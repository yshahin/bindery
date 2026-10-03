import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addPreviewMarginGuides, generateBookletPdf } from './usePdfGeneration'
import { PDFDocument } from 'pdf-lib'
import { calculateBookletLayout, type BookletLayout } from '../utils/bookletCalculator'

const mockSave = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
const mockSourcePages = Array.from({ length: 20 }, (_, index) => ({
  index,
  node: { Contents: vi.fn(() => ({})) },
  getSize: vi.fn(() => ({ width: 612, height: 792 })),
  drawLine: vi.fn(),
}))
const mockGetSize = vi.fn().mockReturnValue({ width: 612, height: 792 })
const mockGetPage = vi.fn().mockReturnValue({ getSize: mockGetSize })
const mockOutputPages: Array<{
  drawPage: ReturnType<typeof vi.fn>
  drawLine: ReturnType<typeof vi.fn>
  drawRectangle: ReturnType<typeof vi.fn>
}> = []
const mockAddPage = vi.fn(() => {
  const page = { drawPage: vi.fn(), drawLine: vi.fn(), drawRectangle: vi.fn() }
  mockOutputPages.push(page)
  return page
})
const mockEmbedPages = vi.fn(async (pages: typeof mockSourcePages) =>
  pages.map((page) => ({ width: 612, height: 792, source: page })),
)

const mockSourcePdf = {
  getPageCount: vi.fn().mockReturnValue(mockSourcePages.length),
  getPages: vi.fn().mockReturnValue(mockSourcePages),
  getPage: mockGetPage,
  save: mockSave,
}

const mockBookletPdf = {
  addPage: mockAddPage,
  copyPages: vi.fn(async (_sourcePdf: typeof mockSourcePdf, indices: number[]) =>
    indices.map((index) => mockSourcePages[index])),
  embedPages: mockEmbedPages,
  setSubject: vi.fn(),
  save: mockSave,
}

vi.mock('pdf-lib', () => {
  return {
    PDFDocument: {
      load: vi.fn(),
      create: vi.fn(),
    },
    rgb: vi.fn((red, green, blue) => ({ red, green, blue })),
  }
})

function createLayout(
  sequence: BookletLayout['sequence'],
  pagesPerSheet = 4,
  includeBooklet = true,
): BookletLayout {
  const sheet = sequence.slice()
  while (sheet.length < pagesPerSheet) sheet.push(null)

  return {
    sequence,
    rangeStart: 1,
    rangeEnd: 20,
    totalPages: 20,
    pagesPerSheet,
    sheetsPerBooklet: 1,
    isRTL: false,
    totalBooklets: 1,
    completeBooklets: 0,
    remainingPages: 0,
    efficiency: 100,
    totalPhysicalPages: pagesPerSheet,
    totalBlankPages: sheet.filter((page) => page === null).length,
    totalSheets: 1,
    pagesPerBooklet: pagesPerSheet,
    booklets: includeBooklet
      ? [{
        index: 1,
        sheets: [sheet],
        sheetCount: 1,
        pages: pagesPerSheet,
        blankPages: sheet.filter((page) => page === null).length,
        isFinal: true,
        pageOrder: sheet,
      }]
      : [],
  }
}

