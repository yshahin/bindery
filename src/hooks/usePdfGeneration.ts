import { useCallback } from 'react'
import type { BookletLayout } from '../utils/bookletCalculator'
import { generateBookletPdf } from '../utils/bookletPdf'

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
