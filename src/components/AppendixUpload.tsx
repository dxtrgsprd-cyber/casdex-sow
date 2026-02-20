import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AppendixUploadProps {
  appendixFileName: string | null;
  onAppendixSelected: (file: File | null, name: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AppendixUpload({
  appendixFileName,
  onAppendixSelected,
  onNext,
  onBack,
}: AppendixUploadProps) {
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onAppendixSelected(file, file.name);
  }, [onAppendixSelected]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-primary" />
            Appendix Document (Optional)
          </CardTitle>
          <CardDescription>
            Upload a Word (.docx) or image (PNG/JPG) to be inserted as pages at the end of each exported SOW
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Drag & drop here, or click to browse
            </p>
            <label>
              <input
                type="file"
                accept=".docx,.png,.jpg,.jpeg,.gif,.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAppendixSelected(file, file.name);
                }}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
            {appendixFileName && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <p className="text-sm font-medium text-primary">✓ {appendixFileName}</p>
                <button
                  onClick={() => onAppendixSelected(null, null)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Continue to Preview →</Button>
      </div>
    </div>
  );
}
