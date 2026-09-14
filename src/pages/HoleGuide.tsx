import { useEffect, useMemo, useState } from 'react'
import { CircleHelp, Printer, Ruler } from 'lucide-react'
import {
  calculateEvenSpacing,
  calculateHolePositions,
  calculateKettleHolePositions,
  cmToMm,
  formatDistance,
  IMPERIAL_SIGNATURE_PRESETS,
  inchesToFractionString,
  inchesToMm,
  mmToCm,
  METRIC_SIGNATURE_PRESETS,
  STITCH_PATTERNS,
  type SignatureSizePreset,
  type StitchPattern,
  type UnitSystem,
} from '../utils/holeGuideCalculator'

type PaperSize = 'a4' | 'letter'

const PAPER_SIZES_MM: Record<PaperSize, { label: string; width: number; height: number }> = {
  a4: { label: 'A4', width: 210, height: 297 },
  letter: { label: 'US Letter', width: 215.9, height: 279.4 },
}

function toUnitValue(mm: number, unitSystem: UnitSystem): string {
  return unitSystem === 'metric' ? mmToCm(mm).toFixed(2) : inchesToFractionString(mm / 25.4)
}

function parseImperialInches(value: string): number {
  const normalized = value.trim().replace(/in|"/gi, '').trim()
  if (!normalized) {
    return Number.NaN
  }

  const direct = Number.parseFloat(normalized)
  if (Number.isFinite(direct) && !normalized.includes('/')) {
    return direct
  }

  const parts = normalized.split(/\s+/)
  if (parts.length === 1 && parts[0].includes('/')) {
    const [numeratorRaw, denominatorRaw] = parts[0].split('/')
    const numerator = Number.parseFloat(numeratorRaw)
    const denominator = Number.parseFloat(denominatorRaw)
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return Number.NaN
    }
    return numerator / denominator
  }

  if (parts.length === 2 && parts[1].includes('/')) {
    const whole = Number.parseFloat(parts[0])
    const [numeratorRaw, denominatorRaw] = parts[1].split('/')
    const numerator = Number.parseFloat(numeratorRaw)
    const denominator = Number.parseFloat(denominatorRaw)
    if (!Number.isFinite(whole) || !Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return Number.NaN
    }
    const sign = whole < 0 ? -1 : 1
    return whole + sign * (numerator / denominator)
  }

  return Number.NaN
}

function fromUnitValue(value: string, unitSystem: UnitSystem): number {
  const parsed = unitSystem === 'metric' ? Number.parseFloat(value) : parseImperialInches(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return Number.NaN
  }

  return unitSystem === 'metric' ? cmToMm(parsed) : inchesToMm(parsed)
}

function getDefaultPreset(unitSystem: UnitSystem): SignatureSizePreset {
  return unitSystem === 'metric' ? METRIC_SIGNATURE_PRESETS[2] : IMPERIAL_SIGNATURE_PRESETS[0]
}

function formatPresetLabel(preset: SignatureSizePreset, unitSystem: UnitSystem): string {
  const presetName = preset.label.split(' (')[0]

  if (unitSystem === 'metric') {
    return `${presetName} (${mmToCm(preset.widthMm).toFixed(2)} × ${mmToCm(preset.heightMm).toFixed(2)} cm)`
  }

  return `${presetName} (${(preset.widthMm / 25.4).toFixed(2)} × ${(preset.heightMm / 25.4).toFixed(2)} in)`
}

