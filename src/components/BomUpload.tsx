import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { parseBomFile } from '@/lib/bomParser';
import type { BomItem, ProjectInfo } from '@/types/sow';

interface BomUploadProps {
  bomItems: BomItem[];
  bomFileName: string | null;
  onBomParsed: (items: BomItem[], scopeText: string, fileName: string, projectInfo: Partial<ProjectInfo>) => void;
  onNext: () => void;
}

export default function BomUpload({ bomItems, bomFileName, onBomParsed, onNext }: BomUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const { items, scopeText, projectInfo } = await parseBomFile(file);
      onBomParsed(items, scopeText, file.name, projectInfo);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [onBomParsed]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Upload BOM File
          </CardTitle>
          <CardDescription>
            Upload your Bill of Materials (.xlsx, .xlsm, .xls) to auto-populate equipment and scope
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
              Drag & drop your BOM file here, or click to browse
            </p>
            <label>
              <input
                type="file"
                accept=".xlsx,.xlsm,.xls"
                onChange={onFileSelect}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
            {bomFileName && (
              <p className="mt-3 text-sm font-medium text-primary">
                ✓ Loaded: {bomFileName}
              </p>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {loading && (
            <p className="mt-4 text-sm text-muted-foreground">Parsing spreadsheet…</p>
          )}
        </CardContent>
      </Card>

      {bomItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parsed Items ({bomItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-20 text-right">Qty</TableHead>
                    <TableHead className="w-32">Part #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bomItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-muted-foreground">{item.partNumber || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={onNext}>Continue to Project Info →</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
