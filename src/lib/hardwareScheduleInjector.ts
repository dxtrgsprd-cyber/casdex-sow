import { saveAs } from 'file-saver';

/**
 * Downloads the hardware schedule file as a separate direct download.
 */
export function downloadHardwareSchedule(file: File): void {
  saveAs(file, file.name);
}