export default function HoleGuide() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('a5')
  const [customHeight, setCustomHeight] = useState('21.00')
  const [customWidth, setCustomWidth] = useState('14.80')
  const [patternId, setPatternId] = useState('kettle-stitch')
  const [customHoleCount, setCustomHoleCount] = useState(5)
  const [kettlePairCount, setKettlePairCount] = useState(2)
  const [topOffset, setTopOffset] = useState('2.20')
  const [bottomOffset, setBottomOffset] = useState('2.20')
  const [spineInset, setSpineInset] = useState('1.20')
  const [symmetricOffsets, setSymmetricOffsets] = useState(true)
  const [kettlePairGap, setKettlePairGap] = useState('1.6')
  const [paperSize, setPaperSize] = useState<PaperSize>('a4')

  const allPresets = useMemo(() => [...METRIC_SIGNATURE_PRESETS, ...IMPERIAL_SIGNATURE_PRESETS], [])
  const metricDisplayPresets = useMemo(
    () => METRIC_SIGNATURE_PRESETS.map((preset) => ({ ...preset, label: formatPresetLabel(preset, unitSystem) })),
    [unitSystem]
  )
  const imperialDisplayPresets = useMemo(
    () => IMPERIAL_SIGNATURE_PRESETS.map((preset) => ({ ...preset, label: formatPresetLabel(preset, unitSystem) })),
    [unitSystem]
  )

  const selectedPattern = useMemo(
    () => STITCH_PATTERNS.find((pattern) => pattern.id === patternId) ?? STITCH_PATTERNS[0],
    [patternId]
  )

  useEffect(() => {
    setTopOffset(toUnitValue(selectedPattern.defaultTopOffsetMm, unitSystem))
    setBottomOffset(toUnitValue(selectedPattern.defaultTopOffsetMm, unitSystem))
    setSpineInset(toUnitValue(selectedPattern.defaultSpineInsetMm, unitSystem))
  }, [selectedPattern])

  const selectedPreset = useMemo(() => {
    if (selectedPresetId === 'custom') {
      return null
    }

    return allPresets.find((preset) => preset.id === selectedPresetId) ?? getDefaultPreset(unitSystem)
  }, [allPresets, selectedPresetId, unitSystem])

  const signatureHeightMm = useMemo(() => {
    if (selectedPreset) {
      return selectedPreset.heightMm
    }

    return fromUnitValue(customHeight, unitSystem)
  }, [customHeight, selectedPreset, unitSystem])

  const signatureWidthMm = useMemo(() => {
    if (selectedPreset) {
      return selectedPreset.widthMm
    }

    return fromUnitValue(customWidth, unitSystem)
  }, [customWidth, selectedPreset, unitSystem])

  const topOffsetMm = useMemo(() => fromUnitValue(topOffset, unitSystem), [topOffset, unitSystem])
  const bottomOffsetMm = useMemo(() => {
    if (symmetricOffsets) {
      return topOffsetMm
    }

    return fromUnitValue(bottomOffset, unitSystem)
  }, [bottomOffset, symmetricOffsets, topOffsetMm, unitSystem])

  const kettlePairGapMm = useMemo(() => fromUnitValue(kettlePairGap, unitSystem), [kettlePairGap, unitSystem])
  const spineInsetMm = useMemo(() => fromUnitValue(spineInset, unitSystem), [spineInset, unitSystem])

  const holeCount = selectedPattern.id === 'kettle-stitch'
    ? 2 + (kettlePairCount * 2)
    : (selectedPattern.id === 'custom' ? customHoleCount : selectedPattern.holeCount)

  const calculation = useMemo(() => {
    if (!Number.isFinite(signatureHeightMm) || !Number.isFinite(signatureWidthMm)) {
      return { error: 'Provide a valid signature width and height.', holes: [] as number[] }
    }

    if (!Number.isFinite(topOffsetMm) || !Number.isFinite(bottomOffsetMm)) {
      return { error: 'Provide valid top and bottom offsets.', holes: [] as number[] }
    }

    if (!Number.isFinite(spineInsetMm)) {
      return { error: 'Provide a valid spine-edge inset value.', holes: [] as number[] }
    }

    if (selectedPattern.id === 'kettle-stitch' && !Number.isFinite(kettlePairGapMm)) {
      return { error: 'Provide a valid kettle pair spacing value.', holes: [] as number[] }
    }

    try {
      if (selectedPattern.id === 'kettle-stitch') {
        const holes = calculateKettleHolePositions({
          signatureHeightMm,
          topOffsetMm,
          bottomOffsetMm,
          pairCount: kettlePairCount,
          pairGapMm: kettlePairGapMm,
        })

        return { error: null as string | null, holes }
      }

      const holes = calculateHolePositions({
        signatureHeightMm,
        topOffsetMm,
        bottomOffsetMm,
        holeCount,
      })

      return { error: null as string | null, holes }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unable to generate the hole guide.',
        holes: [] as number[],
      }
    }
  }, [
    signatureHeightMm,
    signatureWidthMm,
    topOffsetMm,
    bottomOffsetMm,
    spineInsetMm,
    kettlePairGapMm,
    kettlePairCount,
    selectedPattern,
    holeCount,
  ])

  const onUnitSystemChange = (next: UnitSystem) => {
    setUnitSystem(next)

    const defaultPreset = getDefaultPreset(next)
    setSelectedPresetId(defaultPreset.id)
    setCustomWidth(toUnitValue(defaultPreset.widthMm, next))
    setCustomHeight(toUnitValue(defaultPreset.heightMm, next))
    setTopOffset(toUnitValue(selectedPattern.defaultTopOffsetMm, next))
    setBottomOffset(toUnitValue(selectedPattern.defaultTopOffsetMm, next))
    setSpineInset(toUnitValue(selectedPattern.defaultSpineInsetMm, next))
    setKettlePairGap(next === 'imperial' ? '5/8' : '1.60')
  }

  const spacingRule = useMemo(() => {
    if (!Number.isFinite(signatureHeightMm) || !Number.isFinite(topOffsetMm) || !Number.isFinite(bottomOffsetMm)) {
      return null
    }

    try {
      return calculateEvenSpacing(signatureHeightMm, topOffsetMm, bottomOffsetMm, holeCount)
    } catch {
      return null
    }
  }, [bottomOffsetMm, holeCount, signatureHeightMm, topOffsetMm])

  const page = PAPER_SIZES_MM[paperSize]
  const safeSignatureHeightMm = Number.isFinite(signatureHeightMm) ? signatureHeightMm : 0
  const safeSignatureWidthMm = Number.isFinite(signatureWidthMm) ? signatureWidthMm : 0
  const fitHeightMm = Math.min(safeSignatureHeightMm, page.height)
  const fitWidthMm = Math.min(Math.max(safeSignatureWidthMm, 30), Math.min(page.width * 0.6, 80))
  const signatureTopMm = (page.height - fitHeightMm) / 2
  const signatureLeftMm = (page.width - fitWidthMm) / 2
  const foldX = signatureLeftMm + fitWidthMm / 2
  const edgeX = signatureLeftMm + (
    fitWidthMm > 0 && safeSignatureWidthMm > 0
      ? Math.min(Math.max(spineInsetMm, 1), safeSignatureWidthMm - 1) / safeSignatureWidthMm * fitWidthMm
      : fitWidthMm * 0.12
  )
  const stitchLineX = selectedPattern.bindingMode === 'edge' ? edgeX : foldX
  const dimensionX = signatureLeftMm - 12
  const fullHeightTextX = signatureLeftMm - 32
  const fullHeightTextY = signatureTopMm + (fitHeightMm / 2)
  const rightBarStartX = signatureLeftMm + fitWidthMm + 2
  const rightBarEndX = signatureLeftMm + fitWidthMm + 14
  const rightTextX = signatureLeftMm + fitWidthMm + 16
  const middleY = signatureTopMm + (fitHeightMm / 2)

  const canPrint = !calculation.error && calculation.holes.length > 1

  const handlePatternChange = (nextPatternId: string) => {
    setPatternId(nextPatternId)
  }

  const formatPatternName = (pattern: StitchPattern) => `${pattern.label} (${pattern.holeCountLabel})`

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative w-full">
      <div className="absolute top-0 left-0 w-full h-full texture-overlay opacity-50 z-[-1]" />

      <header className="text-center space-y-4 mb-10">
        <div className="flex items-center justify-center gap-3 text-stone-800 mb-2">
          <Ruler size={32} />
          <h1 className="serif-font text-4xl font-bold">Signature Hole Guide</h1>
        </div>
        <p className="text-xl text-stone-600 font-light max-w-3xl mx-auto">
          Create a printable punching guide for Kettle/French Link sewing or a fully custom hole pattern.
        </p>
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-stone-300 bg-white/70 p-1 no-print">
            <button
              type="button"
              onClick={() => onUnitSystemChange('metric')}
              className={`px-4 py-1.5 text-sm rounded-full transition-colors ${unitSystem === 'metric' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-800'}`}
            >
              Metric (cm)
            </button>
            <button
              type="button"
              onClick={() => onUnitSystemChange('imperial')}
              className={`px-4 py-1.5 text-sm rounded-full transition-colors ${unitSystem === 'imperial' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-800'}`}
            >
              Imperial (in)
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 print:grid-cols-1">
        <section className="bg-white rounded-xl border border-stone-200 paper-shadow p-6 space-y-6 no-print">
          <div>
            <h2 className="serif-font text-2xl text-stone-900 mb-1">Guide Settings</h2>
            <p className="text-sm text-stone-500">Choose size, pattern, and spacing rules, then print at 100% scale.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-stone-700">Signature Size</span>
              <select
                value={selectedPresetId}
                onChange={(event) => setSelectedPresetId(event.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800"
              >
                <optgroup label="Metric">
                  {metricDisplayPresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Imperial">
                  {imperialDisplayPresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                </optgroup>
                <option value="custom">Custom size</option>
              </select>
            </label>

            {selectedPresetId === 'custom' && (
              <>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-stone-700">Width ({unitSystem === 'metric' ? 'cm' : 'in'})</span>
                  <input
                    value={customWidth}
                    onChange={(event) => setCustomWidth(event.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800"
                    inputMode="decimal"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-stone-700">Height ({unitSystem === 'metric' ? 'cm' : 'in'})</span>
                  <input
                    value={customHeight}
                    onChange={(event) => setCustomHeight(event.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800"
                    inputMode="decimal"
                  />
                </label>
              </>
            )}

            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-stone-700">Stitch Pattern</span>
              <select
                value={patternId}
                onChange={(event) => handlePatternChange(event.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800"
              >
                {STITCH_PATTERNS.map((pattern) => (
                  <option key={pattern.id} value={pattern.id}>{formatPatternName(pattern)}</option>
                ))}
              </select>
            </label>

            {selectedPattern.id === 'custom' && (
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium text-stone-700">Hole Count</span>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={customHoleCount}
                  onChange={(event) => setCustomHoleCount(Number.parseInt(event.target.value, 10) || 2)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800"
                />
              </label>
            )}

            {selectedPattern.id === 'kettle-stitch' && (
              <>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium text-stone-700">Interior Pair Count</span>
                  <select
                    value={kettlePairCount}
                    onChange={(event) => setKettlePairCount(Number.parseInt(event.target.value, 10))}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800"
                  >
                    <option value={2}>2 pairs</option>
                    <option value={3}>3 pairs</option>
                    <option value={4}>4 pairs</option>
                    <option value={5}>5 pairs</option>
                  </select>
                </label>

                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium text-stone-700">Pair Spacing ({unitSystem === 'metric' ? 'cm' : 'in'})</span>
                  <input
                    value={kettlePairGap}
                    onChange={(event) => setKettlePairGap(event.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-stone-500">Distance between the two holes in each pair (can be set to ribbon/support width).</p>
                </label>
              </>
            )}

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-stone-700">Top Offset ({unitSystem === 'metric' ? 'cm' : 'in'})</span>
              <input
                value={topOffset}
                onChange={(event) => setTopOffset(event.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800"
                inputMode="decimal"
              />
            </label>

            {selectedPattern.bindingMode === 'edge' && (
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium text-stone-700">Distance from Spine Edge ({unitSystem === 'metric' ? 'cm' : 'in'})</span>
                <input
                  value={spineInset}
                  onChange={(event) => setSpineInset(event.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800"
                  inputMode="decimal"
                />
              </label>
            )}

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-stone-700">Bottom Offset ({unitSystem === 'metric' ? 'cm' : 'in'})</span>
              <input
                value={symmetricOffsets ? topOffset : bottomOffset}
                disabled={symmetricOffsets}
                onChange={(event) => setBottomOffset(event.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-800 disabled:bg-stone-100 disabled:text-stone-500"
                inputMode="decimal"
              />
            </label>

            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={symmetricOffsets}
                onChange={(event) => setSymmetricOffsets(event.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-saddle-brown focus:ring-saddle-brown"
              />
              <span className="text-sm text-stone-700">Use symmetric top/bottom offsets</span>
            </label>

            <div className="sm:col-span-2 bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-700 space-y-1">
              <p><strong>Placement:</strong> {selectedPattern.holePlacement}</p>
              <p><strong>Spacing:</strong> {selectedPattern.spacingGuidelines}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-4">
            <div className="text-xs text-stone-500">
              <p className="font-medium text-stone-600">Print instructions:</p>
              <ul className="list-disc list-inside">
                <li>Set scaling to 100% or “Actual Size”.</li>
                <li>Set Margins to “None”.</li>
              </ul>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg border border-stone-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setPaperSize('a4')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${paperSize === 'a4' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-800'}`}
                >
                  A4
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('letter')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${paperSize === 'letter' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-800'}`}
                >
                  US Letter
                </button>
              </div>
              <button
                onClick={() => window.print()}
                disabled={!canPrint}
                className="inline-flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
              >
                <Printer size={16} />
                Print Guide
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 paper-shadow p-4 no-print">
            <h3 className="font-semibold text-stone-800 mb-2">Hole Measurements</h3>
            {calculation.error ? (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md p-3">{calculation.error}</p>
            ) : (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-stone-700">
                {calculation.holes.map((position, index) => (
                  <li key={position}>
                    Hole {index + 1}: {formatDistance(position, unitSystem)} from top
                  </li>
                ))}
              </ul>
            )}
            {spacingRule && (
              <div className="mt-3 border-t border-stone-200 pt-3 text-xs text-stone-600 space-y-1">
                <p><strong>General rule:</strong> usable length = height − top margin − bottom margin</p>
                <p>
                  {formatDistance(signatureHeightMm, unitSystem)} − {formatDistance(topOffsetMm, unitSystem)} − {formatDistance(bottomOffsetMm, unitSystem)}
                  {' = '}
                  {formatDistance(spacingRule.usableLengthMm, unitSystem)}
                </p>
                <p>
                  {spacingRule.spaceCount} spaces → {formatDistance(spacingRule.usableLengthMm, unitSystem)} ÷ {spacingRule.spaceCount}
                  {' = '}
                  {formatDistance(spacingRule.spacingMm, unitSystem)} per space
                </p>
              </div>
            )}
          </div>

          <div className="hole-guide-sheet bg-white rounded-xl border border-stone-200 paper-shadow p-4">
            <svg
              role="img"
              aria-label="Printable hole guide"
              viewBox={`0 0 ${page.width} ${page.height}`}
              className="w-full h-auto"
            >
              <rect x={0} y={0} width={page.width} height={page.height} fill="#ffffff" />

              <rect
                x={signatureLeftMm}
                y={signatureTopMm}
                width={fitWidthMm}
                height={fitHeightMm}
                fill="#fafaf9"
                stroke="#d6d3d1"
                strokeWidth={0.5}
              />

              <line
                x1={stitchLineX}
                y1={0}
                x2={stitchLineX}
                y2={page.height}
                stroke="#78716c"
                strokeWidth={0.6}
                strokeDasharray="2 2"
              />

              <line
                x1={signatureLeftMm}
                y1={middleY}
                x2={signatureLeftMm + fitWidthMm}
                y2={middleY}
                stroke="#a8a29e"
                strokeWidth={0.35}
                strokeDasharray="2 2"
              />

              <line
                x1={dimensionX}
                y1={signatureTopMm}
                x2={dimensionX}
                y2={signatureTopMm + fitHeightMm}
                stroke="#a8a29e"
                strokeWidth={0.4}
              />
              <line
                x1={dimensionX - 2}
                y1={signatureTopMm}
                x2={dimensionX + 2}
                y2={signatureTopMm}
                stroke="#a8a29e"
                strokeWidth={0.4}
              />
              <line
                x1={dimensionX - 2}
                y1={signatureTopMm + fitHeightMm}
                x2={dimensionX + 2}
                y2={signatureTopMm + fitHeightMm}
                stroke="#a8a29e"
                strokeWidth={0.4}
              />
              <text
                x={fullHeightTextX}
                y={fullHeightTextY}
                fontSize={3.1}
                fill="#57534e"
              >
                H: {formatDistance(safeSignatureHeightMm, unitSystem)}
              </text>

              {calculation.holes.map((position) => {
                const y = signatureTopMm + (fitHeightMm > 0 ? (position / safeSignatureHeightMm) * fitHeightMm : 0)

                return (
                  <g key={position}>
                    <line x1={stitchLineX - 18} y1={y} x2={stitchLineX + 18} y2={y} stroke="#a8a29e" strokeWidth={0.4} />
                    <circle cx={stitchLineX} cy={y} r={1.2} fill="#292524" />

                    <line x1={rightBarStartX} y1={y} x2={rightBarEndX} y2={y} stroke="#a8a29e" strokeWidth={0.35} />
                    <line x1={stitchLineX + 19} y1={y} x2={rightBarStartX} y2={y} stroke="#d6d3d1" strokeWidth={0.25} strokeDasharray="1 1" />
                    <text
                      x={rightTextX}
                      y={y - 1.3}
                      fontSize={2.8}
                      fill="#57534e"
                    >
                      {formatDistance(position, unitSystem)}
                    </text>
                  </g>
                )
              })}

            </svg>
          </div>
        </section>
      </div>
    </div>
  )
}
