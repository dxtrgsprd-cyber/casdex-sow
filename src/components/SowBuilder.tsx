import { useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, Zap, Settings2, Code2 } from 'lucide-react';
import {
  SOW_SECTION_TEMPLATES,
  SOW_VARIABLES,
  autoFillFromBom,
  generateSowText,
} from '@/lib/sowTemplates';
import type { BomItem } from '@/types/sow';
import type { SowBuilderState } from '@/types/sow';
import SowSectionSelector from '@/components/SowSectionSelector';

function splitGeneratedSections(text: string): string[] {
  return text.trim() ? text.trim().split(/\n{2,}(?=\d+\.\s)/).map((section) => section.trim()).filter(Boolean) : [];
}

function sectionKey(section: string): string {
  return section.match(/^\d+\.\s+(.+)$/m)?.[1]?.trim() ?? section.trim();
}

type LineDiff =
  | { type: 'equal'; line: string }
  | { type: 'delete'; line: string }
  | { type: 'insert'; line: string };

function diffLines(previousLines: string[], nextLines: string[]): LineDiff[] {
  const dp = Array.from({ length: previousLines.length + 1 }, () => Array(nextLines.length + 1).fill(0));

  for (let i = previousLines.length - 1; i >= 0; i--) {
    for (let j = nextLines.length - 1; j >= 0; j--) {
      dp[i][j] = previousLines[i] === nextLines[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const diff: LineDiff[] = [];
  let i = 0;
  let j = 0;
  while (i < previousLines.length && j < nextLines.length) {
    if (previousLines[i] === nextLines[j]) {
      diff.push({ type: 'equal', line: previousLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      diff.push({ type: 'delete', line: previousLines[i] });
      i++;
    } else {
      diff.push({ type: 'insert', line: nextLines[j] });
      j++;
    }
  }
  while (i < previousLines.length) diff.push({ type: 'delete', line: previousLines[i++] });
  while (j < nextLines.length) diff.push({ type: 'insert', line: nextLines[j++] });

  return diff;
}

function findLineIndex(lines: string[], line: string): number {
  return lines.findIndex((candidate) => candidate === line);
}

function insertGeneratedLine(lines: string[], line: string, afterLine: string | null, beforeLine: string | null) {
  if (!line.trim() || lines.includes(line)) return;

  const beforeIndex = beforeLine ? findLineIndex(lines, beforeLine) : -1;
  if (beforeIndex !== -1) {
    lines.splice(beforeIndex, 0, line);
    return;
  }

  const afterIndex = afterLine ? findLineIndex(lines, afterLine) : -1;
  if (afterIndex !== -1) {
    lines.splice(afterIndex + 1, 0, line);
    return;
  }

  lines.push(line);
}

function nextEqualLine(diff: LineDiff[], startIndex: number): string | null {
  for (let i = startIndex; i < diff.length; i++) {
    if (diff[i].type === 'equal') return diff[i].line;
  }
  return null;
}

function flushDeletedLines(lines: string[], deletedLines: string[]) {
  for (const deletedLine of deletedLines) {
    const index = findLineIndex(lines, deletedLine);
    if (index !== -1) lines.splice(index, 1);
  }
  deletedLines.length = 0;
}

function mergeSectionText(customSection: string, previousSection: string, nextSection: string): string {
  if (customSection === previousSection) return nextSection;

  const mergedLines = customSection.split('\n');
  const diff = diffLines(previousSection.split('\n'), nextSection.split('\n'));
  const pendingDeletes: string[] = [];
  let lastEqualLine: string | null = null;

  diff.forEach((op, index) => {
    if (op.type === 'delete') {
      pendingDeletes.push(op.line);
      return;
    }

    if (op.type === 'insert') {
      const deletedLine = pendingDeletes.shift();
      if (deletedLine !== undefined) {
        const deletedIndex = findLineIndex(mergedLines, deletedLine);
        if (deletedIndex !== -1) mergedLines[deletedIndex] = op.line;
        return;
      }

      insertGeneratedLine(mergedLines, op.line, lastEqualLine, nextEqualLine(diff, index + 1));
      return;
    }

    flushDeletedLines(mergedLines, pendingDeletes);
    lastEqualLine = op.line;
  });

  flushDeletedLines(mergedLines, pendingDeletes);
  return mergedLines.join('\n').trim();
}

function mergeGeneratedIntoCustom(customText: string, previousGenerated: string, nextGenerated: string): string {
  if (customText.trim() === previousGenerated.trim()) return nextGenerated;

  const previousSections = splitGeneratedSections(previousGenerated);
  const nextSections = splitGeneratedSections(nextGenerated);
  const customSections = splitGeneratedSections(customText);
  const previousMap = new Map(previousSections.map((section) => [sectionKey(section), section]));
  const customMap = new Map(customSections.map((section) => [sectionKey(section), section]));
  const nextKeys = new Set(nextSections.map(sectionKey));
  const usedCustomKeys = new Set<string>();

  const mergedSections = nextSections.map((nextSection) => {
    const key = sectionKey(nextSection);
    const previousSection = previousMap.get(key);
    const customSection = customMap.get(key);
    if (previousSection && customSection) {
      usedCustomKeys.add(key);
      return mergeSectionText(customSection, previousSection, nextSection);
    }
    return nextSection;
  });

  for (const customSection of customSections) {
    const key = sectionKey(customSection);
    if (!usedCustomKeys.has(key) && !previousMap.has(key) && !nextKeys.has(key)) {
      mergedSections.push(customSection);
    }
  }

  return mergedSections.join('\n\n').trim();
}

interface SowBuilderProps {
  bomItems: BomItem[];
  sowState: SowBuilderState;
  onSowStateChange: (state: SowBuilderState) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SowBuilder({ bomItems, sowState, onSowStateChange, onNext, onBack }: SowBuilderProps) {
  // Ensure any new template sections are present in sectionOrder
  useEffect(() => {
    const allIds = SOW_SECTION_TEMPLATES.map(s => s.id);
    const missing = allIds.filter(id => !sowState.sectionOrder.includes(id));
    if (missing.length > 0) {
      onSowStateChange({
        ...sowState,
        sectionOrder: [...sowState.sectionOrder, ...missing],
      });
    }
  }, []); // run once on mount

  // Auto-fill from BOM on mount or when BOM changes
  useEffect(() => {
    if (bomItems.length === 0) return;
    const autoVars = autoFillFromBom(bomItems);
    console.log('[SowBuilder] autoFillFromBom returned:', autoVars);
    const hasAnyAutoFilled = Object.keys(autoVars).some(k => autoVars[k]);
    if (!hasAnyAutoFilled) return;

    const merged = { ...sowState.variables };
    let changed = false;
    for (const [key, value] of Object.entries(autoVars)) {
      // Fill if the variable is empty/unset
      const current = (merged[key] || '').trim();
      if (!current && value) {
        merged[key] = value;
        changed = true;
      }
    }
    console.log('[SowBuilder] Auto-fill changed:', changed, 'merged:', merged);
    if (changed) {
      onSowStateChange({ ...sowState, variables: merged });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomItems]);


  const enabledSections = new Set(sowState.enabledSections);

  const mergeCustomForChange = useCallback(
    (nextState: SowBuilderState): string | null => {
      if (sowState.customSowText === null) return null;
      const previousGenerated = generateSowText(
        sowState.sectionOrder,
        new Set(sowState.enabledSections),
        sowState.variables,
        sowState.customTemplates
      );
      const nextGenerated = generateSowText(
        nextState.sectionOrder,
        new Set(nextState.enabledSections),
        nextState.variables,
        nextState.customTemplates
      );
      return mergeGeneratedIntoCustom(sowState.customSowText, previousGenerated, nextGenerated);
    },
    [sowState]
  );

  const handleSectionOrderChange = useCallback(
    (newOrder: string[]) => {
      const next = { ...sowState, sectionOrder: newOrder };
      onSowStateChange({ ...next, customSowText: mergeCustomForChange(next) });
    },
    [sowState, onSowStateChange, mergeCustomForChange]
  );

  const handleEnabledSectionsChange = useCallback(
    (newEnabled: string[]) => {
      const next = { ...sowState, enabledSections: newEnabled };
      onSowStateChange({ ...next, customSowText: mergeCustomForChange(next) });
    },
    [sowState, onSowStateChange, mergeCustomForChange]
  );

  const handleVariableChange = useCallback(
    (key: string, value: string) => {
      const nextVariables = { ...sowState.variables, [key]: value };
      const next = { ...sowState, variables: nextVariables };
      onSowStateChange({ ...next, customSowText: mergeCustomForChange(next) });
    },
    [sowState, onSowStateChange, mergeCustomForChange]
  );

  const handleCustomTemplateChange = useCallback(
    (id: string, template: string | null) => {
      const updated = { ...sowState.customTemplates };
      if (template === null) {
        delete updated[id];
      } else {
        updated[id] = template;
      }
      const next = { ...sowState, customTemplates: updated };
      onSowStateChange({ ...next, customSowText: mergeCustomForChange(next) });
    },
    [sowState, onSowStateChange, mergeCustomForChange]
  );

  const handleProgrammingNotesChange = useCallback(
    (value: string) => {
      onSowStateChange({
        ...sowState,
        programmingNotes: value,
      });
    },
    [sowState, onSowStateChange]
  );


  const templateMap = useMemo(
    () => new Map(SOW_SECTION_TEMPLATES.map((s) => [s.id, s])),
    []
  );

  // Filter out PROGRAMMING_DETAILS from the variables card (it has its own tab)
  const usedVariables = useMemo(() => {
    const used = new Set<string>();
    for (const id of enabledSections) {
      const tmpl = templateMap.get(id);
      if (!tmpl) continue;
      const matches = Array.from(tmpl.template.matchAll(/\{\{(\w+)\}\}/g));
      for (const match of matches) {
        used.add(match[1] as string);
      }
    }
    return SOW_VARIABLES.filter((v) => used.has(v.key) && v.key !== 'PROGRAMMING_DETAILS');
  }, [enabledSections, templateMap]);

  const autoFilledKeys = useMemo(() => {
    if (bomItems.length === 0) return new Set<string>();
    const auto = autoFillFromBom(bomItems);
    return new Set<string>(Object.keys(auto).filter(k => auto[k]));
  }, [bomItems]);

  

  const previewText = useMemo(() => {
    const enabled = new Set(sowState.enabledSections);
    return generateSowText(sowState.sectionOrder, enabled, sowState.variables, sowState.customTemplates);
  }, [sowState.sectionOrder, sowState.enabledSections, sowState.variables, sowState.customTemplates]);

  const handlePreviewTextChange = useCallback(
    (value: string) => {
      onSowStateChange({
        ...sowState,
        customSowText: value === previewText ? null : value,
      });
    },
    [sowState, previewText, onSowStateChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Continue to Preview & Edit →</Button>
      </div>

      <Tabs defaultValue="sections">
        <TabsList className="w-full">
          <TabsTrigger value="sections" className="flex-1 gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="variables" className="flex-1 gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            Variables
          </TabsTrigger>
          <TabsTrigger value="programming" className="flex-1 gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            Programming
          </TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="w-4 h-4 text-primary" />
                Scope of Work Sections
              </CardTitle>
              <CardDescription className="text-xs">
                Click to add sections. Drag to reorder in-use items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SowSectionSelector
                sectionOrder={sowState.sectionOrder}
                enabledSections={sowState.enabledSections}
                customTemplates={sowState.customTemplates ?? {}}
                onSectionOrderChange={handleSectionOrderChange}
                onEnabledSectionsChange={handleEnabledSectionsChange}
                onCustomTemplateChange={handleCustomTemplateChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programming Tab */}
        <TabsContent value="programming">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Code2 className="w-4 h-4 text-primary" />
                Programming Notes
              </CardTitle>
              <CardDescription className="text-xs">
                Programming notes are exported separately — they are not part of the SOW narrative. These notes populate the {'{{PROGRAMMING_DETAILS}}'} field in the SOW SUB Project document only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sowState.programmingNotes ?? ''}
                onChange={(e) => handleProgrammingNotesChange(e.target.value)}
                placeholder={`Enter programming details, e.g.:\nConfigure IP addresses for all cameras\nUpdate firmware to latest version\nProgram access control panels\nEnroll credentials and set schedules\nConfigure VMS recording profiles`}
                className="min-h-[14rem] text-sm font-mono whitespace-pre"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variables Tab */}
        <TabsContent value="variables">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="w-4 h-4 text-primary" />
                SOW Variables
              </CardTitle>
              <CardDescription className="text-xs">
                Values auto-filled from your BOM are marked with ⚡. You can override any value.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usedVariables.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No variables needed for the currently enabled sections.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {usedVariables.map((v) => (
                    <div key={v.key}>
                      <Label className="flex items-center gap-1.5 text-xs">
                        {v.label}
                        {autoFilledKeys.has(v.key) && (
                          <Zap className="w-3 h-3 text-primary" />
                        )}
                      </Label>
                      <Input
                        value={sowState.variables[v.key] || ''}
                        onChange={(e) => handleVariableChange(v.key, e.target.value)}
                        placeholder={`Enter ${v.label.toLowerCase()}`}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Editable Preview */}
      {previewText && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Generated Scope of Work Preview</CardTitle>
            <CardDescription className="text-xs">
              Edit below to customize. Changes override the generated content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sowState.customSowText ?? previewText}
              onChange={(e) => handlePreviewTextChange(e.target.value)}
              className="min-h-[20rem] text-sm font-mono whitespace-pre"
            />
            {sowState.customSowText !== null && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-muted-foreground text-xs"
                onClick={() => onSowStateChange({ ...sowState, customSowText: null })}
              >
                Reset to generated
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Continue to Preview & Edit →</Button>
      </div>
    </div>
  );
}
