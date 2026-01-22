# Architecture Diagram

## Component Hierarchy

```mermaid
graph TD
    App[App.tsx]
    App --> FileUpload[FileUpload]
    App --> Error["(Error Display)"]
    App --> LayoutControls[LayoutControls]
    App --> ResultsDisplay[ResultsDisplay]
    App --> BookletView[BookletView]

    FileUpload -.-> FUProps["Props: pdfFile, totalPages, loading, onFileUpload"]

    LayoutControls --> PagesPerSheet[PagesPerSheetControl]
    LayoutControls --> PrintRange[PrintRangeControl]
    LayoutControls --> TextDir[TextDirectionControl]
    LayoutControls --> SheetsPerBooklet[SheetsPerBookletControl]

    ResultsDisplay --> ResSummary["ResultsSummary<br/>(+ Generate PDF button)"]
    ResultsDisplay --> ResGrid["ResultsGrid<br/>(metrics cards)"]
    ResultsDisplay --> Details[DetailsBreakdown]

    BookletView --> BookletCard["BookletCard<br/>(repeated)"]
    BookletCard --> SheetCard["SheetCard<br/>(repeated)"]
    SheetCard --> Front[Front pages]
    SheetCard --> Back[Back pages]
```

---

## Data Flow Diagram

```mermaid
graph TB
    App["App.tsx<br/>(Orchestration layer - no business logic)"]

    App --> Hook["useBookletState()<br/>(State management hook - main business logic)"]

    Hook --> State["<b>State:</b><br/>• pdfFile, totalPages, pdfData<br/>• sheetsPerBooklet, pagesPerSheet<br/>• textDirection, detectedDirection<br/>• rangeStart, rangeEnd<br/>• layout (BookletLayout)<br/>• loading, detecting, exporting, error"]

    Hook --> Functions["<b>Functions:</b><br/>• handleFileUpload()<br/>• handleSheetsPerBookletChange()<br/>• handlePagesPerSheetChange()<br/>• handleTextDirectionChange()<br/>• handleRangeStartChange/End()<br/>• useOptimalSheets()<br/>• applyRangeLayout()"]

    Hook --> BC[bookletCalculator.ts]
    Hook --> RTL[rtlDetector.ts]
    Hook --> PDFLib["pdf-lib<br/>(external)"]

    BC --> BCFuncs["• calculateBookletLayout<br/>• generateBookletStructure<br/>• findOptimalSheetsPerBooklet<br/>• imposeStandardFourUp"]

    RTL --> RTLFuncs["• detectTextDirection<br/>• inferFromFilename"]

    PDFLib --> PDFLibFuncs["• load PDF<br/>• get page count"]
```

---

## User Interaction Flow

```mermaid
sequenceDiagram
    actor User
    participant Upload as handleFileUpload()
    participant UI as UI Display
    participant Settings as handleSettingChange()
    participant Optimize as useOptimalSheets()
    participant Print as handlePrint()

    User->>Upload: 1. Upload PDF
    Note over Upload: • Read file as ArrayBuffer<br/>• Infer direction from filename<br/>• Load with pdf-lib → get pages<br/>• Detect text direction (async)<br/>• Find optimal sheets<br/>• Calculate initial layout

    Upload->>UI: 2. View Results
    Note over UI: • ResultsDisplay shows metrics<br/>• BookletView shows structure

    User->>Settings: 3. Adjust Settings (optional)
    Note over Settings: • Update state<br/>• Call applyRangeLayout()<br/>• Recalculate layout<br/>• UI updates

    User->>Optimize: 4. Click Optimize (optional)
    Note over Optimize: • Call findOptimalSheetsPerBooklet()<br/>• Update sheetsPerBooklet<br/>• Recalculate layout

    User->>Print: 5. Generate PDF
    Note over Print: • Call generateBookletPdf()<br/>• Create new PDF with pdf-lib<br/>• Copy pages in sequence order<br/>• Add blank pages where needed<br/>• Download result
```

---

## State Update Flow

```mermaid
graph TD
    A[Setting Change] --> B[Handler Function]
    B --> C[Update State Variable]
    C --> D[applyRangeLayout]
    D --> E[calculateBookletLayout]
    E --> F[generateBookletStructure]
    F --> G["imposeStandardFourUp<br/>(or fallback)"]
    G --> H[New BookletLayout object]
    H --> I[setLayout]
    I --> J[React Re-render]
    J --> K[UI Updates]
```

---

## Calculation Algorithm Flow

