---
title: "Paper Weights & Imposition"
excerpt: "Understanding GSM, folios, quartos, and how large sheets become book signatures through folding."
category: "Theory"
date: "Jun 16, 2026"
image: "/images/covers/20260324-paper-weights-and-imposition.png"
seoTitle: "Paper Weights & Imposition: Planning Book Signatures"
metaDescription: "Understand paper weight (GSM), traditional folding schemes, and imposition layouts. Essential theory for planning book projects."
slug: "paper-weights-and-imposition"
---

Before printing and bookmaking merged, paper was always sold in large sheets to be folded into signatures.

**TL;DR**
- Paper weight is measured in GSM (grams per square meter)—80–100 GSM suits most text pages
- Each fold doubles the number of leaves: 1 fold = 4 pages, 2 folds = 8 pages, 3 folds = 16 pages
- Imposition arranges pages so they appear in correct order when folded and trimmed

![Comparison of paper thicknesses](/images/diagrams/paper-thickness-comparison.svg)

## Paper Weight: Understanding GSM

Paper weight is measured in **grams per square meter (GSM)** or **g/m²**. This tells you how much one square meter of that paper weighs.

### Common Weight Ranges

| GSM Range | Category | Typical Uses |
|-----------|----------|--------------|
| 60–90 | Text weight | Book pages, letters |
| 90–120 | Heavy text | Quality stationery |
| 120–170 | Card stock | Covers, postcards |
| 170–300 | Heavy card | Hardcover wraps |
| 300+ | Board | Rarely used flat |

### Choosing the Right Weight

**For text pages:**

- **80 GSM:** Standard, may show through (ghosting)
- **90–100 GSM:** Good opacity, still flexible
- **120 GSM:** Premium feel, thicker books

**For covers:**

- **Soft cover:** 160–200 GSM
- **Dust jackets:** 120–150 GSM
- **Endpapers:** 100–140 GSM

> **Pro tip:** If printing on both sides, choose paper with good opacity. Hold a sheet up to light—if you can clearly see your hand behind it, text may show through.

![Step 1: Paper Thickness comparison diagram](/images/diagrams/paper-thickness-comparison.svg)

## Traditional Paper Sizes

Before ISO standards (A4, A3, etc.), paper came in named sizes. These names describe the original sheet size:

| Name | Sheet Size | Folded to |
|------|------------|-----------|
| Folio | 19 × 24 inches (48 × 61cm) | Half |
| Quarto | 9.5 × 12 inches (24 × 30cm) | Quarter |
| Octavo | 6 × 9 inches (15 × 23cm) | Eighth |
| Sextodecimo (16mo) | 4 × 6 inches (10 × 15cm) | Sixteenth |

These terms also describe how many times a sheet is folded.

## Understanding Imposition

**Imposition** is the arrangement of pages on a large sheet so they appear in correct order when folded. This is how a single sheet becomes a multi-page signature.

> **Common mistake:** Assuming pages print in reading order. They don't. Imposition rearranges them so folding produces the correct sequence.

