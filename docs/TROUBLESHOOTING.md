# Troubleshooting Guide

## Common Issues and Solutions

### Issue: PDF Upload Fails

#### Symptom
Error message: "Please upload a PDF file" or "Error reading PDF"

#### Possible Causes
1. File is not actually a PDF (wrong MIME type)
2. PDF is corrupted or malformed
3. PDF is encrypted or password-protected
4. File is too large (>100MB)

#### Solutions
```typescript
// Check in handleFileUpload (useBookletState.ts)

// 1. Verify MIME type check
if (file.type !== 'application/pdf') {
  // This is correct - file.type comes from browser
}

// 2. Add size check
if (file.size > 100 * 1024 * 1024) { // 100MB
  setError('File too large (max 100MB)')
  return
}

// 3. Better error handling
try {
  const pdfDoc = await PDFDocument.load(arrayBuffer)
} catch (err) {
  if (err.message.includes('encrypted')) {
    setError('PDF is password-protected - please remove encryption')
  } else {
    setError('PDF is corrupted or invalid')
  }
}
```

---

### Issue: Wrong Number of Blank Pages

#### Symptom
Layout shows unexpected number of blank pages

#### Debugging Steps
```javascript
// 1. Check inputs
console.log('totalPages:', totalPages)
console.log('sheetsPerBooklet:', sheetsPerBooklet)
console.log('pagesPerSheet:', pagesPerSheet)

// 2. Check intermediate calculations
const pagesPerBooklet = sheetsPerBooklet * pagesPerSheet
console.log('pagesPerBooklet:', pagesPerBooklet)

const totalPhysicalPagesNeeded = Math.ceil(totalPages / pagesPerSheet) * pagesPerSheet
console.log('totalPhysicalPagesNeeded:', totalPhysicalPagesNeeded)

const totalBooklets = Math.ceil(totalPhysicalPagesNeeded / pagesPerBooklet)
console.log('totalBooklets:', totalBooklets)

const totalPhysicalPages = totalBooklets * pagesPerBooklet
console.log('totalPhysicalPages:', totalPhysicalPages)

const totalBlankPages = totalPhysicalPages - totalPages
console.log('totalBlankPages:', totalBlankPages)
```

#### Common Mistakes
```typescript
// WRONG: This doesn't account for sheet boundaries
const totalBlankPages = pagesPerBooklet - (totalPages % pagesPerBooklet)

// CORRECT: Must round to sheet boundaries first
const totalPhysicalPagesNeeded = Math.ceil(totalPages / pagesPerSheet) * pagesPerSheet
const totalBooklets = Math.ceil(totalPhysicalPagesNeeded / pagesPerBooklet)
const totalPhysicalPages = totalBooklets * pagesPerBooklet
const totalBlankPages = totalPhysicalPages - totalPages
```

#### Validation Test
```typescript
// For 7 pages, 4 per sheet, 12 pages per booklet (3 sheets):
// totalPages = 7
// pagesPerSheet = 4
// sheetsPerBooklet = 3
// pagesPerBooklet = 12

// Round 7 up to next multiple of 4 = 8
// 8 / 12 = 0.67 → need 1 booklet
// 1 booklet × 12 pages = 12 total pages
// 12 - 7 = 5 blank pages ✓
```

---

### Issue: Generated PDF Has Wrong Page Order

#### Symptom
Pages in exported PDF are not in booklet order

#### Check Points

1. **Verify sequence generation**:
```typescript
// In bookletCalculator.ts - generateBookletStructure()
console.log('Page sequence:', sequence)
// Should show pattern like: [4, 1, 2, 3, 8, 5, 6, 7, ...]
```

2. **Verify imposition logic**:
```typescript
// In imposeStandardFourUp() - check two-pointer logic
function imposeStandardFourUp(pages, sheetsPerBooklet, isRTL) {
  let low = 0
  let high = pages.length - 1
  
  // Should alternate between high and low
  const frontLeft = takeHigh()  // Outer page
  const frontRight = takeLow()  // Inner page
  const backLeft = takeLow()    // Inner page
  const backRight = takeHigh()  // Outer page
}
```

