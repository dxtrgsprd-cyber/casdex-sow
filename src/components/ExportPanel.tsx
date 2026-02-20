import { useCallback } from 'react';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateDocx } from '@/lib/documentGenerator';
import { appendToDocs } from '@/lib/appendixInjector';
import { saveAs } from 'file-saver';
import type { ProjectInfo, DocumentType, DocumentOverrides } from '@/types/sow';

interface ExportPanelProps {
  info: ProjectInfo;
  overrides: DocumentOverrides;
  templateFiles: Record<DocumentType, ArrayBuffer | null>;
  appendixFile: File | null;
  onBack: () => void;
}

const docTypes: { type: DocumentType; label: string }[] = [
  { type: 'SOW_SUB_Quoting', label: 'SOW SUB Quoting' },
  { type: 'SOW_Customer', label: 'SOW Customer' },
  { type: 'SOW_SUB_Project', label: 'SOW SUB Project' },
];

export default function ExportPanel({ info, overrides, templateFiles, appendixFile, onBack }: ExportPanelProps) {
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

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>← Back to Preview</Button>
      </div>
    </div>
  );
}
