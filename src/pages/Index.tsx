import { useState, useCallback, useEffect, useRef } from 'react';
import StepIndicator from '@/components/StepIndicator';
import BomUpload from '@/components/BomUpload';
import ProjectInfoForm from '@/components/ProjectInfoForm';
import AppendixUpload from '@/components/HardwareScheduleUpload';
import DocumentPreview from '@/components/DocumentPreview';
import ExportPanel from '@/components/ExportPanel';
import SavedProjects from '@/components/SavedProjects';
import { Button } from '@/components/ui/button';
import { defaultProjectInfo, defaultOverrides } from '@/types/sow';
import type { ProjectInfo, BomItem, DocumentOverrides, DocumentType } from '@/types/sow';
import {
  getProjectIndex,
  getActiveProjectId,
  loadProjectData,
  saveProjectData,
  deleteProject,
  createNewProject,
  migrateIfNeeded,
} from '@/lib/projectStorage';
import type { ProjectIndexEntry } from '@/lib/projectStorage';
import { toast } from 'sonner';

const Index = () => {
  const migrated = useRef(false);
  if (!migrated.current) {
    migrateIfNeeded();
    migrated.current = true;
  }

  const [projectId, setProjectId] = useState<string>(() => {
    const activeId = getActiveProjectId();
    if (activeId && loadProjectData(activeId)) return activeId;
    const index = getProjectIndex();
    if (index.length > 0) return index[0].id;
    return createNewProject().id;
  });

  const [projectIndex, setProjectIndex] = useState<ProjectIndexEntry[]>(getProjectIndex);

  const loadedData = loadProjectData(projectId);
  const [currentStep, setCurrentStep] = useState(loadedData?.currentStep ?? 1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [bomItems, setBomItems] = useState<BomItem[]>(loadedData?.bomItems ?? []);
  const [bomFileName, setBomFileName] = useState<string | null>(loadedData?.bomFileName ?? null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({ ...defaultProjectInfo, ...loadedData?.projectInfo });
  const [appendixFile, setAppendixFile] = useState<File | null>(null);
  const [appendixFileName, setAppendixFileName] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<DocumentOverrides>({ ...defaultOverrides, ...loadedData?.overrides });
  const [templateFiles, setTemplateFiles] = useState<Record<DocumentType, ArrayBuffer | null>>({
    SOW_Customer: null,
    SOW_SUB_Quoting: null,
    SOW_SUB_Project: null,
  });

  useEffect(() => {
    saveProjectData(projectId, {
      currentStep,
      bomItems,
      bomFileName,
      projectInfo,
      overrides,
    });
    setProjectIndex(getProjectIndex());
  }, [projectId, currentStep, bomItems, bomFileName, projectInfo, overrides]);

  const handleLoadProject = useCallback((id: string) => {
    const data = loadProjectData(id);
    if (!data) return;
    setProjectId(id);
    setCurrentStep(data.currentStep);
    setCompletedSteps(new Set());
    setBomItems(data.bomItems);
    setBomFileName(data.bomFileName);
    setProjectInfo({ ...defaultProjectInfo, ...data.projectInfo });
    setAppendixFile(null);
    setAppendixFileName(null);
    setOverrides({ ...defaultOverrides, ...data.overrides });
    toast.success(`Loaded project: ${data.projectInfo.oppNumber || 'Untitled'}`);
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    deleteProject(id);
    const remaining = getProjectIndex();
    setProjectIndex(remaining);
    if (id === projectId) {
      if (remaining.length > 0) {
        handleLoadProject(remaining[0].id);
      } else {
        const { id: newId } = createNewProject();
        setProjectIndex(getProjectIndex());
        handleLoadProject(newId);
      }
    }
    toast.success('Project deleted');
  }, [projectId, handleLoadProject]);

  const handleNewProject = useCallback(() => {
    const { id } = createNewProject();
    setProjectIndex(getProjectIndex());
    handleLoadProject(id);
    toast.success('New project created');
  }, [handleLoadProject]);

  useEffect(() => {
    const docTypes: DocumentType[] = ['SOW_Customer', 'SOW_SUB_Quoting', 'SOW_SUB_Project'];
    docTypes.forEach(async (docType) => {
      try {
        const res = await fetch(`/templates/${docType}.docx`);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          setTemplateFiles(prev => ({ ...prev, [docType]: buffer }));
        }
      } catch (e) {
        console.error(`Failed to load template ${docType}:`, e);
      }
    });
  }, []);

  const completeStep = useCallback((step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback((from: number) => {
    completeStep(from);
    setCurrentStep(from + 1);
  }, [completeStep]);

  const handleBomParsed = useCallback((items: BomItem[], scopeText: string, fileName: string, parsedInfo: Partial<ProjectInfo>) => {
    setBomItems(items);
    setBomFileName(fileName);
    setProjectInfo(prev => {
      const merged = { ...prev, scope: scopeText };
      for (const [key, value] of Object.entries(parsedInfo)) {
        if (value && !prev[key as keyof ProjectInfo]) {
          (merged as any)[key as keyof ProjectInfo] = value;
        }
      }
      return merged;
    });
  }, []);

  const handleAppendix = useCallback((file: File | null, name: string | null) => {
    setAppendixFile(file);
    setAppendixFileName(name);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">SOW Document Generator</h1>
            <p className="text-sm text-muted-foreground">Howard Technology Solutions</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleNewProject}>
            + New Project
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <SavedProjects
          projects={projectIndex}
          activeProjectId={projectId}
          onLoad={handleLoadProject}
          onDelete={handleDeleteProject}
          onNew={handleNewProject}
        />

        <StepIndicator
          currentStep={currentStep}
          onStepClick={goToStep}
          completedSteps={completedSteps}
        />

        {currentStep === 1 && (
          <BomUpload
            bomItems={bomItems}
            bomFileName={bomFileName}
            onBomParsed={handleBomParsed}
            onNext={() => nextStep(1)}
          />
        )}

        {currentStep === 2 && (
          <ProjectInfoForm
            info={projectInfo}
            onChange={setProjectInfo}
            onNext={() => nextStep(2)}
            onBack={() => goToStep(1)}
          />
        )}

        {currentStep === 3 && (
          <AppendixUpload
            appendixFileName={appendixFileName}
            onAppendixSelected={handleAppendix}
            onNext={() => nextStep(3)}
            onBack={() => goToStep(2)}
          />
        )}

        {currentStep === 4 && (
          <DocumentPreview
            info={projectInfo}
            overrides={overrides}
            onOverridesChange={setOverrides}
            onNext={() => nextStep(4)}
            onBack={() => goToStep(3)}
          />
        )}

        {currentStep === 5 && (
          <ExportPanel
            info={projectInfo}
            overrides={overrides}
            templateFiles={templateFiles}
            appendixFile={appendixFile}
            onBack={() => goToStep(4)}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
