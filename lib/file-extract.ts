/**
 * Client-side text extraction from PDF and DOCX files.
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return extractFromPdf(file);
  if (ext === 'docx' || ext === 'doc') return extractFromDocx(file);
  throw new Error('Unsupported file type. Use PDF or DOCX.');
}

async function extractFromPdf(file: File): Promise<string> {
  const { getDocument } = await import('pdfjs-dist');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  const texts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: { str?: string }) => item.str || '')
      .join(' ');
    texts.push(pageText);
  }

  return texts.join('\n\n').replace(/\s+/g, ' ').trim();
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}
