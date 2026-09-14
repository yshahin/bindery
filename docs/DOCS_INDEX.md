# Documentation Index

Welcome! This index helps you find the right documentation for your needs.

---

## 🚀 Quick Start

**New to the project?** Start here:
1. Read [README.md](../README.md) - Project overview and basic usage
2. Skim [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Key concepts and file locations
3. Set up: `npm install && npm run dev`

---

## 📚 Documentation Guide

### For Understanding the App

| Document | When to Use | Reading Time |
|----------|-------------|--------------|
| [README.md](../README.md) | First time learning about the app | 5 min |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Need fast lookup of concepts/locations | 10 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Want to understand system design | 15 min |
| [AGENT_DOCS.md](AGENT_DOCS.md) | Deep dive into implementation | 30 min |
| [BOOKBINDING_TOPICS.md](BOOKBINDING_TOPICS.md) | Domain knowledge and content ideas | 10 min |

### For Making Changes

| Document | When to Use |
|----------|-------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Adding features or modifying code |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Fixing bugs or investigating issues |
| [AGENT_DOCS.md](AGENT_DOCS.md) - "Common Modifications" | Changing specific functionality |

### For Debugging

| Document | When to Use |
|----------|-------------|
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Something's not working |
| [ARCHITECTURE.md](ARCHITECTURE.md) - "Data Flow" | Understanding how data moves |
| [AGENT_DOCS.md](AGENT_DOCS.md) - "Debugging Tips" | Need debugging strategies |

---

## 🎯 Find Information By Topic

### Core Concepts

- **What are booklets/signatures?** → [AGENT_DOCS.md](AGENT_DOCS.md#core-concepts)
- **How does page imposition work?** → [AGENT_DOCS.md](AGENT_DOCS.md#key-algorithms-explained)
- **Why are blank pages needed?** → [AGENT_DOCS.md](AGENT_DOCS.md#core-concepts)

### Architecture & Design

- **Component hierarchy** → [ARCHITECTURE.md](ARCHITECTURE.md#component-hierarchy)
- **Data flow** → [ARCHITECTURE.md](ARCHITECTURE.md#data-flow-diagram)
- **State management** → [ARCHITECTURE.md](ARCHITECTURE.md#state-management-pattern)
- **File structure** → [AGENT_DOCS.md](AGENT_DOCS.md#project-structure)

### Key Files

- **Main app logic** → [AGENT_DOCS.md - useBookletState](AGENT_DOCS.md#2-hooksusebookletstatets)
- **Calculation algorithm** → [AGENT_DOCS.md - bookletCalculator](AGENT_DOCS.md#1-utilsbookletcalculatorts)
- **PDF generation** → [AGENT_DOCS.md - usePdfGeneration](AGENT_DOCS.md#3-hooksusepdfgenerationts)
- **RTL detection** → [AGENT_DOCS.md - rtlDetector](AGENT_DOCS.md#4-utilsrtldetectorts)

### Algorithms

- **Layout calculation** → [AGENT_DOCS.md - Algorithm Flow](AGENT_DOCS.md#algorithm-flow)
- **Page imposition (4-up)** → [AGENT_DOCS.md - Standard Four-Up](AGENT_DOCS.md#standard-four-up-imposition-ltr)
- **Optimization** → [AGENT_DOCS.md - Optimization Algorithm](AGENT_DOCS.md#optimization-algorithm)
- **RTL detection** → [ARCHITECTURE.md - RTL Detection Flow](ARCHITECTURE.md#rtl-detection-flow)

### Common Tasks

| I want to... | See... |
|--------------|--------|
| Add a new setting/control | [CONTRIBUTING.md - Adding New Features](CONTRIBUTING.md#adding-new-features) |
| Modify the calculation | [QUICK_REFERENCE.md - Modify Optimization](QUICK_REFERENCE.md#modifying-existing-features) |
| Change default values | [CONTRIBUTING.md - Changing Defaults](CONTRIBUTING.md#changing-default-values) |
| Add a new page layout | [CONTRIBUTING.md - New Page Layout](CONTRIBUTING.md#2-adding-a-new-page-layout-algorithm) |
| Customize PDF output | [CONTRIBUTING.md - Recipe 1](CONTRIBUTING.md#recipe-1-add-page-numbers-to-output-pdf) |
| Debug an issue | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

---

## 🔍 Search by File Name

### Source Files

| File | Purpose | Documentation |
|------|---------|---------------|
| `src/App.tsx` | Main app component | [AGENT_DOCS](AGENT_DOCS.md#5-components) |
| `src/hooks/useBookletState.ts` | State management | [AGENT_DOCS](AGENT_DOCS.md#2-hooksusebookletstatets) |
| `src/hooks/usePdfGeneration.ts` | PDF export | [AGENT_DOCS](AGENT_DOCS.md#3-hooksusepdfgenerationts) |
| `src/utils/bookletCalculator.ts` | Core algorithm | [AGENT_DOCS](AGENT_DOCS.md#1-utilsbookletcalculatorts) |
| `src/utils/rtlDetector.ts` | RTL detection | [AGENT_DOCS](AGENT_DOCS.md#4-utilsrtldetectorts) |
| `src/components/FileUpload.tsx` | Upload UI | [AGENT_DOCS](AGENT_DOCS.md#fileuploadtsx) |
| `src/components/LayoutControls.tsx` | Settings UI | [AGENT_DOCS](AGENT_DOCS.md#layoutcontrolstsx) |
| `src/components/ResultsDisplay.tsx` | Results UI | [AGENT_DOCS](AGENT_DOCS.md#resultsdisplaytsx) |
| `src/components/BookletView.tsx` | Visual preview | [AGENT_DOCS](AGENT_DOCS.md#bookletviewtsx) |

### Test Files

| File | Tests | Documentation |
|------|-------|---------------|
| `src/utils/bookletCalculator.test.ts` | Algorithm tests | [AGENT_DOCS - Testing](AGENT_DOCS.md#testing) |

---

## 🐛 Troubleshooting Index

| Problem | Solution |
|---------|----------|
| PDF upload fails | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-pdf-upload-fails) |
| Wrong number of blank pages | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-wrong-number-of-blank-pages) |
| Generated PDF wrong order | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-generated-pdf-has-wrong-page-order) |
| RTL detection not working | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-rtl-detection-not-working) |
| Optimization not optimal | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-optimization-not-finding-best-layout) |
| Browser crashes | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-pdf-generation-crashes-browser) |
| Page range issues | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-page-range-not-working) |
| TypeScript errors | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-typescript-errors) |
| Tests failing | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-tests-failing) |
| Build fails | [TROUBLESHOOTING](TROUBLESHOOTING.md#issue-build-fails) |

---

## 📖 Documentation by Role

### I'm an AI Agent tasked with...

**Start Here: [AGENTS.md](../AGENTS.md)** - High-level project entry point for AI assistants.

#### Understanding the codebase
→ Start: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
→ Then: [ARCHITECTURE.md](ARCHITECTURE.md)
→ Deep dive: [AGENT_DOCS.md](AGENT_DOCS.md)

#### Fixing a bug
→ Start: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
→ Reference: [AGENT_DOCS.md - Debugging Tips](AGENT_DOCS.md#debugging-tips)
→ Check: [ARCHITECTURE.md - Data Flow](ARCHITECTURE.md#data-flow-diagram)

#### Adding a feature
→ Start: [CONTRIBUTING.md](CONTRIBUTING.md#adding-new-features)
→ Reference: [AGENT_DOCS.md - Common Modifications](AGENT_DOCS.md#common-modifications)
→ Examples: [CONTRIBUTING.md - Recipes](CONTRIBUTING.md#common-modification-recipes)

#### Optimizing performance
→ Check: [AGENT_DOCS.md - Performance Considerations](AGENT_DOCS.md#performance-considerations)
→ See: [TROUBLESHOOTING.md - Performance Issues](TROUBLESHOOTING.md#performance-issues)

#### Refactoring code
→ Review: [CONTRIBUTING.md - Code Style](CONTRIBUTING.md#code-style-guidelines)
→ Understand: [ARCHITECTURE.md](ARCHITECTURE.md)
→ Reference: [AGENT_DOCS.md](AGENT_DOCS.md)

#### Writing tests
→ See: [CONTRIBUTING.md - Testing](CONTRIBUTING.md#testing-your-changes)
→ Examples: [AGENT_DOCS.md - Testing](AGENT_DOCS.md#testing)

#### Deploying
→ See: [CONTRIBUTING.md - Building and Deployment](CONTRIBUTING.md#building-and-deployment)

---

## 📊 Documentation Statistics

| Document | Size | Sections | Focus |
|----------|------|----------|-------|
| README.md | Short | 6 | User-facing overview |
| QUICK_REFERENCE.md | Medium | 15 | Fast lookups |
| ARCHITECTURE.md | Medium | 12 | Visual diagrams |
| AGENT_DOCS.md | Large | 20+ | Comprehensive technical |
| CONTRIBUTING.md | Large | 8 | How-to guides |
| TROUBLESHOOTING.md | Large | 15+ | Problem solutions |

---

## 🎓 Learning Paths

### Path 1: Quick Understanding (30 minutes)
1. [README.md](../README.md) - 5 min
2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 10 min
3. [ARCHITECTURE.md - Component Hierarchy](ARCHITECTURE.md#component-hierarchy) - 5 min
4. [ARCHITECTURE.md - Data Flow](ARCHITECTURE.md#data-flow-diagram) - 5 min
5. Run `npm run dev` and explore - 5 min

### Path 2: Deep Technical Understanding (2 hours)
1. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 10 min
2. [ARCHITECTURE.md](ARCHITECTURE.md) - 30 min
3. [AGENT_DOCS.md](AGENT_DOCS.md) - 60 min
4. Read key source files - 20 min
   - `bookletCalculator.ts`
   - `useBookletState.ts`

### Path 3: Ready to Contribute (1 hour)
1. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 10 min
2. [CONTRIBUTING.md](CONTRIBUTING.md) - 30 min
3. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 10 min
4. Set up dev environment - 10 min

---

## 💡 Pro Tips

1. **Use Ctrl+F to search** across documentation files
2. **Start with QUICK_REFERENCE** for fastest context
3. **Check TROUBLESHOOTING first** when fixing issues
4. **Read ARCHITECTURE before big changes** to understand impact
5. **Follow code style in CONTRIBUTING** for consistency

---

## 📝 Documentation Maintenance

When updating code, remember to update:
- [ ] Relevant section in AGENT_DOCS.md if architecture changes
- [ ] QUICK_REFERENCE.md if common values change
- [ ] TROUBLESHOOTING.md if new issues discovered
- [ ] CONTRIBUTING.md if adding new patterns/recipes
- [ ] README.md if user-facing features change

---

## 🔗 Quick Links

- **Run app**: `npm run dev`
- **Run tests**: `npm test`
- **Build**: `npm run build`
- **Main entry point**: [src/main.tsx](src/main.tsx)
- **Main component**: [src/App.tsx](src/App.tsx)
- **Core algorithm**: [src/utils/bookletCalculator.ts](src/utils/bookletCalculator.ts)

---

## ❓ Still Can't Find What You Need?

1. Try searching all docs for keywords
2. Check file comments in source code
3. Look at test files for examples
4. Review git history for context
5. Check browser console for runtime info

---

Last updated: January 2026
Documentation version: 1.0
