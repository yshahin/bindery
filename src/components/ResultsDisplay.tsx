import { type BookletLayout } from '../utils/bookletCalculator'
import { Download, Eye } from 'lucide-react'

interface ResultsSummaryProps {
  onPrint: () => void
  onPreview: () => void
  exporting: boolean
}

function ResultsSummary({ onPrint, onPreview, exporting }: ResultsSummaryProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
      <h2 className="text-lg font-serif font-bold text-stone-800">3. Imposition Strategy</h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="bg-white text-stone-700 px-4 py-2 rounded-lg font-bold border border-stone-300 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Preview a page from the generated PDF"
          disabled={exporting}
        >
          <Eye size={18} />
          Preview PDF
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="bg-stone-800 text-white px-5 py-2 rounded-lg font-bold hover:bg-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          title="Generate a booklet-ready PDF"
          disabled={exporting}
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            <>
              <Download size={18} />
              Generate PDF
            </>
          )}
        </button>
      </div>
    </div>
  )
}

interface ResultsGridProps {
  layout: BookletLayout
}

function ResultsGrid({ layout }: ResultsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div className={`p-4 rounded-lg text-center border ${layout.totalBlankPages === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${layout.totalBlankPages === 0 ? 'text-green-700' : 'text-amber-700'}`}>
          Blank Pages
        </div>
        <div className={`text-2xl font-serif font-bold ${layout.totalBlankPages === 0 ? 'text-green-800' : 'text-amber-800'}`}>
          {layout.totalBlankPages}
        </div>
      </div>

      <div className="bg-stone-50 p-4 rounded-lg text-center border border-stone-200">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Booklets</div>
        <div className="text-2xl font-serif font-bold text-stone-800">{layout.totalBooklets}</div>
      </div>

      <div className="bg-stone-50 p-4 rounded-lg text-center border border-stone-200">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Total Sheets</div>
        <div className="text-2xl font-serif font-bold text-stone-800">{layout.totalSheets}</div>
      </div>

      <div className="bg-stone-50 p-4 rounded-lg text-center border border-stone-200">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Pages / Booklet</div>
        <div className="text-2xl font-serif font-bold text-stone-800">{layout.pagesPerBooklet}</div>
      </div>

      <div className="bg-stone-50 p-4 rounded-lg text-center border border-stone-200">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Efficiency</div>
        <div className="text-2xl font-serif font-bold text-stone-800">{layout.efficiency}%</div>
      </div>
    </div>
  )
}

interface DetailsBreakdownProps {
  layout: BookletLayout
  totalPages: number
}

function DetailsBreakdown({ layout, totalPages }: DetailsBreakdownProps) {
  return (
    <div className="mt-8 bg-stone-50/50 rounded-lg p-6 border border-stone-100">
      <h3 className="font-bold text-stone-800 mb-4 text-sm uppercase tracking-wide">Detailed Breakdown</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-12">
        <div className="flex justify-between items-center py-2 border-b border-stone-200/50">
          <span className="text-sm text-stone-600">Total PDF Pages:</span>
          <span className="text-sm font-bold text-stone-800 text-right">{totalPages}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-stone-200/50">
          <span className="text-sm text-stone-600">Selected Range:</span>
          <span className="text-sm font-bold text-stone-800 text-right">
            {layout.rangeStart}–{layout.rangeEnd} ({layout.totalPages} page{layout.totalPages === 1 ? '' : 's'})
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-stone-200/50">
          <span className="text-sm text-stone-600">Pages per Sheet:</span>
          <span className="text-sm font-bold text-stone-800 text-right">{layout.pagesPerSheet}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-stone-200/50">
          <span className="text-sm text-stone-600">Sheets per Booklet:</span>
          <span className="text-sm font-bold text-stone-800 text-right">{layout.sheetsPerBooklet}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-stone-200/50">
          <span className="text-sm text-stone-600">Pages per Booklet:</span>
          <span className="text-sm font-bold text-stone-800 text-right">{layout.pagesPerBooklet}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-stone-200/50">
          <span className="text-sm text-stone-600">Complete Booklets:</span>
          <span className="text-sm font-bold text-stone-800 text-right">{layout.completeBooklets}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-stone-200/50">
          <span className="text-sm text-stone-600">Remaining Pages:</span>
          <span className="text-sm font-bold text-stone-800 text-right">
            {layout.remainingPages || 0}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-stone-200/50">
          <span className="text-sm text-stone-600">Blank Pages Needed:</span>
          <span className="text-sm font-bold text-stone-800 text-right">{layout.totalBlankPages}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-stone-200/50 sm:col-span-2">
          <span className="text-sm text-stone-600">Text Direction:</span>
          <span className="text-sm font-bold text-stone-800 text-right">{layout.isRTL ? 'Right-to-Left (Arranged for RTL binding)' : 'Left-to-Right'}</span>
        </div>
      </div>
    </div>
  )
}

interface ResultsDisplayProps {
  layout: BookletLayout | null
  error: string | null
  totalPages: number
  onPrint: () => void
  onPreview: () => void
  exporting: boolean
}

export default function ResultsDisplay({ layout, error, totalPages, onPrint, onPreview, exporting }: ResultsDisplayProps) {
  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
        <h3 className="text-red-800 font-bold mb-2">Configuration Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  if (!layout) {
    return null
  }

  return (
    <div className="bg-white p-6 rounded-xl paper-shadow border border-stone-100">
      <ResultsSummary onPrint={onPrint} onPreview={onPreview} exporting={exporting} />
      <ResultsGrid layout={layout} />
      <DetailsBreakdown layout={layout} totalPages={totalPages} />
    </div>
  )
}
