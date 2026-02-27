import PizZip from 'pizzip';

export interface VerticalEntry {
  title: string;
  bullets: string[];
}

/** Default vertical-specific site requirement notes. */
export const DEFAULT_VERTICAL_NOTES: Record<string, VerticalEntry> = {
  K12: {
    title: 'K-12 / SCHOOL CAMPUSES',
    bullets: [
      'Comply with district badging and background check requirements before starting work.',
      'Coordinate work to avoid instructional disruption; comply with bell/testing schedules and restricted areas.',
      'No photos/video of students; protect privacy.',
      'Tools/materials secured at all times; do not leave ladders/tools unattended in occupied areas.',
      'Maintain safe egress; do not block corridors/exits or prop doors.',
      'Replace/secure ceiling tiles same-day where possible.',
    ],
  },
  HEW: {
    title: 'HIGHER EDUCATION / UNIVERSITY',
    bullets: [
      'Coordinate access/escort rules and after-hours work with campus facilities/security.',
      'Observe campus access requirements for elevated work, ceiling access, and restricted areas when applicable.',
      'Use signage/barricades where needed in high-traffic areas.',
      'Coordinate network cutovers/testing with campus IT change windows.',
    ],
  },
  MED: {
    title: 'HEALTHCARE / CLINICS / HOSPITALS',
    bullets: [
      'Follow facility dust-control and cleanliness requirements as directed by site rules.',
      'Coordinate to avoid patient-care disruption; observe restricted zones and quiet hours where applicable.',
      'Do not capture patient information in photos; comply with facility confidentiality rules.',
      'Remove debris daily; restore ceiling tiles immediately when required by facility.',
    ],
  },
  BIZ: {
    title: 'COMMERCIAL BUSINESS',
    bullets: [
      'Coordinate daily start/stop, access, staging, and work areas with the site Point of Contact; minimize disruption to normal operations.',
      'In public or high-traffic areas, control the work zone with signage/barricades as required by site rules; keep pathways clear and safe.',
      'Coordinate with site operations for loading zones, equipment traffic (including powered equipment routes), and restricted areas; do not obstruct operational lanes.',
    ],
  },
  GOV: {
    title: 'GOVERNMENT / PUBLIC SAFETY / SECURE SITES',
    bullets: [
      'Comply with access/badging/escort rules and restricted-area requirements.',
      'Follow facility rules on devices, photography, and secure areas.',
      'Escalate any scope questions/field changes to HTS PM before action.',
      'Handle devices/media per HTS direction where chain-of-custody is required.',
    ],
  },
};

const STORAGE_KEY = 'vertical_appendix_overrides';

/** Load user overrides from localStorage. */
export function loadVerticalOverrides(): Record<string, VerticalEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Save user overrides to localStorage. */
export function saveVerticalOverrides(overrides: Record<string, VerticalEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

/** Get the effective notes for a vertical (override or default). */
export function getVerticalNotes(vertical: string, overrides?: Record<string, VerticalEntry>): VerticalEntry | undefined {
  const ov = overrides ?? loadVerticalOverrides();
  return ov[vertical] ?? DEFAULT_VERTICAL_NOTES[vertical];
}

/** Get all verticals with effective notes. */
export function getAllVerticalNotes(overrides?: Record<string, VerticalEntry>): Record<string, VerticalEntry> {
  const ov = overrides ?? loadVerticalOverrides();
  const result: Record<string, VerticalEntry> = {};
  for (const key of Object.keys(DEFAULT_VERTICAL_NOTES)) {
    result[key] = ov[key] ?? DEFAULT_VERTICAL_NOTES[key];
  }
  return result;
}

/**
 * Appends a vertical-specific site requirements appendix page to a generated .docx Blob.
 */
export function appendVerticalNotes(docxBlob: Blob, vertical: string): Promise<Blob> {
  const entry = getVerticalNotes(vertical);
  if (!entry) return Promise.resolve(docxBlob);

  return docxBlob.arrayBuffer().then((buf) => {
    const zip = new PizZip(buf);
    const docXml = zip.file('word/document.xml')?.asText();
    if (!docXml) return docxBlob;

    const closingIdx = docXml.lastIndexOf('</w:body>');
    if (closingIdx === -1) return docxBlob;

    const bulletXml = entry.bullets
      .map(
        (b) => `<w:p>
  <w:pPr>
    <w:ind w:left="360"/>
    <w:spacing w:after="60"/>
  </w:pPr>
  <w:r><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">•  ${escapeXml(b)}</w:t></w:r>
</w:p>`
      )
      .join('\n');

    const appendixXml = `
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
<w:p>
  <w:pPr><w:spacing w:after="120"/></w:pPr>
  <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>Appendix — Site Requirements</w:t></w:r>
</w:p>
<w:p>
  <w:pPr><w:spacing w:after="100"/></w:pPr>
  <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>${escapeXml(entry.title)}</w:t></w:r>
</w:p>
${bulletXml}`;

    const newDocXml = docXml.slice(0, closingIdx) + appendixXml + docXml.slice(closingIdx);
    zip.file('word/document.xml', newDocXml);

    return zip.generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
