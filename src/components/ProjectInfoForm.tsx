import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  { key: 'customerEmail', label: 'Email' },
  { key: 'customerPhone', label: 'Phone' },
];

const subcontractorFields: { key: keyof ProjectInfo; label: string }[] = [
  { key: 'subcontractorName', label: 'Subcontractor' },
  { key: 'subcontractorPoC', label: 'PoC' },
  { key: 'subcontractorEmail', label: 'Email' },
  { key: 'subcontractorPhone', label: 'Phone' },
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
    if (field.key === 'companyName') {
      return (
        <div key={field.key}>
          <Label htmlFor={field.key} className="text-xs">{field.label}</Label>
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

    if (field.key === 'subcontractorName') {
      return (
        <div key={field.key}>
          <Label htmlFor={field.key} className="text-xs">{field.label}</Label>
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
        <div key={field.key} className="sm:col-span-2 lg:col-span-3">
          <Label htmlFor={field.key} className="text-xs">{field.label}</Label>
          <Textarea
            id={field.key}
            value={info[field.key]}
            onChange={e => update(field.key, e.target.value)}
            rows={3}
            className="mt-1 text-sm"
          />
        </div>
      );
    }

    return (
      <div key={field.key}>
        <Label htmlFor={field.key} className="text-xs">{field.label}</Label>
        <Input
          id={field.key}
          value={info[field.key]}
          onChange={e => update(field.key, e.target.value)}
          className="mt-1 h-8 text-sm"
        />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Project + HTS row */}
      <div className="rounded-lg border bg-card p-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Project</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {projectFields.map(f => renderField(f))}
        </div>
        <div className="mt-2">
          {renderField(otherFields[0])}
        </div>
      </div>

      {/* Customer + Subcontractor side by side */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Customer
            <span className="font-normal normal-case ml-1.5 text-muted-foreground/70">— type to search saved</span>
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {customerFields.map(f => renderField(f))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Subcontractor
            <span className="font-normal normal-case ml-1.5 text-muted-foreground/70">— type to search saved</span>
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {subcontractorFields.map(f => renderField(f))}
          </div>
        </div>
      </div>

      {/* Text areas */}
      <div className="rounded-lg border bg-card p-3 space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Details</h3>
        <div className="grid gap-2">
          {otherFields.slice(1).map(f => renderField(f))}
        </div>
      </div>

      <div className="flex justify-between pt-1">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={handleNext}>Continue to Appendix →</Button>
      </div>
    </div>
  );
}
