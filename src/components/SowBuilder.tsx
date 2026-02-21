import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { GripVertical, Wrench, Zap, Settings2 } from 'lucide-react';
import {
  SOW_SECTION_TEMPLATES,
  SOW_VARIABLES,
  autoFillFromBom,
  generateSowText,
} from '@/lib/sowTemplates';
import type { BomItem } from '@/types/sow';
import type { SowBuilderState } from '@/types/sow';

interface SowBuilderProps {
  bomItems: BomItem[];
  sowState: SowBuilderState;
  onSowStateChange: (state: SowBuilderState) => void;
  onNext: () => void;
  onBack: () => void;
}

function SortableSection({
  id,
  title,
  template,
  enabled,
  onToggle,
}: {
  id: string;
  title: string;
  template: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        enabled ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-60'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-sm text-foreground">{title}</h4>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
        {enabled && (
          <p className="mt-1.5 text-xs text-muted-foreground whitespace-pre-line line-clamp-3">
            {template}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SowBuilder({ bomItems, sowState, onSowStateChange, onNext, onBack }: SowBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Auto-fill from BOM on mount or when BOM changes
  useEffect(() => {
    if (bomItems.length === 0) return;
    const autoVars = autoFillFromBom(bomItems);
    const hasAnyAutoFilled = Object.keys(autoVars).some(k => autoVars[k]);
    if (!hasAnyAutoFilled) return;

    // Only auto-fill empty values
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
  }, [bomItems]); // intentionally only on bomItems change

  const sectionOrder = sowState.sectionOrder;
  const enabledSections = new Set(sowState.enabledSections);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sectionOrder.indexOf(active.id as string);
      const newIndex = sectionOrder.indexOf(over.id as string);
      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      onSowStateChange({ ...sowState, sectionOrder: newOrder });
    },
    [sectionOrder, sowState, onSowStateChange]
  );

  const handleToggle = useCallback(
    (id: string, enabled: boolean) => {
      const newEnabled = new Set(enabledSections);
      if (enabled) {
        newEnabled.add(id);
      } else {
        newEnabled.delete(id);
      }
      onSowStateChange({ ...sowState, enabledSections: Array.from(newEnabled) });
    },
    [enabledSections, sowState, onSowStateChange]
  );

  const handleVariableChange = useCallback(
    (key: string, value: string) => {
      onSowStateChange({
        ...sowState,
        variables: { ...sowState.variables, [key]: value },
      });
    },
    [sowState, onSowStateChange]
  );

  const templateMap = useMemo(
    () => new Map(SOW_SECTION_TEMPLATES.map((s) => [s.id, s])),
    []
  );

  // Determine which variables are used in enabled sections
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
    return generateSowText(sectionOrder, enabled, sowState.variables);
  }, [sectionOrder, enabledSections, sowState.variables, sowState.enabledSections]);

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Scope of Work Sections
          </CardTitle>
          <CardDescription>
            Toggle and drag to reorder the SOW sections. Enabled sections will be included in the generated document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sectionOrder.map((id) => {
                  const tmpl = templateMap.get(id);
                  if (!tmpl) return null;
                  return (
                    <SortableSection
                      key={id}
                      id={id}
                      title={tmpl.title}
                      template={tmpl.template}
                      enabled={enabledSections.has(id)}
                      onToggle={(enabled) => handleToggle(id, enabled)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Variables */}
      {usedVariables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              SOW Variables
            </CardTitle>
            <CardDescription>
              Values auto-filled from your BOM are marked with ⚡. You can override any value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {usedVariables.map((v) => (
                <div key={v.key}>
                  <Label className="flex items-center gap-1.5 text-sm">
                    {v.label}
                    {autoFilledKeys.has(v.key) && (
                      <Zap className="w-3 h-3 text-primary" />
                    )}
                  </Label>
                  <Input
                    value={sowState.variables[v.key] || ''}
                    onChange={(e) => handleVariableChange(v.key, e.target.value)}
                    placeholder={`Enter ${v.label.toLowerCase()}`}
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {previewText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generated Scope of Work Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-line text-foreground max-h-96 overflow-auto">
              {previewText}
            </div>
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
