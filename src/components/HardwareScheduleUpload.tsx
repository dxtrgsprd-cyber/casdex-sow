import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HardwareScheduleUploadProps {
  fileName: string | null;
  onFileSelected: (file: File | null, name: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function HardwareScheduleUpload({ fileName, onFileSelected, onNext, onBack }: HardwareScheduleUploadProps) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    onFileSelected(file, file.name);
  }, [onFileSelected]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Hardware Schedule (Optional)
          </CardTitle>
          <CardDescription>
            Upload an additional document to be bundled with SUB_SOW_Quoting and SUB_SOW_Project exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Drag & drop your hardware schedule here, or click to browse
            </p>
            <label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
            {fileName && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <p className="text-sm font-medium text-primary">✓ {fileName}</p>
                <button
                  onClick={() => onFileSelected(null, null)}
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
