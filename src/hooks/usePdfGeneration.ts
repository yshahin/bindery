import { PDFDocument, rgb } from 'pdf-lib'
import type { BookletLayout } from '../utils/bookletCalculator'

export const PRINT_PAPER_SIZES = {
  a3: { label: 'A3 (297 × 420 mm)', widthMm: 297, heightMm: 420, system: 'Metric' },
  a4: { label: 'A4 (210 × 297 mm)', widthMm: 210, heightMm: 297, system: 'Metric' },
  a5: { label: 'A5 (148 × 210 mm)', widthMm: 148, heightMm: 210, system: 'Metric' },
  a6: { label: 'A6 (105 × 148 mm)', widthMm: 105, heightMm: 148, system: 'Metric' },
  letter: { label: 'US Letter (8.5 × 11 in)', widthMm: 215.9, heightMm: 279.4, system: 'Imperial' },
  legal: { label: 'US Legal (8.5 × 14 in)', widthMm: 215.9, heightMm: 355.6, system: 'Imperial' },
  tabloid: { label: 'US Tabloid (11 × 17 in)', widthMm: 279.4, heightMm: 431.8, system: 'Imperial' },
} as const

type PrintPaperType = 'source' | keyof typeof PRINT_PAPER_SIZES

export interface PrintSheetSettings {
  paperType: PrintPaperType
  orientation: 'auto' | 'portrait' | 'landscape'
  outerMarginMm: number
  spineMarginMm: number
  showFoldGuide: boolean
}

const DEFAULT_PRINT_SHEET_SETTINGS: PrintSheetSettings = {
  paperType: 'letter',
  orientation: 'auto',
  outerMarginMm: 0,
  spineMarginMm: 0,
  showFoldGuide: false,
}

const PREVIEW_OUTER_GUIDE_MM = 12.7
const PREVIEW_SPINE_GUIDE_MM = 15.9

