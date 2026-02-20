import PizZip from 'pizzip';

/**
 * Embeds a hardware schedule file as an OLE object at the end of a .docx document.
 * The file appears as a clickable embedded object in Word.
 */
export async function injectHardwareSchedule(
  docxBlob: Blob,
  hardwareScheduleFile: File
): Promise<Blob> {
  const docxBuffer = await docxBlob.arrayBuffer();
  const zip = new PizZip(docxBuffer);

  const hsBuffer = await hardwareScheduleFile.arrayBuffer();
  const fileName = hardwareScheduleFile.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || 'xlsx';

  // Determine content type
  const contentTypes: Record<string, string> = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  const contentType = contentTypes[ext] || 'application/octet-stream';

  // 1. Add the embedded file
  const embeddingPath = `word/embeddings/${fileName}`;
  zip.file(embeddingPath, hsBuffer);

  // 2. Add relationship to document.xml.rels
  const relsPath = 'word/_rels/document.xml.rels';
  let relsXml = zip.file(relsPath)?.asText() || '';
  const rId = 'rIdHardwareSchedule';

  if (!relsXml.includes(rId)) {
    relsXml = relsXml.replace(
      '</Relationships>',
      `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/package" Target="embeddings/${fileName}"/></Relationships>`
    );
    zip.file(relsPath, relsXml);
  }

  // 3. Update [Content_Types].xml to include the embedded file type
  const ctPath = '[Content_Types].xml';
  let ctXml = zip.file(ctPath)?.asText() || '';
  if (!ctXml.includes(`Extension="${ext}"`)) {
    ctXml = ctXml.replace(
      '</Types>',
      `<Default Extension="${ext}" ContentType="${contentType}"/></Types>`
    );
    zip.file(ctPath, ctXml);
  }

  // 4. Add a page break, heading, and embedded object reference in document.xml
  const docPath = 'word/document.xml';
  const documentXml = zip.file(docPath)?.asText();
  if (!documentXml) return docxBlob;

  const closingTag = '</w:body>';
  const idx = documentXml.lastIndexOf(closingTag);
  if (idx === -1) return docxBlob;

  const injection = `
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Hardware Schedule</w:t></w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr>
        <w:t xml:space="preserve">📎 ${fileName.replace(/&/g, '&amp;').replace(/</g, '&lt;')} (embedded — double-click to open)</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:object w:dxaOrig="6000" w:dyaOrig="600">
          <o:OLEObject Type="Embed" ProgID="Package" ShapeID="_x0000_s1026" DrawAspect="Icon" ObjectID="_1" r:id="${rId}"/>
        </w:object>
      </w:r>
    </w:p>
  `;

  const newXml = documentXml.slice(0, idx) + injection + documentXml.slice(idx);
  zip.file(docPath, newXml);

  const out = zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  return out;
}
