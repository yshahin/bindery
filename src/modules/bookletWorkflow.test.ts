import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { createBookletWorkflowModule } from './bookletWorkflow'

async function createPdfFile(pageCount: number, name: string): Promise<File> {
  const pdf = await PDFDocument.create()

  for (let index = 0; index < pageCount; index += 1) {
    pdf.addPage([612, 792])
  }

  const bytes = await pdf.save()
  return new File([bytes], name, { type: 'application/pdf' })
}

describe('createBookletWorkflowModule', () => {
  it('loads a PDF and returns a ready booklet workflow snapshot', async () => {
    const workflow = createBookletWorkflowModule(async () => 'rtl')
    const file = await createPdfFile(20, 'sample.pdf')

    const snapshot = await workflow.load(file)

    expect(snapshot.phase).toBe('ready')
    expect(snapshot.source).toEqual({
      fileName: 'sample.pdf',
      totalPages: 20,
    })
    expect(snapshot.configuration.printRange).toEqual({
      start: 1,
      end: 20,
    })
    expect(snapshot.configuration.printSheet).toEqual({
      imposePages: true,
      orderAsSignatures: true,
      paperType: 'letter',
      orientation: 'auto',
      outerMarginMm: 0,
      spineMarginMm: 0,
      showFoldGuide: false,
    })
    expect(snapshot.configuration.textDirection).toEqual({
      choice: 'auto',
      detected: 'rtl',
      effective: 'rtl',
    })
    expect(snapshot.bookletLayout).toMatchObject({
      totalPages: 20,
      rangeStart: 1,
      rangeEnd: 20,
      isRTL: true,
    })
    expect(snapshot.bookletLayout?.sheetsPerBooklet).toBe(snapshot.configuration.sheetsPerBooklet)
    expect(snapshot.error).toBeNull()
  })

  it('revises the print range and text direction through the workflow interface', async () => {
    const workflow = createBookletWorkflowModule(async () => 'rtl')
    const file = await createPdfFile(32, 'sample.pdf')

    await workflow.load(file)
    const snapshot = workflow.revise({
      printRange: { kind: 'custom', start: 5, end: 20 },
      textDirection: 'ltr',
      printSheet: { imposePages: false, orderAsSignatures: false, orientation: 'landscape', outerMarginMm: 12, spineMarginMm: 6, showFoldGuide: true },
    })

    expect(snapshot.phase).toBe('ready')
    expect(snapshot.configuration.printRange).toEqual({
      start: 5,
      end: 20,
    })
    expect(snapshot.configuration.textDirection).toEqual({
      choice: 'ltr',
      detected: 'rtl',
      effective: 'ltr',
    })
    expect(snapshot.configuration.printSheet).toEqual({
      imposePages: false,
      orderAsSignatures: false,
      paperType: 'letter',
      orientation: 'landscape',
      outerMarginMm: 12,
      spineMarginMm: 6,
      showFoldGuide: true,
    })
    expect(snapshot.bookletLayout).toMatchObject({
      totalPages: 16,
      rangeStart: 5,
      rangeEnd: 20,
      isRTL: false,
    })
  })

  it('preserves unchanged print-sheet settings across partial and unrelated revisions', async () => {
    const workflow = createBookletWorkflowModule(async () => 'ltr')
    await workflow.load(await createPdfFile(8, 'settings.pdf'))

    workflow.revise({ printSheet: { spineMarginMm: 7 } })
    const snapshot = workflow.revise({ sheetsPerBooklet: 3 })

    expect(snapshot.configuration.printSheet).toEqual({
      imposePages: true,
      orderAsSignatures: true,
      paperType: 'letter',
      orientation: 'auto',
      outerMarginMm: 0,
      spineMarginMm: 7,
      showFoldGuide: false,
    })
  })

  it('exports a booklet PDF and file name from the current workflow state', async () => {
    const workflow = createBookletWorkflowModule(async () => 'ltr')
    const file = await createPdfFile(12, 'chapter.pdf')

    await workflow.load(file)
    const exportResult = await workflow.export()
    const exportedPdf = await PDFDocument.load(exportResult.pdfBytes)

    expect(exportResult.fileName).toBe('chapter-booklet.pdf')
    expect(exportResult.mimeType).toBe('application/pdf')
    const layout = workflow.getSnapshot().bookletLayout
    expect(exportedPdf.getPageCount()).toBe(
      Math.ceil((layout?.sequence.length ?? 0) / (layout?.pagesPerSheet ?? 1)) * 2,
    )
    const exportedSize = exportedPdf.getPage(0).getSize()
    expect(exportedSize.width).toBeCloseTo(792)
    expect(exportedSize.height).toBeCloseTo(612)
  })

  it('exports original pages in reading order when imposition is left to the printer', async () => {
    const workflow = createBookletWorkflowModule(async () => 'ltr')
    await workflow.load(await createPdfFile(12, 'chapter.pdf'))
    workflow.revise({
      printRange: { kind: 'custom', start: 3, end: 5 },
      printSheet: { imposePages: false },
    })

    const exportResult = await workflow.export()
    const exportedPdf = await PDFDocument.load(exportResult.pdfBytes)

    expect(exportedPdf.getPageCount()).toBe(3)
    expect(exportedPdf.getPage(0).getSize()).toEqual({ width: 612, height: 792 })
    expect(exportedPdf.getPage(2).getSize()).toEqual({ width: 612, height: 792 })
  })

  it('keeps exportable PDF data when direction detection transfers its input buffer', async () => {
    const workflow = createBookletWorkflowModule(async (pdfData) => {
      structuredClone(pdfData, { transfer: [pdfData] })
      return 'ltr'
    })
    const file = await createPdfFile(12, 'transferred.pdf')

    await workflow.load(file)

    await expect(workflow.export()).resolves.toMatchObject({
      fileName: 'transferred-booklet.pdf',
      mimeType: 'application/pdf',
    })
  })
})
