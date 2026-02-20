import { useState, useCallback } from 'react';
import { Download, FileText, Archive, Upload, AlertCircle, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadDocx, downloadAllAsZip } from '@/lib/documentGenerator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProjectInfo, DocumentType, DocumentOverrides } from '@/types/sow';

interface ExportPanelProps {
  info: ProjectInfo;
  overrides: DocumentOverrides;
  templateFiles: Record<DocumentType, ArrayBuffer | null>;
  hardwareScheduleFile: File | null;
  onBack: () => void;
}

const docTypes: { type: DocumentType; label: string }[] = [
  { type: 'SOW_Customer', label: 'SOW Customer' },
  { type: 'SOW_SUB_Quoting', label: 'SOW SUB Quoting' },
  { type: 'SOW_SUB_Project', label: 'SOW SUB Project' },
];

export default function ExportPanel({ info, overrides, templateFiles, hardwareScheduleFile, onBack }: ExportPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [missingTemplates, setMissingTemplates] = useState<DocumentType[]>([]);
  const [folderName, setFolderName] = useState(info.projectName || 'SOW_Documents');

  const handleUploadTemplate = useCallback((docType: DocumentType, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      templateFiles[docType] = e.target?.result as ArrayBuffer;
      setMissingTemplates(prev => prev.filter(t => t !== docType));
    };
    reader.readAsArrayBuffer(file);
  }, [templateFiles]);

  const handleExportSingle = useCallback((docType: DocumentType) => {
    const template = templateFiles[docType];
    if (!template) {
      setMissingTemplates(prev => [...new Set([...prev, docType])]);
      return;
    }
    downloadDocx(template, info, overrides[docType], `${docType}.docx`);
  }, [templateFiles, info, overrides]);

  const handleExportAll = useCallback(async () => {
    const missing = docTypes.filter(d => !templateFiles[d.type]).map(d => d.type);
    if (missing.length > 0) {
      setMissingTemplates(missing);
      return;
    }
    setExporting(true);
    try {
      await downloadAllAsZip(templateFiles, info, overrides, hardwareScheduleFile, folderName);
    } finally {
      setExporting(false);
    }
  }, [templateFiles, info, overrides, hardwareScheduleFile, folderName]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Documents
          </CardTitle>
          <CardDescription>
            Download individual documents or all at once as a ZIP archive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template upload section */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Document Templates</p>
            <p className="text-xs text-muted-foreground">
              Upload your .docx templates so placeholders can be filled. Templates must use {'{{Field_Name}}'} syntax.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {docTypes.map(({ type, label }) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{label}</span>
                    {templateFiles[type] && (
                      <span className="text-xs text-primary font-medium">✓</span>
                    )}
                  </div>
                  {!templateFiles[type] && (
                    <label>
                      <input
                        type="file"
                        accept=".docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadTemplate(type, file);
                        }}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span className="flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Upload
                        </span>
                      </Button>
                    </label>
                  )}
                  {missingTemplates.includes(type) && !templateFiles[type] && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Required
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Individual exports */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Individual Downloads</p>
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

          {/* Folder name */}
          <div className="space-y-2">
            <Label htmlFor="folderName" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              Export Folder Name
            </Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. ProjectName_SOW"
            />
            <p className="text-xs text-muted-foreground">
              ZIP file and inner folder will use this name
            </p>
          </div>

          <hr className="border-border" />

          {/* Export all */}
          <Button onClick={handleExportAll} disabled={exporting} size="lg" className="w-full">
            <Archive className="w-5 h-5 mr-2" />
            {exporting ? 'Generating ZIP…' : 'Export All as ZIP'}
          </Button>
          {hardwareScheduleFile && (
            <p className="text-xs text-muted-foreground text-center">
              Hardware schedule ({hardwareScheduleFile.name}) will be included in the ZIP
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>← Back to Preview</Button>
      </div>
    </div>
  );
}
