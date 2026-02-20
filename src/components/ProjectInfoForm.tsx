import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { ProjectInfo } from '@/types/sow';

interface ProjectInfoFormProps {
  info: ProjectInfo;
  onChange: (info: ProjectInfo) => void;
  onNext: () => void;
  onBack: () => void;
}

const fields: { key: keyof ProjectInfo; label: string; section: string; type?: 'textarea' }[] = [
  { key: 'projectName', label: 'Project Name', section: 'Project' },
  { key: 'oppNumber', label: 'OPP Number', section: 'Project' },
  { key: 'projectNumber', label: 'Project Number', section: 'Project' },
  { key: 'date', label: 'Date', section: 'Project' },
  { key: 'companyName', label: 'Company Name', section: 'Customer' },
  { key: 'companyAddress', label: 'Company Address', section: 'Customer' },
  { key: 'cityStateZip', label: 'City / State / Zip', section: 'Customer' },
  { key: 'customerName', label: 'Customer Name', section: 'Customer' },
  { key: 'customerContact', label: 'Customer Contact', section: 'Customer' },
  { key: 'customerPhone', label: 'Customer Phone', section: 'Customer' },
  { key: 'solutionArchitect', label: 'Solution Architect', section: 'HTS' },
  { key: 'scope', label: 'Material List', section: 'Material List', type: 'textarea' },
  { key: 'notes', label: 'Additional Notes', section: 'Other', type: 'textarea' },
];

export default function ProjectInfoForm({ info, onChange, onNext, onBack }: ProjectInfoFormProps) {
  const sections = [...new Set(fields.map(f => f.section))];

  const update = (key: keyof ProjectInfo, value: string) => {
    onChange({ ...info, [key]: value });
  };

  return (
    <div className="space-y-6">
      {sections.map(section => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="text-lg">{section === 'Material List' ? section : `${section} Information`}</CardTitle>
            {section === 'Material List' && (
              <CardDescription>Auto-populated from BOM. Edit as needed.</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields
                .filter(f => f.section === section)
                .map(field => (
                  <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <Label htmlFor={field.key}>{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.key}
                        value={info[field.key]}
                        onChange={e => update(field.key, e.target.value)}
                        rows={5}
                        className="mt-1.5"
                      />
                    ) : (
                      <Input
                        id={field.key}
                        value={info[field.key]}
                        onChange={e => update(field.key, e.target.value)}
                        className="mt-1.5"
                      />
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Continue to Hardware Schedule →</Button>
      </div>
    </div>
  );
}
