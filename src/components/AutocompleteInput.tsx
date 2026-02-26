import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: { label: string; sublabel?: string }[];
  onSelect: (index: number) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AutocompleteInput({
  id,
  value,
  onChange,
  suggestions,
  onSelect,
  onSearch,
  placeholder,
  className,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (val: string) => {
    onChange(val);
    onSearch(val);
    setOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      onSelect(highlightedIndex);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => { onSearch(value); setOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn('mt-1.5', className)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                i === highlightedIndex && 'bg-accent text-accent-foreground'
              )}
              onMouseDown={(e) => { e.preventDefault(); onSelect(i); setOpen(false); }}
            >
              <span className="font-medium">{s.label}</span>
              {s.sublabel && (
                <span className="text-muted-foreground ml-2 text-xs">{s.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
