import type { ProjectInfo, BomItem, DocumentOverrides, SowBuilderState } from '@/types/sow';
import { defaultProjectInfo, defaultOverrides, defaultSowBuilderState } from '@/types/sow';

const PROJECTS_INDEX_KEY = 'sow-projects-index';
const PROJECT_DATA_PREFIX = 'sow-project-';
const ACTIVE_PROJECT_KEY = 'sow-active-project';

// Migrate old single-project storage
const OLD_STORAGE_KEY = 'sow-generator-state';

export interface ProjectData {
  currentStep: number;
  bomItems: BomItem[];
  bomFileName: string | null;
  projectInfo: ProjectInfo;
  overrides: DocumentOverrides;
  sowBuilderState: SowBuilderState;
}

export interface ProjectIndexEntry {
  id: string;
  oppNumber: string;
  projectName: string;
  lastModified: string;
  currentStep: number;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function getProjectIndex(): ProjectIndexEntry[] {
  try {
    const raw = localStorage.getItem(PROJECTS_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjectIndex(index: ProjectIndexEntry[]) {
  localStorage.setItem(PROJECTS_INDEX_KEY, JSON.stringify(index));
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(id: string | null) {
  if (id) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}

export function loadProjectData(id: string): ProjectData | null {
  try {
    const raw = localStorage.getItem(PROJECT_DATA_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProjectData(id: string, data: ProjectData) {
  try {
    localStorage.setItem(PROJECT_DATA_PREFIX + id, JSON.stringify(data));
    // Update index entry
    const index = getProjectIndex();
    const existing = index.findIndex(e => e.id === id);
    const entry: ProjectIndexEntry = {
      id,
      oppNumber: data.projectInfo.oppNumber,
      projectName: data.projectInfo.projectName,
      lastModified: new Date().toLocaleDateString('en-US'),
      currentStep: data.currentStep,
    };
    if (existing >= 0) {
      index[existing] = entry;
    } else {
      index.unshift(entry);
    }
    saveProjectIndex(index);
    setActiveProjectId(id);
  } catch {
    // storage full
  }
}

export function deleteProject(id: string) {
  localStorage.removeItem(PROJECT_DATA_PREFIX + id);
  const index = getProjectIndex().filter(e => e.id !== id);
  saveProjectIndex(index);
  if (getActiveProjectId() === id) {
    setActiveProjectId(null);
  }
}

export function createNewProject(): { id: string; data: ProjectData } {
  const id = generateId();
  const data: ProjectData = {
    currentStep: 1,
    bomItems: [],
    bomFileName: null,
    projectInfo: { ...defaultProjectInfo },
    overrides: { ...defaultOverrides },
    sowBuilderState: { ...defaultSowBuilderState },
  };
  saveProjectData(id, data);
  return { id, data };
}

/** Export the current project as a downloadable JSON file */
export function exportProjectAsFile(id: string) {
  const data = loadProjectData(id);
  if (!data) return;
  const exportPayload = { id, ...data, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const name = data.projectInfo.oppNumber || data.projectInfo.projectName || 'project';
  a.href = url;
  a.download = `casdex-project-${name}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import a project from a JSON file */
export function importProjectFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const id = generateId();
        const data: ProjectData = {
          currentStep: parsed.currentStep ?? 1,
          bomItems: parsed.bomItems ?? [],
          bomFileName: parsed.bomFileName ?? null,
          projectInfo: { ...defaultProjectInfo, ...parsed.projectInfo },
          overrides: { ...defaultOverrides, ...parsed.overrides },
          sowBuilderState: { ...defaultSowBuilderState, ...parsed.sowBuilderState },
        };
        saveProjectData(id, data);
        resolve(id);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/** Migrate legacy single-project storage to multi-project format */
export function migrateIfNeeded() {
  try {
    const old = localStorage.getItem(OLD_STORAGE_KEY);
    if (!old) return;
    const parsed = JSON.parse(old) as Partial<ProjectData>;
    if (!parsed.projectInfo) return;
    
    const id = generateId();
    const data: ProjectData = {
      currentStep: parsed.currentStep ?? 1,
      bomItems: parsed.bomItems ?? [],
      bomFileName: parsed.bomFileName ?? null,
      projectInfo: { ...defaultProjectInfo, ...parsed.projectInfo },
      overrides: { ...defaultOverrides, ...parsed.overrides },
      sowBuilderState: { ...defaultSowBuilderState },
    };
    saveProjectData(id, data);
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch {
    // ignore
  }
}