3. **Verify PDF generation**:
```typescript
// In usePdfGeneration.ts
console.log('Layout sequence:', layout.sequence)
console.log('Range start:', layout.rangeStart)

for (const pageNum of layout.sequence) {
  const absoluteIndex = (layout.rangeStart - 1) + (pageNum - 1)
  console.log(`Page ${pageNum} → Index ${absoluteIndex}`)
}
```

#### Manual Verification
For 4-page PDF with 4 pages per sheet:
```
Expected sequence: [4, 1, 2, 3]
When folded: 1, 2, 3, 4 ✓

Front of sheet: [4, 1]
Back of sheet:  [2, 3]
```

---

### Issue: RTL Detection Not Working

#### Symptom
Arabic/Hebrew PDF detected as LTR or not detected

#### Debugging RTL Detection
```typescript
// In rtlDetector.ts - add logging
export async function detectTextDirection(pdfArrayBuffer, fileName) {
  try {
    // ... loading code ...
    
    let totalChars = 0
    let rtlChars = 0
    
    for (let pageNum = 1; pageNum <= pagesToCheck; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      console.log(`Page ${pageNum} items:`, textContent.items.length)
      
      for (const item of textContent.items) {
        if ('str' in item && item.str) {
          console.log('Text:', item.str)
          // ... character checking ...
        }
      }
    }
    
    console.log(`Total chars: ${totalChars}, RTL chars: ${rtlChars}`)
    console.log(`Ratio: ${(rtlChars / totalChars * 100).toFixed(1)}%`)
  }
}
```

#### Common Issues

1. **PDF uses images not text**:
```typescript
// Solution: No text extractable, must rely on filename
if (totalChars === 0) {
  console.log('No text found, using filename heuristic')
  return inferDirectionFromFilename(fileName)
}
```

2. **Threshold too high**:
```typescript
// Current: 10% RTL chars needed
if (totalChars > 50 && rtlChars / totalChars > 0.1) {
  return 'rtl'
}

// Try lowering to 5%:
if (totalChars > 50 && rtlChars / totalChars > 0.05) {
  return 'rtl'
}
```

3. **Wrong character ranges**:
```typescript
// Verify ranges include your language
const rtlRanges: [number, number][] = [
  [0x0590, 0x05FF], // Hebrew ✓
  [0x0600, 0x06FF], // Arabic ✓
  [0x0700, 0x074F], // Syriac
  [0x0750, 0x077F], // Arabic Supplement ✓
  [0x08A0, 0x08FF], // Arabic Extended-A ✓
  [0xFB50, 0xFDFF], // Arabic Presentation Forms-A ✓
  [0xFE70, 0xFEFF], // Arabic Presentation Forms-B ✓
]
```

---

### Issue: Optimization Not Finding Best Layout

#### Symptom
"Optimize" button suggests suboptimal sheet count

#### Debug Optimization
```typescript
// In findOptimalSheetsPerBooklet()
const preferredSheetCounts = [3, 4, 5, 6, 7, 8]

preferredSheetCounts.forEach((sheets) => {
  const layout = calculateBookletLayout(totalPages, sheets, pagesPerSheet)
  console.log(`Sheets: ${sheets}, Blanks: ${layout.totalBlankPages}`)
})
```

#### Example Output
```
Testing 23 pages, 4 pages per sheet:
Sheets: 3, Blanks: 1  ← Best (12 pages per booklet)
Sheets: 4, Blanks: 9  (16 pages per booklet)
Sheets: 5, Blanks: 17 (20 pages per booklet)
...
```

#### Adjust Candidates
```typescript
// For very small documents
const maxPossibleSheets = Math.ceil(totalPages / pagesPerSheet)

// If document is only 4 pages with 4 per sheet:
// maxPossibleSheets = 1, but candidates start at 3
// Solution: fallback to smaller values
if (!candidates.length) {
  candidates = [Math.max(2, Math.min(maxPossibleSheets, preferredSheetCounts[0]))]
}
```

---

### Issue: PDF Generation Crashes Browser

#### Symptom
Browser becomes unresponsive when generating large PDFs

#### Solutions

1. **Check PDF size**:
```typescript
const pdfBytes = await generateBookletPdf()
console.log('PDF size:', (pdfBytes.length / 1024 / 1024).toFixed(2), 'MB')

if (pdfBytes.length > 50 * 1024 * 1024) {
  console.warn('Large PDF generated')
}
```

