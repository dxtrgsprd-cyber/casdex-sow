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
    SCOPE: merged.scope,
    Scope: merged.scope,
    scope: merged.scope,
    Material_List: merged.scope,
    material_list: merged.scope,
    'Material List': merged.scope,
    // Scope of Work
    SCOPE_OF_WORK: merged.scopeOfWork,
    Scope_of_Work: merged.scopeOfWork,
    scope_of_work: merged.scopeOfWork,
    'Scope of Work': merged.scopeOfWork,
    Scope_Of_Work: merged.scopeOfWork,
    // Notes
    Notes: merged.notes,
    notes: merged.notes,
    NOTES: merged.notes,
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
      removedParts.push('/' + key);
      zip.remove(key);
    }
  });

  // Clean up [Content_Types].xml so Word doesn't see missing parts
  if (removedParts.length > 0) {
    const ctPath = '[Content_Types].xml';
    const ctXml = zip.file(ctPath)?.asText();
    if (ctXml) {
      let cleaned = ctXml;
      for (const part of removedParts) {
        // Remove Override entries referencing deleted customXml parts
        const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(`<Override[^>]+PartName="${escaped}"[^>]*/?>`, 'g'), '');
      }
      zip.file(ctPath, cleaned);
    }

    // Remove relationships pointing to customXml
    const relsPath = '_rels/.rels';
    const relsXml = zip.file(relsPath)?.asText();
    if (relsXml) {
      const cleaned = relsXml.replace(/<Relationship[^>]+Target="customXml\/[^"]*"[^>]*\/>/g, '');
      zip.file(relsPath, cleaned);
    }
  }

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