describe('generateBookletPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOutputPages.length = 0
    vi.mocked(PDFDocument.load).mockResolvedValue(mockSourcePdf as any)
    vi.mocked(PDFDocument.create).mockResolvedValue(mockBookletPdf as any)
  })

  it('should throw error if input data is missing', async () => {
    await expect(generateBookletPdf(new ArrayBuffer(10), { sequence: [] } as BookletLayout))
      .rejects.toThrow('A PDF with a generated layout is required.')
  })

  it('should generate a PDF with correct page sequence', async () => {
    const mockPdfData = new ArrayBuffer(10)
    const mockLayout = createLayout([1, null, 2, null])

    const pdfBytes = await generateBookletPdf(mockPdfData, mockLayout)

    expect(PDFDocument.load).toHaveBeenCalledWith(mockPdfData)
    expect(PDFDocument.create).toHaveBeenCalled()
    expect(mockEmbedPages).toHaveBeenCalledWith([mockSourcePages[0], mockSourcePages[1]])
    expect(mockAddPage).toHaveBeenCalledTimes(2)
    for (const [size] of mockAddPage.mock.calls) {
      expect(size[0]).toBeCloseTo(792)
      expect(size[1]).toBeCloseTo(612)
    }
    expect(mockOutputPages[0].drawPage).toHaveBeenCalledTimes(1)
    expect(mockOutputPages[1].drawPage).toHaveBeenCalledTimes(1)
    expect(mockOutputPages[0].drawPage.mock.calls.map(([page]) => page.source.index)).toEqual([0])
    expect(mockOutputPages[1].drawPage.mock.calls.map(([page]) => page.source.index)).toEqual([1])
    expect(mockOutputPages[0].drawLine).not.toHaveBeenCalled()
    expect(mockOutputPages[1].drawLine).not.toHaveBeenCalled()

    expect(pdfBytes).toEqual(new Uint8Array([1, 2, 3]))
  })

  it('should handle page ranges correctly', async () => {
    const mockPdfData = new ArrayBuffer(10)
    const mockLayout = {
      ...createLayout([1, 2], 4, false),
      rangeStart: 5,
      rangeEnd: 10,
    }

    await generateBookletPdf(mockPdfData, mockLayout)

    expect(mockEmbedPages).toHaveBeenCalledWith([mockSourcePages[4], mockSourcePages[5]])
    expect(mockOutputPages).toHaveLength(2)
  })

  it('exports selected pages in reading order when imposition is left to the printer', async () => {
    const layout = {
      ...createLayout([1, 2, 3, 4]),
      rangeStart: 5,
      rangeEnd: 6,
      totalPages: 2,
    }

    await generateBookletPdf(new ArrayBuffer(10), layout, {
      imposePages: false,
      orderAsSignatures: true,
      paperType: 'letter',
      orientation: 'auto',
      outerMarginMm: 0,
      spineMarginMm: 0,
      showFoldGuide: true,
    })

    expect(mockBookletPdf.copyPages).toHaveBeenCalledWith(mockSourcePdf, [4, 5])
    expect(mockAddPage).toHaveBeenCalledTimes(2)
    expect(mockEmbedPages).not.toHaveBeenCalled()
  })

  it.each([
    {
      isRTL: false,
      orderAsSignatures: true,
      expected: [[12, 1], [2, 11], [10, 3], [4, 9], [8, 5], [6, 7]],
    },
    {
      isRTL: false,
      orderAsSignatures: false,
      expected: [[12, 1], [2, 11], [10, 3], [4, 9], [8, 5], [6, 7]],
    },
    {
      isRTL: true,
      orderAsSignatures: true,
      expected: [[1, 12], [11, 2], [3, 10], [9, 4], [5, 8], [7, 6]],
    },
    {
      isRTL: true,
      orderAsSignatures: false,
      expected: [[1, 12], [11, 2], [3, 10], [9, 4], [5, 8], [7, 6]],
    },
  ])(
    'imposes 3-sheet signatures in the correct $isRTL page order (signature grouping: $orderAsSignatures)',
    async ({ isRTL, orderAsSignatures, expected }) => {
      const layout = calculateBookletLayout(12, 3, 4, isRTL)

      await generateBookletPdf(new ArrayBuffer(10), layout, {
        imposePages: true,
        orderAsSignatures,
        paperType: 'source',
        orientation: 'landscape',
        outerMarginMm: 0,
        spineMarginMm: 0,
        showFoldGuide: false,
      })

      const printedPageNumbers = mockOutputPages.map((page) =>
        page.drawPage.mock.calls.map(([embeddedPage]) => embeddedPage.source.index + 1))
      expect(printedPageNumbers).toEqual(expected)

      const frontDraws = mockOutputPages[0].drawPage.mock.calls
      const pageOneX = frontDraws.find(([embeddedPage]) => embeddedPage.source.index === 0)?.[1].x
      const pageTwelveX = frontDraws.find(([embeddedPage]) => embeddedPage.source.index === 11)?.[1].x
      expect(pageOneX).toBeDefined()
      expect(pageTwelveX).toBeDefined()
      expect(pageOneX! < pageTwelveX!).toBe(isRTL)
    },
  )

  it.each([4, 8, 16])('composes %i-page sheets into two output sides', async (pagesPerSheet) => {
    const sequence = Array.from({ length: pagesPerSheet }, (_, index) => index + 1)
    const mockLayout = createLayout(sequence, pagesPerSheet)
    await generateBookletPdf(new ArrayBuffer(10), mockLayout)

    const expectedSizeMm = pagesPerSheet === 8 ? [215.9, 279.4] : [279.4, 215.9]
    expect(mockAddPage.mock.calls[0][0][0]).toBeCloseTo(expectedSizeMm[0] * 72 / 25.4)
    expect(mockAddPage.mock.calls[0][0][1]).toBeCloseTo(expectedSizeMm[1] * 72 / 25.4)
    expect(mockOutputPages).toHaveLength(2)
    expect(mockOutputPages[0].drawPage).toHaveBeenCalledTimes(pagesPerSheet / 2)
    expect(mockOutputPages[1].drawPage).toHaveBeenCalledTimes(pagesPerSheet / 2)
  })

  it('marks each signature with an unnumbered dark tab in booklet order', async () => {
    const mockLayout = createLayout([1, 2, 3, 4])
    const booklet = mockLayout.booklets[0]
    mockLayout.totalBooklets = 2
    mockLayout.booklets = [
      { ...booklet, index: 1 },
      { ...booklet, index: 2 },
    ]

    await generateBookletPdf(new ArrayBuffer(10), mockLayout, {
      imposePages: true,
      orderAsSignatures: true,
      paperType: 'source',
      orientation: 'landscape',
      outerMarginMm: 0,
      spineMarginMm: 0,
      showFoldGuide: false,
    })

    expect(mockOutputPages).toHaveLength(4)
    const tabPositions = mockOutputPages.map((page) => page.drawRectangle.mock.calls[0][0])
    expect(tabPositions[0].y).toBe(tabPositions[1].y)
    expect(tabPositions[2].y).toBe(tabPositions[3].y)
    expect(tabPositions[0].y).toBeGreaterThan(tabPositions[2].y)
    expect(tabPositions[0]).toMatchObject({
      x: 792 - 3 * 72 / 25.4,
      width: 3 * 72 / 25.4,
      color: { red: 0.12, green: 0.12, blue: 0.12 },
    })
  })

  it('ignores sheets per signature and imposes the entire document as one signature', async () => {
    const layout = createLayout([8, 1, 2, 7, 6, 3, 4, 5, 16, 9, 10, 15, 14, 11, 12, 13], 4, false)
    const firstSheets = [[8, 1, 2, 7], [6, 3, 4, 5]]
    const secondSheets = [[16, 9, 10, 15], [14, 11, 12, 13]]
    layout.totalPages = 16
    layout.totalBooklets = 2
    layout.totalSheets = 4
    layout.booklets = [firstSheets, secondSheets].map((sheets, index) => ({
      index: index + 1,
      sheets,
      sheetCount: sheets.length,
      pages: 8,
      blankPages: 0,
      isFinal: index === 1,
      pageOrder: sheets.flat(),
    }))

    await generateBookletPdf(new ArrayBuffer(10), layout, {
      imposePages: true,
      orderAsSignatures: false,
      paperType: 'source',
      orientation: 'landscape',
      outerMarginMm: 0,
      spineMarginMm: 0,
      showFoldGuide: false,
    })

    const printedPageOrder = mockOutputPages.map((page) =>
      page.drawPage.mock.calls.map(([embeddedPage]) => embeddedPage.source.index + 1))
    expect(printedPageOrder).toEqual([
      [16, 1], [2, 15],
      [14, 3], [4, 13],
      [12, 5], [6, 11],
      [10, 7], [8, 9],
    ])
    expect(mockOutputPages.every((page) => page.drawRectangle.mock.calls.length === 0)).toBe(true)
  })

  it.each([
    { paperType: 'source' as const, orientation: 'portrait' as const, sourceSize: { width: 792, height: 612 }, expectedSize: [612, 792] },
    { paperType: 'source' as const, orientation: 'landscape' as const, sourceSize: { width: 612, height: 792 }, expectedSize: [792, 612] },
  ])('uses the $orientation sheet override', async ({ orientation, sourceSize, expectedSize }) => {
    mockGetSize.mockReturnValueOnce(sourceSize)

    await generateBookletPdf(
      new ArrayBuffer(10),
      createLayout([1, 2, 3, 4]),
      { imposePages: true, orderAsSignatures: true, paperType: 'source', orientation, outerMarginMm: 0, spineMarginMm: 0, showFoldGuide: false },
    )

    expect(mockAddPage).toHaveBeenNthCalledWith(1, expectedSize)
  })

  it.each([
    { paperType: 'a3' as const, size: [297, 420] },
    { paperType: 'a4' as const, size: [210, 297] },
    { paperType: 'a5' as const, size: [148, 210] },
    { paperType: 'a6' as const, size: [105, 148] },
    { paperType: 'letter' as const, size: [215.9, 279.4] },
    { paperType: 'legal' as const, size: [215.9, 355.6] },
    { paperType: 'tabloid' as const, size: [279.4, 431.8] },
  ])('generates output using $paperType paper dimensions', async ({ paperType, size }) => {
    const pointsPerMillimeter = 72 / 25.4

    await generateBookletPdf(new ArrayBuffer(10), createLayout([1, 2, 3, 4]), {
      imposePages: true,
      orderAsSignatures: true,
      paperType,
      orientation: 'portrait',
      outerMarginMm: 0,
      spineMarginMm: 0,
      showFoldGuide: false,
    })

    expect(mockAddPage).toHaveBeenNthCalledWith(1, size.map((dimension) => dimension * pointsPerMillimeter))
  })

  it('uses US Letter as the default output paper', async () => {
    await generateBookletPdf(new ArrayBuffer(10), createLayout([1, 2, 3, 4]))

    const pointsPerMillimeter = 72 / 25.4
    expect(mockAddPage).toHaveBeenNthCalledWith(1, [279.4 * pointsPerMillimeter, 215.9 * pointsPerMillimeter])
  })

  it('applies outer and spine margins and draws a dashed center-fold guide when enabled', async () => {
    const mockLayout = createLayout([1, 2, 3, 4])
    await generateBookletPdf(
      new ArrayBuffer(10),
      mockLayout,
      { imposePages: true, orderAsSignatures: true, paperType: 'source', orientation: 'portrait', outerMarginMm: 10, spineMarginMm: 5, showFoldGuide: true },
    )

    const pointsPerMillimeter = 72 / 25.4
    const margin = 10 * pointsPerMillimeter
    const spine = 5 * pointsPerMillimeter
    const cellWidth = (612 - margin * 2 - spine * 2) / 2
    const leftDraw = mockOutputPages[0].drawPage.mock.calls[0][1]
    const rightDraw = mockOutputPages[0].drawPage.mock.calls[1][1]

    expect(leftDraw.x).toBeCloseTo(margin)
    expect(rightDraw.x).toBeCloseTo(margin + cellWidth + spine * 2)
    expect(mockOutputPages[0].drawLine).toHaveBeenCalledWith(expect.objectContaining({
      start: { x: 306, y: margin },
      end: { x: 306, y: 792 - margin },
      dashArray: [3, 3],
    }))
    expect(mockOutputPages[1].drawLine).toHaveBeenCalledTimes(1)
  })

  it('applies negative outer and spine margins to page placement', async () => {
    await generateBookletPdf(
      new ArrayBuffer(10),
      createLayout([1, 2, 3, 4]),
      { imposePages: true, orderAsSignatures: true, paperType: 'source', orientation: 'portrait', outerMarginMm: -5, spineMarginMm: -2, showFoldGuide: false },
    )

    const pointsPerMillimeter = 72 / 25.4
    const outerMargin = -5 * pointsPerMillimeter
    const spineMargin = -2 * pointsPerMillimeter
    const cellWidth = (612 - outerMargin * 2 - spineMargin * 2) / 2
    const leftDraw = mockOutputPages[0].drawPage.mock.calls[0][1]
    const rightDraw = mockOutputPages[0].drawPage.mock.calls[1][1]

    expect(leftDraw.x).toBeCloseTo(outerMargin)
    expect(rightDraw.x).toBeCloseTo(outerMargin + cellWidth + spineMargin * 2)
  })

  it('adds static dashed margin guides to the preview PDF copy', async () => {
    await addPreviewMarginGuides(new Uint8Array([1, 2, 3]))

    const outerMargin = 12.7 * 72 / 25.4
    const spineMargin = 15.9 * 72 / 25.4
    expect(mockSourcePages[0].drawLine).toHaveBeenCalledTimes(6)
    expect(mockSourcePages[0].drawLine).toHaveBeenCalledWith(expect.objectContaining({
      start: { x: outerMargin, y: 0 },
      end: { x: outerMargin, y: 792 },
      dashArray: [3, 3],
    }))
    expect(mockSourcePages[0].drawLine).toHaveBeenCalledWith(expect.objectContaining({
      start: { x: 306 - spineMargin, y: 0 },
      end: { x: 306 - spineMargin, y: 792 },
      dashArray: [3, 3],
    }))
  })
})
