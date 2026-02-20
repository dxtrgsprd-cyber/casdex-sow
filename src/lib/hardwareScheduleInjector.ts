import JSZip from 'jszip';

/**
 * Bundles a generated SOW docx blob together with a hardware schedule file
 * into a single ZIP archive for download.
 */
export async function bundleWithHardwareSchedule(
  docxBlob: Blob,
  docxFileName: string,
  hardwareScheduleFile: File
): Promise<{ blob: Blob; fileName: string }> {
  const zip = new JSZip();

  const docxBuffer = await docxBlob.arrayBuffer();
  zip.file(docxFileName, docxBuffer);

  const hsBuffer = await hardwareScheduleFile.arrayBuffer();
  zip.file(hardwareScheduleFile.name, hsBuffer);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const baseName = docxFileName.replace(/\.docx$/i, '');
  return { blob: zipBlob, fileName: `${baseName}.zip` };
}
