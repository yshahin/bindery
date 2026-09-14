import { useCallback, useMemo, useState } from 'react'
import { createBookletWorkflowModule, type WorkflowSnapshot } from '../modules/bookletWorkflow'
import type { TextDirection } from '../utils/rtlDetector'

type WorkflowLayout = WorkflowSnapshot['bookletLayout']

const getSelectedPageCount = (start: number, end: number): number => Math.max(0, end - start + 1)

export interface UseBookletWorkflowResult {
  pdfFile: File | null
  totalPages: number
  sheetsPerBooklet: number
  pagesPerSheet: number
  textDirection: TextDirection
  detectedDirection: TextDirection | null
  layout: WorkflowLayout
  error: string | null
  loading: boolean
  detecting: boolean
  exporting: boolean
  rangeStart: number
  rangeEnd: number
  selectedPageCount: number
  hasCover: boolean
  coverPages: number
  setError: (error: string | null) => void
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleSheetsPerBookletChange: (value: string) => void
  handleTextDirectionChange: (direction: TextDirection) => void
  handlePagesPerSheetChange: (value: number) => void
  useOptimalSheets: () => void
  handleRangeStartChange: (value: string) => void
  handleRangeEndChange: (value: string) => void
  handleResetRange: () => void
  handleHasCoverChange: (value: boolean) => void
  handleCoverPagesChange: (value: number) => void
  exportBooklet: () => Promise<{ pdfBytes: Uint8Array; fileName: string; mimeType: 'application/pdf' }>
}

export function useBookletWorkflow(): UseBookletWorkflowResult {
  const workflow = useMemo(() => createBookletWorkflowModule(), [])
  const [snapshot, setSnapshot] = useState(() => workflow.getSnapshot())
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const updateSnapshot = useCallback((nextSnapshot: typeof snapshot) => {
    setSnapshot(nextSnapshot)
    setLocalError(null)
  }, [])

  const setError = useCallback((error: string | null) => {
    setLocalError(error)
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setDetecting(true)

    try {
      const nextSnapshot = await workflow.load(file)
      setSnapshot(nextSnapshot)
      setPdfFile(nextSnapshot.phase === 'ready' ? file : null)
      setLocalError(nextSnapshot.error?.message ?? null)
    } finally {
      setLoading(false)
      setDetecting(false)
    }
  }, [workflow])

  const handleSheetsPerBookletChange = useCallback((value: string): void => {
    const sheetsPerBooklet = parseInt(value, 10)
    if (!Number.isNaN(sheetsPerBooklet) && sheetsPerBooklet > 0) {
      updateSnapshot(workflow.revise({ sheetsPerBooklet }))
    }
  }, [updateSnapshot, workflow])

  const handleTextDirectionChange = useCallback((direction: TextDirection): void => {
    if (direction === 'ltr' || direction === 'rtl') {
      updateSnapshot(workflow.revise({ textDirection: direction }))
    }
  }, [updateSnapshot, workflow])

  const handlePagesPerSheetChange = useCallback((value: number): void => {
    const pagesPerSheet = parseInt(String(value), 10)
    if (!Number.isNaN(pagesPerSheet) && pagesPerSheet > 0 && pagesPerSheet % 2 === 0) {
      updateSnapshot(workflow.revise({ pagesPerSheet, sheetsPerBooklet: 'optimal' }))
    }
  }, [updateSnapshot, workflow])

  const useOptimalSheets = useCallback((): void => {
    updateSnapshot(workflow.revise({ sheetsPerBooklet: 'optimal' }))
  }, [updateSnapshot, workflow])

  const handleRangeStartChange = useCallback((value: string): void => {
    const start = parseInt(value, 10)
    if (Number.isNaN(start)) return

    updateSnapshot(workflow.revise({
      printRange: {
        kind: 'custom',
        start,
        end: snapshot.configuration.printRange.end,
      },
    }))
  }, [snapshot.configuration.printRange.end, updateSnapshot, workflow])

  const handleRangeEndChange = useCallback((value: string): void => {
    const end = parseInt(value, 10)
    if (Number.isNaN(end)) return

    updateSnapshot(workflow.revise({
      printRange: {
        kind: 'custom',
        start: snapshot.configuration.printRange.start,
        end,
      },
    }))
  }, [snapshot.configuration.printRange.start, updateSnapshot, workflow])

  const handleResetRange = useCallback((): void => {
    updateSnapshot(workflow.revise({ printRange: { kind: 'all' } }))
  }, [updateSnapshot, workflow])

  const handleHasCoverChange = useCallback((enabled: boolean): void => {
    updateSnapshot(workflow.revise({
      coverPages: {
        enabled,
        count: snapshot.configuration.coverPages.count,
      },
      sheetsPerBooklet: 'optimal',
    }))
  }, [snapshot.configuration.coverPages.count, updateSnapshot, workflow])

  const handleCoverPagesChange = useCallback((value: number): void => {
    const count = parseInt(String(value), 10)
    if (!Number.isNaN(count) && count > 0 && count <= 10) {
      updateSnapshot(workflow.revise({
        coverPages: {
          enabled: snapshot.configuration.coverPages.enabled,
          count,
        },
        sheetsPerBooklet: 'optimal',
      }))
    }
  }, [snapshot.configuration.coverPages.enabled, updateSnapshot, workflow])

  const exportBooklet = useCallback(async () => {
    setExporting(true)

    try {
      const result = await workflow.export()
      setLocalError(null)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to export booklet PDF'
      setLocalError(message)
      throw error
    } finally {
      setExporting(false)
    }
  }, [workflow])

  const totalPages = snapshot.source?.totalPages ?? 0

  return {
    pdfFile,
    totalPages,
    sheetsPerBooklet: snapshot.configuration.sheetsPerBooklet,
    pagesPerSheet: snapshot.configuration.pagesPerSheet,
    textDirection: snapshot.configuration.textDirection.effective,
    detectedDirection: snapshot.configuration.textDirection.detected,
    layout: snapshot.bookletLayout,
    error: localError ?? snapshot.error?.message ?? null,
    loading,
    detecting,
    exporting,
    rangeStart: snapshot.configuration.printRange.start,
    rangeEnd: snapshot.configuration.printRange.end,
    selectedPageCount: getSelectedPageCount(
      snapshot.configuration.printRange.start,
      snapshot.configuration.printRange.end,
    ),
    hasCover: snapshot.configuration.coverPages.enabled,
    coverPages: snapshot.configuration.coverPages.count,
    setError,
    handleFileUpload,
    handleSheetsPerBookletChange,
    handleTextDirectionChange,
    handlePagesPerSheetChange,
    useOptimalSheets,
    handleRangeStartChange,
    handleRangeEndChange,
    handleResetRange,
    handleHasCoverChange,
    handleCoverPagesChange,
    exportBooklet,
  }
}
