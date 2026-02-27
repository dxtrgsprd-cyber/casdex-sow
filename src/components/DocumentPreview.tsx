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

const docOrder: DocumentType[] = ['SOW_SUB_Quoting', 'SOW_SUB_Project', 'SOW_Customer'];

const docLabels: Record<DocumentType, string> = {
  SOW_Customer: 'Customer SOW',
  SOW_SUB_Quoting: 'RFP SUB',
  SOW_SUB_Project: 'SOW SUB Project',
};

const docDescriptions: Record<DocumentType, string> = {
  SOW_SUB_Quoting: 'RFP send to Sub for Labor Quote',
  SOW_SUB_Project: 'Send this SOW to sub once OPP is Awarded',
  SOW_Customer: 'Final SOW to include with documentation for customer signature',
};

const fieldLabels: Record<string, string> = {
  Project_Name: 'Project Name',
  'OPP Number': 'OPP Number',
  Project_Number: 'Project Number',
  Date: 'Date',
  Customer_Name: 'Customer Name',
  Address: 'Address',
  Point_of_Contact: 'Point of Contact',
  Customer_Email: 'Customer Email',
  Customer_Phone: 'Customer Phone',
  Subcontractor_Name: 'Subcontractor',
  Subcontractor_PoC: 'Subcontractor PoC',
  Subcontractor_Email: 'Subcontractor Email',
  Subcontractor_Phone: 'Subcontractor Phone',
  SOLUTION_ARCHITECT: 'Solution Architect',
  Material_List: 'Material List',
  SCOPE_OF_WORK: 'Scope of Work',
  PROGRAMMING_DETAILS: 'Programming Details',
  Notes: 'Notes',
};

const fieldToInfoKey: Record<string, keyof ProjectInfo> = {
  Project_Name: 'projectName',
  'OPP Number': 'oppNumber',
  Project_Number: 'projectNumber',
  Date: 'date',
  Customer_Name: 'companyName',
  Address: 'companyAddress',
  Point_of_Contact: 'customerName',
  Customer_Email: 'customerEmail',
  Customer_Phone: 'customerPhone',
  Subcontractor_Name: 'subcontractorName',
  Subcontractor_PoC: 'subcontractorPoC',
  Subcontractor_Email: 'subcontractorEmail',
  Subcontractor_Phone: 'subcontractorPhone',
  SOLUTION_ARCHITECT: 'solutionArchitect',
  Material_List: 'scope',
  SCOPE_OF_WORK: 'scopeOfWork',
  PROGRAMMING_DETAILS: 'programmingNotes',
  Notes: 'notes',
};

export default function DocumentPreview({ info, overrides, onOverridesChange, onNext, onBack }: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState<DocumentType>('SOW_SUB_Quoting');

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
          {docOrder.map(dt => (
            <TabsTrigger key={dt} value={dt}>{docLabels[dt]}</TabsTrigger>
          ))}
        </TabsList>

        {docOrder.map(docType => {
          const resolved = getResolvedFields(info, overrides[docType]);
          return (
            <TabsContent key={docType} value={docType}>
              <Card>
                <CardHeader>
                  <CardTitle>{docDescriptions[docType]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(fieldLabels).map(([templateField, label]) => {
                      const infoKey = fieldToInfoKey[templateField];
                      const value = resolved[templateField] || '';
                      const isOverridden = infoKey && overrides[docType][infoKey] !== undefined;
                      const isLong = templateField === 'SCOPE_OF_WORK' || templateField === 'Material_List' || templateField === 'PROGRAMMING_DETAILS' || templateField === 'Notes';

                      return (
                        <div key={templateField} className={isLong ? 'sm:col-span-2' : ''}>
                          <Label className="flex items-center gap-1.5 font-semibold">
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
                              rows={5}
                              className="mt-1 text-sm font-normal leading-tight"
                            />
                          ) : (
                            <Input
                              value={value}
                              onChange={e => handleOverride(docType, templateField, e.target.value)}
                              className="mt-1 font-normal"
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