export async function generateBookletPdf(
  pdfData: ArrayBuffer,
  layout: BookletLayout,
  settings: PrintSheetSettings = DEFAULT_PRINT_SHEET_SETTINGS,
): Promise<Uint8Array> {
  if (!layout.sequence?.length) {
    throw new Error('A PDF with a generated layout is required.')
  }

  const sourcePdf = await PDFDocument.load(pdfData)
  const bookletPdf = await PDFDocument.create()
  const pointsPerMillimeter = 72 / 25.4

  let defaultSize: [number, number] = [612, 792]
  if (sourcePdf.getPageCount() > 0) {
    const { width, height } = sourcePdf.getPage(0).getSize()
    defaultSize = [width, height]
  }
  if (settings.paperType !== 'source') {
    const { widthMm, heightMm } = PRINT_PAPER_SIZES[settings.paperType]
    defaultSize = [widthMm * pointsPerMillimeter, heightMm * pointsPerMillimeter]
  }

  const orientation = settings.orientation === 'auto'
    ? layout.pagesPerSheet === 8 ? 'portrait' : 'landscape'
    : settings.orientation
  const [width, height] = defaultSize
  const swapDimensions = orientation === 'portrait'
    ? width > height
    : height > width
  if (swapDimensions) defaultSize = [height, width]

  const pageRangeOffset = Math.max(0, (layout.rangeStart ?? 1) - 1)
  const sourcePages = sourcePdf.getPages()
  const indicesToCopy = new Set<number>()

  for (const pageNum of layout.sequence) {
    if (pageNum !== null) {
      const absoluteIndex = pageRangeOffset + pageNum - 1
      if (absoluteIndex >= 0 && absoluteIndex < sourcePages.length) {
        indicesToCopy.add(absoluteIndex)
      }
    }
  }

  const sourceIndices = [...indicesToCopy]
  const embeddableSourceIndices = sourceIndices.filter((index) => sourcePages[index].node.Contents())
  const embeddedPages = embeddableSourceIndices.length
    ? await bookletPdf.embedPages(embeddableSourceIndices.map((index) => sourcePages[index]))
    : []
  const embeddedPageBySourceIndex = new Map(
    embeddableSourceIndices.map((sourceIndex, index) => [sourceIndex, embeddedPages[index]]),
  )
  const sheets = layout.booklets.flatMap((booklet) =>
    booklet.sheets.map((sheet) => ({ sheet, bookletIndex: booklet.index })),
  )
  if (!sheets.length) {
    for (let offset = 0; offset < layout.sequence.length; offset += layout.pagesPerSheet) {
      const sheet = layout.sequence.slice(offset, offset + layout.pagesPerSheet)
      while (sheet.length < layout.pagesPerSheet) sheet.push(null)
      const bookletIndex = Math.floor(offset / Math.max(1, layout.pagesPerBooklet)) + 1
      sheets.push({ sheet, bookletIndex })
    }
  }

  const outerMargin = (Number.isFinite(settings.outerMarginMm) ? settings.outerMarginMm : 0) * pointsPerMillimeter
  const spineMargin = (Number.isFinite(settings.spineMarginMm) ? settings.spineMarginMm : 0) * pointsPerMillimeter

  for (const { sheet, bookletIndex } of sheets) {
    const pagesPerSide = Math.ceil(sheet.length / 2)
    const columns = pagesPerSide <= 1 ? 1 : pagesPerSide <= 4 ? 2 : 4
    const rows = Math.ceil(pagesPerSide / columns)
    const hasSpineGutter = columns > 1
    const gutterWidth = hasSpineGutter ? spineMargin * 2 : 0
    const cellWidth = (defaultSize[0] - outerMargin * 2 - gutterWidth) / columns
    const cellHeight = (defaultSize[1] - outerMargin * 2) / rows

    for (const sidePages of [sheet.slice(0, pagesPerSide), sheet.slice(pagesPerSide)]) {
      const outputPage = bookletPdf.addPage(defaultSize)

      sidePages.forEach((pageNum, pageIndex) => {
        if (pageNum === null) return

        const absoluteIndex = pageRangeOffset + pageNum - 1
        const embeddedPage = embeddedPageBySourceIndex.get(absoluteIndex)
        if (!embeddedPage || cellWidth <= 0 || cellHeight <= 0) return

        const column = pageIndex % columns
        const row = Math.floor(pageIndex / columns)
        const x = outerMargin + column * cellWidth + (hasSpineGutter && column >= columns / 2 ? gutterWidth : 0)
        const y = defaultSize[1] - outerMargin - (row + 1) * cellHeight
        const scale = Math.min(cellWidth / embeddedPage.width, cellHeight / embeddedPage.height)
        const width = embeddedPage.width * scale
        const height = embeddedPage.height * scale

        outputPage.drawPage(embeddedPage, {
          x: x + (cellWidth - width) / 2,
          y: y + (cellHeight - height) / 2,
          width,
          height,
        })
      })

      if (settings.showFoldGuide) {
        outputPage.drawLine({
          start: { x: defaultSize[0] / 2, y: outerMargin },
          end: { x: defaultSize[0] / 2, y: defaultSize[1] - outerMargin },
          color: rgb(0.55, 0.55, 0.55),
          thickness: 0.5,
          dashArray: [3, 3],
        })
      }

      const tabWidth = 3 * pointsPerMillimeter
      const tabSlotHeight = defaultSize[1] / Math.max(1, layout.totalBooklets)
      const tabHeight = Math.min(10 * pointsPerMillimeter, tabSlotHeight * 0.8)
      const tabX = layout.isRTL ? 0 : defaultSize[0] - tabWidth
      const tabY = defaultSize[1] - bookletIndex * tabSlotHeight + (tabSlotHeight - tabHeight) / 2

      outputPage.drawRectangle({
        x: tabX,
        y: tabY,
        width: tabWidth,
        height: tabHeight,
        color: rgb(0.12, 0.12, 0.12),
      })
    }
  }

  return bookletPdf.save()
}

export async function addPreviewMarginGuides(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const previewPdf = await PDFDocument.load(pdfBytes)
  const pointsPerMillimeter = 72 / 25.4
  const outerMargin = PREVIEW_OUTER_GUIDE_MM * pointsPerMillimeter
  const spineMargin = PREVIEW_SPINE_GUIDE_MM * pointsPerMillimeter
  const guideStyle = {
    color: rgb(0.1, 0.48, 0.58),
    thickness: 0.5,
    dashArray: [3, 3],
  }

  for (const page of previewPdf.getPages()) {
    const { width, height } = page.getSize()
    const verticalGuides = [outerMargin, width - outerMargin, width / 2 - spineMargin, width / 2 + spineMargin]
    const horizontalGuides = [outerMargin, height - outerMargin]

    for (const x of new Set(verticalGuides)) {
      page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, ...guideStyle })
    }
    for (const y of new Set(horizontalGuides)) {
      page.drawLine({ start: { x: 0, y }, end: { x: width, y }, ...guideStyle })
    }
  }

  return previewPdf.save()
}

export function downloadPdfBlob(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
