import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const content = `BT /F1 14 Tf 72 720 Td (Quarterly Report) Tj 0 -28 Td (Revenue: 88000) Tj 0 -22 Td (Expenses: 41000) Tj 0 -22 Td (Profit: 47000) Tj 0 -22 Td (Margin: 53.4%) Tj ET`;
const stream = `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`;

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
  stream,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
];

let body = '%PDF-1.4\n';
const offsets = [0];
objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(body));
  body += `${index + 1} 0 obj\n${object}\nendobj\n`;
});
const xrefStart = Buffer.byteLength(body);
let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
offsets.slice(1).forEach((offset) => {
  xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
});
body += xref;
body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sample-report.pdf');
writeFileSync(out, body);
console.log(`wrote ${out}`);
