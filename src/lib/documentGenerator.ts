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

function getTemplateData(info: ProjectInfo, overrides: Partial<ProjectInfo>): Record<string, string> {
  const merged = { ...info, ...overrides };
  return {
    Project_Name: merged.projectName,
    'Project Name': merged.projectName,
    'OPP Number': merged.oppNumber,
    OPP_Number: merged.oppNumber,
    'OPP NUMBER': merged.oppNumber,
    Project_Number: merged.projectNumber,
    Date: merged.date,
    DATE: merged.date,
    project_days: formatNumericSpelling(merged.numberOfWorkDays),
    'Number of Work Days': formatNumericSpelling(merged.numberOfWorkDays),
    Customer_Name: merged.companyName,
    Address: merged.companyAddress,
    'Project Location': merged.companyAddress,
    City_State_Zip: merged.cityStateZip,
    'City / State / Zip': merged.cityStateZip,
    Install_Location: merged.installLocation,
    'Install Location': merged.installLocation,
    Vertical: merged.vertical,
    Multiple_Sites: merged.vertical,
    Point_of_Contact: merged.customerName,
    'Point of Contact': merged.customerName,
    Customer_Email: merged.customerEmail,
    'Customer Email': merged.customerEmail,
    Customer_Phone: merged.customerPhone,
    'Customer Phone': merged.customerPhone,
    // Subcontractor fields
    Subcontractor: merged.subcontractorName,
    Subcontractor_Name: merged.subcontractorName,
    'Subcontractor Name': merged.subcontractorName,
    Subcontractor_PoC: merged.subcontractorPoC,
    'Subcontractor PoC': merged.subcontractorPoC,
    Subcontractor_Email: merged.subcontractorEmail,
    'Subcontractor Email': merged.subcontractorEmail,
    Subcontractor_Phone: merged.subcontractorPhone,
    'Subcontractor Phone': merged.subcontractorPhone,
    SOLUTION_ARCHITECT: merged.solutionArchitect,
    SCOPE: merged.scope,
    Material_List: merged.scope,
    SCOPE_OF_WORK: merged.scopeOfWork,
    'Scope of Work': merged.scopeOfWork,
    Notes: merged.notes,
  };
}


export function generateDocx(
  templateBuffer: ArrayBuffer,
  info: ProjectInfo,
  overrides: Partial<ProjectInfo>
): Blob {
  const zip = new PizZip(templateBuffer);

  // Remove customXml parts that may contain broken template tags
  Object.keys(zip.files).forEach((key) => {
    if (key.startsWith('customXml/')) {
      zip.remove(key);
    }
  });

  const doc = new Docxtemplater(zip, {
    paragraphLoop: false,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    nullGetter: () => '',
  });

  const data = getTemplateData(info, overrides);
  doc.render(data);

  const out = doc.getZip().generate({
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