2. **Add progress indicator**:
```typescript
// In usePdfGeneration.ts
for (let i = 0; i < layout.sequence.length; i++) {
  const pageNum = layout.sequence[i]
  
  if (i % 10 === 0) {
    // Update progress every 10 pages
    console.log(`Processing page ${i}/${layout.sequence.length}`)
  }
  
  // ... copy page ...
}
```

3. **Use Web Worker** (advanced):
```typescript
// Move PDF generation to worker
// worker.ts
self.onmessage = async (e) => {
  const { pdfData, sequence } = e.data
  // ... generate PDF ...
  self.postMessage({ pdfBytes })
}
```

---

### Issue: Page Range Not Working

#### Symptom
Selected range not reflected in generated PDF

#### Check Range Calculation
```typescript
// In usePdfGeneration.ts
const pageRangeOffset = Math.max(0, (layout.rangeStart ?? 1) - 1)
console.log('Range offset:', pageRangeOffset)

for (const pageNum of layout.sequence) {
  if (pageNum !== null) {
    const absoluteIndex = pageRangeOffset + pageNum - 1
    console.log(`Relative ${pageNum} → Absolute ${absoluteIndex}`)
    
    if (absoluteIndex < 0 || absoluteIndex >= sourcePdf.getPageCount()) {
      console.error('Index out of bounds!')
    }
  }
}
```

#### Example
```
PDF has 100 pages
User selects range: 50-60 (11 pages)
rangeStart = 50
rangeEnd = 60

In layout, pages are 1-11 (relative to range)
In source PDF, pages are 49-59 (0-indexed)

Conversion:
  layoutPage = 1
  absoluteIndex = (50 - 1) + (1 - 1) = 49 ✓
  
  layoutPage = 11
  absoluteIndex = (50 - 1) + (11 - 1) = 59 ✓
```

---

### Issue: TypeScript Errors

#### Common Type Errors

1. **PageNumber type**:
```typescript
// ERROR: Type 'number | null' is not assignable to 'number'
const pageNum: number = layout.sequence[0]

// FIX: Handle null case
const pageNum = layout.sequence[0]
if (pageNum !== null) {
  // Use pageNum here
}
```

2. **Optional properties**:
```typescript
// ERROR: Object is possibly 'undefined'
const start = layout.rangeStart - 1

// FIX: Use nullish coalescing
const start = (layout.rangeStart ?? 1) - 1
```

3. **Enum types**:
```typescript
// ERROR: Type 'string' is not assignable to TextDirection
const dir: TextDirection = 'left-to-right'

// FIX: Use correct enum value
const dir: TextDirection = 'ltr'
```

---

### Issue: Tests Failing

#### Run Tests with Debug
```bash
npm test -- --reporter=verbose
```

#### Common Test Issues

1. **Floating point precision**:
```typescript
// WRONG: Direct equality
expect(layout.efficiency).toBe(85.7142857)

// RIGHT: Use toBeCloseTo
expect(layout.efficiency).toBeCloseTo(85.71, 2)
```

2. **Mock not working**:
```typescript
// Make sure to mock before import
vi.mock('pdf-lib')
import { PDFDocument } from 'pdf-lib'
```

3. **Async not awaited**:
```typescript
// WRONG: Missing await
it('should detect RTL', () => {
  const result = detectTextDirection(buffer)
  expect(result).toBe('rtl')
})

// RIGHT: Add async/await
it('should detect RTL', async () => {
  const result = await detectTextDirection(buffer)
  expect(result).toBe('rtl')
})
```

---

### Issue: Build Fails

#### Check Node Version
```bash
node --version  # Should be v16+
npm --version
```

#### Clear Cache and Reinstall
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

#### Check for Port Conflicts
```bash
# If dev server won't start
lsof -i :5173  # Check what's using port 5173
```

---

### Issue: Blank Pages in Wrong Place

#### Symptom
Blank pages appear in middle of booklet instead of at end

#### Verify Blank Page Placement
```typescript
// In generateBookletStructure()
const pagesWithBlanks: PageNumber[] = []

// Add content pages first
for (let i = 1; i <= totalPages; i++) {
  pagesWithBlanks.push(i)
}

// Add blanks at END only
for (let i = 0; i < totalBlankPages; i++) {
  pagesWithBlanks.push(null)  // null = blank
}

// Blanks should be at end of array
console.log('Last 5 pages:', pagesWithBlanks.slice(-5))
// Should be: [19, 20, null, null, null] for 20 pages + 3 blanks
```

