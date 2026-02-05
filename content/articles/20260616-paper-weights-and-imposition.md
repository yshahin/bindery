---
title: "Paper Weights & Imposition"
excerpt: "Understanding GSM, folios, quartos, and how large sheets become book signatures through folding."
category: "Theory"
date: "Jun 16, 2026"
image: "/images/covers/20260324-paper-weights-and-imposition.png"
---

Before printing and bookmaking merged, paper was always sold in large sheets to be folded into signatures. Understanding paper weights and folding schemes (imposition) connects you to centuries of book history and helps you make better material choices.

### Paper Weight: Understanding GSM

Paper weight is measured in **grams per square meter (GSM)** or **g/m²**. This tells you how much one square meter of that paper weighs.

#### Common Weight Ranges

| GSM Range | Category | Typical Uses |
|-----------|----------|--------------|
| 60-90 | Text weight | Book pages, letters |
| 90-120 | Heavy text | Quality stationery |
| 120-170 | Card stock | Covers, postcards |
| 170-300 | Heavy card | Hardcover wraps |
| 300+ | Board | Rarely used flat |

#### Choosing the Right Weight

**For text pages:**

- 80 gsm: Standard, may show through (ghosting)
- 90-100 gsm: Good opacity, still flexible
- 120 gsm: Premium feel, thicker books

**For covers:**

- Soft cover: 160-200 gsm
- Dust jackets: 120-150 gsm
- Endpapers: 100-140 gsm

![Paper Thickness](/images/diagrams/paper-thickness-comparison.svg)

### Traditional Paper Sizes

Before ISO standards (A4, A3, etc.), paper came in named sizes. These names describe the original sheet size:

| Name | Sheet Size | Folded to |
|------|------------|-----------|
| Folio | 48 × 61 cm | Half |
| Quarto | 24 × 30 cm | Quarter |
| Octavo | 15 × 23 cm | Eighth |
| Sextodecimo (16mo) | 10 × 15 cm | Sixteenth |

These terms also describe how many times a sheet is folded.

### Understanding Imposition

**Imposition** is the arrangement of pages on a large sheet so they appear in correct order when folded. This is how a single sheet becomes a multi-page signature.

![Watch: Understanding Imposition and Signatures](https://www.youtube.com/watch?v=gk56oIyfY-M)

### Folding Schemes

#### Folio (2 leaves, 4 pages)

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

#### Quarto (4 leaves, 8 pages)

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

#### Octavo (8 leaves, 16 pages)

Three folds from a single sheet. The classic book signature.

#### Sextodecimo (16 leaves, 32 pages)

Four folds. Maximum practical for most papers before bulk becomes problematic.

### The Mathematics of Signatures

Each fold doubles the number of leaves:

| Folds | Leaves | Pages |
|-------|--------|-------|
| 1 | 2 | 4 |
| 2 | 4 | 8 |
| 3 | 8 | 16 |
| 4 | 16 | 32 |

**Formula:** Leaves = 2^(number of folds), Pages = Leaves × 2

### Practical Application: Planning a Book

Say you want to make a 96-page book:

**Option 1: 8-page signatures (quarto)**

- 96 ÷ 8 = 12 signatures
- Each signature: 1 sheet folded twice

**Option 2: 16-page signatures (octavo)**

- 96 ÷ 16 = 6 signatures
- Each signature: 1 sheet folded three times

**Option 3: Mixed**

- Five 16-page signatures (80 pages) + one 16-page signature
- Allows for smaller final signature if needed

### Choosing Signature Size

| Signature Size | Advantages | Disadvantages |
|----------------|------------|---------------|
| 4 pages | Simple, easy to align | Many signatures needed |
| 8 pages | Good balance | Common choice |
| 16 pages | Fewer signatures | Bulk at spine can be an issue |
| 32 pages | Very efficient | Paper must be thin |

**Rule of thumb:** Heavier paper = smaller signatures. Thin paper can handle larger signatures.

### Imposition for Printing

When printing your own pages, you must arrange them correctly for folding:

#### Simple 4-Page Imposition (Folio)

Print two pages per side of a sheet:

- Side 1: Pages 4 and 1
- Side 2: Pages 2 and 3

#### 8-Page Imposition (Quarto)

More complex—pages must be positioned considering both folds:

- Side 1: Pages 8, 1, 4, 5
- Side 2: Pages 2, 7, 6, 3

![Imposition Layout](/images/diagrams/imposition-layout-8page.svg)

### Software for Imposition

Several tools can automate imposition:

- **Adobe InDesign:** Full imposition controls
- **Booklet printing in most PDF readers:** Simple 4-page imposition
- **Online tools:** Websites that rearrange pages for booklet printing
- **Dedicated imposition software:** For complex commercial work

### Calculating Paper Needs

To determine how much paper you need:

1. **Determine signature size:** (e.g., 16 pages)
2. **Calculate sheets per signature:** (1 for 16-page octavo)
3. **Determine number of signatures:** (total pages ÷ signature size)
4. **Add waste:** (10-15% for mistakes and trimming)

**Example:**

- 96-page book with 16-page signatures
- 6 signatures × 1 sheet = 6 sheets
- Plus 10% waste = 7 sheets minimum

### Common Mistakes

- **Wrong page order:** Always test imposition with numbered scrap paper first
- **Forgetting grain direction:** Grain must run parallel to the final spine
- **Paper too thick:** Large signatures with heavy paper won't fold cleanly
- **No creasing:** Always score fold lines on heavy stock

Understanding paper weights and imposition connects the digital file to the physical book. Master these concepts, and you can plan any book project from page count to finished binding.
