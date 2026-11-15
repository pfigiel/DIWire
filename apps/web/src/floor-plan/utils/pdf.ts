import type { PDFDocumentProxy } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

export type Pdf = PDFDocumentProxy

const thumbnailLongSide = 480
const tracingLongSide = 4000

// Imported on demand: pdf.js is larger than the rest of the app, and only a PDF needs it.
export const pdfOf = async (file: File): Promise<Pdf> => {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  return pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
}

const pageCanvasOf = async (pdf: Pdf, pageNumber: number, longSide: number) => {
  const page = await pdf.getPage(pageNumber)
  const natural = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: longSide / Math.max(natural.width, natural.height) })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)

  await page.render({ canvas, viewport }).promise

  return canvas
}

export const pageThumbnailOf = async (pdf: Pdf, pageNumber: number) =>
  (await pageCanvasOf(pdf, pageNumber, thumbnailLongSide)).toDataURL('image/jpeg', 0.8)

export const pageImageOf = async (pdf: Pdf, pageNumber: number) => {
  const canvas = await pageCanvasOf(pdf, pageNumber, tracingLongSide)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob === null) reject(new Error(`Page ${pageNumber} could not be encoded`))
      else resolve(blob)
    }, 'image/png')
  })
}
