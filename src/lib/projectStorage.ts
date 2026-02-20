import type { ProjectInfo, BomItem, DocumentOverrides } from '@/types/sow';
import { defaultProjectInfo, defaultOverrides } from '@/types/sow';

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
  };
  saveProjectData(id, data);
  return { id, data };
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
    };
    saveProjectData(id, data);
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch {
    // ignore
  }
}