```mermaid
graph TD
    A["calculateBookletLayout(totalPages, sheetsPerBooklet, pagesPerSheet, isRTL)"]
    A --> B["Calculate derived values:<br/>• pagesPerBooklet = sheetsPerBooklet × pagesPerSheet<br/>• totalPhysicalPagesNeeded = ceil(totalPages / pagesPerSheet) × pagesPerSheet<br/>• totalBooklets = ceil(totalPhysicalPagesNeeded / pagesPerBooklet)<br/>• totalPhysicalPages = totalBooklets × pagesPerBooklet<br/>• totalBlankPages = totalPhysicalPages - totalPages"]
    B --> C["generateBookletStructure(...)"]
    C --> D["Create array: [1, 2, 3, ..., totalPages, null, null, ...blanks]"]
    D --> E["Split into booklets (chunks of pagesPerBooklet)"]
    E --> F[For each booklet]
    F --> G["imposeStandardFourUp(bookletPages, sheetsPerBooklet, isRTL)"]
    G --> H["Use two-pointer technique:<br/>• low = 0, high = length-1<br/>• For each sheet:<br/>  - Take page from high (outer page)<br/>  - Take page from low (inner page)<br/>  - Create [outer, inner] pairs for front/back<br/>  - Reverse order if RTL<br/>• Result: sheets array + flat sequence"]
    H --> I["Build Booklet objects with:<br/>• sheets array (2D: sheets × pages per sheet)<br/>• blankPages count<br/>• pageOrder (flattened)"]
    I --> J[Combine all booklets]
    J --> K[Return BookletLayout with all data]
```

---

## PDF Generation Flow

```mermaid
graph TD
    A["useBookletPdfGenerator(pdfData, layout)"]
    A --> B[Returns async function]
    B --> C[Load source PDF with pdf-lib]
    C --> D[Create new blank PDF]
    D --> E[Get default page size from source]
    E --> F[For each page number in layout.sequence]
    F --> G{pageNum === null?}
    G -->|Yes| H[Add blank page with default size]
    G -->|No| I["Calculate absolute index:<br/>absoluteIndex = (rangeStart - 1) + (pageNum - 1)"]
    I --> J[Copy page from source[absoluteIndex]]
    J --> K[Add to new PDF]
    H --> L{More pages?}
    K --> L
    L -->|Yes| F
    L -->|No| M["Return PDF.save() → Uint8Array"]
    M --> N["downloadPdfBlob(bytes, filename)"]
    N --> O[Create Blob → Create URL → Trigger download]
```

---

## RTL Detection Flow

```mermaid
graph TD
    A["detectTextDirection(pdfArrayBuffer, fileName)"]
    A --> B[Import pdfjs-dist dynamically]
    B --> C[Set worker source CDN]
    C --> D[Load PDF with pdfjs]
    D --> E["For first 3 pages (or less)"]
    E --> F[Get page]
    F --> G[Extract text content]
    G --> H[For each text item]
    H --> I["For each character:<br/>• Check if charCode in RTL ranges<br/>• Increment totalChars<br/>• If RTL char: increment rtlChars"]
    I --> J["Calculate ratio: rtlChars / totalChars"]
    J --> K{totalChars > 50<br/>AND ratio > 10%?}
    K -->|Yes| L["return 'rtl'"]
    K -->|No| M{rtlChars > 0?}
    M -->|Yes| N["return 'unknown'"]
    M -->|No| O{totalChars === 0?}
    O -->|Yes| P["inferDirectionFromFilename(fileName)"]
    O -->|No| Q["return 'ltr'"]
```

---

## Component Communication

```mermaid
graph TD
    App["App (Parent)"]
    App --> Hook["useBookletState() hook<br/>(Provides all state & handlers)"]

    App --> FU["FileUpload<br/>Props: pdfFile, totalPages, loading<br/>Calls: onFileUpload(event)"]

    App --> LC["LayoutControls<br/>Props: all settings, ranges, directions<br/>Calls: onChange handlers"]

    App --> RD["ResultsDisplay<br/>Props: layout, totalPages, exporting<br/>Calls: onPrint()"]

    App --> BV["BookletView<br/>Props: layout, layoutRangeStart<br/>(Display only - no callbacks)"]
```

---

## Module Dependencies

```mermaid
graph LR
    App[App.tsx]
    App --> FileUpload
    App --> LayoutControls
    App --> ResultsDisplay
    App --> BookletView
    App --> useBookletState
    App --> usePdfGeneration

    useBookletState --> calculateBookletLayout
    useBookletState --> findOptimalSheetsPerBooklet
    useBookletState --> detectTextDirection
    useBookletState --> inferDirectionFromFilename
    useBookletState --> PDFDocument1["PDFDocument<br/>(pdf-lib)"]

    usePdfGeneration --> PDFDocument2["PDFDocument<br/>(pdf-lib)"]
    usePdfGeneration --> BookletLayoutType["BookletLayout type"]

    bookletCalculator["bookletCalculator.ts<br/>(Pure functions,<br/>no external imports)"]

    rtlDetector[rtlDetector.ts]
    rtlDetector --> pdfjsDist["pdfjs-dist<br/>(dynamically)"]

    LayoutControls --> TextDirectionType["TextDirection type"]

    ResultsDisplay --> BookletLayoutType2["BookletLayout type"]

    BookletView --> BookletLayoutType3["BookletLayout,<br/>Booklet,<br/>PageNumber types"]
```

