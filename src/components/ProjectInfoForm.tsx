import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import AutocompleteInput from '@/components/AutocompleteInput';
import type { ProjectInfo } from '@/types/sow';
import {
  searchCustomers,
  saveCustomer,
  searchSubcontractors,
  saveSubcontractor,
  type CustomerContact,
  type SubcontractorContact,
} from '@/lib/contactDatabase';

interface ProjectInfoFormProps {
  info: ProjectInfo;
  onChange: (info: ProjectInfo) => void;
  onNext: () => void;
  onBack: () => void;
}

const projectFields: { key: keyof ProjectInfo; label: string }[] = [
  { key: 'projectName', label: 'Project Name' },
  { key: 'oppNumber', label: 'OPP Number' },
  { key: 'projectNumber', label: 'Project Number' },
  { key: 'date', label: 'Date' },
];

const customerFields: { key: keyof ProjectInfo; label: string }[] = [
  { key: 'companyName', label: 'Customer Name' },
  { key: 'companyAddress', label: 'Project Location' },
  { key: 'cityStateZip', label: 'City / State / Zip' },
  { key: 'customerName', label: 'Point of Contact' },
  { key: 'customerEmail', label: 'Customer Email' },
  { key: 'customerPhone', label: 'Customer Phone' },
];

const subcontractorFields: { key: keyof ProjectInfo; label: string }[] = [
  { key: 'subcontractorName', label: 'Subcontractor' },
  { key: 'subcontractorPoC', label: 'Subcontractor PoC' },
  { key: 'subcontractorEmail', label: 'Subcontractor Email' },
  { key: 'subcontractorPhone', label: 'Subcontractor Phone' },
];

const otherFields: { key: keyof ProjectInfo; label: string; type?: 'textarea' }[] = [
  { key: 'solutionArchitect', label: 'Solution Architect' },
  { key: 'scope', label: 'Material List', type: 'textarea' },
  { key: 'scopeOfWork', label: 'Scope of Work', type: 'textarea' },
  { key: 'notes', label: 'Additional Notes', type: 'textarea' },
];

export default function ProjectInfoForm({ info, onChange, onNext, onBack }: ProjectInfoFormProps) {
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerContact[]>([]);
  const [subSuggestions, setSubSuggestions] = useState<SubcontractorContact[]>([]);

  const update = (key: keyof ProjectInfo, value: string) => {
    onChange({ ...info, [key]: value });
  };

  // Auto-save contacts when navigating away
  const saveContacts = useCallback(() => {
    if (info.companyName.trim()) {
      saveCustomer({
        companyName: info.companyName,
        companyAddress: info.companyAddress,
        cityStateZip: info.cityStateZip,
        customerName: info.customerName,
        customerEmail: info.customerEmail,
        customerPhone: info.customerPhone,
      });
    }
    if (info.subcontractorName.trim()) {
      saveSubcontractor({
        subcontractorName: info.subcontractorName,
        subcontractorPoC: info.subcontractorPoC,
        subcontractorEmail: info.subcontractorEmail,
        subcontractorPhone: info.subcontractorPhone,
      });
    }
  }, [info]);

  const handleNext = () => {
    saveContacts();
    onNext();
  };

  const handleSelectCustomer = (index: number) => {
    const c = customerSuggestions[index];
    if (!c) return;
    onChange({
      ...info,
      companyName: c.companyName,
      companyAddress: c.companyAddress,
      cityStateZip: c.cityStateZip,
      customerName: c.customerName,
      customerEmail: c.customerEmail,
      customerPhone: c.customerPhone,
    });
  };

  const handleSelectSubcontractor = (index: number) => {
    const s = subSuggestions[index];
    if (!s) return;
    onChange({
      ...info,
      subcontractorName: s.subcontractorName,
      subcontractorPoC: s.subcontractorPoC,
      subcontractorEmail: s.subcontractorEmail,
      subcontractorPhone: s.subcontractorPhone,
    });
  };

  const renderField = (field: { key: keyof ProjectInfo; label: string; type?: string }) => {
    // Customer Name with autocomplete
    if (field.key === 'companyName') {
      return (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>
          <AutocompleteInput
            id={field.key}
            value={info[field.key]}
            onChange={val => update(field.key, val)}
            suggestions={customerSuggestions.map(c => ({
              label: c.companyName,
              sublabel: c.customerName,
            }))}
            onSelect={handleSelectCustomer}
            onSearch={q => setCustomerSuggestions(searchCustomers(q))}
          />
        </div>
      );
    }

    // Subcontractor Name with autocomplete
    if (field.key === 'subcontractorName') {
      return (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>
          <AutocompleteInput
            id={field.key}
            value={info[field.key]}
            onChange={val => update(field.key, val)}
            suggestions={subSuggestions.map(s => ({
              label: s.subcontractorName,
              sublabel: s.subcontractorPoC,
            }))}
            onSelect={handleSelectSubcontractor}
            onSearch={q => setSubSuggestions(searchSubcontractors(q))}
          />
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="sm:col-span-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Textarea
            id={field.key}
            value={info[field.key]}
            onChange={e => update(field.key, e.target.value)}
            rows={5}
            className="mt-1.5"
          />
        </div>
      );
    }

    return (
      <div key={field.key}>
        <Label htmlFor={field.key}>{field.label}</Label>
        <Input
          id={field.key}
          value={info[field.key]}
          onChange={e => update(field.key, e.target.value)}
          className="mt-1.5"
        />
      </div>
    );
  };

  const sections = [
    { title: 'Project Information', fields: projectFields },
    { title: 'Customer Information', fields: customerFields, description: 'Start typing to search saved customers.' },
    { title: 'Subcontractor Information', fields: subcontractorFields, description: 'Start typing to search saved subcontractors.' },
    { title: 'HTS Information', fields: [otherFields[0]] },
    { title: 'Material List', fields: [otherFields[1]], description: 'Auto-populated from BOM. Edit as needed.' },
    { title: 'Scope of Work', fields: [otherFields[2]], description: 'Paste your Scope of Work narrative here.' },
    { title: 'Other', fields: [otherFields[3]] },
  ];

  return (
    <div className="space-y-6">
      {sections.map(section => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.fields.map(field => renderField(field))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={handleNext}>Continue to Appendix →</Button>
      </div>
    </div>
  );
}
