import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import type { ProjectInfo, DocumentType, DocumentOverrides } from '@/types/sow';

function getTemplateData(info: ProjectInfo, overrides: Partial<ProjectInfo>): Record<string, string> {
  const merged = { ...info, ...overrides };
  return {
    Project_Name: merged.projectName,
    'OPP Number': merged.oppNumber,
    OPP_Number: merged.oppNumber,
    Project_Number: merged.projectNumber,
    Date: merged.date,
    Company_Name: merged.companyName,
    Company_Address: merged.companyAddress,
    City_State_Zip: merged.cityStateZip,
    Customer_Name: merged.customerName,
    Customer_Contact: merged.customerContact,
    Customer_Phone: merged.customerPhone,
    SOLUTION_ARCHITECT: merged.solutionArchitect,
    SCOPE: merged.scope,
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
  hardwareScheduleFile: File | null
) {
  const zip = new JSZip();
  const folder = zip.folder(info.projectName || 'SOW_Documents')!;

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
  saveAs(content, `${info.projectName || 'SOW_Documents'}.zip`);
}

export function getResolvedFields(
  info: ProjectInfo,
  overrides: Partial<ProjectInfo>
): Record<string, string> {
  return getTemplateData(info, overrides);
}
