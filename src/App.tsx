import FileUpload from './components/FileUpload'
import LayoutControls from './components/LayoutControls'
import ResultsDisplay from './components/ResultsDisplay'
import BookletView from './components/BookletView'
import { useBookletState } from './hooks/useBookletState'
import { useBookletPdfGenerator, downloadPdfBlob } from './hooks/usePdfGeneration'
import GithubCorner from 'react-github-corner'
import './App.css'

function App() {
  const {
    pdfFile,
    totalPages,
    sheetsPerBooklet,
    pagesPerSheet,
    pdfData,
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
    setExporting,
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
  } = useBookletState()

  const generateBookletPdf = useBookletPdfGenerator(pdfData, layout)

  const handlePrint = async () => {
    if (!layout || !pdfData) {
      setError('Upload a PDF and generate a layout before exporting.')
      return
    }

    setExporting(true)
    try {
      const pdfBytes = await generateBookletPdf()
      const baseName = pdfFile?.name?.replace(/\.pdf$/i, '') || 'booklet'
      downloadPdfBlob(pdfBytes, `${baseName}-booklet.pdf`)
    } catch (err) {
      console.error(err)
      setError(`Unable to generate booklet PDF: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  const layoutRangeStart = layout?.rangeStart ?? 1

  return (
    <div className="app">
      <GithubCorner
        href="https://github.com/yshahin/bookletapp"
        bannerColor="#151513"
        octoColor="#fff"
        size={80}
        direction="right"
      />
      <div className="container">
        <header className="header">
          <h1>📚 Booklet Layout Optimizer</h1>
          <p>Calculate optimal booklet layouts to minimize blank pages</p>
        </header>

        <FileUpload
          pdfFile={pdfFile}
          totalPages={totalPages}
          loading={loading}
          onFileUpload={handleFileUpload}
        />

        {error && <div className="error-message">{error}</div>}

        {totalPages > 0 && (
          <>
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
                  totalPages={totalPages}
                  onPrint={handlePrint}
                  exporting={exporting}
                />
                <BookletView layout={layout} layoutRangeStart={layoutRangeStart} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App

