import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
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
    Customer_Name: merged.customerName,
    'Point of Contact': merged.customerName,
    Customer_Contact: merged.customerContact,
    Customer_Phone: merged.customerPhone,
    'Customer Phone': merged.customerPhone,
    Customer: merged.companyName,
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
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
  });

  const data = getTemplateData(info, overrides);
  doc.render(data);

  const out = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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

export async function downloadAllAsZip(
  templates: Record<DocumentType, ArrayBuffer | null>,
  info: ProjectInfo,
  overrides: DocumentOverrides,
  hardwareScheduleFile: File | null,
  folderName?: string
) {
  const zip = new JSZip();
  const name = folderName || info.projectName || 'SOW_Documents';
  const folder = zip.folder(name)!;

  const docTypes: DocumentType[] = ['SOW_Customer', 'SOW_SUB_Quoting', 'SOW_SUB_Project'];

  for (const docType of docTypes) {
    const template = templates[docType];
    if (template) {
      const blob = generateDocx(template, info, overrides[docType]);
      folder.file(`${docType}.docx`, blob);
    }
  }

  if (hardwareScheduleFile) {
    const buffer = await hardwareScheduleFile.arrayBuffer();
    folder.file(hardwareScheduleFile.name, buffer);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${name}.zip`);
}

export function getResolvedFields(
  info: ProjectInfo,
  overrides: Partial<ProjectInfo>
): Record<string, string> {
  return getTemplateData(info, overrides);
}
