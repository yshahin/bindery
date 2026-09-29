import { describe, it, expect } from 'vitest'
import {
  calculateBookletLayout,
  findOptimalSheetsPerBooklet,
} from './bookletCalculator'

describe('findOptimalSheetsPerBooklet', () => {
  const cases = [
    { totalPages: 48, expectedSheets: 6 },
    { totalPages: 100, expectedSheets: 5 },
    { totalPages: 128, expectedSheets: 8 },
    { totalPages: 300, expectedSheets: 5 },
    { totalPages: 42, expectedSheets: 6 },
    { totalPages: 33, expectedSheets: 3 },
    { totalPages: 125, expectedSheets: 8 },
  ]

  cases.forEach(({ totalPages, expectedSheets }) => {
    it(`selects ${expectedSheets} sheets for ${totalPages} pages`, () => {
      expect(findOptimalSheetsPerBooklet(totalPages, 4)).toBe(expectedSheets)
    })
  })
})

function fourUpReadingOrder(sheets: Array<Array<number | null>>): Array<number | null> {
  const readingOrder: Array<number | null> = []

  for (const sheet of sheets) {
    readingOrder.push(sheet[1] ?? null, sheet[2] ?? null)
  }

  for (const sheet of [...sheets].reverse()) {
    readingOrder.push(sheet[3] ?? null, sheet[0] ?? null)
  }

  return readingOrder
}

describe('optimal signature padding', () => {
  it('keeps capacity blanks after content in reading order and preserves cover blanks', () => {
    const optimalSheets = findOptimalSheetsPerBooklet(5, 4)
    const layout = calculateBookletLayout(5, optimalSheets, 4)

    expect(optimalSheets).toBe(2)
    expect(fourUpReadingOrder(layout.booklets[0].sheets)).toEqual([
      1, 2, 3, 4, 5, null, null, null,
    ])

    const layoutWithCover = calculateBookletLayout(5, 2, 4, false, true, 1)
    expect(fourUpReadingOrder(layoutWithCover.booklets[0].sheets)).toEqual([
      null, 1, 2, 3, 4, 5, null, null,
    ])
  })
})

describe('booklet page order (4 pages per sheet, LTR)', () => {
  const cases = [
    {
      sheetsPerBooklet: 1,
      expectedOrders: [
        [4, 1, 2, 3],
        [8, 5, 6, 7],
        [12, 9, 10, 11],
      ],
    },
    {
      sheetsPerBooklet: 2,
      expectedOrders: [
        [8, 1, 2, 7, 6, 3, 4, 5],
        [16, 9, 10, 15, 14, 11, 12, 13],
        [24, 17, 18, 23, 22, 19, 20, 21],
      ],
    },
    {
      sheetsPerBooklet: 3,
      expectedOrders: [
        [12, 1, 2, 11, 10, 3, 4, 9, 8, 5, 6, 7],
        [24, 13, 14, 23, 22, 15, 16, 21, 20, 17, 18, 19],
        [36, 25, 26, 35, 34, 27, 28, 33, 32, 29, 30, 31],
      ],
    },
    {
      sheetsPerBooklet: 4,
      expectedOrders: [
        [16, 1, 2, 15, 14, 3, 4, 13, 12, 5, 6, 11, 10, 7, 8, 9],
        [32, 17, 18, 31, 30, 19, 20, 29, 28, 21, 22, 27, 26, 23, 24, 25],
      ],
    },
    {
      sheetsPerBooklet: 5,
      expectedOrders: [
        [20, 1, 2, 19, 18, 3, 4, 17, 16, 5, 6, 15, 14, 7, 8, 13, 12, 9, 10, 11],
        [
          40, 21, 22, 39, 38, 23, 24, 37, 36, 25, 26, 35, 34, 27, 28, 33, 32, 29,
          30, 31,
        ],
      ],
    },
    {
      sheetsPerBooklet: 6,
      expectedOrders: [
        [
          24, 1, 2, 23, 22, 3, 4, 21, 20, 5, 6, 19, 18, 7, 8, 17, 16, 9, 10, 15,
          14, 11, 12, 13,
        ],
        [
          48, 25, 26, 47, 46, 27, 28, 45, 44, 29, 30, 43, 42, 31, 32, 41, 40, 33,
          34, 39, 38, 35, 36, 37,
        ],
      ],
    },
    {
      sheetsPerBooklet: 7,
      expectedOrders: [
        [
          28, 1, 2, 27, 26, 3, 4, 25, 24, 5, 6, 23, 22, 7, 8, 21, 20, 9, 10, 19,
          18, 11, 12, 17, 16, 13, 14, 15,
        ],
        [
          56, 29, 30, 55, 54, 31, 32, 53, 52, 33, 34, 51, 50, 35, 36, 49, 48, 37,
          38, 47, 46, 39, 40, 45, 44, 41, 42, 43,
        ],
      ],
    },
    {
      sheetsPerBooklet: 8,
      expectedOrders: [
        [
          32, 1, 2, 31, 30, 3, 4, 29, 28, 5, 6, 27, 26, 7, 8, 25, 24, 9, 10, 23,
          22, 11, 12, 21, 20, 13, 14, 19, 18, 15, 16, 17,
        ],
      ],
    },
  ]

  cases.forEach(({ sheetsPerBooklet, expectedOrders }) => {
    it(`matches classic order for ${sheetsPerBooklet} sheet booklet`, () => {
      const totalPages = sheetsPerBooklet * 4 * expectedOrders.length
      const layout = calculateBookletLayout(totalPages, sheetsPerBooklet, 4, false)

      expectedOrders.forEach((expectedOrder, bookletIndex) => {
        expect(layout.booklets[bookletIndex].pageOrder).toEqual(expectedOrder)
      })
    })
  })
})

