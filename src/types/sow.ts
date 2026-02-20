export interface BomItem {
  description: string;
  quantity: number;
  partNumber?: string;
  unitPrice?: number;
  totalPrice?: number;
  category?: string;
}

export interface ProjectInfo {
  projectName: string;
  oppNumber: string;
  projectNumber: string;
  date: string;
  companyName: string;
  companyAddress: string;
  cityStateZip: string;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  solutionArchitect: string;
  scope: string;
  scopeOfWork: string;
  notes: string;
}

export const defaultProjectInfo: ProjectInfo = {
  projectName: '',
  oppNumber: '',
  projectNumber: '',
  date: new Date().toLocaleDateString('en-US'),
  companyName: '',
  companyAddress: '',
  cityStateZip: '',
  customerName: '',
  customerContact: '',
  customerPhone: '',
  solutionArchitect: '',
  scope: '',
  scopeOfWork: '',
  notes: '',
};

export type DocumentType = 'SOW_Customer' | 'SOW_SUB_Quoting' | 'SOW_SUB_Project';

export interface DocumentOverrides {
  SOW_Customer: Partial<ProjectInfo>;
  SOW_SUB_Quoting: Partial<ProjectInfo>;
  SOW_SUB_Project: Partial<ProjectInfo>;
}

export const defaultOverrides: DocumentOverrides = {
  SOW_Customer: {},
  SOW_SUB_Quoting: {},
  SOW_SUB_Project: {},
};

export interface AppState {
  currentStep: number;
  bomItems: BomItem[];
  bomFileName: string | null;
  projectInfo: ProjectInfo;
  hardwareScheduleFile: File | null;
  hardwareScheduleFileName: string | null;
  documentOverrides: DocumentOverrides;
  templateFiles: Record<DocumentType, ArrayBuffer | null>;
}
