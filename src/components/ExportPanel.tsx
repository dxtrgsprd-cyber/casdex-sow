import { useCallback, useState, useEffect } from 'react';
import { Download, FileText, Upload, RotateCcw, ChevronDown, BookOpen, ClipboardList, FileDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { generateDocx } from '@/lib/documentGenerator';
import { appendToDocs } from '@/lib/appendixInjector';
import { appendProgrammingNotes } from '@/lib/programmingAppendix';
import { appendLiftNotes } from '@/lib/liftAppendix';
import {
  appendVerticalNotes,
  DEFAULT_VERTICAL_NOTES,
  loadVerticalOverrides,
  saveVerticalOverrides,
  type VerticalEntry,
} from '@/lib/verticalAppendix';
import { downloadFieldManual } from '@/lib/fieldManualGenerator';
import { exportDocxAsPdf } from '@/lib/pdfExport';
import { saveTemplate, deleteTemplate } from '@/lib/templateStorage';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import type { ProjectInfo, BomItem, DocumentType, DocumentOverrides } from '@/types/sow';


interface ExportPanelProps {
  info: ProjectInfo;
  bomItems: BomItem[];
  overrides: DocumentOverrides;
  templateFiles: Record<DocumentType, ArrayBuffer | null>;
  onTemplateChange: (type: DocumentType, buffer: ArrayBuffer | null) => void;
  appendixFile: File | null;
  onProgrammingToggle?: (enabled: boolean) => void;
  onLiftToggle?: (enabled: boolean) => void;
  onBack: () => void;
}

const docTypes: { type: DocumentType; label: string }[] = [
  { type: 'SOW_SUB_Quoting', label: 'RFP SUB' },
  { type: 'SOW_SUB_Project', label: 'SOW SUB Project' },
  { type: 'SOW_Customer', label: 'Customer SOW' },
];

const VERTICAL_ORDER = ['K12', 'HED', 'MED', 'BIZ', 'GOV'];

export default function ExportPanel({ info, bomItems, overrides, templateFiles, onTemplateChange, appendixFile, onProgrammingToggle, onLiftToggle, onBack }: ExportPanelProps) {
  const allLoaded = docTypes.every(d => templateFiles[d.type]);

  // Appendix overrides state
  const [appendixOverrides, setAppendixOverrides] = useState<Record<string, VerticalEntry>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<DocumentType[]>(docTypes.map(d => d.type));

  const toggleSelected = (type: DocumentType, checked: boolean) =>
    setSelected(prev => (checked ? [...new Set([...prev, type])] : prev.filter(t => t !== type)));


  useEffect(() => {
    setAppendixOverrides(loadVerticalOverrides());
  }, []);

  const getEffective = (key: string): VerticalEntry =>
    appendixOverrides[key] ?? DEFAULT_VERTICAL_NOTES[key];

  const handleAppendixChange = useCallback((key: string, bullets: string) => {
    const entry = getEffective(key);
    const updated = {
      ...appendixOverrides,
      [key]: { ...entry, bullets: bullets.split('\n').filter(l => l.trim()) },
    };
    setAppendixOverrides(updated);
    saveVerticalOverrides(updated);
  }, [appendixOverrides]);

  const handleAppendixReset = useCallback((key: string) => {
    const updated = { ...appendixOverrides };
    delete updated[key];
    setAppendixOverrides(updated);
    saveVerticalOverrides(updated);
    toast.success(`${key} appendix reset to default`);
  }, [appendixOverrides]);

  const buildBlob = useCallback(async (docType: DocumentType): Promise<Blob | null> => {
    const template = templateFiles[docType];
    if (!template) return null;

    let docBlob = generateDocx(template, info, overrides[docType], docType);

    if (info.vertical) {
      docBlob = await appendVerticalNotes(docBlob, info.vertical);
    }
    if (appendixFile) {
      docBlob = await appendToDocs(docBlob, appendixFile);
    }
    if (info.programmingRequired && info.programmingNotes?.trim()) {
      docBlob = await appendProgrammingNotes(docBlob, info.programmingNotes);
    }
    if (info.liftNeeded) {
      docBlob = await appendLiftNotes(docBlob, info.liftHeight, info.liftEnvironment);
    }
    return docBlob;
  }, [templateFiles, info, overrides, appendixFile]);

  const fileNameFor = useCallback((docType: DocumentType, ext: 'docx' | 'pdf') => {
    const label = docTypes.find(d => d.type === docType)?.label ?? docType;
    const opp = info.oppNumber?.trim() || 'Document';
    return `${opp} - ${label}.${ext}`;
  }, [info.oppNumber]);

  const exportOne = useCallback(async (docType: DocumentType, format: 'docx' | 'pdf') => {
    const label = docTypes.find(d => d.type === docType)?.label ?? docType;
    setBusy(`${docType}-${format}`);
    try {
      const docBlob = await buildBlob(docType);
      if (!docBlob) return;
      if (format === 'docx') {
        saveAs(docBlob, fileNameFor(docType, 'docx'));
      } else {
        await exportDocxAsPdf(docBlob, fileNameFor(docType, 'pdf'));
      }
    } catch (e) {
      console.error('[export] Export failed:', e);
      toast.error(`Export failed for ${label}`);
    } finally {
      setBusy(null);
    }
  }, [buildBlob, fileNameFor]);

  const exportMany = useCallback(async (types: DocumentType[], format: 'docx' | 'pdf') => {
    if (types.length === 0) {
      toast.error('Select at least one document to export');
      return;
    }
    setBusy(`batch-${format}`);
    try {
      for (const type of types) {
        const label = docTypes.find(d => d.type === type)?.label ?? type;
        try {
          const docBlob = await buildBlob(type);
          if (!docBlob) continue;
          if (format === 'docx') {
            saveAs(docBlob, fileNameFor(type, 'docx'));
          } else {
            await exportDocxAsPdf(docBlob, fileNameFor(type, 'pdf'));
          }
          // Small gap so browsers don't drop rapid successive downloads / print dialogs
          await new Promise(r => setTimeout(r, format === 'pdf' ? 1200 : 400));
        } catch (e) {
          console.error('[export] Export failed:', e);
          toast.error(`Export failed for ${label}`);
        }
      }
      toast.success(`Exported ${types.length} document${types.length > 1 ? 's' : ''} (${format.toUpperCase()})`);
    } finally {
      setBusy(null);
    }
  }, [buildBlob, fileNameFor]);


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
      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>← Back to Preview</Button>
      </div>
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

            {/* Field Manual Export */}
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2">Field Installation Manual</p>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-primary/30 hover:bg-primary/5"
                onClick={async () => {
                  try {
                    await downloadFieldManual(info, bomItems, info.scopeOfWork || '');
                    toast.success('Field Manual exported');
                  } catch (e) {
                    console.error('[export] Field Manual failed:', e);
                    toast.error('Field Manual export failed');
                  }
                }}
              >
                <ClipboardList className="w-4 h-4 mr-1.5" />
                Field Manual (.docx)
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Generates a 13-section installer field guide with BOM checklist, device specs, QC items, and sign-off sheet.
              </p>
            </div>
          </div>

          {/* Programming Notes Toggle */}
          {info.programmingNotes?.trim() && (
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <Checkbox
                id="export-include-programming"
                checked={info.programmingRequired}
                onCheckedChange={(checked) => onProgrammingToggle?.(!!checked)}
              />
              <div className="grid gap-1 leading-none">
                <Label htmlFor="export-include-programming" className="font-semibold cursor-pointer">
                  Include Programming Notes
                </Label>
                <p className="text-xs text-muted-foreground">
                  Appends programming notes as a separate page at the end of each exported document.
                </p>
              </div>
            </div>
          )}

          {/* Lift Requirements Toggle */}
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
            <Checkbox
              id="export-include-lift"
              checked={info.liftNeeded}
              onCheckedChange={(checked) => onLiftToggle?.(!!checked)}
            />
            <div className="grid gap-1 leading-none">
              <Label htmlFor="export-include-lift" className="font-semibold cursor-pointer">
                Include Lift Requirements
              </Label>
              <p className="text-xs text-muted-foreground">
                Appends lift / equipment requirements ({info.liftHeight ? `${info.liftHeight} ft` : 'height TBD'}{info.liftEnvironment ? `, ${info.liftEnvironment}` : ''}) as a separate page.
              </p>
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

      {/* Manage Appendix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Manage Appendix
          </CardTitle>
          <CardDescription>
            Site requirement notes appended to each SOW based on the selected vertical. Click to expand and edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {VERTICAL_ORDER.map((key) => {
              const entry = getEffective(key);
              const isOverridden = key in appendixOverrides;
              return (
                <Collapsible key={key}>
                  <div className="rounded-lg border bg-card">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/40 transition-colors rounded-lg group">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                            {key}
                          </span>
                          <span className="text-sm font-medium truncate">{entry.title}</span>
                          {isOverridden && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                              customized
                            </span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-3 pb-3 space-y-2">
                        <Textarea
                          value={entry.bullets.join('\n')}
                          onChange={(e) => handleAppendixChange(key, e.target.value)}
                          className="text-xs font-mono min-h-[8rem] whitespace-pre"
                          placeholder="One bullet point per line"
                        />
                        {isOverridden && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-muted-foreground"
                            onClick={() => handleAppendixReset(key)}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset to default
                          </Button>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>← Back to Preview</Button>
      </div>
    </div>
  );
}
