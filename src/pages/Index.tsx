import { useState, useCallback, useEffect, useRef } from 'react';
import StepIndicator from '@/components/StepIndicator';
import BomUpload from '@/components/BomUpload';
import ProjectInfoForm from '@/components/ProjectInfoForm';
import SowBuilder from '@/components/SowBuilder';
import DocumentPreview from '@/components/DocumentPreview';
import ExportPanel from '@/components/ExportPanel';
import { generateSowText } from '@/lib/sowTemplates';
import SavedProjects from '@/components/SavedProjects';
import { loadTemplate } from '@/lib/templateStorage';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { defaultProjectInfo, defaultOverrides, defaultSowBuilderState } from '@/types/sow';
import type { ProjectInfo, BomItem, DocumentOverrides, DocumentType, SowBuilderState } from '@/types/sow';
import {
  getProjectIndex,
  getActiveProjectId,
  loadProjectData,
  saveProjectData,
  deleteProject,
  createNewProject,
  migrateIfNeeded,
  exportProjectAsFile,
} from '@/lib/projectStorage';
import type { ProjectIndexEntry } from '@/lib/projectStorage';
import { toast } from 'sonner';
import { AlertTriangle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import casdexScopeLogo from '@/assets/casdex-scope-logo.png';

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
  const [sowState, setSowState] = useState<SowBuilderState>(() => ({
    ...defaultSowBuilderState,
    ...loadedData?.sowBuilderState,
  }));
  const [appendixFile, setAppendixFile] = useState<File | null>(null);
  const [overrides, setOverrides] = useState<DocumentOverrides>({ ...defaultOverrides, ...loadedData?.overrides });
  const [templateFiles, setTemplateFiles] = useState<Record<DocumentType, ArrayBuffer | null>>({
    SOW_Customer: null,
    SOW_SUB_Quoting: null,
    SOW_SUB_Project: null
  });

  useEffect(() => {
    saveProjectData(projectId, {
      currentStep,
      bomItems,
      bomFileName,
      projectInfo,
      overrides,
      sowBuilderState: sowState,
    });
    setProjectIndex(getProjectIndex());
  }, [projectId, currentStep, bomItems, bomFileName, projectInfo, overrides, sowState]);

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
    setSowState({ ...defaultSowBuilderState, ...data.sowBuilderState });
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
        // Check IndexedDB for custom template first
        const custom = await loadTemplate(docType);
        if (custom) {
          setTemplateFiles((prev) => ({ ...prev, [docType]: custom }));
          return;
        }
        // Fall back to default
        const res = await fetch(`/templates/${docType}.docx`);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          setTemplateFiles((prev) => ({ ...prev, [docType]: buffer }));
        }
      } catch (e) {
        console.error(`Failed to load template ${docType}:`, e);
      }
    });
  }, []);

  const handleTemplateChange = useCallback((type: DocumentType, buffer: ArrayBuffer | null) => {
    setTemplateFiles(prev => ({ ...prev, [type]: buffer }));
  }, []);

  const completeStep = useCallback((step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
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
    setProjectInfo((prev) => {
      const merged = { ...prev, scope: scopeText };
      for (const [key, value] of Object.entries(parsedInfo)) {
        if (value && !prev[key as keyof ProjectInfo]) {
          (merged as any)[key as keyof ProjectInfo] = value;
        }
      }
      return merged;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src={casdexScopeLogo} alt="CASDEX Scope" className="h-10" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => exportProjectAsFile(projectId)}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleNewProject}>
              + New Project
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-3">
        <Alert className="border-destructive/30 bg-muted">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-muted-foreground text-xs">
            Your projects are stored in your web browser's local storage. To avoid data loss, please back up your projects regularly by exporting them as files.
          </AlertDescription>
        </Alert>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <SavedProjects
          projects={projectIndex}
          activeProjectId={projectId}
          onLoad={handleLoadProject}
          onDelete={handleDeleteProject}
          onNew={handleNewProject} />


        <StepIndicator
          currentStep={currentStep}
          onStepClick={goToStep}
          completedSteps={completedSteps} />


        {currentStep === 1 &&
        <BomUpload
          bomItems={bomItems}
          bomFileName={bomFileName}
          onBomParsed={handleBomParsed}
          onNext={() => nextStep(1)} />

        }

        {currentStep === 2 &&
        <ProjectInfoForm
          info={projectInfo}
          onChange={setProjectInfo}
          onNext={() => nextStep(2)}
          onBack={() => goToStep(1)} />

        }

        {currentStep === 3 &&
        <SowBuilder
          bomItems={bomItems}
          sowState={sowState}
          onSowStateChange={setSowState}
          onNext={() => {
            const sowText = sowState.customSowText ?? generateSowText(
              sowState.sectionOrder, new Set(sowState.enabledSections), sowState.variables
            );
            setProjectInfo(prev => ({ ...prev, scopeOfWork: sowText }));
            setOverrides(prev => ({
              ...prev,
              SOW_SUB_Quoting: { ...prev.SOW_SUB_Quoting, scopeOfWork: sowText },
              SOW_SUB_Project: { ...prev.SOW_SUB_Project, scopeOfWork: sowText },
            }));
            nextStep(3);
          }}
          onBack={() => goToStep(2)} />
        }

        {currentStep === 4 &&
        <DocumentPreview
          info={projectInfo}
          overrides={overrides}
          onOverridesChange={setOverrides}
          onNext={() => nextStep(4)}
          onBack={() => goToStep(3)} />

        }

        {currentStep === 5 &&
        <ExportPanel
          info={projectInfo}
          overrides={overrides}
          templateFiles={templateFiles}
          onTemplateChange={handleTemplateChange}
          appendixFile={appendixFile}
          onBack={() => goToStep(4)} />
        }
      </main>
    </div>);

};

export default Index;