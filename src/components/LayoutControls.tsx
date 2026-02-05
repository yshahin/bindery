import { type TextDirection } from '../utils/rtlDetector'
import { RotateCw, RefreshCw, Target } from 'lucide-react';

interface PagesPerSheetControlProps {
  pagesPerSheet: number
  onPagesPerSheetChange: (value: number) => void
}

function PagesPerSheetControl({ pagesPerSheet, onPagesPerSheetChange }: PagesPerSheetControlProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-stone-700 mb-2">
        Pages per Sheet (front + back)
        <span className="block text-xs font-normal text-stone-500 mt-1">Must be multiple of 2</span>
      </label>
      <div className="flex gap-2">
        {[4, 8, 16].map(val => (
          <button
            key={val}
            type="button"
            onClick={() => onPagesPerSheetChange(val)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors border ${pagesPerSheet === val
              ? 'bg-stone-800 text-white border-stone-800'
              : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
              }`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  )
}

interface PrintRangeControlProps {
  rangeStart: number
  rangeEnd: number
  totalPages: number
  selectedPageCount: number
  onRangeStartChange: (value: string) => void
  onRangeEndChange: (value: string) => void
  onResetRange: () => void
}

function PrintRangeControl({
  rangeStart,
  rangeEnd,
  totalPages,
  selectedPageCount,
  onRangeStartChange,
  onRangeEndChange,
  onResetRange
}: PrintRangeControlProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-stone-700 mb-2">
        Print Range
        <span className="block text-xs font-normal text-stone-500 mt-1">Choose the start and end page for the booklet</span>
      </label>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          min="1"
          max={totalPages}
          value={rangeStart}
          onChange={(e) => onRangeStartChange(e.target.value)}
          className="w-20 px-3 py-2 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-800 text-center"
        />
        <span className="text-stone-400">—</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={rangeEnd}
          onChange={(e) => onRangeEndChange(e.target.value)}
          className="w-20 px-3 py-2 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-800 text-center"
        />
        <button
          type="button"
          onClick={onResetRange}
          className="ml-2 p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
          title="Reset to full page range"
          disabled={rangeStart === 1 && rangeEnd === totalPages}
        >
          <RotateCw size={16} />
        </button>
      </div>
      <div className="text-xs text-stone-500 font-medium bg-stone-50 inline-block px-2 py-1 rounded border border-stone-200">
        Printing {selectedPageCount} page{selectedPageCount === 1 ? '' : 's'} from {rangeStart} to {rangeEnd}
      </div>
    </div>
  )
}

interface TextDirectionControlProps {
  textDirection: TextDirection
  detectedDirection: TextDirection | null
  detecting: boolean
  onTextDirectionChange: (direction: TextDirection) => void
}

function TextDirectionControl({
  textDirection,
  detectedDirection,
  detecting,
  onTextDirectionChange
}: TextDirectionControlProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-stone-700 mb-2">
        Text Direction
        <span className="block text-xs font-normal text-stone-500 mt-1 h-5 flex items-center gap-1">
          {detectedDirection && detectedDirection !== 'unknown' && (
            <span className="text-green-600">Detected: {detectedDirection.toUpperCase()}</span>
          )}
          {detectedDirection === 'unknown' && (
            <span className="text-amber-600">Could not auto-detect</span>
          )}
          {!detectedDirection && detecting && (
            <span className="flex items-center gap-1 text-stone-400">
              <RefreshCw size={10} className="animate-spin" /> Detecting...
            </span>
          )}
        </span>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onTextDirectionChange('ltr')}
          className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors border text-center ${textDirection === 'ltr'
            ? 'bg-stone-800 text-white border-stone-800'
            : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
            }`}
          title="Left-to-Right (English, European languages)"
        >
          ← LTR
        </button>
        <button
          type="button"
          onClick={() => onTextDirectionChange('rtl')}
          className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors border text-center ${textDirection === 'rtl'
            ? 'bg-stone-800 text-white border-stone-800'
            : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
            }`}
          title="Right-to-Left (Arabic, Hebrew)"
        >
          RTL →
        </button>
      </div>
    </div>
  )
}

interface SheetsPerBookletControlProps {
  sheetsPerBooklet: number
  pagesPerSheet: number
  onSheetsPerBookletChange: (value: string) => void
  onOptimize: () => void
}

function SheetsPerBookletControl({
  sheetsPerBooklet,
  pagesPerSheet,
  onSheetsPerBookletChange,
  onOptimize
}: SheetsPerBookletControlProps) {
  return (
    <div className="mb-6">
      <label htmlFor="sheets-per-booklet" className="block text-sm font-bold text-stone-700 mb-2">
        Sheets per Booklet (Signature)
        <span className="block text-xs font-normal text-stone-500 mt-1">Control how many sheets get folded into each booklet</span>
      </label>
      <div className="flex items-stretch gap-2 mb-2">
        <input
          type="number"
          id="sheets-per-booklet"
          min="1"
          step="1"
          value={sheetsPerBooklet}
          onChange={(e) => onSheetsPerBookletChange(e.target.value)}
          className="w-20 px-3 py-2 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-800 text-center"
        />
        <button
          type="button"
          onClick={onOptimize}
          className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded border border-stone-200 transition-colors"
          title="Find optimal sheet count to minimize blank pages"
        >
          <Target size={16} /> Optimize
        </button>
      </div>
      <div className="text-xs text-stone-500">
        Each booklet = {sheetsPerBooklet * pagesPerSheet} pages
      </div>
    </div>
  )
}

interface BookCoverControlProps {
  hasCover: boolean
  coverPages: number
  onHasCoverChange: (value: boolean) => void
  onCoverPagesChange: (value: number) => void
}

function BookCoverControl({
  hasCover,
  coverPages,
  onHasCoverChange,
  onCoverPagesChange
}: BookCoverControlProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <label className="block text-sm font-bold text-stone-700">
          Book Cover
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={hasCover}
          onClick={() => onHasCoverChange(!hasCover)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 ${hasCover ? 'bg-stone-800' : 'bg-stone-200'
            }`}
          title={hasCover ? 'Remove cover pages' : 'Add cover pages'}
        >
          <span className="sr-only">Use book cover</span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasCover ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>

      <span className="block text-xs font-normal text-stone-500 mb-2">Add blank pages at beginning and end for gluing the cover</span>

      <div className={`transition-all duration-300 overflow-hidden ${hasCover ? 'max-h-24 opacity-100' : 'max-h-0 opacity-50'}`}>
        <div className="flex items-center gap-2 mb-1">
          <input
            type="number"
            id="cover-pages"
            min="1"
            max="10"
            step="1"
            value={coverPages}
            onChange={(e) => onCoverPagesChange(Number(e.target.value))}
            className="w-20 px-3 py-2 bg-white border border-stone-300 rounded focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 text-stone-800 text-center"
            disabled={!hasCover}
          />
          <span className="text-sm text-stone-600">pages each side</span>
        </div>

        <div className="text-xs text-stone-400">
          Total: {coverPages * 2} blank pages ({coverPages} at start, {coverPages} at end)
        </div>
      </div>
    </div>
  )
}

interface LayoutControlsProps {
  pagesPerSheet: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  selectedPageCount: number
  textDirection: TextDirection
  detectedDirection: TextDirection | null
  detecting: boolean
  sheetsPerBooklet: number
  hasCover: boolean
  coverPages: number
  onPagesPerSheetChange: (value: number) => void
  onRangeStartChange: (value: string) => void
  onRangeEndChange: (value: string) => void
  onResetRange: () => void
  onTextDirectionChange: (direction: TextDirection) => void
  onSheetsPerBookletChange: (value: string) => void
  onOptimize: () => void
  onHasCoverChange: (value: boolean) => void
  onCoverPagesChange: (value: number) => void
}

export default function LayoutControls({
  pagesPerSheet,
  rangeStart,
  rangeEnd,
  totalPages,
  selectedPageCount,
  textDirection,
  detectedDirection,
  detecting,
  sheetsPerBooklet,
  hasCover,
  coverPages,
  onPagesPerSheetChange,
  onRangeStartChange,
  onRangeEndChange,
  onResetRange,
  onTextDirectionChange,
  onSheetsPerBookletChange,
  onOptimize,
  onHasCoverChange,
  onCoverPagesChange
}: LayoutControlsProps) {
  return (
    <div className="bg-white p-6 rounded-xl paper-shadow border border-stone-100 h-fit">
      <h2 className="text-lg font-serif font-bold text-stone-800 mb-6 pb-2 border-b border-stone-100">2. Layout Settings</h2>

      <PagesPerSheetControl
        pagesPerSheet={pagesPerSheet}
        onPagesPerSheetChange={onPagesPerSheetChange}
      />

      <BookCoverControl
        hasCover={hasCover}
        coverPages={coverPages}
        onHasCoverChange={onHasCoverChange}
        onCoverPagesChange={onCoverPagesChange}
      />

      <PrintRangeControl
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalPages={totalPages}
        selectedPageCount={selectedPageCount}
        onRangeStartChange={onRangeStartChange}
        onRangeEndChange={onRangeEndChange}
        onResetRange={onResetRange}
      />

      <TextDirectionControl
        textDirection={textDirection}
        detectedDirection={detectedDirection}
        detecting={detecting}
        onTextDirectionChange={onTextDirectionChange}
      />

      <SheetsPerBookletControl
        sheetsPerBooklet={sheetsPerBooklet}
        pagesPerSheet={pagesPerSheet}
        onSheetsPerBookletChange={onSheetsPerBookletChange}
        onOptimize={onOptimize}
      />
    </div>
  )
}