---

## State Management Pattern

**Pattern**: Centralized hook with derived state

```mermaid
graph TD
    Hook["useBookletState() Hook"]

    Hook --> Primary["Primary State (useState)<br/>• pdfFile<br/>• totalPages<br/>• pdfData<br/>• sheetsPerBooklet<br/>• pagesPerSheet<br/>• textDirection<br/>• rangeStart/rangeEnd<br/>• loading flags<br/>• error"]

    Hook --> Derived["Derived State<br/>• layout (calculated from other state)<br/>• selectedPageCount (rangeEnd - rangeStart + 1)"]

    Hook --> Helper["Helper Function<br/>• applyRangeLayout() - recalculates layout<br/>• Used by all handlers"]

    Hook --> Handlers["Handlers (useCallback)<br/>• All memoized with dependencies<br/>• Call applyRangeLayout() after state update<br/>• Export to parent (App)"]
```

**Why this pattern**:
- Single source of truth
- Handlers colocated with state
- Easy to test (hook can be tested independently)
- No prop drilling (all state in one place)

---

## Error Handling Flow

```mermaid
graph TD
    A[Try Operation] --> B{Error?}
    B -->|Yes| C["Catch Error"]
    C --> D["setError(message)"]
    D --> E[App displays error in UI]
    E --> F[User fixes issue or uploads new file]
    F --> G["setError(null) - clear error"]
    B -->|No| H[Continue execution]
```

**Error types**:
- File upload errors (wrong type, read failure)
- PDF parsing errors (corrupted PDF)
- Calculation errors (invalid parameters)
- PDF generation errors (page out of bounds)
- RTL detection errors (non-fatal, fallback to filename)

---

## Optimization Points

### Current Bottlenecks
1. **PDF Loading**: Synchronous, blocks UI
2. **Text Detection**: Samples 3 pages (could be slow for large pages)
3. **PDF Generation**: Synchronous, blocks UI
4. **Layout Recalculation**: Happens on every setting change

### Potential Optimizations
1. Move PDF operations to Web Worker
2. Debounce layout recalculation
3. Cache RTL detection results
4. Virtualize BookletView for many booklets
5. Progressive loading for large PDFs

---

## Testing Strategy

```mermaid
graph TD
    A[Unit Tests<br/>bookletCalculator.test.ts]
    A --> B[Test pure functions]
    B --> C["• calculateBookletLayout()<br/>• findOptimalSheetsPerBooklet()<br/>• generateBookletStructure()"]
    C --> D[Test cases]
    D --> E["• Normal cases (various page counts)<br/>• Edge cases (0, 1, very large)<br/>• LTR vs RTL differences<br/>• Optimization correctness"]
    E --> F["Run with: npm test (Vitest)"]
```

**Not currently tested** (could be added):
- Component rendering (React Testing Library)
- Hook behavior (React Hooks Testing Library)
- PDF generation (integration test with sample PDF)
- RTL detection (mock pdfjs-dist)

---

## Build Process

```mermaid
graph TD
    A[Source Code<br/>TypeScript + React] --> B[Vite Build Tool]
    B --> C[TypeScript Compilation]
    C --> D[React JSX Transformation]
    D --> E[CSS Bundling]
    E --> F[Asset Optimization]
    F --> G["Output: dist/<br/>├── index.html<br/>├── assets/<br/>│   ├── index.[hash].js<br/>│   └── index.[hash].css<br/>└── (other assets)"]
```

---

## Extension Points

### To Add New Features

**New page layout** (e.g., 2-up):
```
1. Add option in LayoutControls
2. Add imposition logic in bookletCalculator
3. Update validation in useBookletState
```

**Save/Load Settings**:
```
1. Add localStorage functions
2. Add buttons in LayoutControls
3. Call load on mount, save on change
```

**Preview Pages**:
```
1. Add new component PreviewPanel
2. Use pdfjs-dist to render pages to canvas
3. Show in BookletView or modal
```

**Batch Processing**:
```
1. Change FileUpload to accept multiple files
2. Add file list UI
3. Process in loop or parallel
4. Zip results or individual downloads
```

---

This architecture document provides a visual and structural overview of the application. Refer to `AGENT_DOCS.md` for detailed implementation information.
