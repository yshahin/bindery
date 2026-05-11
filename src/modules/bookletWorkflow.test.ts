import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { createBookletWorkflowModule } from './bookletWorkflow'

async function createPdfFile(pageCount: number, name: string): Promise<File> {
  const pdf = await PDFDocument.create()

  for (let index = 0; index < pageCount; index += 1) {
    pdf.addPage([612, 792])
  }

  const bytes = await pdf.save()
  return new File([bytes], name, { type: 'application/pdf' })
}

describe('createBookletWorkflowModule', () => {
  it('loads a PDF and returns a ready booklet workflow snapshot', async () => {
    const workflow = createBookletWorkflowModule({
      detectTextDirection: async () => 'rtl',
    })
    const file = await createPdfFile(20, 'sample.pdf')

    const snapshot = await workflow.load(file)

    expect(snapshot.phase).toBe('ready')
    expect(snapshot.source).toEqual({
      fileName: 'sample.pdf',
      totalPages: 20,
    })
    expect(snapshot.configuration.printRange).toEqual({
      start: 1,
      end: 20,
    })
    expect(snapshot.configuration.textDirection).toEqual({
      choice: 'auto',
      detected: 'rtl',
      effective: 'rtl',
    })
    expect(snapshot.bookletLayout).toMatchObject({
      totalPages: 20,
      rangeStart: 1,
      rangeEnd: 20,
      isRTL: true,
    })
    expect(snapshot.bookletLayout?.sheetsPerBooklet).toBe(snapshot.configuration.sheetsPerBooklet)
    expect(snapshot.error).toBeNull()
  })

  it('revises the print range and text direction through the workflow interface', async () => {
    const workflow = createBookletWorkflowModule({
      detectTextDirection: async () => 'rtl',
    })
    const file = await createPdfFile(32, 'sample.pdf')

    await workflow.load(file)
    const snapshot = workflow.revise({
      printRange: { kind: 'custom', start: 5, end: 20 },
      textDirection: 'ltr',
    })

    expect(snapshot.phase).toBe('ready')
    expect(snapshot.configuration.printRange).toEqual({
      start: 5,
      end: 20,
    })
    expect(snapshot.configuration.textDirection).toEqual({
      choice: 'ltr',
      detected: 'rtl',
      effective: 'ltr',
    })
    expect(snapshot.bookletLayout).toMatchObject({
      totalPages: 16,
      rangeStart: 5,
      rangeEnd: 20,
      isRTL: false,
    })
  })

  it('exports a booklet PDF and file name from the current workflow state', async () => {
    const workflow = createBookletWorkflowModule({
      detectTextDirection: async () => 'ltr',
    })
    const file = await createPdfFile(12, 'chapter.pdf')

    await workflow.load(file)
    const exportResult = await workflow.export()
    const exportedPdf = await PDFDocument.load(exportResult.pdfBytes)

    expect(exportResult.fileName).toBe('chapter-booklet.pdf')
    expect(exportResult.mimeType).toBe('application/pdf')
    expect(exportedPdf.getPageCount()).toBe(workflow.getSnapshot().bookletLayout?.sequence.length)
  })
})
