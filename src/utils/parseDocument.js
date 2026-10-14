import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const TEXT_EXTENSIONS = new Set(['txt', 'md', 'csv', 'log']);
const PDF_EXTENSIONS = new Set(['pdf']);

export function getFileKind(file) {
  const name = file.name.toLowerCase();
  const ext = name.includes('.') ? name.split('.').pop() : '';
  if (file.type === 'application/pdf' || PDF_EXTENSIONS.has(ext)) return 'pdf';
  if (file.type.startsWith('text/') || TEXT_EXTENSIONS.has(ext)) return 'text';
  return 'unsupported';
}

export function isSupportedFile(file) {
  return getFileKind(file) !== 'unsupported';
}

async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: buffer,
    useSystemFonts: true,
    isEvalSupported: false,
  }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lineMap = new Map();

    content.items.forEach((item) => {
      const text = 'str' in item ? item.str : '';
      if (!text) return;
      const y = item.transform?.[5] ?? 0;
      const x = item.transform?.[4] ?? 0;
      const bucket = Math.round(y);
      if (!lineMap.has(bucket)) lineMap.set(bucket, []);
      lineMap.get(bucket).push({ x, text });
    });

    const lines = [...lineMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, fragments]) =>
        fragments
          .sort((a, b) => a.x - b.x)
          .map((fragment) => fragment.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter(Boolean);

    pages.push({ pageNumber, text: lines.join('\n') });
  }

  return {
    pageCount: pdf.numPages,
    text: pages.map((page) => page.text).join('\n\n'),
    pages,
  };
}

async function extractPlainText(file) {
  const text = await file.text();
  const pages = [{ pageNumber: 1, text }];
  return { pageCount: 1, text, pages };
}

export async function parseDocument(file, onProgress) {
  const kind = getFileKind(file);
  if (kind === 'unsupported') {
    throw new Error('Unsupported file type. Upload a PDF or text file (.txt, .md, .csv).');
  }

  onProgress?.({ stage: 'reading', progress: 12 });
  const result = kind === 'pdf' ? await extractPdfText(file) : await extractPlainText(file);
  onProgress?.({ stage: 'parsed', progress: 100 });

  return {
    fileName: file.name,
    fileSize: file.size,
    kind,
    parsedAt: new Date().toISOString(),
    ...result,
  };
}
