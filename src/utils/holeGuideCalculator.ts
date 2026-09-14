export type UnitSystem = 'metric' | 'imperial'

export interface SignatureSizePreset {
  id: string
  label: string
  widthMm: number
  heightMm: number
}

export interface StitchPattern {
  id: string
  label: string
  bestFor: string
  holeCountLabel: string
  holeCount: number
  holePlacement: string
  spacingGuidelines: string
  bindingMode: 'fold' | 'edge'
  defaultTopOffsetMm: number
  defaultSpineInsetMm: number
  supportsRibbonGap: boolean
}

export interface HoleGuideInput {
  signatureHeightMm: number
  topOffsetMm: number
  bottomOffsetMm: number
  holeCount: number
  ribbonGapMm?: number
}

export interface KettleHoleGuideInput {
  signatureHeightMm: number
  topOffsetMm: number
  bottomOffsetMm: number
  pairCount: number
  pairGapMm: number
}

export interface EvenSpacingResult {
  usableLengthMm: number
  spaceCount: number
  spacingMm: number
}

export const MM_PER_INCH = 25.4
export const MM_PER_CM = 10

export const METRIC_SIGNATURE_PRESETS: SignatureSizePreset[] = [
  { id: 'a6', label: 'A6 (10.5 × 14.8 cm)', widthMm: 105, heightMm: 148 },
  { id: 'b6', label: 'B6 (12.5 × 17.6 cm)', widthMm: 125, heightMm: 176 },
  { id: 'a5', label: 'A5 (14.8 × 21.0 cm)', widthMm: 148, heightMm: 210 },
  { id: 'a4', label: 'A4 (21.0 × 29.7 cm)', widthMm: 210, heightMm: 297 },
]

export const IMPERIAL_SIGNATURE_PRESETS: SignatureSizePreset[] = [
  { id: 'letter', label: 'US Letter (8.5 × 11 in)', widthMm: 215.9, heightMm: 279.4 },
  { id: 'half-letter', label: 'Half Letter (5.5 × 8.5 in)', widthMm: 139.7, heightMm: 215.9 },
  { id: 'quarter-letter', label: 'Quarter Letter (4.25 × 5.5 in)', widthMm: 107.95, heightMm: 139.7 },
  { id: 'eighth-letter', label: 'Eighth Letter (2.75 × 4.25 in)', widthMm: 69.85, heightMm: 107.95 },
]

export const STITCH_PATTERNS: StitchPattern[] = [
  {
    id: 'kettle-stitch',
    label: 'Kettle / French Link',
    bestFor: 'Multi-signature text blocks needing link support',
    holeCountLabel: 'Top + bottom + 2–5 support pairs',
    holeCount: 6,
    holePlacement: '1 top, 1 bottom, plus interior pairs (no center single hole)',
    spacingGuidelines: '2 pairs: pair centers at 1/4 and 3/4. 3 pairs: centered and symmetric around midpoint. 4–5 pairs: evenly distributed interior pair centers.',
    bindingMode: 'fold',
    defaultTopOffsetMm: 22,
    defaultSpineInsetMm: 12,
    supportsRibbonGap: false,
  },
  {
    id: 'custom',
    label: 'Custom Hole Count',
    bestFor: 'Custom patterns and experiments',
    holeCountLabel: 'User-defined',
    holeCount: 5,
    holePlacement: 'Even spacing (or center ribbon gap) along selected line',
    spacingGuidelines: 'Set top/bottom offsets first, then divide remaining length.',
    bindingMode: 'fold',
    defaultTopOffsetMm: 20,
    defaultSpineInsetMm: 12,
    supportsRibbonGap: true,
  },
]

export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH
}

export function mmToCm(mm: number): number {
  return mm / MM_PER_CM
}

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH
}

export function cmToMm(cm: number): number {
  return cm * MM_PER_CM
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const temp = y
    y = x % y
    x = temp
  }
  return x || 1
}

export function inchesToFractionString(inches: number, denominator: number = 16): string {
  const sign = inches < 0 ? '-' : ''
  const absoluteInches = Math.abs(inches)
  let whole = Math.floor(absoluteInches)
  let numerator = Math.round((absoluteInches - whole) * denominator)

  if (numerator === denominator) {
    whole += 1
    numerator = 0
  }

  if (numerator === 0) {
    return `${sign}${whole}`
  }

  const divisor = gcd(numerator, denominator)
  const reducedNumerator = numerator / divisor
  const reducedDenominator = denominator / divisor

  if (whole === 0) {
    return `${sign}${reducedNumerator}/${reducedDenominator}`
  }

  return `${sign}${whole} ${reducedNumerator}/${reducedDenominator}`
}

export function formatDistance(mm: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'metric') {
    return `${mmToCm(mm).toFixed(2)} cm`
  }

  return `${inchesToFractionString(mmToInches(mm))} in`
}

