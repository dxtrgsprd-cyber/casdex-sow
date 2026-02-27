import { useCallback } from 'react';
import { Download, FileText, Upload, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateDocx } from '@/lib/documentGenerator';
import { appendToDocs } from '@/lib/appendixInjector';
import { saveTemplate, deleteTemplate } from '@/lib/templateStorage';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import type { ProjectInfo, DocumentType, DocumentOverrides } from '@/types/sow';

interface ExportPanelProps {
  info: ProjectInfo;
  overrides: DocumentOverrides;
  templateFiles: Record<DocumentType, ArrayBuffer | null>;
  onTemplateChange: (type: DocumentType, buffer: ArrayBuffer | null) => void;
  appendixFile: File | null;
  onBack: () => void;
}

const docTypes: { type: DocumentType; label: string }[] = [
  { type: 'SOW_SUB_Quoting', label: 'RFP SUB' },
  { type: 'SOW_Customer', label: 'Customer SOW' },
  { type: 'SOW_SUB_Project', label: 'SOW SUB Project' },
];

export default function ExportPanel({ info, overrides, templateFiles, onTemplateChange, appendixFile, onBack }: ExportPanelProps) {
  const allLoaded = docTypes.every(d => templateFiles[d.type]);

  const handleExportSingle = useCallback(async (docType: DocumentType) => {
    const template = templateFiles[docType];
    if (!template) return;

    let docBlob = generateDocx(template, info, overrides[docType]);

    if (appendixFile) {
      docBlob = await appendToDocs(docBlob, appendixFile);
    }

    saveAs(docBlob, `${docType}.docx`);
  }, [templateFiles, info, overrides, appendixFile]);

  const handleUploadTemplate = useCallback(async (docType: DocumentType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const buffer = await file.arrayBuffer();
        await saveTemplate(docType, buffer);
        onTemplateChange(docType, buffer);
        toast.success(`Template "${docType}" updated from ${file.name}`);
      } catch (e) {
        toast.error('Failed to upload template');
      }
    };
    input.click();
  }, [onTemplateChange]);

  const handleResetTemplate = useCallback(async (docType: DocumentType) => {
    try {
      await deleteTemplate(docType);
      const res = await fetch(`/templates/${docType}.docx`);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        onTemplateChange(docType, buffer);
        toast.success(`Template "${docType}" reset to default`);
      }
    } catch {
      toast.error('Failed to reset template');
    }
  }, [onTemplateChange]);

  return (
    <div className="space-y-6">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Documents
          </CardTitle>
          <CardDescription>
            Templates are pre-loaded — just download your documents
            {appendixFile && ` (appendix "${appendixFile.name}" will be inserted at the end)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!allLoaded && (
            <p className="text-sm text-muted-foreground">Loading templates…</p>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium">Download Documents</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {docTypes.map(({ type, label }) => (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() => handleExportSingle(type)}
                  disabled={!templateFiles[type]}
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  {label} (.docx)
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Manage Templates
          </CardTitle>
          <CardDescription>
            Upload custom .docx templates to replace the defaults. Use {'{{Field_Name}}'} placeholders in your templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {docTypes.map(({ type, label }) => (
              <div key={type} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadTemplate(type)}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetTemplate(type)}
                    title="Reset to default template"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>← Back to Preview</Button>
      </div>
    </div>
  );
}
