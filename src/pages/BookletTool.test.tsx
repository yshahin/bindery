import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import BookletTool from './BookletTool'
import * as useBookletWorkflowModule from '../hooks/useBookletWorkflow'
import { downloadPdfBlob } from '../hooks/usePdfGeneration'

// Mock the hook
vi.mock('../hooks/useBookletWorkflow', () => ({
  useBookletWorkflow: vi.fn(),
}))

vi.mock('../hooks/usePdfGeneration', () => ({
  downloadPdfBlob: vi.fn(),
}))

describe('BookletTool', () => {

  it('renders upload screen initially', () => {
    // Setup initial mock state
    vi.mocked(useBookletWorkflowModule.useBookletWorkflow).mockReturnValue({
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
      setError: vi.fn(),
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
      exportBooklet: vi.fn(),
    })

    render(
      <BrowserRouter>
        <BookletTool />
      </BrowserRouter>
    )
    expect(screen.getByText(/The Bindery Tool/i)).toBeDefined()
    // Using loose text matching for buttons/labels might need refinement if text changes
  })

  it('renders layout controls and results when layout is present', () => {
    vi.mocked(useBookletWorkflowModule.useBookletWorkflow).mockReturnValue({
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
      setError: vi.fn(),
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
      exportBooklet: vi.fn(),
    })

    render(
      <BrowserRouter>
        <BookletTool />
      </BrowserRouter>
    )

    // Check for some control elements
    expect(screen.getByText(/Layout Settings/i)).toBeDefined()
    expect(screen.getAllByText(/Sheets per Booklet/i).length).toBeGreaterThan(0)

    // Check for results
    expect(screen.getByText(/3. Imposition Strategy/i)).toBeDefined()
  })

  it('displays error message when error state is present', () => {
    const errorMsg = 'Failed to load PDF'
    vi.mocked(useBookletWorkflowModule.useBookletWorkflow).mockReturnValue({
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
      setError: vi.fn(),
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
      exportBooklet: vi.fn(),
    })

    render(
      <BrowserRouter>
        <BookletTool />
      </BrowserRouter>
    )
    expect(screen.getByText(errorMsg)).toBeDefined()
  })

  it('downloads the exported booklet PDF through the page adapter', async () => {
    const exportBooklet = vi.fn().mockResolvedValue({
      pdfBytes: new Uint8Array([1, 2, 3]),
      fileName: 'test-booklet.pdf',
      mimeType: 'application/pdf',
    })

    vi.mocked(useBookletWorkflowModule.useBookletWorkflow).mockReturnValue({
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
        sequence: [1, 2],
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
      setError: vi.fn(),
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
      exportBooklet,
    })

    render(
      <BrowserRouter>
        <BookletTool />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /generate pdf/i }))

    await waitFor(() => {
      expect(exportBooklet).toHaveBeenCalled()
      expect(downloadPdfBlob).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]), 'test-booklet.pdf')
    })
  })
})
