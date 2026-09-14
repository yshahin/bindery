import { describe, expect, it } from 'vitest'
import { calculateEvenSpacing, calculateHolePositions, calculateKettleHolePositions } from './holeGuideCalculator'

describe('calculateHolePositions', () => {
  it('generates evenly spaced holes when no ribbon gap is used', () => {
    const holes = calculateHolePositions({
      signatureHeightMm: 210,
      topOffsetMm: 20,
      bottomOffsetMm: 20,
      holeCount: 5,
    })

    expect(holes).toEqual([20, 62.5, 105, 147.5, 190])
  })

  it('applies a center ribbon gap when provided', () => {
    const holes = calculateHolePositions({
      signatureHeightMm: 210,
      topOffsetMm: 20,
      bottomOffsetMm: 20,
      holeCount: 5,
      ribbonGapMm: 12,
    })

    const gaps = holes.slice(1).map((position, index) => Number((position - holes[index]).toFixed(3)))
    expect(gaps).toEqual([52.667, 12, 52.667, 52.667])
  })

  it('throws when offsets exceed available signature height', () => {
    expect(() =>
      calculateHolePositions({
        signatureHeightMm: 150,
        topOffsetMm: 100,
        bottomOffsetMm: 80,
        holeCount: 4,
      })
    ).toThrow(/leave no room/i)
  })

  it('throws when ribbon gap is too large', () => {
    expect(() =>
      calculateHolePositions({
        signatureHeightMm: 180,
        topOffsetMm: 20,
        bottomOffsetMm: 20,
        holeCount: 4,
        ribbonGapMm: 140,
      })
    ).toThrow(/smaller than the available/i)
  })

  it('calculates even spacing from margins and hole count', () => {
    const result = calculateEvenSpacing(200, 20, 20, 5)

    expect(result.usableLengthMm).toBe(160)
    expect(result.spaceCount).toBe(4)
    expect(result.spacingMm).toBe(40)
  })

  it('generates top/bottom stations with 2 interior pairs for kettle stitch', () => {
    const holes = calculateKettleHolePositions({
      signatureHeightMm: 210,
      topOffsetMm: 20,
      bottomOffsetMm: 20,
      pairCount: 2,
      pairGapMm: 10,
    })

    expect(holes).toEqual([20, 57.5, 67.5, 142.5, 152.5, 190])
  })

  it('generates 3 interior pairs for kettle stitch', () => {
    const holes = calculateKettleHolePositions({
      signatureHeightMm: 210,
      topOffsetMm: 20,
      bottomOffsetMm: 20,
      pairCount: 3,
      pairGapMm: 8,
    })

    expect(holes).toEqual([20, 56.5, 64.5, 101, 109, 145.5, 153.5, 190])
  })

  it('generates 4 interior pairs for kettle stitch', () => {
    const holes = calculateKettleHolePositions({
      signatureHeightMm: 210,
      topOffsetMm: 20,
      bottomOffsetMm: 20,
      pairCount: 4,
      pairGapMm: 8,
    })

    expect(holes).toEqual([20, 50, 58, 84, 92, 118, 126, 152, 160, 190])
  })

  it('generates 5 interior pairs for kettle stitch', () => {
    const holes = calculateKettleHolePositions({
      signatureHeightMm: 210,
      topOffsetMm: 20,
      bottomOffsetMm: 20,
      pairCount: 5,
      pairGapMm: 6,
    })

    expect(holes).toEqual([20, 45.33333333333333, 51.33333333333333, 73.66666666666666, 79.66666666666666, 102, 108, 130.33333333333331, 136.33333333333331, 158.66666666666669, 164.66666666666669, 190])
  })

  it('throws when kettle pair spacing is too large for the available layout', () => {
    expect(() =>
      calculateKettleHolePositions({
        signatureHeightMm: 160,
        topOffsetMm: 20,
        bottomOffsetMm: 20,
        pairCount: 5,
        pairGapMm: 60,
      })
    ).toThrow(/too large/i)
  })
})
