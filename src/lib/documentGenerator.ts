import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import type { ProjectInfo, DocumentType, DocumentOverrides } from '@/types/sow';

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
    Company_Name: merged.companyName,
    'Customer Name': merged.companyName,
    Company_Address: merged.companyAddress,
    'Project Location': merged.companyAddress,
    City_State_Zip: merged.cityStateZip,
    'City / State / Zip': merged.cityStateZip,
    Customer_Name: merged.companyName,
    'Point of Contact': merged.customerName,
    Customer_Email: merged.customerEmail,
    'Customer Email': merged.customerEmail,
    Customer_Phone: merged.customerPhone,
    'Customer Phone': merged.customerPhone,
    Customer: merged.companyName,
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
    'Material List': merged.scope,
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
