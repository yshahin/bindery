# Contribution Guide

This guide explains how to make common modifications to the Booklet Layout Optimizer app.

---

## Table of Contents

1. [Setup for Development](#setup-for-development)
2. [Adding New Features](#adding-new-features)
3. [Modifying Existing Features](#modifying-existing-features)
4. [Code Style Guidelines](#code-style-guidelines)
5. [Testing Your Changes](#testing-your-changes)
6. [Common Modification Recipes](#common-modification-recipes)

---

## Setup for Development

### Initial Setup
```bash
# Clone and install
git clone <repo-url>
cd booklets
npm install

# Start development server
npm run dev
# Open http://localhost:5173
```

### Development Workflow
1. Make changes to source files in `src/`
2. Vite hot-reloads automatically
3. Test in browser
4. Run tests: `npm test`
5. Build for production: `npm run build`

---

## Adding New Features

### 1. Adding a New Control/Setting

**Example**: Add a "Page Margin" control

**Step 1**: Add state to `useBookletState.ts`
```typescript
const [pageMargin, setPageMargin] = useState<number>(0)

// Add to return object
return {
  // ... existing state ...
  pageMargin,
  handlePageMarginChange,
}
```

**Step 2**: Add handler
```typescript
const handlePageMarginChange = useCallback((value: number): void => {
  setPageMargin(value)
  // If affects layout:
  if (getRangePageCount(rangeStart, rangeEnd) > 0) {
    applyRangeLayout({ /* pass new value */ })
  }
}, [applyRangeLayout, rangeEnd, rangeStart])
```

**Step 3**: Update `LayoutControls.tsx`
```typescript
// Add to props interface
interface LayoutControlsProps {
  // ... existing props ...
  pageMargin: number
  onPageMarginChange: (value: number) => void
}

// Add new control component
function PageMarginControl({ pageMargin, onPageMarginChange }) {
  return (
    <div className="control-group">
      <label>Page Margin (mm)</label>
      <input
        type="number"
        value={pageMargin}
        onChange={(e) => onPageMarginChange(Number(e.target.value))}
      />
    </div>
  )
}

// Add to main component
export default function LayoutControls({ /* ... */, pageMargin, onPageMarginChange }) {
  return (
    <div className="controls-section">
      {/* ... existing controls ... */}
      <PageMarginControl
        pageMargin={pageMargin}
        onPageMarginChange={onPageMarginChange}
      />
    </div>
  )
}
```

**Step 4**: Pass from App.tsx
```typescript
function App() {
  const {
    // ... existing destructure ...
    pageMargin,
    handlePageMarginChange,
  } = useBookletState()

  return (
    // ...
    <LayoutControls
      // ... existing props ...
      pageMargin={pageMargin}
      onPageMarginChange={handlePageMarginChange}
    />
  )
}
```

### 2. Adding a New Page Layout Algorithm

**Example**: Add 2-up layout (2 pages per sheet)

**Step 1**: Add to quick buttons in `LayoutControls.tsx`
```typescript
<div className="quick-buttons">
  {[2, 4, 8, 16].map(val => (  // Added 2
    <button
      key={val}
      onClick={() => onPagesPerSheetChange(val)}
      className={pagesPerSheet === val ? 'active' : ''}
    >
      {val}
    </button>
  ))}
</div>
```

**Step 2**: Add imposition logic in `bookletCalculator.ts`
```typescript
function imposeTwoUp(pages: PageNumber[], sheetsPerBooklet: number, isRTL: boolean): ImposedPages {
  const sheets: PageNumber[][] = []

  for (let i = 0; i < sheetsPerBooklet; i++) {
    const frontPage = i < pages.length ? pages[i] : null
    const backPage = i + sheetsPerBooklet < pages.length ? pages[i + sheetsPerBooklet] : null

    sheets.push(isRTL ? [backPage, frontPage] : [frontPage, backPage])
  }

  return { sheets, sequence: sheets.flat() }
}

// Update generateBookletStructure
export function generateBookletStructure(...) {
  // ...
  const imposed =
    pagesPerSheet === 4 ? imposeStandardFourUp(...) :
    pagesPerSheet === 2 ? imposeTwoUp(...) :
    arrangeBookletPagesFallback(...)
  // ...
}
```

**Step 3**: Test thoroughly
```typescript
// Add test in bookletCalculator.test.ts
describe('2-up layout', () => {
  it('should arrange pages for 2 pages per sheet', () => {
    const layout = calculateBookletLayout(8, 2, 2)
    expect(layout.totalSheets).toBe(4)
    expect(layout.totalBlankPages).toBe(0)
  })
})
```

### 3. Adding PDF Metadata

**Location**: `hooks/usePdfGeneration.ts`

**Add after PDF creation**:
```typescript
export function useBookletPdfGenerator(...) {
  return useCallback(async () => {
    // ... existing code ...
    const bookletPdf = await PDFDocument.create()

    // Add metadata
    bookletPdf.setTitle('Booklet Layout')
    bookletPdf.setAuthor('Booklet Layout Optimizer')
    bookletPdf.setSubject('Print-ready booklet')
    bookletPdf.setCreator('https://your-site.com')
    bookletPdf.setProducer('pdf-lib')
    bookletPdf.setCreationDate(new Date())

    // ... rest of generation code ...
  }, [layout, pdfData])
}
```

### 4. Adding a Preview Feature

**Step 1**: Create component `PreviewPanel.tsx`
```typescript
import { useState, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

interface PreviewPanelProps {
  pdfData: ArrayBuffer | null
  pageNumber: number
}

export default function PreviewPanel({ pdfData, pageNumber }: PreviewPanelProps) {
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    if (!pdfData) return

    const renderPage = async () => {
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1.0 })

      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: canvas.getContext('2d')!,
        viewport
      }).promise

      setImageUrl(canvas.toDataURL())
    }

    renderPage()
  }, [pdfData, pageNumber])

  return (
    <div className="preview-panel">
      {imageUrl && <img src={imageUrl} alt={`Page ${pageNumber}`} />}
    </div>
  )
}
```

**Step 2**: Add to App.tsx
```typescript
// Add state for preview
const [previewPage, setPreviewPage] = useState<number>(1)

// Add to render
{layout && (
  <PreviewPanel pdfData={pdfData} pageNumber={previewPage} />
)}
```

---

## Modifying Existing Features

### Changing Default Values

**Pages per sheet default**:
```typescript
// In useBookletState.ts
const [pagesPerSheet, setPagesPerSheet] = useState<number>(8)  // Changed from 4
```

**Default text direction**:
```typescript
// In useBookletState.ts
const [textDirection, setTextDirection] = useState<TextDirection>('rtl')  // Changed from 'ltr'
```

**Preferred sheet counts for optimization**:
```typescript
// In bookletCalculator.ts - findOptimalSheetsPerBooklet()
const preferredSheetCounts = [2, 3, 4, 5, 6, 8, 10]  // Added 2, 10
```

### Adjusting RTL Detection Sensitivity

```typescript
// In rtlDetector.ts - detectTextDirection()

// Lower threshold (detect RTL more easily)
if (totalChars > 30 && rtlChars / totalChars > 0.05) {  // Changed from 50 & 0.1
  return 'rtl'
}

// Check more pages
const pagesToCheck = Math.min(5, pdf.numPages)  // Changed from 3
```

### Modifying UI Text

**File Upload text**:
```typescript
// In FileUpload.tsx
<span>Drop PDF here or click to browse</span>  // Changed text
```

**Button labels**:
```typescript
// In ResultsDisplay.tsx
{exporting ? 'Creating PDF…' : '📄 Download Booklet'}  // Changed text
```

### Changing Styles

**Colors**:
```css
/* In App.css */
:root {
  --primary-color: #2563eb;  /* Change main color */
  --success-color: #10b981;
  --error-color: #ef4444;
}
```

**Component styling**:
```css
/* Modify existing classes or add new ones */
.booklet-card {
  border-radius: 12px;     /* Changed from 8px */
  padding: 24px;           /* Changed from 16px */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

---

## Code Style Guidelines

### TypeScript

1. **Always define interfaces for props**:
```typescript
// Good
interface MyComponentProps {
  value: number
  onChange: (value: number) => void
}

// Bad
function MyComponent({ value, onChange }: any) { ... }
```

2. **Use explicit return types for functions**:
```typescript
// Good
function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0)
}

// Acceptable (for simple cases)
const calculateTotal = (items: number[]) => {
  return items.reduce((sum, item) => sum + item, 0)
}
```

3. **Handle null/undefined explicitly**:
```typescript
// Good
const startPage = layout?.rangeStart ?? 1

// Bad
const startPage = layout.rangeStart || 1  // Doesn't handle 0 correctly
```

### React

1. **Use functional components**:
```typescript
// Good
export default function MyComponent({ prop }: Props) {
  return <div>{prop}</div>
}

// Don't use class components
```

2. **Memoize callbacks with useCallback**:
```typescript
// Good (when passed to child components)
const handleClick = useCallback(() => {
  doSomething()
}, [dependencies])

// Acceptable (for simple inline handlers)
<button onClick={() => console.log('clicked')}>
```

3. **Extract complex JSX into sub-components**:
```typescript
// Good
function ComplexForm() {
  return (
    <div>
      <FormHeader />
      <FormBody />
      <FormFooter />
    </div>
  )
}

// Bad (all in one component, 500+ lines)
```

### File Organization

1. **One main export per file**
2. **Helper components in same file if only used there**
3. **Shared types in separate files or utils**
4. **Tests alongside source files with `.test.ts` suffix**

### Naming Conventions

```typescript
// Components: PascalCase
function BookletView() {}

// Hooks: camelCase with 'use' prefix
function useBookletState() {}

// Functions: camelCase
function calculateLayout() {}

// Constants: SCREAMING_SNAKE_CASE (if truly constant)
const MAX_FILE_SIZE = 100 * 1024 * 1024

// Types/Interfaces: PascalCase
interface BookletLayout {}
type PageNumber = number | null
```

---

## Testing Your Changes

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test bookletCalculator

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Writing Tests

**Unit test for pure function**:
```typescript
import { describe, it, expect } from 'vitest'
import { calculateBookletLayout } from './bookletCalculator'

describe('calculateBookletLayout', () => {
  it('should calculate correct blank pages', () => {
    const layout = calculateBookletLayout(7, 3, 4)
    expect(layout.totalBlankPages).toBe(5)
    expect(layout.totalSheets).toBe(3)
  })

  it('should handle edge case: 0 pages', () => {
    const layout = calculateBookletLayout(0, 3, 4)
    expect(layout.totalBlankPages).toBe(0)
  })
})
```

**Component test** (if adding React Testing Library):
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FileUpload from './FileUpload'

describe('FileUpload', () => {
  it('should show upload prompt when no file', () => {
    render(<FileUpload pdfFile={null} totalPages={0} loading={false} onFileUpload={() => {}} />)
    expect(screen.getByText(/Click to upload PDF/i)).toBeInTheDocument()
  })
})
```

### Manual Testing Checklist

After making changes, test:
- [ ] Upload small PDF (4-8 pages)
- [ ] Upload large PDF (100+ pages)
- [ ] Try different pages per sheet (2, 4, 8, 16)
- [ ] Adjust sheets per booklet
- [ ] Click optimize
- [ ] Change text direction
- [ ] Modify page range
- [ ] Generate PDF
- [ ] Verify generated PDF in viewer
- [ ] Check browser console for errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)

---

## Common Modification Recipes

### Recipe 1: Add Page Numbers to Output PDF

**Location**: `hooks/usePdfGeneration.ts`

```typescript
import { rgb } from 'pdf-lib'

export function useBookletPdfGenerator(pdfData, layout) {
  return useCallback(async () => {
    // ... existing code ...

    const pages = bookletPdf.getPages()

    pages.forEach((page, index) => {
      const { width, height } = page.getSize()

      // Draw page number at bottom center
      page.drawText(`${index + 1}`, {
        x: width / 2 - 10,
        y: 20,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      })
    })

    return bookletPdf.save()
  }, [layout, pdfData])
}
```

### Recipe 2: Save Settings to Local Storage

**Location**: `hooks/useBookletState.ts`

```typescript
// Load settings on mount
useEffect(() => {
  const saved = localStorage.getItem('bookletSettings')
  if (saved) {
    const { pagesPerSheet, sheetsPerBooklet, textDirection } = JSON.parse(saved)
    setPagesPerSheet(pagesPerSheet ?? 4)
    setSheetsPerBooklet(sheetsPerBooklet ?? 4)
    setTextDirection(textDirection ?? 'ltr')
  }
}, [])

// Save settings when changed
useEffect(() => {
  const settings = { pagesPerSheet, sheetsPerBooklet, textDirection }
  localStorage.setItem('bookletSettings', JSON.stringify(settings))
}, [pagesPerSheet, sheetsPerBooklet, textDirection])
```

### Recipe 3: Add Crop Marks

**Location**: `hooks/usePdfGeneration.ts`

```typescript
function drawCropMarks(page: PDFPage) {
  const { width, height } = page.getSize()
  const cropLength = 20
  const margin = 10

  // Top-left
  page.drawLine({
    start: { x: margin, y: height - margin },
    end: { x: margin + cropLength, y: height - margin },
    thickness: 0.5,
  })
  page.drawLine({
    start: { x: margin, y: height - margin },
    end: { x: margin, y: height - margin - cropLength },
    thickness: 0.5,
  })

  // Repeat for other three corners...
}

// In useBookletPdfGenerator, after adding pages:
bookletPdf.getPages().forEach(page => {
  drawCropMarks(page)
})
```

### Recipe 4: Batch Process Multiple Files

**Location**: `hooks/useBookletState.ts`

```typescript
const [pdfFiles, setPdfFiles] = useState<File[]>([])
const [layouts, setLayouts] = useState<Map<string, BookletLayout>>(new Map())

const handleMultipleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
  const files = Array.from(event.target.files || [])

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pages = pdfDoc.getPageCount()

    const optimalSheets = findOptimalSheetsPerBooklet(pages, pagesPerSheet)
    const layout = calculateBookletLayout(pages, optimalSheets, pagesPerSheet)

    setLayouts(prev => new Map(prev).set(file.name, layout))
  }

  setPdfFiles(files)
}, [pagesPerSheet])
```

### Recipe 5: Add Export Options (CSV, JSON)

**Create new file**: `utils/exportHelpers.ts`

```typescript
export function exportLayoutAsJSON(layout: BookletLayout): string {
  return JSON.stringify(layout, null, 2)
}

export function exportLayoutAsCSV(layout: BookletLayout): string {
  const rows = [
    ['Metric', 'Value'],
    ['Total Pages', layout.totalPages],
    ['Total Booklets', layout.totalBooklets],
    ['Total Sheets', layout.totalSheets],
    ['Blank Pages', layout.totalBlankPages],
    ['Efficiency', `${layout.efficiency}%`],
  ]

  return rows.map(row => row.join(',')).join('\n')
}

export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
```

**Add buttons in** `ResultsDisplay.tsx`:
```typescript
import { exportLayoutAsJSON, exportLayoutAsCSV, downloadText } from '../utils/exportHelpers'

<button onClick={() => downloadText(exportLayoutAsJSON(layout), 'layout.json')}>
  Export JSON
</button>
<button onClick={() => downloadText(exportLayoutAsCSV(layout), 'layout.csv')}>
  Export CSV
</button>
```

### Recipe 6: Add Keyboard Shortcuts

**Location**: `App.tsx`

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + P: Generate PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault()
      if (layout) handlePrint()
    }

    // Ctrl/Cmd + O: Optimize
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault()
      useOptimalSheets()
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [layout, handlePrint, useOptimalSheets])
```

---

## Building and Deployment

### Build for Production
```bash
npm run build
```

Output in `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Deploy to Static Host

**Netlify**:
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

**Vercel**:
```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

**GitHub Pages**:
```bash
# Update vite.config.js
export default defineConfig({
  base: '/booklets/',  // Your repo name
  // ...
})

# Build and deploy
npm run build
gh-pages -d dist
```

---

## Getting Help

If you're stuck:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [AGENT_DOCS.md](AGENT_DOCS.md) for implementation details
3. Look at [ARCHITECTURE.md](ARCHITECTURE.md) for system overview
4. Check browser console for errors
5. Run tests: `npm test`

---

## Submitting Changes

1. Test thoroughly (manual + automated)
2. Update relevant documentation
3. Add/update tests if needed
4. Check for TypeScript errors: `npm run build`
5. Ensure code follows style guidelines
6. Write clear commit messages

---

Happy coding! 🚀
