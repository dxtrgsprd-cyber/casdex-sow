import { useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, Zap, Settings2 } from 'lucide-react';
import {
  SOW_SECTION_TEMPLATES,
  SOW_VARIABLES,
  autoFillFromBom,
  generateSowText,
} from '@/lib/sowTemplates';
import type { BomItem } from '@/types/sow';
import type { SowBuilderState } from '@/types/sow';
import SowSectionSelector from '@/components/SowSectionSelector';

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
    const hasAnyAutoFilled = Object.keys(autoVars).some(k => autoVars[k]);
    if (!hasAnyAutoFilled) return;

    const merged = { ...sowState.variables };
    let changed = false;
    for (const [key, value] of Object.entries(autoVars)) {
      if (!merged[key] && value) {
        merged[key] = value;
        changed = true;
      }
    }
    if (changed) {
      onSowStateChange({ ...sowState, variables: merged });
    }
  }, [bomItems]);

  const enabledSections = new Set(sowState.enabledSections);

  const handleSectionOrderChange = useCallback(
    (newOrder: string[]) => {
      onSowStateChange({ ...sowState, sectionOrder: newOrder, customSowText: null });
    },
    [sowState, onSowStateChange]
  );

  const handleEnabledSectionsChange = useCallback(
    (newEnabled: string[]) => {
      onSowStateChange({ ...sowState, enabledSections: newEnabled, customSowText: null });
    },
    [sowState, onSowStateChange]
  );

  const handleVariableChange = useCallback(
    (key: string, value: string) => {
      onSowStateChange({
        ...sowState,
        variables: { ...sowState.variables, [key]: value },
        customSowText: null,
      });
    },
    [sowState, onSowStateChange]
  );

  const templateMap = useMemo(
    () => new Map(SOW_SECTION_TEMPLATES.map((s) => [s.id, s])),
    []
  );

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
    return SOW_VARIABLES.filter((v) => used.has(v.key));
  }, [enabledSections, templateMap]);

  const autoFilledKeys = useMemo(() => {
    if (bomItems.length === 0) return new Set<string>();
    const auto = autoFillFromBom(bomItems);
    return new Set<string>(Object.keys(auto).filter(k => auto[k]));
  }, [bomItems]);

  const previewText = useMemo(() => {
    const enabled = new Set(sowState.enabledSections);
    return generateSowText(sowState.sectionOrder, enabled, sowState.variables);
  }, [sowState.sectionOrder, sowState.enabledSections, sowState.variables]);

  return (
    <div className="space-y-4">
      {/* Section Selector */}
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
            onSectionOrderChange={handleSectionOrderChange}
            onEnabledSectionsChange={handleEnabledSectionsChange}
          />
        </CardContent>
      </Card>

      {/* Variables */}
      {usedVariables.length > 0 && (
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
          </CardContent>
        </Card>
      )}

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
              onChange={(e) => onSowStateChange({ ...sowState, customSowText: e.target.value })}
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
