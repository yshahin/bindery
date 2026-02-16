# Agent Guide: Booklets Project

Welcome, AI Agent! This repository is a hybrid project combining a specialized **PDF Booklet Tool** with a **Content-Based Website** focused on the craft of bookbinding.

This document serves as your primary entry point for understanding how to interact with, maintain, and expand this codebase.

---

## 🎯 Project Mission

The goal of this project is to provide:
1.  **Utilities**: Practical tools for bookbinders (specifically the PDF imposition tool).
2.  **Knowledge**: A curated collection of articles and tutorials on bookbinding techniques.
3.  **Inspiration**: A gallery of completed projects.

---

## 🏗️ Technical Architecture

The project is built with **React 19**, **Vite 7**, and **TypeScript**.

### 1. The Booklet Tool (Logic-Heavy)
-   **Core Algorithm**: `src/utils/bookletCalculator.ts` - Handles the complex math of page imposition.
-   **State Management**: `src/hooks/useBookletState.ts` - Orchestrates PDF loading, settings, and layout calculation.
-   **PDF Manipulation**: `src/hooks/usePdfGeneration.ts` - Uses `pdf-lib` to generate the final output.
-   **RTL Detection**: `src/utils/rtlDetector.ts` - Auto-detects right-to-left languages.

### 2. The Content System (Data-Heavy)
-   **Articles**: Markdown files located in `content/articles/` and `content/drafts/`.
-   **Metadata**: Articles use YAML front-matter for titles, dates, and categories.
-   **Data Loading**: `src/data.ts` - Dynamically imports and parses content using `import.meta.glob`.
-   **Gallery**: Defined in `content/gallery.yaml`.

---

## 🤖 Agent Responsibilities & Workflows

### ✍️ Adding Content (Articles)
When asked to write or update articles:
1.  **Format**: Use Markdown with front-matter.
2.  **Location**: 
    -   New posts: `content/articles/YYYYMMDD-slug.md`
    -   Drafts: `content/drafts/YYYYMMDD-slug.md` (only visible in `npm run dev`)
3.  **Front-matter Fields**: `title`, `excerpt`, `category`, `date`, `image`, `published` (optional).
    -   *Note*: `id` is automatically derived from the filename.
    -   *Note*: `readTime` is calculated based on word count.
4.  **Images**: Place in `public/images/covers/` or `public/images/diagrams/`.

### 🛠️ Modifying the Tool
When modifying the booklet calculator:
1.  **Tests First**: The logic is covered in `src/utils/bookletCalculator.test.ts`. Run `npm test` before and after changes.
2.  **Validation**: Ensure `pagesPerSheet` remains even and `sheetsPerBooklet` is a positive integer.
3.  **UI Sync**: If adding a new setting, update `src/hooks/useBookletState.ts` and `src/components/LayoutControls.tsx`.

### 🎨 UI & Styling
-   **Tailwind CSS 4**: Used for all styling.
-   **Components**: Organized in `src/components/` (atomic pieces) and `src/pages/` (top-level views).
-   **Icons**: Check existing patterns before adding new icon libraries.

---

## 📚 Deep Dive Documentation

For more specific information, refer to these files in the `docs/` directory:

-   **[AGENT_DOCS.md](docs/AGENT_DOCS.md)**: Extremely detailed technical breakdown of the codebase, algorithms, and data structures. **Read this first for any code changes.**
-   **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: High-level system design and data flow.
-   **[CONTRIBUTING.md](docs/CONTRIBUTING.md)**: Coding standards and "how-to" recipes.
-   **[QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)**: Cheat sheet for file locations and common values.
-   **[BOOKBINDING_TOPICS.md](docs/BOOKBINDING_TOPICS.md)**: List of content ideas and domain knowledge.

---

## 🚀 Common Commands

-   `npm run dev`: Start development server (includes drafts).
-   `npm test`: Run Vitest suite.
-   `npm run build`: Production build.
-   `npm run lint`: Run ESLint.

---

## ⚠️ Safety & Constraints

1.  **PDF-Lib**: Do not replace `pdf-lib` without a very strong reason; it's central to the export logic.
2.  **Metadata Integrity**: Ensure article IDs match their filenames to maintain routing consistency.
3.  **Blank Pages**: The imposition algorithm assumes blank pages are only added at the end of signatures. Do not break this assumption without refactoring the entire calculator.
