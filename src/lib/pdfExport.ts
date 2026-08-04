/**
 * Local-only DOCX -> PDF export.
 * Renders the generated .docx to HTML (docx-preview) inside a hidden iframe and
 * triggers the browser's print-to-PDF for that document. No network, no backend.
 */
import { renderAsync } from 'docx-preview';

/** Render a .docx blob into a print window and open the print (Save as PDF) dialog. */
export async function exportDocxAsPdf(blob: Blob, fileName: string): Promise<void> {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '820px';
  iframe.style.height = '1060px';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    throw new Error('Unable to create print frame');
  }

  doc.open();
  doc.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
  doc.close();

  // Title drives the default filename in most print-to-PDF dialogs
  doc.title = fileName.replace(/\.docx$/i, '');

  const style = doc.createElement('style');
  style.textContent = `
    body { margin: 0; background: #fff; }
    .docx-wrapper { background: #fff !important; padding: 0 !important; }
    .docx-wrapper > section.docx { box-shadow: none !important; margin: 0 auto !important; }
    @page { margin: 0; }
  `;
  doc.head.appendChild(style);

  await renderAsync(blob, doc.body, undefined, {
    className: 'docx',
    inWrapper: true,
    ignoreWidth: false,
    ignoreHeight: false,
    breakPages: true,
    useBase64URL: true,
  });

  // Let fonts/images settle before printing
  await new Promise((r) => setTimeout(r, 350));

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  // Keep the frame alive long enough for the print dialog to read it
  setTimeout(() => iframe.remove(), 60_000);
}