#### Verify Booklet Distribution
```typescript
// Blanks should only be in final booklet
const lastBooklet = booklets[booklets.length - 1]
console.log('Last booklet blank pages:', lastBooklet.blankPages)

// All other booklets should have 0 blanks
for (let i = 0; i < booklets.length - 1; i++) {
  console.log(`Booklet ${i+1} blanks:`, booklets[i].blankPages)
  // Should always be 0
}
```

---

## Performance Issues

### Symptom: Slow Layout Calculation

#### Profile Performance
```typescript
console.time('calculateLayout')
const layout = calculateBookletLayout(totalPages, sheets, pagesPerSheet)
console.timeEnd('calculateLayout')
```

#### Optimize If Needed
```typescript
// Memoize expensive calculations
const memoizedLayout = useMemo(() => {
  return calculateBookletLayout(totalPages, sheetsPerBooklet, pagesPerSheet, isRTL)
}, [totalPages, sheetsPerBooklet, pagesPerSheet, isRTL])
```

### Symptom: UI Freezes During PDF Generation

#### Add Progress Updates
```typescript
setExporting(true)
try {
  // Allow UI to update
  await new Promise(resolve => setTimeout(resolve, 0))
  
  const pdfBytes = await generateBookletPdf()
  
  await new Promise(resolve => setTimeout(resolve, 0))
  
  downloadPdfBlob(pdfBytes, filename)
} finally {
  setExporting(false)
}
```

---

## Validation Errors

### Prevent Invalid Input

```typescript
// In LayoutControls input handlers
const handleSheetInput = (e) => {
  const value = parseInt(e.target.value)
  
  // Validate before setting
  if (isNaN(value) || value < 1) {
    return  // Don't update
  }
  
  if (value > 100) {
    setError('Sheets per booklet must be ≤ 100')
    return
  }
  
  onSheetsPerBookletChange(value)
}
```

---

## Browser Compatibility Issues

### PDF.js Worker Errors

#### Symptom
"Cannot find worker" or worker loading fails

#### Solution
```typescript
// In rtlDetector.ts
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
} catch (e) {
  // Fallback CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = 
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
}
```

### File Download Not Working

#### Safari/iOS Issues
```typescript
// Some browsers block auto-download
// Add user interaction check
const downloadPdfBlob = (pdfBytes, filename) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  
  // Ensure link is in DOM for some browsers
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up after short delay
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
```

---

## Getting Help

### Collect Debug Info

```javascript
// Run this in browser console when issue occurs
const debugInfo = {
  pdfFile: pdfFile?.name,
  totalPages,
  sheetsPerBooklet,
  pagesPerSheet,
  textDirection,
  rangeStart,
  rangeEnd,
  selectedPageCount,
  layout: layout ? {
    totalBooklets: layout.totalBooklets,
    totalBlankPages: layout.totalBlankPages,
    totalSheets: layout.totalSheets,
    efficiency: layout.efficiency,
  } : null,
  error,
}

console.log('DEBUG INFO:', JSON.stringify(debugInfo, null, 2))
```

### Check Browser Console

Look for:
- Red errors (exceptions)
- Yellow warnings (potential issues)
- Network errors (failed CDN loads)
- Memory warnings (large PDFs)

### Verify File State

```javascript
// In browser console
console.log('PDF loaded:', !!pdfData)
console.log('Layout calculated:', !!layout)
console.log('Layout sequence length:', layout?.sequence?.length)
```

---

## Quick Diagnostic Checklist

- [ ] PDF loads successfully (check totalPages > 0)
- [ ] Text direction detected correctly
- [ ] Layout calculates without errors
- [ ] Blank pages only in final booklet
- [ ] Page sequence looks correct
- [ ] Generated PDF downloads
- [ ] Pages in correct order when viewed
- [ ] No console errors
- [ ] No memory warnings
- [ ] Tests pass (`npm test`)

---

This troubleshooting guide covers most common issues. For issues not listed here, check:
1. Browser console for errors
2. Network tab for failed requests
3. `AGENT_DOCS.md` for implementation details
4. `ARCHITECTURE.md` for system overview
