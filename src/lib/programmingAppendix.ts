import PizZip from 'pizzip';

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Appends programming notes as a new appendix page at the end of a .docx Blob.
 */
export async function appendProgrammingNotes(docxBlob: Blob, programmingNotes: string): Promise<Blob> {
  const trimmed = programmingNotes.trim();
  if (!trimmed) return docxBlob;

  const buf = await docxBlob.arrayBuffer();
  const zip = new PizZip(buf);
  const docXml = zip.file('word/document.xml')?.asText();
  if (!docXml) return docxBlob;

  const closingIdx = docXml.lastIndexOf('</w:body>');
  if (closingIdx === -1) return docxBlob;

  const lines = trimmed.split('\n').filter(l => l.trim());
  const linesXml = lines
    .map(
      (line) => `<w:p>
  <w:pPr><w:spacing w:after="60"/></w:pPr>
  <w:r><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r>
</w:p>`
    )
    .join('\n');

  const appendixXml = `
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
<w:p>
  <w:pPr><w:spacing w:after="120"/></w:pPr>
  <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>Appendix — Programming Notes</w:t></w:r>
</w:p>
${linesXml}`;

  const newDocXml = docXml.slice(0, closingIdx) + appendixXml + docXml.slice(closingIdx);
  zip.file('word/document.xml', newDocXml);

  return zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
