# Agent Documentation: Booklet Layout Optimizer

## Project Overview

This is a web application that helps prepare PDF books for professional printing by calculating optimal booklet layouts and minimizing blank pages. The app reorganizes PDF pages into booklet format (also known as "signatures") where pages are arranged for folding and binding.

### Key Purpose
When printing books professionally, pages are printed on large sheets, folded, and bound together. This app:
1. Analyzes uploaded PDFs
2. Calculates the optimal arrangement to minimize wasted pages
3. Generates a new PDF with pages reordered for immediate printing

---

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **PDF Libraries**: 
  - `pdf-lib` (v1.17.1) - PDF generation and manipulation
  - `pdfjs-dist` (v5.4.394) - PDF parsing and text extraction
- **Testing**: Vitest 4
- **Node Version**: v16 or higher

---

## Project Structure

```
booklets/
├── src/
│   ├── App.tsx                          # Main app component
│   ├── App.css                          # Main styles
│   ├── main.tsx                         # Entry point
│   ├── components/
│   │   ├── FileUpload.tsx              # PDF upload component
│   │   ├── LayoutControls.tsx          # Settings controls (pages per sheet, range, etc.)
│   │   ├── ResultsDisplay.tsx          # Shows calculation results
│   │   └── BookletView.tsx             # Visualizes booklet/sheet layout
│   ├── hooks/
│   │   ├── useBookletState.ts          # Main state management hook
│   │   └── usePdfGeneration.ts         # PDF export functionality
│   └── utils/
│       ├── bookletCalculator.ts        # Core booklet calculation algorithm
│       ├── bookletCalculator.test.ts   # Unit tests
│       └── rtlDetector.ts              # RTL text detection
├── package.json
├── vite.config.js
└── tsconfig.json
```

---

## Core Concepts

### 1. Booklet/Signature Printing
- A **sheet** is a physical piece of paper printed on both sides (front and back)
- A **signature/booklet** is a group of sheets folded together to form a section of a book
- **Pages per sheet**: How many logical PDF pages fit on one physical sheet (must be even: 2, 4, 8, 16, etc.)
- **Sheets per booklet**: How many sheets are folded together to create one booklet

### 2. Page Imposition
The algorithm arranges pages so that when sheets are printed, folded, and stacked, pages appear in the correct reading order. For a 4-page-per-sheet layout:
- Front of sheet: [high page, low page]
- Back of sheet: [low+1 page, high-1 page]

This creates the correct order when folded.

### 3. Blank Pages
Since booklets must contain complete sheets, blank pages are added to fill the last booklet if needed. The optimizer tries to minimize these.

### 4. RTL Support
The app detects and supports Right-to-Left languages (Arabic, Hebrew) by rearranging page order accordingly.

---

## Key Files Deep Dive

### 1. `utils/bookletCalculator.ts`

**Purpose**: Core algorithm for calculating booklet layouts.

**Main Types**:
```typescript
interface BookletLayout {
  totalPages: number           // Pages in selected range
  pagesPerSheet: number        // Logical pages per physical sheet
  sheetsPerBooklet: number     // Sheets folded per booklet
  pagesPerBooklet: number      // Total pages in one booklet
  isRTL: boolean              // Right-to-left text direction
  totalBooklets: number        // Total number of booklets
  completeBooklets: number     // Full booklets
  remainingPages: number       // Pages in partial final booklet
  totalSheets: number         // Physical sheets needed
  totalPhysicalPages: number   // All pages including blanks
  totalBlankPages: number      // Blank pages needed
  efficiency: number           // Percentage of non-blank pages
  booklets: Booklet[]         // Detailed booklet data
  sequence: PageNumber[]       // Final page ordering
  rangeStart?: number         // Start of PDF range
  rangeEnd?: number           // End of PDF range
}
```

**Key Functions**:
- `calculateBookletLayout()`: Main calculation function
- `generateBookletStructure()`: Creates booklet structure with page arrangement
- `imposeStandardFourUp()`: Implements 4-page imposition algorithm (LTR and RTL)
- `findOptimalSheetsPerBooklet()`: Finds sheet count that minimizes blank pages

