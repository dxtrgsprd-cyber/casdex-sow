import PizZip from 'pizzip';
import * as XLSX from 'xlsx';

/**
 * Appends hardware schedule content (from an Excel file) as a table
 * at the end of a generated .docx blob.
 */
export async function injectHardwareSchedule(
  docxBlob: Blob,
  hardwareScheduleFile: File
): Promise<Blob> {
  // Parse the hardware schedule
  const hsBuffer = await hardwareScheduleFile.arrayBuffer();
  const workbook = XLSX.read(hsBuffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rows.length === 0) return docxBlob;

  // Build the Word XML table
  const tableXml = buildTableXml(rows);

  // Inject into the docx
  const docxBuffer = await docxBlob.arrayBuffer();
  const zip = new PizZip(docxBuffer);
  const documentXml = zip.file('word/document.xml')?.asText();
  if (!documentXml) return docxBlob;

  // Insert before the closing </w:body> tag
  const closingTag = '</w:body>';
  const idx = documentXml.lastIndexOf(closingTag);
  if (idx === -1) return docxBlob;

  // Add a page break + heading + table
  const injection = `
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Hardware Schedule</w:t></w:r></w:p>
    ${tableXml}
  `;

  const newXml = documentXml.slice(0, idx) + injection + documentXml.slice(idx);
  zip.file('word/document.xml', newXml);

  const out = zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  return out;
}

function buildTableXml(rows: string[][]): string {
  const borderXml = `<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>`;

  const rowsXml = rows.map((row, rowIndex) => {
    const cells = row.map(cell => {
      const text = String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const bold = rowIndex === 0 ? '<w:b/>' : '';
      return `<w:tc>
        <w:tcPr><w:tcBorders>${borderXml}</w:tcBorders></w:tcPr>
        <w:p><w:r><w:rPr>${bold}<w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r></w:p>
      </w:tc>`;
    }).join('');
    return `<w:tr>${cells}</w:tr>`;
  }).join('');

  return `<w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="0" w:type="auto"/>
      <w:tblBorders>${borderXml}</w:tblBorders>
    </w:tblPr>
    ${rowsXml}
  </w:tbl>`;
}
