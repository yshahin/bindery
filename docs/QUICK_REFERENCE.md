# Quick Reference Guide

## What This App Does
Prepares PDF books for professional printing by reordering pages into booklet/signature format and minimizing blank pages.

## 30-Second Overview
1. User uploads PDF
2. App detects text direction (LTR/RTL)
3. Calculates optimal booklet layout
4. Generates new PDF with pages reordered for printing/folding

---

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main component, orchestrates everything |
| `src/hooks/useBookletState.ts` | State management, main logic |
| `src/utils/bookletCalculator.ts` | Core booklet calculation algorithm |
| `src/hooks/usePdfGeneration.ts` | Generates reordered PDF |
| `src/utils/rtlDetector.ts` | Auto-detects RTL languages |
| `src/components/LayoutControls.tsx` | User settings UI |
| `src/components/BookletView.tsx` | Visual booklet preview |

---

## Key Terms

- **Sheet**: Physical paper (has front and back)
- **Booklet/Signature**: Group of folded sheets
- **Pages per Sheet**: Logical pages on one physical sheet (must be even: 4, 8, 16)
- **Sheets per Booklet**: How many sheets folded together
- **Imposition**: Arranging pages so they're in order after folding
- **Blank Pages**: Filler pages to complete final booklet

---

## State Variables

```typescript
pdfFile          // Uploaded file
totalPages       // Pages in PDF
sheetsPerBooklet // User setting (or auto-optimized)
pagesPerSheet    // User setting (4, 8, or 16)
textDirection    // 'ltr' or 'rtl'
layout           // Calculated BookletLayout object
rangeStart       // First page to include
rangeEnd         // Last page to include
```

---

## Main Functions

### `calculateBookletLayout(totalPages, sheetsPerBooklet, pagesPerSheet, isRTL)`
**Location**: `utils/bookletCalculator.ts`
**Purpose**: Calculates complete layout with page ordering
**Returns**: `BookletLayout` object

### `findOptimalSheetsPerBooklet(totalPages, pagesPerSheet)`
**Location**: `utils/bookletCalculator.ts`
**Purpose**: Finds sheet count that minimizes blank pages
**Returns**: Optimal number of sheets per booklet

### `useBookletState()`
**Location**: `hooks/useBookletState.ts`
**Purpose**: Main state management hook
**Returns**: All state + handlers

### `useBookletPdfGenerator(pdfData, layout)`
**Location**: `hooks/usePdfGeneration.ts`
**Purpose**: Creates final reordered PDF
**Returns**: Function that generates PDF bytes

---

## Data Flow

```
PDF Upload → Load with pdf-lib → Detect RTL → Find optimal layout → 
Calculate layout → Display results → Generate PDF → Download
```

---

## Common Tasks

### Change Default Pages Per Sheet
**File**: `hooks/useBookletState.ts`
**Line**: `const [pagesPerSheet, setPagesPerSheet] = useState<number>(4)`
Change `4` to `8` or `16`

### Modify Optimization Logic
**File**: `utils/bookletCalculator.ts`
**Function**: `findOptimalSheetsPerBooklet()`
**Current**: Minimizes blank pages
**How**: Change candidate array or comparison logic

### Add New Page Layout Option
**Files**: 
1. `components/LayoutControls.tsx` - Add button
2. `utils/bookletCalculator.ts` - Add imposition logic (if not 4-based)

### Customize PDF Output
**File**: `hooks/usePdfGeneration.ts`
**Function**: `useBookletPdfGenerator()`
Add metadata, margins, headers, etc. before `bookletPdf.save()`

### Change RTL Detection Sensitivity
**File**: `utils/rtlDetector.ts`
**Line**: `if (totalChars > 50 && rtlChars / totalChars > 0.1)`
Adjust `0.1` (10% threshold) or `50` (minimum chars)

---

## TypeScript Types

