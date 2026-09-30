import { useEffect, useRef, useState } from 'react'
import FileUpload from '../components/FileUpload'
import LayoutControls from '../components/LayoutControls'
import ResultsDisplay from '../components/ResultsDisplay'
import BookletView from '../components/BookletView'
import { useBookletWorkflow } from '../hooks/useBookletWorkflow'
import { addPreviewMarginGuides, downloadPdfBlob } from '../hooks/usePdfGeneration'
import { Book, CircleHelp, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BookletTool() {
  const [preview, setPreview] = useState<{ url: string; pageCount: number } | null>(null)
  const [previewPage, setPreviewPage] = useState(1)
  const previewUrlRef = useRef<string | null>(null)
  const {
    pdfFile,
    totalPages,
    sheetsPerBooklet,
    pagesPerSheet,
    textDirection,
    detectedDirection,
    layout,
    error,
    loading,
    detecting,
    exporting,
    rangeStart,
    rangeEnd,
    selectedPageCount,
    hasCover,
    coverPages,
    printSheet,
    setError,
    exportBooklet,
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
    handlePrintSheetChange,
  } = useBookletWorkflow()

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  useEffect(() => {
    if (!previewUrlRef.current) return

    URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setPreview(null)
    setPreviewPage(1)
  }, [layout, printSheet])

  const handlePreview = async () => {
    if (!layout) return

    try {
      const exported = await exportBooklet()
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)

      const previewBytes = printSheet.imposePages
        ? await addPreviewMarginGuides(exported.pdfBytes)
        : exported.pdfBytes
      const url = URL.createObjectURL(new Blob([previewBytes as BlobPart], { type: 'application/pdf' }))
      previewUrlRef.current = url
      setPreview({ url, pageCount: printSheet.imposePages ? layout.totalSheets * 2 : layout.totalPages })
      setPreviewPage(1)
    } catch (err) {
      setError(`Unable to preview booklet PDF: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleClosePreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setPreview(null)
  }

  const handlePrint = async () => {
    if (!layout) {
      setError('Upload a PDF and generate a layout before exporting.')
      return
    }

    try {
      const exported = await exportBooklet()
      downloadPdfBlob(exported.pdfBytes, exported.fileName)
    } catch (err) {
      console.error(err)
      setError(`Unable to generate booklet PDF: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const layoutRangeStart = layout?.rangeStart ?? 1

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative w-full">
      <div className="absolute top-0 left-0 w-full h-full texture-overlay opacity-50 z-[-1]" />
      <header className="text-center space-y-4 mb-12">
        <div className="flex items-center justify-center gap-3 text-stone-800 mb-2">
          <Book size={32} />
          <h1 className="serif-font text-4xl font-bold">Waraq Tool</h1>
        </div>
        <p className="text-xl text-stone-600 font-light max-w-2xl mx-auto">
          Calculate optimal signature layouts and generate imposition proofs for hand-bookbinding.
        </p>
        <div className="flex justify-center">
          <Link
            to="/articles/20260205-how-to-use-booklet-tool"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 border border-stone-200 rounded-full px-4 py-1.5 transition-colors bg-white/50 backdrop-blur-sm hover:bg-white hover:border-stone-300"
          >
            <CircleHelp size={16} />
            <span>New to this? Read the <strong>How-To Guide</strong></span>
          </Link>
        </div>
        <div className="flex justify-center">
          <Link
            to="/hole-guide"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 border border-stone-200 rounded-full px-4 py-1.5 transition-colors bg-white/50 backdrop-blur-sm hover:bg-white hover:border-stone-300"
          >
            <span>Need to punch signatures? Open the <strong>Hole Guide Tool</strong></span>
          </Link>
        </div>
      </header>

      <main className="space-y-8 animate-fade-in">
        <FileUpload
          pdfFile={pdfFile}
          totalPages={totalPages}
          loading={loading}
          onFileUpload={handleFileUpload}
        />

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        {totalPages > 0 && (
          <div className="space-y-8">
            <LayoutControls
              pagesPerSheet={pagesPerSheet}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              totalPages={totalPages}
              selectedPageCount={selectedPageCount}
              textDirection={textDirection}
              detectedDirection={detectedDirection}
              detecting={detecting}
              sheetsPerBooklet={sheetsPerBooklet}
              hasCover={hasCover}
              coverPages={coverPages}
              printSheet={printSheet}
              onPagesPerSheetChange={handlePagesPerSheetChange}
              onRangeStartChange={handleRangeStartChange}
              onRangeEndChange={handleRangeEndChange}
              onResetRange={handleResetRange}
              onTextDirectionChange={handleTextDirectionChange}
              onSheetsPerBookletChange={handleSheetsPerBookletChange}
              onOptimize={useOptimalSheets}
              onHasCoverChange={handleHasCoverChange}
              onCoverPagesChange={handleCoverPagesChange}
              onPrintSheetChange={handlePrintSheetChange}
            />

            {layout && (
              <>
                <ResultsDisplay
                  layout={layout}
                  orderAsSignatures={printSheet.orderAsSignatures}
                  error={null}
                  totalPages={totalPages}
                  onPrint={handlePrint}
                  onPreview={handlePreview}
                  exporting={exporting}
                />
                {preview && (
                  <section className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden" aria-label="Generated PDF preview">
                    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-stone-200">
                      <h2 className="font-serif text-lg font-bold text-stone-800">Generated PDF Preview</h2>
                      <div className="flex items-center gap-3">
                        <label htmlFor="preview-page" className="text-sm text-stone-600">Page</label>
                        <input
                          id="preview-page"
                          aria-label="Preview page"
                          type="number"
                          min="1"
                          max={preview.pageCount}
                          value={previewPage}
                          onChange={(event) => {
                            const nextPage = Number(event.target.value)
                            if (Number.isInteger(nextPage) && nextPage >= 1 && nextPage <= preview.pageCount) {
                              setPreviewPage(nextPage)
                            }
                          }}
                          className="w-20 px-3 py-2 bg-white border border-stone-300 rounded text-center text-stone-800"
                        />
                        <span className="text-sm text-stone-500">of {preview.pageCount}</span>
                        <button
                          type="button"
                          aria-label="Close preview"
                          title="Close preview"
                          onClick={handleClosePreview}
                          className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </header>
                    <iframe
                      key={`${preview.url}#page=${previewPage}`}
                      title={`Generated PDF page ${previewPage}`}
                      src={`${preview.url}#page=${previewPage}`}
                      className="w-full h-[70vh] min-h-[420px] bg-stone-100"
                    />
                  </section>
                )}
                <BookletView layout={layout} layoutRangeStart={layoutRangeStart} />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
