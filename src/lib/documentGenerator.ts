import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import type { ProjectInfo, DocumentType, DocumentOverrides } from '@/types/sow';

const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function numberToWords(n: number): string {
  if (n < 0) return 'negative ' + numberToWords(-n);
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
  return String(n);
}

function formatNumericSpelling(value: string): string {
  const num = parseInt(value, 10);
  if (isNaN(num) || value.trim() === '') return value;
  return `${numberToWords(num)} (${num})`;
}

function compactMultiline(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .filter((line) => line.trim() !== '')
    .join('\n')
    .trim();
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeForMatch(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function stripBoldFromRun(runXml: string): string {
  return runXml
    .replace(/<w:b(?:\s+[^>]*)?\s*\/>/g, '')
    .replace(/<w:bCs(?:\s+[^>]*)?\s*\/>/g, '');
}

function removeBoldFromTargetLines(documentXml: string, targetLines: string[]): { xml: string; updatedRuns: number } {
  const targets = new Set(targetLines.map(normalizeForMatch).filter(Boolean));
  if (targets.size === 0) return { xml: documentXml, updatedRuns: 0 };

  let updatedRuns = 0;
  const xml = documentXml.replace(/<w:r\b[\s\S]*?<\/w:r>/g, (runXml) => {
    const texts = Array.from(runXml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)).map((m) => decodeXmlEntities(m[1]));
    if (texts.length === 0) return runXml;

    const runText = normalizeForMatch(texts.join(''));
    if (!targets.has(runText)) return runXml;

    const stripped = stripBoldFromRun(runXml);
    if (stripped !== runXml) updatedRuns += 1;
    return stripped;
  });

  return { xml, updatedRuns };
}

function applyMultilineFieldFormattingFix(zip: PizZip, data: Record<string, string>): void {
  const materialLines = compactMultiline(data.Material_List || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const programmingLines = compactMultiline(data.PROGRAMMING_DETAILS || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const scopeBodyLines = compactMultiline(data.SCOPE_OF_WORK || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^\d+\.\s+/.test(l));

  const targetLines = [...materialLines, ...programmingLines, ...scopeBodyLines];
  if (targetLines.length === 0) return;

  const docPath = 'word/document.xml';
  const documentXml = zip.file(docPath)?.asText();
  if (!documentXml) return;

  const { xml, updatedRuns } = removeBoldFromTargetLines(documentXml, targetLines);
  if (updatedRuns > 0) {
    zip.file(docPath, xml);
    console.log('[docgen] Removed bold from multiline body runs:', updatedRuns);
  }
}

function getTemplateData(info: ProjectInfo, overrides: Partial<ProjectInfo>): Record<string, string> {
  const merged = { ...info, ...overrides };
  const materialList = compactMultiline(merged.scope || '');
  const scopeOfWork = compactMultiline(merged.scopeOfWork || '');
  const programmingDetails = compactMultiline(merged.programmingNotes || '');

  return {
    Project_Name: merged.projectName,
    'Project Name': merged.projectName,
    project_name: merged.projectName,
    OPP_Number: merged.oppNumber,
    'OPP Number': merged.oppNumber,
    'OPP NUMBER': merged.oppNumber,
    OPP_NUMBER: merged.oppNumber,
    Project_Number: merged.projectNumber,
    project_number: merged.projectNumber,
    Date: merged.date,
    DATE: merged.date,
    date: merged.date,
    project_days: formatNumericSpelling(merged.numberOfWorkDays),
    'Number of Work Days': formatNumericSpelling(merged.numberOfWorkDays),
    Number_of_Work_Days: formatNumericSpelling(merged.numberOfWorkDays),
    Customer_Name: merged.companyName,
    customer_name: merged.companyName,
    Address: merged.companyAddress,
    address: merged.companyAddress,
    'Project Location': merged.companyAddress,
    Project_Location: merged.companyAddress,
    City_State_Zip: merged.cityStateZip,
    'City / State / Zip': merged.cityStateZip,
    city_state_zip: merged.cityStateZip,
    Install_Location: merged.installLocation,
    'Install Location': merged.installLocation,
    install_location: merged.installLocation,
    Vertical: merged.vertical,
    vertical: merged.vertical,
    Multiple_Sites: merged.vertical,
    Point_of_Contact: merged.customerName,
    'Point of Contact': merged.customerName,
    point_of_contact: merged.customerName,
    Customer_Email: merged.customerEmail,
    'Customer Email': merged.customerEmail,
    customer_email: merged.customerEmail,
    Customer_Phone: merged.customerPhone,
    'Customer Phone': merged.customerPhone,
    customer_phone: merged.customerPhone,
    // Subcontractor fields
    Subcontractor: merged.subcontractorName,
    Subcontractor_Name: merged.subcontractorName,
    'Subcontractor Name': merged.subcontractorName,
    subcontractor_name: merged.subcontractorName,
    Subcontractor_PoC: merged.subcontractorPoC,
    'Subcontractor PoC': merged.subcontractorPoC,
    subcontractor_poc: merged.subcontractorPoC,
    Subcontractor_Email: merged.subcontractorEmail,
    'Subcontractor Email': merged.subcontractorEmail,
    subcontractor_email: merged.subcontractorEmail,
    Subcontractor_Phone: merged.subcontractorPhone,
    'Subcontractor Phone': merged.subcontractorPhone,
    subcontractor_phone: merged.subcontractorPhone,
    SOLUTION_ARCHITECT: merged.solutionArchitect,
    Solution_Architect: merged.solutionArchitect,
    solution_architect: merged.solutionArchitect,
    // Scope & Material
    SCOPE: materialList,
    Scope: materialList,
    scope: materialList,
    Material_List: materialList,
    material_list: materialList,
    'Material List': materialList,
    // Scope of Work
    SCOPE_OF_WORK: scopeOfWork,
    Scope_of_Work: scopeOfWork,
    scope_of_work: scopeOfWork,
    'Scope of Work': scopeOfWork,
    Scope_Of_Work: scopeOfWork,
    // Notes
    Notes: merged.notes,
    notes: merged.notes,
    NOTES: merged.notes,
    // Programming Details
    PROGRAMMING_DETAILS: programmingDetails,
    Programming_Details: programmingDetails,
    programming_details: programmingDetails,
    'Programming Details': programmingDetails,
  };
}


export function generateDocx(
  templateBuffer: ArrayBuffer,
  info: ProjectInfo,
  overrides: Partial<ProjectInfo>
): Blob {
  const zip = new PizZip(templateBuffer);

  // Remove customXml parts that may contain broken template tags
  const removedParts: string[] = [];
  Object.keys(zip.files).forEach((key) => {
    if (key.startsWith('customXml/')) {
      removedParts.push(key);
      zip.remove(key);
    }
  });

  if (removedParts.length > 0) {
    console.log('[docgen] Removed customXml parts:', removedParts);

    // Clean up [Content_Types].xml
    const ctPath = '[Content_Types].xml';
    const ctXml = zip.file(ctPath)?.asText();
    if (ctXml) {
      let cleaned = ctXml;
      for (const part of removedParts) {
        const partName = '/' + part;
        const escaped = partName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(`\\s*<Override[^>]*PartName="${escaped}"[^>]*/>`, 'g'), '');
      }
      zip.file(ctPath, cleaned);
      console.log('[docgen] Cleaned [Content_Types].xml');
    }

    // Remove relationships in root _rels/.rels
    const relsPath = '_rels/.rels';
    const relsXml = zip.file(relsPath)?.asText();
    if (relsXml) {
      const cleaned = relsXml.replace(/\s*<Relationship[^>]*Target="customXml[^"]*"[^>]*\/>/g, '');
      zip.file(relsPath, cleaned);
    }

    // Remove relationships in word/_rels/document.xml.rels
    const docRelsPath = 'word/_rels/document.xml.rels';
    const docRelsXml = zip.file(docRelsPath)?.asText();
    if (docRelsXml) {
      const cleaned = docRelsXml.replace(/\s*<Relationship[^>]*Target="[^"]*customXml[^"]*"[^>]*\/>/g, '');
      zip.file(docRelsPath, cleaned);
    }

    // Also remove any customXml _rels folders
    Object.keys(zip.files).forEach((key) => {
      if (key.includes('customXml') && key.includes('_rels')) {
        zip.remove(key);
      }
    });
  }

  // Log all remaining zip entries for debugging
  console.log('[docgen] Zip entries after cleanup:', Object.keys(zip.files).filter(k => !k.endsWith('/')));

  const doc = new Docxtemplater(zip, {
    paragraphLoop: false,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    nullGetter: () => '',
  });

  const data = getTemplateData(info, overrides);
  doc.render(data);

  const renderedZip = doc.getZip();
  applyMultilineFieldFormattingFix(renderedZip, data);

  const out = renderedZip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  return out;
}

export function downloadDocx(
  templateBuffer: ArrayBuffer,
  info: ProjectInfo,
  overrides: Partial<ProjectInfo>,
  fileName: string
) {
  const blob = generateDocx(templateBuffer, info, overrides);
  saveAs(blob, fileName);
}

export function getResolvedFields(
  info: ProjectInfo,
  overrides: Partial<ProjectInfo>
): Record<string, string> {
  return getTemplateData(info, overrides);
}