### BookletLayout
```typescript
{
  totalPages: number
  pagesPerSheet: number
  sheetsPerBooklet: number
  pagesPerBooklet: number
  isRTL: boolean
  totalBooklets: number
  totalSheets: number
  totalBlankPages: number
  efficiency: number
  booklets: Booklet[]
  sequence: (number | null)[]
  rangeStart?: number
  rangeEnd?: number
}
```

### Booklet
```typescript
{
  index: number          // Booklet number (1-based)
  sheets: PageNumber[][] // Array of sheets, each with page numbers
  sheetCount: number
  pages: number
  blankPages: number
  isFinal: boolean      // True for last booklet
  pageOrder: PageNumber[]
}
```

---

## Quick Debugging

### Layout Calculation Wrong
Check: `calculateBookletLayout()` math, especially:
- `totalPhysicalPagesNeeded` rounding
- `totalBlankPages` calculation

### PDF Generation Fails
Check: `usePdfGeneration.ts`
- Page number conversion: `absoluteIndex = rangeStart - 1 + pageNum - 1`
- Bounds checking: `absoluteIndex < sourcePdf.getPageCount()`

### RTL Not Working
Check: `rtlDetector.ts`
- Character ranges (Arabic: 0x0600-0x06FF, Hebrew: 0x0590-0x05FF)
- Threshold (default 10%)
- Filename fallback logic

### Optimization Not Optimal
Check: `findOptimalSheetsPerBooklet()`
- Candidate array: `[3, 4, 5, 6, 7, 8]`
- Comparison logic (prefer fewer blanks, then larger booklets)

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

---

## Dependencies

- **pdf-lib**: PDF creation/manipulation (generates output)
- **pdfjs-dist**: PDF parsing (reads input, extracts text)
- **react**: UI framework
- **vite**: Build tool
- **vitest**: Testing
- **typescript**: Type safety

---

## Constraints to Remember

1. ✓ Pages per sheet must be even (2, 4, 8, 16...)
2. ✓ Sheets per booklet must be positive integer
3. ✓ Blank pages only in final booklet
4. ✓ Page range must be within PDF bounds
5. ✓ RTL detection samples max 3 pages (performance)
6. ✓ All page numbers are 1-based (not 0-based)

---

## Architecture Pattern

**Hooks-based React app** with:
- State management in custom hook (`useBookletState`)
- Pure calculation functions (`bookletCalculator.ts`)
- Presentation components (dumb components)
- Side-effect hook for PDF generation (`usePdfGeneration`)

**No external state management** (Redux, etc.) - all state in React hooks
**No backend** - pure client-side processing
**No routing** - single-page app

---

## File Sizes

- `bookletCalculator.ts`: ~200 lines (core algorithm)
- `useBookletState.ts`: ~280 lines (state + handlers)
- `App.tsx`: ~120 lines (orchestration)
- `LayoutControls.tsx`: ~260 lines (4 sub-components)
- Other components: ~50-150 lines each

---

## Test Coverage

Tests in: `utils/bookletCalculator.test.ts`
Covers:
- Basic calculations
- Edge cases (0, 1 page)
- Optimization algorithm
- LTR/RTL differences

To add tests: Use Vitest's `describe`, `it`, `expect`

---

## Next Steps for New Agents

1. Read `AGENT_DOCS.md` for full details
2. Run `npm install && npm run dev`
3. Upload a small PDF (8-12 pages) to test
4. Check browser console for any errors
5. Read `bookletCalculator.ts` to understand core logic
6. Trace through `useBookletState.ts` for state flow

---

## Support for Common Requests

**"Add page numbers"**: Modify `usePdfGeneration.ts`, draw text on each page
**"Change margins"**: Modify page creation in `usePdfGeneration.ts`
**"Support other layouts"**: Add imposition function in `bookletCalculator.ts`
**"Save settings"**: Add localStorage in `useBookletState.ts`
**"Batch processing"**: Add file array state + loop in handlers
**"Add preview"**: Use `pdfjs-dist` to render pages to canvas
**"Export metadata"**: Call `bookletPdf.setTitle()` etc. in generator

---

End of Quick Reference. See `AGENT_DOCS.md` for comprehensive documentation.
