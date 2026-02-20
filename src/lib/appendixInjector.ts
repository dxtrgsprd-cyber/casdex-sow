import PizZip from 'pizzip';

/**
 * Appends an appendix file at the end of a .docx Blob.
 * - If appendix is a .docx: merges its body paragraphs into the SOW after a page break.
 * - If appendix is an image (PNG/JPG/GIF/WEBP): embeds it as a full-width image after a page break.
 */
export async function appendToDocs(
  docxBlob: Blob,
  appendixFile: File
): Promise<Blob> {
  const ext = appendixFile.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'docx') {
    return appendDocx(docxBlob, appendixFile);
  } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
    return appendImage(docxBlob, appendixFile, ext);
  }

  // Unsupported format — return original unchanged
  return docxBlob;
}

// ---------------------------------------------------------------------------
// DOCX merge
// ---------------------------------------------------------------------------
async function appendDocx(mainBlob: Blob, appendixFile: File): Promise<Blob> {
  const [mainBuf, appendBuf] = await Promise.all([
    mainBlob.arrayBuffer(),
    appendixFile.arrayBuffer(),
  ]);

  const mainZip = new PizZip(mainBuf);
  const appendZip = new PizZip(appendBuf);

  const mainDocXml = mainZip.file('word/document.xml')?.asText();
  const appendDocXml = appendZip.file('word/document.xml')?.asText();
  if (!mainDocXml || !appendDocXml) return mainBlob;

  // Extract body content from the appendix (between <w:body> and </w:body>)
  const appendBodyMatch = appendDocXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
  if (!appendBodyMatch) return mainBlob;

  // Strip the final <w:sectPr> from the appended content so only one sectPr exists
  let appendBody = appendBodyMatch[1].replace(/<w:sectPr[\s\S]*?<\/w:sectPr>/g, '');

  const pageBreak = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
  const insertion = pageBreak + appendBody;

  // Insert before the closing </w:body>
  const closingIdx = mainDocXml.lastIndexOf('</w:body>');
  if (closingIdx === -1) return mainBlob;

  // Merge relationships from appendix into main document
  const mainRelsPath = 'word/_rels/document.xml.rels';
  const appendRelsPath = 'word/_rels/document.xml.rels';
  let mainRels = mainZip.file(mainRelsPath)?.asText() ?? '';
  const appendRels = appendZip.file(appendRelsPath)?.asText() ?? '';

  // Copy appendix media files to main zip, remapping relationship IDs
  const idMap: Record<string, string> = {};
  let rIdCounter = 900; // Start high to avoid collisions

  const appendRelMatches = [...appendRels.matchAll(
    /Id=\"(rId\d+)\"[^>]+Type=\"[^"]*\/image\"[^>]+Target=\"([^"]+)\"/g
  )];

  for (const match of appendRelMatches) {
    const [, oldId, target] = match;
    const newId = `rId${rIdCounter++}`;
    idMap[oldId] = newId;

    // Copy the media file
    const mediaFile = appendZip.file(`word/${target}`);
    if (mediaFile) {
      const mediaData = mediaFile.asUint8Array();
      mainZip.file(`word/${target}`, mediaData);

      // Add relationship to main rels
      const relType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';
      mainRels = mainRels.replace(
        '</Relationships>',
        `<Relationship Id="${newId}" Type="${relType}" Target="${target}"/></Relationships>`
      );
    }
  }

  // Remap relationship IDs in appended body XML
  for (const [oldId, newId] of Object.entries(idMap)) {
    appendBody = appendBody.split(oldId).join(newId);
  }

  mainZip.file(mainRelsPath, mainRels);

  const newDocXml =
    mainDocXml.slice(0, closingIdx) +
    pageBreak +
    appendBody +
    mainDocXml.slice(closingIdx);

  mainZip.file('word/document.xml', newDocXml);

  return mainZip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

// ---------------------------------------------------------------------------
// Image embed
// ---------------------------------------------------------------------------
async function appendImage(mainBlob: Blob, imageFile: File, ext: string): Promise<Blob> {
  const [mainBuf, imageBuf] = await Promise.all([
    mainBlob.arrayBuffer(),
    imageFile.arrayBuffer(),
  ]);

  const mainZip = new PizZip(mainBuf);

  const contentTypeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  const contentType = contentTypeMap[ext] ?? 'image/png';
  const mediaFileName = `appendix_image.${ext}`;
  const mediaPath = `word/media/${mediaFileName}`;

  mainZip.file(mediaPath, imageBuf);

  // Add content type override
  const ctPath = '[Content_Types].xml';
  let ctXml = mainZip.file(ctPath)?.asText() ?? '';
  const partName = `/word/media/${mediaFileName}`;
  if (!ctXml.includes(partName)) {
    ctXml = ctXml.replace(
      '</Types>',
      `<Override PartName="${partName}" ContentType="${contentType}"/></Types>`
    );
    mainZip.file(ctPath, ctXml);
  }

  // Add relationship
  const relsPath = 'word/_rels/document.xml.rels';
  let relsXml = mainZip.file(relsPath)?.asText() ?? '';
  const rId = 'rIdAppendixImage';
  if (!relsXml.includes(rId)) {
    relsXml = relsXml.replace(
      '</Relationships>',
      `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaFileName}"/></Relationships>`
    );
    mainZip.file(relsPath, relsXml);
  }

  // Use a large EMU size (~6.5 inches wide at 914400 EMU/inch)
  const cx = 5943600; // ~6.5 inches
  const cy = 7943600; // ~8.7 inches (approximate full page height)

  const imageXml = `
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
<w:p>
  <w:pPr><w:jc w:val="center"/></w:pPr>
  <w:r>
    <w:rPr/>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0"
        xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
        <wp:extent cx="${cx}" cy="${cy}"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="1" name="AppendixImage"/>
        <wp:cNvGraphicFramePr/>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr>
                <pic:cNvPr id="0" name="AppendixImage"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>`;

  const docXml = mainZip.file('word/document.xml')?.asText();
  if (!docXml) return mainBlob;

  const closingIdx = docXml.lastIndexOf('</w:body>');
  if (closingIdx === -1) return mainBlob;

  const newDocXml = docXml.slice(0, closingIdx) + imageXml + docXml.slice(closingIdx);
  mainZip.file('word/document.xml', newDocXml);

  return mainZip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
