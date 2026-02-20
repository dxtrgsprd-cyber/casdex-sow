import { useState, useCallback, useEffect } from 'react';
import StepIndicator from '@/components/StepIndicator';
import BomUpload from '@/components/BomUpload';
import ProjectInfoForm from '@/components/ProjectInfoForm';
import HardwareScheduleUpload from '@/components/HardwareScheduleUpload';
import DocumentPreview from '@/components/DocumentPreview';
import ExportPanel from '@/components/ExportPanel';
import { Button } from '@/components/ui/button';
import { defaultProjectInfo, defaultOverrides } from '@/types/sow';
import type { ProjectInfo, BomItem, DocumentOverrides, DocumentType } from '@/types/sow';
import { toast } from 'sonner';

const STORAGE_KEY = 'sow-generator-state';

interface SavedState {
  currentStep: number;
  bomItems: BomItem[];
  bomFileName: string | null;
  projectInfo: ProjectInfo;
  hardwareScheduleFileName: string | null;
  overrides: DocumentOverrides;
}

function loadSavedState(): Partial<SavedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full, ignore
  }
}

const Index = () => {
  const saved = loadSavedState();
  const [currentStep, setCurrentStep] = useState(saved?.currentStep ?? 1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [bomItems, setBomItems] = useState<BomItem[]>(saved?.bomItems ?? []);
  const [bomFileName, setBomFileName] = useState<string | null>(saved?.bomFileName ?? null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({ ...defaultProjectInfo, ...saved?.projectInfo });
  const [hardwareScheduleFile, setHardwareScheduleFile] = useState<File | null>(null);
  const [hardwareScheduleFileName, setHardwareScheduleFileName] = useState<string | null>(saved?.hardwareScheduleFileName ?? null);
  const [overrides, setOverrides] = useState<DocumentOverrides>({ ...defaultOverrides, ...saved?.overrides });
  const [templateFiles, setTemplateFiles] = useState<Record<DocumentType, ArrayBuffer | null>>({
    SOW_Customer: null,
    SOW_SUB_Quoting: null,
    SOW_SUB_Project: null,
  });

  // Auto-save on state changes
  useEffect(() => {
    saveState({
      currentStep,
      bomItems,
      bomFileName,
      projectInfo,
      hardwareScheduleFileName,
      overrides,
    });
  }, [currentStep, bomItems, bomFileName, projectInfo, hardwareScheduleFileName, overrides]);

  const handleClearSaved = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setBomItems([]);
    setBomFileName(null);
    setProjectInfo(defaultProjectInfo);
    setHardwareScheduleFile(null);
    setHardwareScheduleFileName(null);
    setOverrides(defaultOverrides);
    toast.success('Session cleared — starting fresh');
  }, []);

  // Auto-load embedded templates on mount
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
    // Merge parsed project info into current state, only filling empty fields
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

  const handleHardwareSchedule = useCallback((file: File | null, name: string | null) => {
    setHardwareScheduleFile(file);
    setHardwareScheduleFileName(name);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">SOW Document Generator</h1>
            <p className="text-sm text-muted-foreground">Howard Technology Solutions</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearSaved}>
            Start New
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
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
          <HardwareScheduleUpload
            fileName={hardwareScheduleFileName}
            onFileSelected={handleHardwareSchedule}
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
            onBack={() => goToStep(4)}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
