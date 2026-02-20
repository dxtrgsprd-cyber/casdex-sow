import { useState, useCallback, useEffect } from 'react';
import StepIndicator from '@/components/StepIndicator';
import BomUpload from '@/components/BomUpload';
import ProjectInfoForm from '@/components/ProjectInfoForm';
import HardwareScheduleUpload from '@/components/HardwareScheduleUpload';
import DocumentPreview from '@/components/DocumentPreview';
import ExportPanel from '@/components/ExportPanel';
import { defaultProjectInfo, defaultOverrides } from '@/types/sow';
import type { ProjectInfo, BomItem, DocumentOverrides, DocumentType } from '@/types/sow';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [bomFileName, setBomFileName] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(defaultProjectInfo);
  const [hardwareScheduleFile, setHardwareScheduleFile] = useState<File | null>(null);
  const [hardwareScheduleFileName, setHardwareScheduleFileName] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<DocumentOverrides>(defaultOverrides);
  const [templateFiles, setTemplateFiles] = useState<Record<DocumentType, ArrayBuffer | null>>({
    SOW_Customer: null,
    SOW_SUB_Quoting: null,
    SOW_SUB_Project: null,
  });

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

  const handleBomParsed = useCallback((items: BomItem[], scopeText: string, fileName: string) => {
    setBomItems(items);
    setBomFileName(fileName);
    setProjectInfo(prev => ({ ...prev, scope: scopeText }));
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
