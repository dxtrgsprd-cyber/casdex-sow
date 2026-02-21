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
  companyName: string;
  companyAddress: string;
  cityStateZip: string;
  customerName: string;
  customerEmail: string;
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
  customerEmail: '',
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

export interface SowBuilderState {
  sectionOrder: string[];
  enabledSections: string[];
  variables: Record<string, string>;
  customSowText: string | null;
}

export const defaultSowBuilderState: SowBuilderState = {
  sectionOrder: [
    'install_cameras',
    'provide_cabling',
    'relocate_cameras',
    'conduit_installation',
    'cable_termination',
    'testing_commissioning',
    'server_nvr',
    'wireless_ptp',
    'licenses',
    'poe_switches',
    'poe_injectors',
    'mounts_accessories',
    'ac_install',
    'ac_composite_cabling',
    'ac_controller',
    'ac_intercom',
    'ac_locking',
    'ac_readers',
    'ac_dps_rex',
    'ac_power',
    'ac_termination',
    'ac_testing',
  ],
  enabledSections: [
    'install_cameras',
    'provide_cabling',
    'testing_commissioning',
  ],
  variables: {},
  customSowText: null,
};

export interface AppState {
  currentStep: number;
  bomItems: BomItem[];
  bomFileName: string | null;
  projectInfo: ProjectInfo;
  documentOverrides: DocumentOverrides;
  templateFiles: Record<DocumentType, ArrayBuffer | null>;
}
