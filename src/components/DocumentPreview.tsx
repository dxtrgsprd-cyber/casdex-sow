import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getResolvedFields } from '@/lib/documentGenerator';
import type { ProjectInfo, DocumentType, DocumentOverrides } from '@/types/sow';

interface DocumentPreviewProps {
  info: ProjectInfo;
  overrides: DocumentOverrides;
  onOverridesChange: (overrides: DocumentOverrides) => void;
  onNext: () => void;
  onBack: () => void;
}

const docLabels: Record<DocumentType, string> = {
  SOW_Customer: 'SOW Customer',
  SOW_SUB_Quoting: 'SOW SUB Quoting',
  SOW_SUB_Project: 'SOW SUB Project',
};

const fieldLabels: Record<string, string> = {
  Project_Name: 'Project Name',
  'OPP Number': 'OPP Number',
  Project_Number: 'Project Number',
  Date: 'Date',
  Company_Name: 'Customer Name',
  Company_Address: 'Project Location',
  City_State_Zip: 'City / State / Zip',
  Customer_Name: 'Customer Name',
  'Point of Contact': 'Point of Contact',
  Customer_Email: 'Customer Email',
  Customer_Phone: 'Customer Phone',
  SOLUTION_ARCHITECT: 'Solution Architect',
  SCOPE: 'Material List',
  SCOPE_OF_WORK: 'Scope of Work',
  Notes: 'Notes',
};

const fieldToInfoKey: Record<string, keyof ProjectInfo> = {
  Project_Name: 'projectName',
  'OPP Number': 'oppNumber',
  Project_Number: 'projectNumber',
  Date: 'date',
  Company_Name: 'companyName',
  Company_Address: 'companyAddress',
  City_State_Zip: 'cityStateZip',
  Customer_Name: 'companyName',
  'Point of Contact': 'customerName',
  Customer_Email: 'customerEmail',
  Customer_Phone: 'customerPhone',
  SOLUTION_ARCHITECT: 'solutionArchitect',
  SCOPE: 'scope',
  SCOPE_OF_WORK: 'scopeOfWork',
  Notes: 'notes',
};

export default function DocumentPreview({ info, overrides, onOverridesChange, onNext, onBack }: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState<DocumentType>('SOW_Customer');

  const handleOverride = (docType: DocumentType, templateField: string, value: string) => {
    const infoKey = fieldToInfoKey[templateField];
    if (!infoKey) return;

    const newOverrides = { ...overrides };
    if (value === info[infoKey]) {
      // Remove override if it matches the base value
      const { [infoKey]: _, ...rest } = newOverrides[docType];
      newOverrides[docType] = rest;
    } else {
      newOverrides[docType] = { ...newOverrides[docType], [infoKey]: value };
    }
    onOverridesChange(newOverrides);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocumentType)}>
        <TabsList className="grid w-full grid-cols-3">
          {(Object.keys(docLabels) as DocumentType[]).map(dt => (
            <TabsTrigger key={dt} value={dt}>{docLabels[dt]}</TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(docLabels) as DocumentType[]).map(docType => {
          const resolved = getResolvedFields(info, overrides[docType]);
          return (
            <TabsContent key={docType} value={docType}>
              <Card>
                <CardHeader>
                  <CardTitle>{docLabels[docType]} — Preview & Overrides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(fieldLabels).map(([templateField, label]) => {
                      const infoKey = fieldToInfoKey[templateField];
                      const value = resolved[templateField] || '';
                      const isOverridden = infoKey && overrides[docType][infoKey] !== undefined;
                      const isLong = templateField === 'SCOPE' || templateField === 'Notes';

                      return (
                        <div key={templateField} className={isLong ? 'sm:col-span-2' : ''}>
                          <Label className="flex items-center gap-1.5">
                            {label}
                            {isOverridden && (
                              <span className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                                overridden
                              </span>
                            )}
                          </Label>
                          {isLong ? (
                            <Textarea
                              value={value}
                              onChange={e => handleOverride(docType, templateField, e.target.value)}
                              rows={4}
                              className="mt-1.5"
                            />
                          ) : (
                            <Input
                              value={value}
                              onChange={e => handleOverride(docType, templateField, e.target.value)}
                              className="mt-1.5"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Continue to Export →</Button>
      </div>
    </div>
  );
}
