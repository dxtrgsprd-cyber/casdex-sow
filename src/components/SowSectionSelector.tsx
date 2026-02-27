import { useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X } from 'lucide-react';
import { SOW_SECTION_TEMPLATES } from '@/lib/sowTemplates';
import { useState } from 'react';

interface SowSectionSelectorProps {
  sectionOrder: string[];
  enabledSections: string[];
  onSectionOrderChange: (order: string[]) => void;
  onEnabledSectionsChange: (enabled: string[]) => void;
}

const templateMap = new Map(SOW_SECTION_TEMPLATES.map((s) => [s.id, s]));

function SortableInUseItem({ id, index }: { id: string; index: number }) {
  const tmpl = templateMap.get(id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-1.5 rounded border bg-card border-border text-sm group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <span className="text-muted-foreground font-medium text-xs w-5 shrink-0">{index + 1}.</span>
      <span className="flex-1 min-w-0 truncate font-medium text-foreground">{tmpl?.title ?? id}</span>
    </div>
  );
}

function AvailableItem({ id, onAdd }: { id: string; onAdd: (id: string) => void }) {
  const tmpl = templateMap.get(id);
  return (
    <button
      onClick={() => onAdd(id)}
      className="flex items-center gap-2 px-2 py-1.5 rounded border border-dashed border-border/60 bg-muted/30 text-sm w-full text-left hover:bg-muted/60 hover:border-border transition-colors group"
    >
      <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
      <span className="flex-1 min-w-0 truncate text-muted-foreground group-hover:text-foreground">
        {tmpl?.title ?? id}
      </span>
    </button>
  );
}

export default function SowSectionSelector({
  sectionOrder,
  enabledSections,
  onSectionOrderChange,
  onEnabledSectionsChange,
}: SowSectionSelectorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const enabledSet = useMemo(() => new Set(enabledSections), [enabledSections]);

  // In-use items in their display order
  const inUseItems = useMemo(
    () => sectionOrder.filter((id) => enabledSet.has(id)),
    [sectionOrder, enabledSet]
  );

  // Available items (not enabled), preserving template default order
  const availableItems = useMemo(() => {
    const allIds = SOW_SECTION_TEMPLATES.map((s) => s.id);
    return allIds.filter((id) => !enabledSet.has(id));
  }, [enabledSet]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIdx = sectionOrder.indexOf(active.id as string);
      const newIdx = sectionOrder.indexOf(over.id as string);
      if (oldIdx === -1 || newIdx === -1) return;

      onSectionOrderChange(arrayMove(sectionOrder, oldIdx, newIdx));
    },
    [sectionOrder, onSectionOrderChange]
  );

  const handleAdd = useCallback(
    (id: string) => {
      onEnabledSectionsChange([...enabledSections, id]);
    },
    [enabledSections, onEnabledSectionsChange]
  );

  const handleRemove = useCallback(
    (id: string) => {
      onEnabledSectionsChange(enabledSections.filter((s) => s !== id));
    },
    [enabledSections, onEnabledSectionsChange]
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* In Use */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          In Use ({inUseItems.length})
        </h4>
        <div className="border rounded-lg p-2 min-h-[120px] bg-muted/10 space-y-1.5">
          {inUseItems.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Add sections from the right →
            </p>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={inUseItems} strategy={verticalListSortingStrategy}>
              {inUseItems.map((id, idx) => (
                <div key={id} className="flex items-center gap-1">
                  <div className="flex-1 min-w-0">
                    <SortableInUseItem id={id} index={idx} />
                  </div>
                  <button
                    onClick={() => handleRemove(id)}
                    className="shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove section"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Available */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Available ({availableItems.length})
        </h4>
        <div className="border rounded-lg p-2 min-h-[120px] bg-muted/10 space-y-1.5">
          {availableItems.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              All sections in use ✓
            </p>
          )}
          {availableItems.map((id) => (
            <AvailableItem key={id} id={id} onAdd={handleAdd} />
          ))}
        </div>
      </div>
    </div>
  );
}
