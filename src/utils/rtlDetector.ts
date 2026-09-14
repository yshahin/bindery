import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

export type TextDirection = 'ltr' | 'rtl' | 'unknown'

const rtlRanges: [number, number][] = [
  [0x0590, 0x05FF], // Hebrew
  [0x0600, 0x06FF], // Arabic
  [0x0700, 0x074F], // Syriac
  [0x0750, 0x077F], // Arabic Supplement
  [0x08A0, 0x08FF], // Arabic Extended-A
  [0xFB50, 0xFDFF], // Arabic Presentation Forms-A
  [0xFE70, 0xFEFF], // Arabic Presentation Forms-B
]

const rtlKeywords = ['rtl', 'arabic', 'hebrew', 'urdu', 'farsi', 'persian']
const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/

export function inferDirectionFromFilename(fileName: string = ''): TextDirection {
  if (!fileName) return 'ltr'
  const normalized = fileName.toLowerCase()

  if (rtlRegex.test(fileName) || rtlKeywords.some((word) => normalized.includes(word))) {
    return 'rtl'
  }

  return 'ltr'
}

/**
 * Detects if a PDF contains RTL (Right-to-Left) text
 * @param pdfArrayBuffer - The PDF file as ArrayBuffer
 * @param fileName - Optional original file name for fallback detection
 * @returns The detected text direction
 */
export async function detectTextDirection(
  pdfArrayBuffer: ArrayBuffer,
  fileName: string = ''
): Promise<TextDirection> {
  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist')

    // Use the bundled worker so PDF parsing never depends on third-party runtime scripts.
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc
    }

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer })
    const pdf = await loadingTask.promise

    function isRTLChar(charCode: number): boolean {
      return rtlRanges.some(([start, end]) => charCode >= start && charCode <= end)
    }

    let totalChars = 0
    let rtlChars = 0

    // Sample pages for detection (check first 3 pages or all if less)
    const pagesToCheck = Math.min(3, pdf.numPages)

    for (let pageNum = 1; pageNum <= pagesToCheck; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      for (const item of textContent.items) {
        if ('str' in item && item.str) {
          for (let i = 0; i < item.str.length; i++) {
            const charCode = item.str.charCodeAt(i)
            // Only count printable characters
            if (charCode > 32) {
              totalChars++
              if (isRTLChar(charCode)) {
                rtlChars++
              }
            }
          }
        }
      }
    }

    // If we have enough characters and RTL characters are significant (>10%)
    if (totalChars > 50 && rtlChars / totalChars > 0.1) {
      return 'rtl'
    }

    // If we have some RTL characters but not enough to be certain
    if (rtlChars > 0 && totalChars > 0) {
      return 'unknown' // Could be mixed or RTL, user should verify
    }

    // No text extracted: fall back to file name heuristics
    if (totalChars === 0 && fileName) {
      return inferDirectionFromFilename(fileName)
    }

    return 'ltr'
  } catch (error) {
    console.warn('Error detecting text direction:', error)
    return 'unknown'
  }
}
