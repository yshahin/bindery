import { useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import type { BookletLayout } from '../utils/bookletCalculator'

export async function generateBookletPdf(
  pdfData: ArrayBuffer,
  layout: BookletLayout,
): Promise<Uint8Array> {
  if (!layout.sequence?.length) {
    throw new Error('A PDF with a generated layout is required.')
  }

  const sourcePdf = await PDFDocument.load(pdfData)
  const bookletPdf = await PDFDocument.create()

  let defaultSize: [number, number] = [612, 792]
  if (sourcePdf.getPageCount() > 0) {
    const { width, height } = sourcePdf.getPage(0).getSize()
    defaultSize = [width, height]
  }

  const pageRangeOffset = Math.max(0, (layout.rangeStart ?? 1) - 1)
  const indicesToCopy: number[] = []

  for (const pageNum of layout.sequence) {
    if (pageNum !== null) {
      const absoluteIndex = pageRangeOffset + pageNum - 1
      if (absoluteIndex >= 0 && absoluteIndex < sourcePdf.getPageCount()) {
        indicesToCopy.push(absoluteIndex)
      }
    }
  }

  const copiedPages = await bookletPdf.copyPages(sourcePdf, indicesToCopy)

  let copiedPageIndex = 0
  for (const pageNum of layout.sequence) {
    if (pageNum === null) {
      bookletPdf.addPage(defaultSize)
      continue
    }

    const absoluteIndex = pageRangeOffset + pageNum - 1
    if (absoluteIndex >= 0 && absoluteIndex < sourcePdf.getPageCount()) {
      bookletPdf.addPage(copiedPages[copiedPageIndex])
      copiedPageIndex += 1
    } else {
      bookletPdf.addPage(defaultSize)
    }
  }

  return bookletPdf.save()
}

export function useBookletPdfGenerator(pdfData: ArrayBuffer | null, layout: BookletLayout | null) {
  return useCallback(async () => {
    if (!pdfData || !layout) {
      throw new Error('A PDF with a generated layout is required.')
    }

    return generateBookletPdf(pdfData, layout)
  }, [layout, pdfData])
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
