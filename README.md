# Bindery

A comprehensive digital workbench for bookbinders. This application combines practical tools for calculating signatures and layouts with a rich library of learning resources, tutorials, and binding theory.

## Features

### 🛠️ Booklet Calculator
- **PDF Upload**: Analyze valid print layouts for any PDF.
- **Signature Optimization**: Automatically calculates the optimal number of sheets per signature to minimize blank pages.
- **Export Ready**: Generates imposition-ready PDFs for home printing.

### 📚 Knowledge Base
- **Articles & Guides**: In-depth articles on techniques, materials, and theory, powered by Markdown.
- **Drafts System**: Integrated drafting workflow for new content (visible in dev mode only).
- **Video Tutorials**: Curated video guides for visual learners.
- **Inspiration Gallery**: Showcase of traditional and modern binding styles.

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
> **Note:** When running in dev mode, articles in `src/drafts/` will automatically be visible.

3. Run tests:
```bash
npm test
```

## Content Management

The application uses a file-based CMS for articles:
- **Published Articles**: Place your `.md` files in `content/articles/`.
- **Drafts**: Work on new content in `content/drafts/`. These are excluded from production builds.
- **Frontmatter**: All articles require metadata headers (id, title, date, category, etc.).

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed content guidelines.

## Documentation for Developers & AI Agents

**📖 [AGENTS.md](AGENTS.md)** - **Start here if you are an AI assistant.**

- **[docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)** - Complete guide to all documentation.
- **[docs/BOOKBINDING_TOPICS.md](docs/BOOKBINDING_TOPICS.md)** - Comprehensive list of binding styles and planned topics.
- **[docs/ARTICLE_SCHEDULE.md](docs/ARTICLE_SCHEDULE.md)** - 1-Year content release roadmap.
- **[docs/AGENT_DOCS.md](docs/AGENT_DOCS.md)** - Technical implementation details.

## Acknowledgments

Special thanks to **[Four Keys Book Arts](https://www.youtube.com/@FourKeysBookArts)**. Their extensive library of tutorials, clear explanations, and dedication to the craft have been a massive inspiration for the content and direction of this project.

## License

MIT

