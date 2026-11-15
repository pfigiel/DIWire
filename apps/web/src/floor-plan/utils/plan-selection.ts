import { pageImageOf, pageThumbnailOf, pdfOf, type Pdf } from './pdf'

export type PlanRaster = {
  blob: Blob
  width: number
  height: number
}

/** A file the user picked, before it is saved: either an image ready to use, or a PDF still waiting for its page. */
export type PlanSelection =
  | { kind: 'image'; name: string; raster: PlanRaster; previewUrl: string }
  | { kind: 'pages'; name: string; pdf: Pdf; thumbnails: string[] }

const rasterOf = async (blob: Blob): Promise<PlanRaster> => {
  const bitmap = await createImageBitmap(blob)
  const raster = { blob, width: bitmap.width, height: bitmap.height }
  bitmap.close()

  return raster
}

export const pageRasterOf = async (pdf: Pdf, pageNumber: number) =>
  rasterOf(await pageImageOf(pdf, pageNumber))

const imageSelectionOf = (name: string, raster: PlanRaster): PlanSelection => ({
  kind: 'image',
  name,
  raster,
  previewUrl: URL.createObjectURL(raster.blob),
})

export const planSelectionOf = async (file: File): Promise<PlanSelection> => {
  if (file.type !== 'application/pdf') return imageSelectionOf(file.name, await rasterOf(file))

  const pdf = await pdfOf(file)

  if (pdf.numPages === 1) return imageSelectionOf(file.name, await pageRasterOf(pdf, 1))

  const thumbnails: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    thumbnails.push(await pageThumbnailOf(pdf, pageNumber))
  }

  return { kind: 'pages', name: file.name, pdf, thumbnails }
}
