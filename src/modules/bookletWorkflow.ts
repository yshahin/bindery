import { PDFDocument } from 'pdf-lib'
import {
  calculateBookletLayout,
  findOptimalSheetsPerBooklet,
  type BookletLayout,
} from '../utils/bookletCalculator'
import {
  detectTextDirection as detectTextDirectionImpl,
  inferDirectionFromFilename,
  type TextDirection,
} from '../utils/rtlDetector'
import { generateBookletPdf } from '../hooks/usePdfGeneration'

type TextDirectionChoice = 'auto' | 'ltr' | 'rtl'
type WorkflowPhase = 'empty' | 'ready' | 'failed'
type PrintRangeIntent = { kind: 'all' } | { kind: 'custom'; start: number; end: number }

type WorkflowErrorCode =
  | 'invalid-file'
  | 'pdf-load-failed'
  | 'invalid-layout'
  | 'export-not-ready'

export interface WorkflowError {
  code: WorkflowErrorCode
  message: string
  recoverable: boolean
}

export interface WorkflowConfiguration {
  pagesPerSheet: number
  sheetsPerBooklet: number
  printRange: {
    start: number
    end: number
  }
  textDirection: {
    choice: TextDirectionChoice
    detected: TextDirection | null
    effective: 'ltr' | 'rtl'
  }
  coverPages: {
    enabled: boolean
    count: number
  }
}

export interface WorkflowSnapshot {
  phase: WorkflowPhase
  source: null | {
    fileName: string
    totalPages: number
  }
  configuration: WorkflowConfiguration
  bookletLayout: (BookletLayout & { rangeStart: number; rangeEnd: number }) | null
  error: WorkflowError | null
}

export interface WorkflowExport {
  pdfBytes: Uint8Array
  fileName: string
  mimeType: 'application/pdf'
}

export interface BookletWorkflowModule {
  getSnapshot(): WorkflowSnapshot
  load(file: File): Promise<WorkflowSnapshot>
  revise(intent: WorkflowRevision): WorkflowSnapshot
  export(): Promise<WorkflowExport>
  reset(): WorkflowSnapshot
}

interface WorkflowDependencies {
  detectTextDirection: (pdfData: ArrayBuffer, fileName: string) => Promise<TextDirection>
}

export interface WorkflowRevision {
  pagesPerSheet?: number
  sheetsPerBooklet?: number | 'optimal'
  printRange?: PrintRangeIntent
  textDirection?: TextDirectionChoice
  coverPages?: {
    enabled: boolean
    count: number
  }
}

const defaultConfiguration: WorkflowConfiguration = {
  pagesPerSheet: 4,
  sheetsPerBooklet: 4,
  printRange: {
    start: 1,
    end: 1,
  },
  textDirection: {
    choice: 'auto',
    detected: null,
    effective: 'ltr',
  },
  coverPages: {
    enabled: true,
    count: 2,
  },
}

function createEmptySnapshot(): WorkflowSnapshot {
  return {
    phase: 'empty',
    source: null,
    configuration: structuredClone(defaultConfiguration),
    bookletLayout: null,
    error: null,
  }
}

function toEffectiveTextDirection(choice: TextDirectionChoice, detected: TextDirection, fileName: string): 'ltr' | 'rtl' {
  if (choice === 'ltr' || choice === 'rtl') {
    return choice
  }

  if (detected === 'ltr' || detected === 'rtl') {
    return detected
  }

  return inferDirectionFromFilename(fileName) === 'rtl' ? 'rtl' : 'ltr'
}

function toWorkflowError(code: WorkflowErrorCode, message: string): WorkflowError {
  return {
    code,
    message,
    recoverable: true,
  }
}

async function readFileData(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer()
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
        return
      }

      reject(new Error('Unable to read PDF data'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read PDF data'))
    reader.readAsArrayBuffer(file)
  })
}

function normalizeRange(totalPages: number, printRange: PrintRangeIntent | undefined): { start: number; end: number } {
  if (!printRange || printRange.kind === 'all') {
    return { start: 1, end: totalPages }
  }

  const start = Math.min(Math.max(1, printRange.start), totalPages)
  const end = Math.min(Math.max(start, printRange.end), totalPages)

  return { start, end }
}

