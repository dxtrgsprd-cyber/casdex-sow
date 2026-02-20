import { useCallback } from 'react';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadDocx } from '@/lib/documentGenerator';
import type { ProjectInfo, DocumentType, DocumentOverrides } from '@/types/sow';

interface ExportPanelProps {
  info: ProjectInfo;
  overrides: DocumentOverrides;
  templateFiles: Record<DocumentType, ArrayBuffer | null>;
  onBack: () => void;
}

const docTypes: { type: DocumentType; label: string }[] = [
  { type: 'SOW_Customer', label: 'SOW Customer' },
  { type: 'SOW_SUB_Quoting', label: 'SOW SUB Quoting' },
  { type: 'SOW_SUB_Project', label: 'SOW SUB Project' },
];

export default function ExportPanel({ info, overrides, templateFiles, onBack }: ExportPanelProps) {
  const allLoaded = docTypes.every(d => templateFiles[d.type]);

  const handleExportSingle = useCallback((docType: DocumentType) => {
    const template = templateFiles[docType];
    if (!template) return;
    downloadDocx(template, info, overrides[docType], `${docType}.docx`);
  }, [templateFiles, info, overrides]);

  const handleExportAll = useCallback(() => {
    for (const { type } of docTypes) {
      const template = templateFiles[type];
      if (template) {
        downloadDocx(template, info, overrides[type], `${type}.docx`);
      }
    }
  }, [templateFiles, info, overrides]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Documents
          </CardTitle>
          <CardDescription>
            Templates are pre-loaded — just download your documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!allLoaded && (
            <p className="text-sm text-muted-foreground">Loading templates…</p>
          )}

          {/* Individual exports */}
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

          <hr className="border-border" />

          {/* Export all */}
          <Button onClick={handleExportAll} size="lg" className="w-full" disabled={!allLoaded}>
            <Download className="w-5 h-5 mr-2" />
            Download All Documents
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>← Back to Preview</Button>
      </div>
    </div>
  );
}
