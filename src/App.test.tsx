import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import * as useBookletStateModule from './hooks/useBookletState'

// Mock the hook
vi.mock('./hooks/useBookletState', () => ({
  useBookletState: vi.fn(),
}))

// Mock the PDF generator hook
vi.mock('./hooks/usePdfGeneration', () => ({
  useBookletPdfGenerator: () => vi.fn(),
  downloadPdfBlob: vi.fn(),
}))

describe('App', () => {

  it('renders upload screen initially', () => {
    // Setup initial mock state
    vi.mocked(useBookletStateModule.useBookletState).mockReturnValue({
      pdfFile: null,
      totalPages: 0,
      layout: null,
      error: null,
      loading: false,
      detecting: false,
      exporting: false,
      rangeStart: 1,
      rangeEnd: 0,
      selectedPageCount: 0,
      hasCover: true,
      coverPages: 2,
      sheetsPerBooklet: 4,
      pagesPerSheet: 4,
      textDirection: 'ltr',
      detectedDirection: null,
      pdfData: null,
      setError: vi.fn(),
      setExporting: vi.fn(),
      handleFileUpload: vi.fn(),
      handleSheetsPerBookletChange: vi.fn(),
      handleTextDirectionChange: vi.fn(),
      handlePagesPerSheetChange: vi.fn(),
      useOptimalSheets: vi.fn(),
      handleRangeStartChange: vi.fn(),
      handleRangeEndChange: vi.fn(),
      handleResetRange: vi.fn(),
      handleHasCoverChange: vi.fn(),
      handleCoverPagesChange: vi.fn(),
    })

    render(<App />)
    expect(screen.getByText(/The Bindery Tool/i)).toBeDefined()
    // Using loose text matching for buttons/labels might need refinement if text changes
  })

  it('renders layout controls and results when layout is present', () => {
    vi.mocked(useBookletStateModule.useBookletState).mockReturnValue({
      pdfFile: new File([''], 'test.pdf'),
      totalPages: 10,
      layout: {
        totalPages: 10,
        booklets: [],
        totalPhysicalPages: 12,
        totalBlankPages: 2,
        efficiency: 90,
        sheetsPerBooklet: 4,
        pagesPerSheet: 4,
        pagesPerBooklet: 16,
        isRTL: false,
        totalBooklets: 1,
        completeBooklets: 0,
        remainingPages: 0,
        rangeStart: 1,
        rangeEnd: 10,
        totalSheets: 3,
        sequence: []
      } as any,
      error: null,
      loading: false,
      detecting: false,
      exporting: false,
      rangeStart: 1,
      rangeEnd: 10,
      selectedPageCount: 10,
      hasCover: true,
      coverPages: 2,
      sheetsPerBooklet: 4,
      pagesPerSheet: 4,
      textDirection: 'ltr',
      detectedDirection: 'ltr',
      pdfData: new ArrayBuffer(0),
      setError: vi.fn(),
      setExporting: vi.fn(),
      handleFileUpload: vi.fn(),
      handleSheetsPerBookletChange: vi.fn(),
      handleTextDirectionChange: vi.fn(),
      handlePagesPerSheetChange: vi.fn(),
      useOptimalSheets: vi.fn(),
      handleRangeStartChange: vi.fn(),
      handleRangeEndChange: vi.fn(),
      handleResetRange: vi.fn(),
      handleHasCoverChange: vi.fn(),
      handleCoverPagesChange: vi.fn(),
    })

    render(<App />)

    // Check for some control elements
    expect(screen.getByText(/Layout Settings/i)).toBeDefined()
    expect(screen.getAllByText(/Sheets per Booklet/i).length).toBeGreaterThan(0)

    // Check for results
    expect(screen.getByText(/3. Imposition Strategy/i)).toBeDefined()
  })

  it('displays error message when error state is present', () => {
    const errorMsg = 'Failed to load PDF'
    vi.mocked(useBookletStateModule.useBookletState).mockReturnValue({
      pdfFile: null,
      totalPages: 0,
      layout: null,
      error: errorMsg, // Error set
      loading: false,
      detecting: false,
      exporting: false,
      rangeStart: 1,
      rangeEnd: 0,
      selectedPageCount: 0,
      hasCover: true,
      coverPages: 2,
      sheetsPerBooklet: 4,
      pagesPerSheet: 4,
      textDirection: 'ltr',
      detectedDirection: null,
      pdfData: null,
      setError: vi.fn(),
      setExporting: vi.fn(),
      handleFileUpload: vi.fn(),
      handleSheetsPerBookletChange: vi.fn(),
      handleTextDirectionChange: vi.fn(),
      handlePagesPerSheetChange: vi.fn(),
      useOptimalSheets: vi.fn(),
      handleRangeStartChange: vi.fn(),
      handleRangeEndChange: vi.fn(),
      handleResetRange: vi.fn(),
      handleHasCoverChange: vi.fn(),
      handleCoverPagesChange: vi.fn(),
    })

    render(<App />)
    expect(screen.getByText(errorMsg)).toBeDefined()
  })
})