**Algorithm Flow**:
1. Calculate total physical pages needed (must be multiple of pages-per-sheet)
2. Calculate number of booklets (based on sheets-per-booklet)
3. Calculate blank pages needed to fill final booklet
4. Arrange pages using imposition algorithm
5. Split into individual booklets with sheet layouts

### 2. `hooks/useBookletState.ts`

**Purpose**: Central state management for the entire app.

**State Variables**:
- `pdfFile`: Uploaded PDF file object
- `totalPages`: Total pages in PDF
- `pdfData`: ArrayBuffer of PDF data
- `sheetsPerBooklet`: User setting for booklet size
- `pagesPerSheet`: User setting (4, 8, 16)
- `textDirection`: LTR or RTL
- `detectedDirection`: Auto-detected direction
- `layout`: Calculated booklet layout
- `rangeStart/rangeEnd`: Selected page range
- `loading/detecting/exporting`: Loading states
- `error`: Error message

**Key Functions**:
- `handleFileUpload()`: Loads PDF, detects direction, calculates optimal layout
- `applyRangeLayout()`: Recalculates layout when settings change
- `handleSheetsPerBookletChange()`: Updates booklet size
- `handlePagesPerSheetChange()`: Updates pages per sheet, recalculates optimal booklet size
- `useOptimalSheets()`: Finds and applies optimal sheets per booklet
- `handleRangeStartChange/handleRangeEndChange()`: Updates page range
- `handleTextDirectionChange()`: Changes LTR/RTL mode

**Important Logic**:
- When a PDF is uploaded, the app automatically:
  1. Detects text direction
  2. Finds optimal sheets per booklet
  3. Calculates initial layout
- All setting changes trigger layout recalculation
- Page range is bounded and validated on every change

### 3. `hooks/usePdfGeneration.ts`

**Purpose**: Generates the final booklet PDF.

**Process**:
1. Load source PDF with `pdf-lib`
2. Create new blank PDF
3. For each page in the layout sequence:
   - If null (blank page): add blank page
   - If valid page number: copy page from source PDF
4. Save and download result

**Important**: Page numbers in the layout are relative to the selected range. The hook converts them to absolute positions in the source PDF using `rangeStart`.

### 4. `utils/rtlDetector.ts`

**Purpose**: Detect if PDF contains RTL text (Arabic, Hebrew, etc.)

**Detection Strategy**:
1. **Filename heuristics**: Check filename for RTL keywords or characters
2. **Content analysis**: Extract text from first 3 pages, count RTL characters
3. **Threshold**: If >10% of characters are RTL, classify as RTL
4. **Fallback**: If text extraction fails, use filename heuristics

**RTL Character Ranges**:
- Hebrew: 0x0590-0x05FF
- Arabic: 0x0600-0x06FF, 0x0750-0x077F, 0x08A0-0x08FF
- Arabic Presentation Forms: 0xFB50-0xFDFF, 0xFE70-0xFEFF

### 5. Components

#### `FileUpload.tsx`
Simple file input component. Shows:
- Upload button when no file
- File name and page count after upload
- Loading state during PDF processing

#### `LayoutControls.tsx`
Settings panel with four sub-components:
- **PagesPerSheetControl**: Quick buttons for 4, 8, 16
- **PrintRangeControl**: Start/end inputs with reset button
- **TextDirectionControl**: LTR/RTL toggle with auto-detection indicator
- **SheetsPerBookletControl**: Number input with optimize button

#### `ResultsDisplay.tsx`
Shows calculated results:
- Primary metric: Total blank pages
- Grid of statistics (booklets, sheets, efficiency)
- Detailed breakdown of all parameters
- Generate PDF button

#### `BookletView.tsx`
Visual representation of booklet structure:
- Shows each booklet/signature
- For each booklet, shows all sheets
- For each sheet, shows front and back pages
- Highlights blank pages
- Shows absolute page numbers from original PDF

