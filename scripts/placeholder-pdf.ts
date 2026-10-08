/** Builds a tiny, valid one-page PDF so /resume works before a real file is uploaded. */
export function buildPlaceholderPdf(lines: string[]): Buffer {
  const escape = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`);
  const text = lines.map((line, i) => `BT /F1 ${i === 0 ? 22 : 12} Tf 72 ${720 - i * 28} Td (${escape(line)}) Tj ET`).join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(body));
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(body, "latin1");
}