![Watch: Understanding Imposition and Signatures](https://www.youtube.com/watch?v=gk56oIyfY-M)

## Folding Schemes

### Folio (2 leaves, 4 pages)

One fold:

```
Sheet flat:          Folded:
┌─────┬─────┐        ┌─────┐
│  4  │  1  │   →    │  1  │
├─────┼─────┤        │  2  │
│  2  │  3  │        │  3  │
└─────┴─────┘        │  4  │
                     └─────┘
```

**Result:** 1 signature with 2 leaves (4 pages)

### Quarto (4 leaves, 8 pages)

Two folds:

```
Sheet flat:               Folded once:         Folded twice:
┌───┬───┬───┬───┐        ┌───┬───┐            ┌───┐
│ 4 │ 5 │ 8 │ 1 │   →    │ 1 │ 4 │    →       │ 1 │
├───┼───┼───┼───┤        │ 2 │ 3 │            │ 2 │
│ 6 │ 3 │ 2 │ 7 │        │ 7 │ 6 │            │...│
└───┴───┴───┴───┘        │ 8 │ 5 │            │ 8 │
                         └───┴───┘            └───┘
```

**Result:** 1 signature with 4 leaves (8 pages)

### Octavo (8 leaves, 16 pages)

Three folds from a single sheet. The classic book signature.

### Sextodecimo (16 leaves, 32 pages)

Four folds. Maximum practical for most papers before bulk becomes problematic.

![Imposition layout showing page positions for an 8-page signature](/images/diagrams/imposition-layout-8page.svg)

## The Mathematics of Signatures

Each fold doubles the number of leaves:

| Folds | Leaves | Pages |
|-------|--------|-------|
| 1 | 2 | 4 |
| 2 | 4 | 8 |
| 3 | 8 | 16 |
| 4 | 16 | 32 |

**Formula:** Leaves = 2^(number of folds), Pages = Leaves × 2

## Practical Application: Planning a Book

Say you want to make a 96-page book:

**Option 1: 8-page signatures (quarto)**

- 96 ÷ 8 = 12 signatures
- Each signature: 1 sheet folded twice

**Option 2: 16-page signatures (octavo)**

- 96 ÷ 16 = 6 signatures
- Each signature: 1 sheet folded three times

**Option 3: Mixed**

- Five 16-page signatures (80 pages) + two 8-page signatures (16 pages)
- Allows flexibility in final page count

> **Pro tip:** Use smaller signatures for the first and last sections. This keeps the book's exterior neat even if inner signatures show slight "creep" (pages pushing forward).

## Choosing Signature Size

| Signature Size | Advantages | Disadvantages |
|----------------|------------|---------------|
| 4 pages | Simple, easy to align | Many signatures needed |
| 8 pages | Good balance | Common choice |
| 16 pages | Fewer signatures | Bulk at spine can be an issue |
| 32 pages | Very efficient | Paper must be thin |

**Rule of thumb:** Heavier paper = smaller signatures. Thin paper (under 80 GSM) can handle larger signatures.

## Imposition for Printing

When printing your own pages, you must arrange them correctly for folding:

### Simple 4-Page Imposition (Folio)

Print two pages per side of a sheet:

- Side 1: Pages 4 and 1
- Side 2: Pages 2 and 3

### 8-Page Imposition (Quarto)

More complex—pages must be positioned considering both folds:

- Side 1: Pages 8, 1, 4, 5
- Side 2: Pages 2, 7, 6, 3

> **Tool swap:** Don't want to calculate? Many PDF readers have "booklet printing" built in. InDesign, Affinity Publisher, and free tools like BookletCreator handle imposition automatically.

## Software for Imposition

Several tools can automate imposition:

- **Adobe InDesign:** Full imposition controls
- **Booklet printing in most PDF readers:** Simple 4-page imposition
- **Online tools:** Websites that rearrange pages for booklet printing
- **Dedicated imposition software:** For complex commercial work

## Calculating Paper Needs

To determine how much paper you need:

1. **Determine signature size:** (e.g., 16 pages)
2. **Calculate sheets per signature:** (1 for 16-page octavo)
3. **Determine number of signatures:** (total pages ÷ signature size)
4. **Add waste:** (10–15% for mistakes and trimming)

**Example:**

- 96-page book with 16-page signatures
- 6 signatures × 1 sheet = 6 sheets
- Plus 15% waste = 7 sheets minimum

> **Common mistake:** Forgetting to account for endpapers. A casebound book needs additional sheets for the front and back endpapers, usually 2–4 extra leaves.

![Step 3: Imposition layout used to plan page positions](/images/diagrams/imposition-layout-8page.svg)

## Common Mistakes

- **Wrong page order:** Always test imposition with numbered scrap paper first
- **Forgetting grain direction:** Grain must run parallel to the final spine
- **Paper too thick:** Large signatures with heavy paper won't fold cleanly
- **No creasing:** Always score fold lines on heavy stock (160+ GSM)

Understanding paper weights and imposition connects the digital file to the physical book. Master these concepts, and you can plan any book project from page count to finished binding.

---

## Glossary

- **GSM:** Grams per square meter, the standard measurement of paper weight
- **Imposition:** The arrangement of pages on a sheet so they appear in order when folded
- **Signature:** A folded sheet forming a section of the book
- **Folio/Quarto/Octavo:** Traditional terms describing how many times a sheet is folded
- **Creep:** The tendency of inner pages in a thick signature to extend beyond outer pages

---

## FAQ

**What GSM should I use for novel text pages?**
80–100 GSM is standard. 80 GSM is economical but may show through; 90–100 GSM offers better opacity and feel.

**How do I know if my paper is too thick for 16-page signatures?**
Fold a test signature. If the inner pages push forward significantly or the fold is rounded rather than crisp, use smaller signatures.

**Can I mix different papers in one signature?**
Yes, but all papers in a single signature should be similar weight. Different weights fold at different thicknesses, causing alignment issues.

**Why do some books have a few blank pages at the end?**
Signatures come in fixed page counts (4, 8, 16, etc.). A 140-page text in 16-page signatures requires 9 signatures (144 pages), leaving 4 blank.

**Do I need expensive software for imposition?**
No. Free tools and built-in PDF reader features handle simple booklet imposition. Complex jobs (multiple signatures, different paper sizes) benefit from dedicated software.

---

## Suggested Internal Links

- Grain Direction & Folding Techniques
- The Anatomy of a Book
- Project: Pamphlet Stitch Booklet
- Beginner's Guide to Case Binding

---

## Image Plan

- **Hero:** Stack of different weight papers fanned out with GSM labels
- **Step 1:** Paper thickness comparison diagram
- **Step 2:** Imposition layout showing page positions for 8-page signature
- **Step 3:** Paper calculation worksheet example