---

## Data Flow

```
User uploads PDF
    ↓
handleFileUpload() in useBookletState
    ↓
Load PDF with pdf-lib → get page count
    ↓
Detect text direction (rtlDetector)
    ↓
Find optimal sheets per booklet
    ↓
applyRangeLayout() → calculateBookletLayout()
    ↓
Update layout state → UI re-renders
    ↓
User clicks "Generate PDF"
    ↓
useBookletPdfGenerator() creates new PDF
    ↓
Download to user
```

---

## Common Modifications

### Adding New Page Layouts

1. **Add new option to `LayoutControls.tsx`**:
   ```tsx
   {[4, 8, 16, 32].map(val => ...)}  // Add 32
   ```

2. **Handle new layout in `bookletCalculator.ts`**:
   - If not divisible by 4, create new imposition function
   - Add to `generateBookletStructure()` logic

3. **Update validation**:
   - Ensure value is even in `handlePagesPerSheetChange()`

### Modifying Optimization Algorithm

Edit `findOptimalSheetsPerBooklet()` in `bookletCalculator.ts`:
- Adjust `preferredSheetCounts` array
- Change optimization criteria (currently minimizes blank pages)
- Add secondary optimization factors (e.g., prefer certain booklet sizes)

### Adding New Text Direction

1. **Update type** in `rtlDetector.ts`:
   ```typescript
   export type TextDirection = 'ltr' | 'rtl' | 'ttb' | 'unknown'
   ```

2. **Add detection logic**:
   - Add character ranges
   - Update detection function

3. **Add imposition logic**:
   - Create new arrangement in `bookletCalculator.ts`
   - Update `TextDirectionControl` component

### Customizing Export Format

Modify `useBookletPdfGenerator()`:
- Add metadata: `bookletPdf.setTitle()`, `setAuthor()`
- Adjust page sizes
- Add headers/footers
- Insert separator pages between booklets

---

## Testing

### Running Tests
```bash
npm test
```

### Test Files
- `utils/bookletCalculator.test.ts`: Core algorithm tests

### Test Coverage
- Basic layout calculations
- Edge cases (0 pages, 1 page, etc.)
- Blank page calculations
- Optimization algorithm

### Adding Tests
Use Vitest syntax:
```typescript
import { describe, it, expect } from 'vitest'
import { calculateBookletLayout } from './bookletCalculator'

describe('new feature', () => {
  it('should handle edge case', () => {
    const result = calculateBookletLayout(7, 3, 4)
    expect(result.totalBlankPages).toBe(5)
  })
})
```

---

## Development Workflow

### Starting Development
```bash
npm install
npm run dev
```
Opens at `http://localhost:5173`

### Building for Production
```bash
npm run build
npm run preview  # Test production build locally
```

### Code Style
- TypeScript strict mode enabled
- React functional components with hooks
- Props interfaces defined for all components
- Detailed JSDoc comments on utility functions

---

## Common Issues & Solutions

### Issue: PDF generation fails
**Cause**: Invalid page numbers or out-of-range indices
**Solution**: Check `rangeStart` offset calculation in `usePdfGeneration.ts`

### Issue: RTL detection not working
**Cause**: PDF uses images instead of text, or encoded text
**Solution**: Add filename-based fallback or manual override option

### Issue: Blank pages incorrect
**Cause**: Rounding errors in calculation
**Solution**: Verify calculations in `calculateBookletLayout()` use consistent rounding

### Issue: Large PDFs slow or crash
**Cause**: Loading entire PDF into memory
**Solution**: Consider paginated loading or worker-based processing

---

## Performance Considerations

1. **PDF Loading**: Uses `ArrayBuffer` to keep PDF in memory. Large files (>100MB) may cause issues.

2. **Text Direction Detection**: Only samples first 3 pages to avoid performance impact.

3. **Layout Recalculation**: Happens on every setting change. Could be debounced for very large documents.