export function calculateHolePositions(input: HoleGuideInput): number[] {
  const { signatureHeightMm, topOffsetMm, bottomOffsetMm, holeCount, ribbonGapMm } = input

  if (signatureHeightMm <= 0) {
    throw new Error('Signature height must be greater than 0.')
  }

  if (holeCount < 2) {
    throw new Error('At least 2 holes are required to create a guide.')
  }

  if (topOffsetMm < 0 || bottomOffsetMm < 0) {
    throw new Error('Top and bottom offsets must be 0 or greater.')
  }

  const availableSpanMm = signatureHeightMm - topOffsetMm - bottomOffsetMm

  if (availableSpanMm <= 0) {
    throw new Error('Top and bottom offsets leave no room for stitching.')
  }

  const gapCount = holeCount - 1

  if (gapCount === 1) {
    return [topOffsetMm, topOffsetMm + availableSpanMm]
  }

  const hasRibbonGap = typeof ribbonGapMm === 'number' && ribbonGapMm > 0

  if (!hasRibbonGap) {
    const evenGapMm = availableSpanMm / gapCount
    return Array.from({ length: holeCount }, (_, index) => topOffsetMm + (index * evenGapMm))
  }

  if ((ribbonGapMm as number) >= availableSpanMm) {
    throw new Error('Ribbon gap must be smaller than the available stitching span.')
  }

  const regularGapCount = gapCount - 1
  if (regularGapCount <= 0) {
    throw new Error('Not enough holes to apply a ribbon gap.')
  }

  const regularGapMm = (availableSpanMm - (ribbonGapMm as number)) / regularGapCount
  if (regularGapMm <= 0) {
    throw new Error('Ribbon gap is too large for this signature and offset configuration.')
  }

  const centerGapIndex = Math.floor((gapCount - 1) / 2)
  const gaps = Array.from({ length: gapCount }, () => regularGapMm)
  gaps[centerGapIndex] = ribbonGapMm as number

  const positions: number[] = [topOffsetMm]
  for (const gap of gaps) {
    positions.push(positions[positions.length - 1] + gap)
  }

  return positions
}

export function calculateEvenSpacing(
  signatureHeightMm: number,
  topOffsetMm: number,
  bottomOffsetMm: number,
  holeCount: number
): EvenSpacingResult {
  if (holeCount < 2) {
    throw new Error('At least 2 holes are required to calculate spacing.')
  }

  const usableLengthMm = signatureHeightMm - topOffsetMm - bottomOffsetMm
  if (usableLengthMm <= 0) {
    throw new Error('Top and bottom offsets leave no usable stitching length.')
  }

  const spaceCount = holeCount - 1
  return {
    usableLengthMm,
    spaceCount,
    spacingMm: usableLengthMm / spaceCount,
  }
}

export function calculateKettleHolePositions(input: KettleHoleGuideInput): number[] {
  const { signatureHeightMm, topOffsetMm, bottomOffsetMm, pairCount, pairGapMm } = input

  if (signatureHeightMm <= 0) {
    throw new Error('Signature height must be greater than 0.')
  }

  if (topOffsetMm < 0 || bottomOffsetMm < 0) {
    throw new Error('Top and bottom offsets must be 0 or greater.')
  }

  if (pairCount < 1) {
    throw new Error('At least one interior hole pair is required.')
  }

  if (pairGapMm <= 0) {
    throw new Error('Pair spacing must be greater than 0.')
  }

  const topStation = topOffsetMm
  const bottomStation = signatureHeightMm - bottomOffsetMm
  const usableSpanMm = bottomStation - topStation

  if (usableSpanMm <= 0) {
    throw new Error('Top and bottom offsets leave no room for stitching.')
  }

  if (pairCount < 2 || pairCount > 5) {
    throw new Error('Kettle/French Link supports 2 to 5 interior pairs.')
  }

  let holes: number[]

  if (pairCount === 2) {
    const topPairCenter = topStation + (usableSpanMm * 0.25)
    const bottomPairCenter = topStation + (usableSpanMm * 0.75)

    holes = [
      topStation,
      topPairCenter - (pairGapMm / 2),
      topPairCenter + (pairGapMm / 2),
      bottomPairCenter - (pairGapMm / 2),
      bottomPairCenter + (pairGapMm / 2),
      bottomStation,
    ]
  } else if (pairCount === 3) {
    const middlePairCenter = topStation + (usableSpanMm * 0.5)
    const middlePairTop = middlePairCenter - (pairGapMm / 2)
    const middlePairBottom = middlePairCenter + (pairGapMm / 2)

    const topPairCenter = (topStation + middlePairTop) / 2
    const bottomPairCenter = (middlePairBottom + bottomStation) / 2

    holes = [
      topStation,
      topPairCenter - (pairGapMm / 2),
      topPairCenter + (pairGapMm / 2),
      middlePairTop,
      middlePairBottom,
      bottomPairCenter - (pairGapMm / 2),
      bottomPairCenter + (pairGapMm / 2),
      bottomStation,
    ]
  } else {
    const centers = Array.from({ length: pairCount }, (_, index) => {
      const fraction = (index + 1) / (pairCount + 1)
      return topStation + (usableSpanMm * fraction)
    })

    holes = [topStation]
    for (const center of centers) {
      holes.push(center - (pairGapMm / 2))
      holes.push(center + (pairGapMm / 2))
    }
    holes.push(bottomStation)
  }

  const hasOverlap = holes.slice(1).some((value, index) => value <= holes[index])
  if (hasOverlap) {
    throw new Error('Pair spacing is too large for the selected pair count and offsets.')
  }

  return holes
}
