import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import BookletTool from './BookletTool'
import * as useBookletWorkflowModule from '../hooks/useBookletWorkflow'
import { addPreviewMarginGuides, downloadPdfBlob } from '../hooks/usePdfGeneration'

// Mock the hook
vi.mock('../hooks/useBookletWorkflow', () => ({
  useBookletWorkflow: vi.fn(),
}))

vi.mock('../hooks/usePdfGeneration', async (importOriginal) => ({
  ...await importOriginal<typeof import('../hooks/usePdfGeneration')>(),
  downloadPdfBlob: vi.fn(),
  addPreviewMarginGuides: vi.fn(async (pdfBytes: Uint8Array) => pdfBytes),
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
      printSheet: { imposePages: true, orderAsSignatures: true, paperType: 'letter', orientation: 'auto', outerMarginMm: 0, spineMarginMm: 0, showFoldGuide: false },
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
      handlePrintSheetChange: vi.fn(),
      exportBooklet: vi.fn(),
    })

    render(
      <BrowserRouter>
        <BookletTool />
      </BrowserRouter>
    )
    expect(screen.getByText(/Waraq Tool/i)).toBeDefined()
    // Using loose text matching for buttons/labels might need refinement if text changes
  })

  it('renders layout controls and results when layout is present', () => {
    const handlePrintSheetChange = vi.fn()
    const workflowResult: ReturnType<typeof useBookletWorkflowModule.useBookletWorkflow> = {
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
      printSheet: { imposePages: true, orderAsSignatures: true, paperType: 'letter', orientation: 'auto', outerMarginMm: 0, spineMarginMm: 0, showFoldGuide: false },
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
      handlePrintSheetChange,
      exportBooklet: vi.fn(),
    }
    vi.mocked(useBookletWorkflowModule.useBookletWorkflow).mockReturnValue(workflowResult)

    const rendered = render(
      <BrowserRouter>
        <BookletTool />
      </BrowserRouter>
    )

    // Check for some control elements
    expect(screen.getByText(/Layout Settings/i)).toBeDefined()
    expect(screen.getAllByText(/Sheets per Booklet/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Outer margin (mm)')).toBeDefined()
    expect(screen.getByLabelText('Spine inset (mm)')).toBeDefined()
    expect(screen.getByLabelText('Print paper')).toBeDefined()
    expect(screen.getByRole('group', { name: 'Sheet orientation' })).toBeDefined()
    expect(screen.getByRole('switch', { name: 'Impose pages in PDF' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('switch', { name: 'Order by signature' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('switch', { name: 'Center-fold guide' })).toBeDefined()

    fireEvent.click(screen.getByRole('switch', { name: 'Order by signature' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Impose pages in PDF' }))
    fireEvent.click(screen.getByRole('button', { name: 'landscape' }))
    fireEvent.change(screen.getByLabelText('Print paper'), { target: { value: 'a4' } })
    fireEvent.change(screen.getByLabelText('Outer margin (mm)'), { target: { value: '-2' } })
    fireEvent.click(screen.getByRole('switch', { name: 'Center-fold guide' }))
    expect(handlePrintSheetChange).toHaveBeenNthCalledWith(1, { orderAsSignatures: false })
    expect(handlePrintSheetChange).toHaveBeenNthCalledWith(2, { imposePages: false })
    expect(handlePrintSheetChange).toHaveBeenNthCalledWith(3, { orientation: 'landscape' })
    expect(handlePrintSheetChange).toHaveBeenNthCalledWith(4, { paperType: 'a4' })
    expect(handlePrintSheetChange).toHaveBeenNthCalledWith(5, { outerMarginMm: -2 })
    expect(handlePrintSheetChange).toHaveBeenNthCalledWith(6, { showFoldGuide: true })

    workflowResult.printSheet.orderAsSignatures = false
    rendered.rerender(
      <BrowserRouter>
        <BookletTool />
      </BrowserRouter>
    )
    const hiddenSheetsInput = document.querySelector<HTMLInputElement>('#sheets-per-booklet')
    expect(hiddenSheetsInput?.disabled).toBe(true)
    expect(hiddenSheetsInput?.closest('[aria-hidden="true"]')?.classList.contains('max-h-0')).toBe(true)
    expect(screen.getByText('All sheets are treated as one signature.')).toBeDefined()
    expect(screen.getByText('Booklets').nextElementSibling?.textContent).toBe('-')
    workflowResult.printSheet.imposePages = false
    rendered.rerender(
      <BrowserRouter>
        <BookletTool />
      </BrowserRouter>
    )
    expect(screen.queryByText('All sheets are treated as one signature.')).toBeNull()
    expect(screen.queryByText(/Pages stay in reading order/)).toBeNull()
    expect(screen.queryByText(/Signature grouping applies only/)).toBeNull()

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
      printSheet: { imposePages: true, orderAsSignatures: true, paperType: 'letter', orientation: 'auto', outerMarginMm: 0, spineMarginMm: 0, showFoldGuide: false },
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
      handlePrintSheetChange: vi.fn(),
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
      fileName: 'test.booklet.pdf',
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
      printSheet: { imposePages: true, orderAsSignatures: true, paperType: 'letter', orientation: 'auto', outerMarginMm: 12.7, spineMarginMm: 15.9, showFoldGuide: false },
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
      handlePrintSheetChange: vi.fn(),
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
      expect(downloadPdfBlob).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]), 'test.booklet.pdf')
    })
  })

  it('previews a selected page from the generated booklet PDF', async () => {
    const exportBooklet = vi.fn().mockResolvedValue({
      pdfBytes: new Uint8Array([1, 2, 3]),
      fileName: 'test.booklet.pdf',
      mimeType: 'application/pdf',
    })
    const createObjectURL = vi.fn().mockReturnValue('blob:generated-booklet')
    const revokeObjectURL = vi.fn()
    const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL')
    const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL')

    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })

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
      printSheet: { imposePages: false, orderAsSignatures: true, paperType: 'letter', orientation: 'auto', outerMarginMm: 0, spineMarginMm: 0, showFoldGuide: false },
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
      handlePrintSheetChange: vi.fn(),
      exportBooklet,
    })

    render(
      <BrowserRouter>
        <BookletTool />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /preview pdf/i }))

    await waitFor(() => {
      expect(exportBooklet).toHaveBeenCalled()
      expect(addPreviewMarginGuides).not.toHaveBeenCalled()
      expect(screen.getByTitle('Generated PDF page 1').getAttribute('src')).toBe('blob:generated-booklet#page=1')
      expect(screen.getByText('of 10')).toBeDefined()
    })

    fireEvent.change(screen.getByLabelText('Preview page'), { target: { value: '3' } })
    expect(screen.getByTitle('Generated PDF page 3').getAttribute('src')).toBe('blob:generated-booklet#page=3')

    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }))
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:generated-booklet')

    if (originalCreateObjectURL) Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL)
    else delete (URL as { createObjectURL?: typeof URL.createObjectURL }).createObjectURL
    if (originalRevokeObjectURL) Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL)
    else delete (URL as { revokeObjectURL?: typeof URL.revokeObjectURL }).revokeObjectURL
  })
})
