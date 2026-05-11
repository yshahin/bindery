import FileUpload from '../components/FileUpload'
import LayoutControls from '../components/LayoutControls'
import ResultsDisplay from '../components/ResultsDisplay'
import BookletView from '../components/BookletView'
import { useBookletWorkflow } from '../hooks/useBookletWorkflow'
import { downloadPdfBlob } from '../hooks/usePdfGeneration'
import { Book, CircleHelp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BookletTool() {
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
  } = useBookletWorkflow()

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
              onPagesPerSheetChange={handlePagesPerSheetChange}
              onRangeStartChange={handleRangeStartChange}
              onRangeEndChange={handleRangeEndChange}
              onResetRange={handleResetRange}
              onTextDirectionChange={handleTextDirectionChange}
              onSheetsPerBookletChange={handleSheetsPerBookletChange}
              onOptimize={useOptimalSheets}
              onHasCoverChange={handleHasCoverChange}
              onCoverPagesChange={handleCoverPagesChange}
            />

            {layout && (
              <>
                <ResultsDisplay
                  layout={layout}
                  error={null}
                  totalPages={totalPages}
                  onPrint={handlePrint}
                  exporting={exporting}
                />
                <BookletView layout={layout} layoutRangeStart={layoutRangeStart} />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