function createReadySnapshot(input: {
  fileName: string
  totalPages: number
  detectedDirection: TextDirection
  textDirectionChoice: TextDirectionChoice
  pagesPerSheet: number
  sheetsPerBooklet: number | 'optimal'
  printRange?: PrintRangeIntent
  coverPages: {
    enabled: boolean
    count: number
  }
}): WorkflowSnapshot {
  const printRange = normalizeRange(input.totalPages, input.printRange)
  const selectedPages = Math.max(0, printRange.end - printRange.start + 1)
  const effectiveTextDirection = toEffectiveTextDirection(
    input.textDirectionChoice,
    input.detectedDirection,
    input.fileName,
  )
  const sheetsPerBooklet = input.sheetsPerBooklet === 'optimal'
    ? findOptimalSheetsPerBooklet(
        selectedPages,
        input.pagesPerSheet,
        input.coverPages.enabled,
        input.coverPages.count,
      )
    : input.sheetsPerBooklet
  const bookletLayout = {
    ...calculateBookletLayout(
      selectedPages,
      sheetsPerBooklet,
      input.pagesPerSheet,
      effectiveTextDirection === 'rtl',
      input.coverPages.enabled,
      input.coverPages.count,
    ),
    rangeStart: printRange.start,
    rangeEnd: printRange.end,
  }

  return {
    phase: 'ready',
    source: {
      fileName: input.fileName,
      totalPages: input.totalPages,
    },
    configuration: {
      pagesPerSheet: input.pagesPerSheet,
      sheetsPerBooklet,
      printRange,
      textDirection: {
        choice: input.textDirectionChoice,
        detected: input.detectedDirection,
        effective: effectiveTextDirection,
      },
      coverPages: input.coverPages,
    },
    bookletLayout,
    error: null,
  }
}

export function createBookletWorkflowModule(
  dependencies: Partial<WorkflowDependencies> = {},
): BookletWorkflowModule {
  const deps: WorkflowDependencies = {
    detectTextDirection: dependencies.detectTextDirection ?? detectTextDirectionImpl,
  }

  let snapshot = createEmptySnapshot()
  let pdfData: ArrayBuffer | null = null
  let sourceFileName: string | null = null

  return {
    getSnapshot() {
      return snapshot
    },

    async load(file) {
      if (file.type !== 'application/pdf') {
        pdfData = null
        snapshot = {
          ...createEmptySnapshot(),
          phase: 'failed',
          error: toWorkflowError('invalid-file', 'Please upload a PDF file'),
        }
        return snapshot
      }

      try {
        pdfData = await readFileData(file)
        sourceFileName = file.name
        const pdf = await PDFDocument.load(pdfData)
        const totalPages = pdf.getPageCount()
        const detectedDirection = await deps.detectTextDirection(pdfData, file.name)
        snapshot = createReadySnapshot({
          fileName: file.name,
          totalPages,
          detectedDirection,
          textDirectionChoice: 'auto',
          pagesPerSheet: defaultConfiguration.pagesPerSheet,
          sheetsPerBooklet: 'optimal',
          printRange: { kind: 'all' },
          coverPages: defaultConfiguration.coverPages,
        })

        return snapshot
      } catch (error) {
        pdfData = null
        sourceFileName = null
        snapshot = {
          ...createEmptySnapshot(),
          phase: 'failed',
          error: toWorkflowError(
            'pdf-load-failed',
            error instanceof Error ? error.message : 'Unable to load PDF',
          ),
        }
        return snapshot
      }
    },

    revise(intent) {
      if (snapshot.phase !== 'ready' || !snapshot.source) {
        return snapshot
      }

      snapshot = createReadySnapshot({
        fileName: snapshot.source.fileName,
        totalPages: snapshot.source.totalPages,
        detectedDirection: snapshot.configuration.textDirection.detected ?? 'unknown',
        textDirectionChoice: intent.textDirection ?? snapshot.configuration.textDirection.choice,
        pagesPerSheet: intent.pagesPerSheet ?? snapshot.configuration.pagesPerSheet,
        sheetsPerBooklet: intent.sheetsPerBooklet ?? snapshot.configuration.sheetsPerBooklet,
        printRange: intent.printRange
          ?? { kind: 'custom', start: snapshot.configuration.printRange.start, end: snapshot.configuration.printRange.end },
        coverPages: intent.coverPages ?? snapshot.configuration.coverPages,
      })

      return snapshot
    },

    async export() {
      if (!pdfData || !snapshot.bookletLayout) {
        throw new Error('Booklet workflow is not ready for export')
      }

      const pdfBytes = await generateBookletPdf(pdfData, snapshot.bookletLayout)
      const baseName = (sourceFileName ?? snapshot.source?.fileName ?? 'booklet').replace(/\.pdf$/i, '')

      return {
        pdfBytes,
        fileName: `${baseName}-booklet.pdf`,
        mimeType: 'application/pdf',
      }
    },

    reset() {
      pdfData = null
      sourceFileName = null
      snapshot = createEmptySnapshot()
      return snapshot
    },
  }
}
