export interface BomItem {
  description: string;
  quantity: number;
  partNumber?: string;
  vendor?: string;
  unitPrice?: number;
  totalPrice?: number;
  category?: string;
}

export interface ProjectInfo {
  projectName: string;
  oppNumber: string;
  projectNumber: string;
  date: string;
  numberOfWorkDays: string;
  companyName: string;
  companyAddress: string;
  cityStateZip: string;
  installLocation: string;
  vertical: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subcontractorName: string;
  subcontractorPoC: string;
  subcontractorEmail: string;
  subcontractorPhone: string;
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
  numberOfWorkDays: '',
  companyName: '',
  companyAddress: '',
  cityStateZip: '',
  installLocation: '',
  vertical: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  subcontractorName: '',
  subcontractorPoC: '',
  subcontractorEmail: '',
  subcontractorPhone: '',
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

export interface SowBuilderState {
  sectionOrder: string[];
  enabledSections: string[];
  variables: Record<string, string>;
  customSowText: string | null;
  programmingNotes: string;
  customTemplates: Record<string, string>;
}

export const defaultSowBuilderState: SowBuilderState = {
  sectionOrder: [
    'install_cameras',
    'relocate_cameras',
    'poe_switches',
    'poe_injectors',
    'mounts_accessories',
    'ac_install',
    'ac_controller',
    'ac_intercom',
    'ac_locking',
    'ac_readers',
    'ac_dps_rex',
    'ac_power',
    'provide_cabling',
    'ac_composite_cabling',
    'conduit_installation',
    'cable_termination',
    'ac_termination',
    'licenses',
    'wireless_ptp',
    'server_nvr',
    'programming',
    'testing_commissioning',
    'ac_testing',
  ],
  enabledSections: [
    'install_cameras',
    'provide_cabling',
    'testing_commissioning',
  ],
  variables: {},
  customSowText: null,
  programmingNotes: '',
  customTemplates: {},
};

export interface AppState {
  currentStep: number;
  bomItems: BomItem[];
  bomFileName: string | null;
  projectInfo: ProjectInfo;
  documentOverrides: DocumentOverrides;
  templateFiles: Record<DocumentType, ArrayBuffer | null>;
}