4. **PDF Generation**: Synchronous operation that blocks UI. Consider using Web Workers for large documents.

---

## Future Enhancement Ideas

1. **Crop Marks**: Add printer crop marks to generated PDF
2. **Batch Processing**: Upload multiple PDFs at once
3. **Templates**: Save/load common settings
4. **Preview**: Show actual page rendering before export
5. **Advanced Layouts**: Support for 2-up, 3-up layouts
6. **Binding Offset**: Add gutter margins for binding
7. **Color Separation**: CMYK support for professional printing
8. **Page Numbers**: Auto-add page numbers to output
9. **Bookmarks**: Preserve PDF bookmarks/TOC
10. **Server Mode**: API for batch processing

---

## Important Constraints

1. **Pages per sheet MUST be even** (for front/back printing)
2. **Blank pages only added to final booklet** (never in middle)
3. **Page range must be within PDF bounds** (validated on change)
4. **Sheets per booklet must be positive integer**
5. **RTL only affects page order, not rotation** (assumes printer handles orientation)

---

## Key Algorithms Explained

### Standard Four-Up Imposition (LTR)
For 4 pages per sheet with pages [1,2,3,4]:
```
Front: [4, 1]
Back:  [2, 3]
```
When folded, reads: 1, 2, 3, 4

### Standard Four-Up Imposition (RTL)
For 4 pages per sheet with pages [1,2,3,4]:
```
Front: [1, 4]
Back:  [3, 2]
```
When folded, reads right-to-left: 1, 2, 3, 4

### Optimization Algorithm
```
For each candidate sheet count [3,4,5,6,7,8]:
  Calculate layout
  Count blank pages
  If fewer blanks (or equal blanks but larger booklet):
    This is the new best
Return best sheet count
```

---

## Debugging Tips

1. **Check calculated layout**: Add `console.log(layout)` in `useBookletState`
2. **Verify page sequence**: The `sequence` array shows final page order
3. **Test with small PDFs**: Use 8-12 page PDFs for quick iteration
4. **Check browser console**: PDF loading errors appear in console
5. **Validate calculations manually**: For 7 pages, 4 per sheet, 3 sheets per booklet:
   - Need 8 pages total (round up to multiple of 4)
   - = 1 blank page needed
   - 2 sheets total (8 pages ÷ 4)
   - 1 booklet (can't fill second booklet with just 2 sheets when we need 3)

---

## API Reference

### Main Hook: `useBookletState()`

Returns object with:
- **State**: `pdfFile`, `totalPages`, `sheetsPerBooklet`, `pagesPerSheet`, `layout`, etc.
- **Handlers**: `handleFileUpload`, `handleSheetsPerBookletChange`, `useOptimalSheets`, etc.
- **Setters**: `setError`, `setExporting`

### Calculator: `calculateBookletLayout(totalPages, sheetsPerBooklet, pagesPerSheet, isRTL?)`

Calculates complete booklet layout.
- **Returns**: `BookletLayout` object with all metrics and page arrangement
- **Throws**: Error if `pagesPerSheet` not even or `sheetsPerBooklet` not positive

### Optimizer: `findOptimalSheetsPerBooklet(totalPages, pagesPerSheet)`

Finds optimal sheet count to minimize waste.
- **Returns**: Number of sheets per booklet
- **Strategy**: Tests preferred values [3,4,5,6,7,8], picks minimum blanks

### PDF Generator: `useBookletPdfGenerator(pdfData, layout)`

Hook that returns PDF generation function.
- **Returns**: Async function that generates `Uint8Array` of PDF
- **Usage**: `const generate = useBookletPdfGenerator(...); const bytes = await generate()`

---

## Questions for Users

When a user requests changes, ask:
1. What's the expected page count range? (affects optimization)
2. What binding method will be used? (affects margin needs)
3. Are PDFs primarily LTR or RTL? (affects default settings)
4. What printer specs? (affects available pages-per-sheet options)

---

This documentation should provide everything needed to understand, maintain, and extend the Booklet Layout Optimizer application.
