// Uses pdfjs-dist to extract text from uploaded PDFs
// Worker is bundled locally by Vite to avoid CDN/import failures.
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

export const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((item) => item.str).join(' ')
    fullText += pageText + '\n'
  }

  return fullText.trim()
}

export const isValidPDF = (file) => {
  return file && file.type === 'application/pdf' && file.size < 5 * 1024 * 1024 // 5MB limit
}

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
