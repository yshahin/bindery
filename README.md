# Booklet Layout Optimizer

A modern web application that calculates optimal booklet layouts for PDF files to minimize blank pages when printing.

## Features

- 📄 **PDF Upload**: Upload any PDF file to analyze its page count
- 🎯 **Automatic Optimization**: Automatically finds the optimal sheet count per booklet to minimize blank pages
- ⚙️ **Customizable Settings**:
  - Pages per sheet (must be multiples of 2 for front/back printing)
  - Sheets per booklet (signature size)
- 🖨️ **Booklet PDF Export**: Generates a new PDF with pages reordered (and blank pages inserted) for immediate printing
- 📊 **Detailed Results**: Shows total blank pages, efficiency, sheets needed, and detailed breakdown
- 🎨 **Modern UI**: Beautiful, responsive interface with gradient design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How It Works

1. **Upload a PDF**: Click the upload area and select your PDF file
2. **Adjust Settings**:
   - **Pages per Sheet**: Choose how many logical pages to print on each sheet (2, 4, 8, 16, etc.)
   - **Sheets per Booklet (Signature)**: Choose how many sheets get folded into a single booklet
3. **Optimize**: Click the "Optimize" button to automatically find the best sheet count
4. **View Results**: See the calculated layout with blank pages, efficiency, and detailed breakdown
5. **Export Booklet PDF**: Click "Generate PDF" to download the reordered document ready for printing

## Understanding the Results

- **Total Blank Pages**: The number of blank pages that will be needed
- **Efficiency**: Percentage of physical pages that contain actual content
- **Total Sheets**: Number of physical sheets needed for printing
- **Complete Booklets**: Number of full booklets that can be made
- **Remaining Pages**: Content pages in the final incomplete booklet (if any)

## Technical Details

The algorithm calculates:
- How many sheets form each booklet based on the selected sheet count
- How many complete booklets can be made from the total pages
- How many blank pages are required at the end of the job to fill the last booklet
- The optimal sheet count per booklet to minimize waste

## Documentation for Developers & AI Agents

**📖 [START HERE: Documentation Index](docs/DOCS_INDEX.md)** - Complete guide to all documentation

This project includes comprehensive documentation for future development:

- **[docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)** - Navigation guide to all documentation (START HERE)
- **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** - Fast reference guide with key concepts and common tasks
- **[docs/AGENT_DOCS.md](docs/AGENT_DOCS.md)** - Complete technical documentation with architecture and algorithms
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Visual diagrams showing component structure and data flow
- **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Guide for adding features and modifying code
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Solutions to common issues and debugging guides

### Quick Start for Agents
1. Read [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md) to find the right documentation
2. For fast context: [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) (10 minutes)
3. For deep understanding: [docs/AGENT_DOCS.md](docs/AGENT_DOCS.md) (30 minutes)
4. To make changes: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
5. To fix issues: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## License

MIT

