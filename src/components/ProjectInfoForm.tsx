import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AutocompleteInput from '@/components/AutocompleteInput';
import type { ProjectInfo, SowBuilderState } from '@/types/sow';
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
  sowState: SowBuilderState;
  onSowStateChange: (state: SowBuilderState) => void;
  onNext: () => void;
  onBack: () => void;
}

const projectFields: { key: keyof ProjectInfo; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'oppNumber', label: 'OPP Number' },
  { key: 'companyName', label: 'Customer Name' },
  { key: 'companyAddress', label: 'Address' },
  { key: 'cityStateZip', label: 'City / State / Zip' },
  { key: 'projectName', label: 'Project Name' },
  { key: 'solutionArchitect', label: 'Solution Architect / Presales Engineer' },
  { key: 'numberOfWorkDays', label: 'Number of Work Days' },
];

const customerFields: { key: keyof ProjectInfo; label: string }[] = [
  { key: 'companyName', label: 'Customer Name' },
  { key: 'installLocation', label: 'Install Location' },
  { key: 'vertical', label: 'Vertical' },
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

export default function ProjectInfoForm({ info, onChange, sowState, onSowStateChange, onNext, onBack }: ProjectInfoFormProps) {
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerContact[]>([]);
  const [subSuggestions, setSubSuggestions] = useState<SubcontractorContact[]>([]);

  const update = (key: keyof ProjectInfo, value: string) => {
    const updated = { ...info, [key]: value };
    // Auto-populate Install Location from Address + City/State/Zip
    if (key === 'companyAddress' || key === 'cityStateZip') {
      const addr = key === 'companyAddress' ? value : info.companyAddress;
      const city = key === 'cityStateZip' ? value : info.cityStateZip;
      updated.installLocation = [addr, city].filter(Boolean).join(', ');
    }
    onChange(updated);
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
        <div key={field.key + field.label}>
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

    if (field.key === 'vertical') {
      const verticals = ['K12', 'HEW', 'BIZ', 'GOV', 'MED'];
      return (
        <div key={field.key}>
          <Label htmlFor={field.key} className="text-xs">{field.label}</Label>
          <Select value={info.vertical} onValueChange={val => update('vertical', val)}>
            <SelectTrigger className="mt-1 h-8 text-sm">
              <SelectValue placeholder="Select vertical" />
            </SelectTrigger>
            <SelectContent>
              {verticals.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            value={String(info[field.key])}
            onChange={e => update(field.key, e.target.value)}
            rows={3}
            className="mt-1 text-sm"
          />
        </div>
      );
    }

    return (
      <div key={field.key + field.label}>
        <Label htmlFor={field.key} className="text-xs">{field.label}</Label>
        <Input
          id={field.key}
          value={String(info[field.key])}
          onChange={e => update(field.key, e.target.value)}
          className="mt-1 h-8 text-sm"
        />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={handleNext}>Continue to SOW →</Button>
      </div>
      {/* Project Box */}
      <div className="rounded-lg border bg-card p-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Project</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {projectFields.map(f => renderField(f))}
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

      {/* Other Info Box */}
      <div className="rounded-lg border bg-card p-3 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Other Info</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Programming */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                id="programmingRequired"
                checked={info.programmingRequired}
                onCheckedChange={checked => onChange({ ...info, programmingRequired: checked })}
              />
              <Label htmlFor="programmingRequired" className="text-xs">Programming Required</Label>
            </div>
            {info.programmingRequired && (
              <div>
                <Label htmlFor="programmingNotes" className="text-xs">Programming Notes (added as appendix)</Label>
                <Textarea
                  id="programmingNotes"
                  value={sowState?.programmingNotes ?? ''}
                  onChange={e => {
                    if (!sowState || !onSowStateChange) return;
                    onSowStateChange({
                      ...sowState,
                      programmingNotes: e.target.value,
                      variables: { ...sowState.variables, PROGRAMMING_DETAILS: e.target.value },
                      customSowText: null,
                    });
                  }}
                  placeholder={`e.g.:\nConfigure IP addresses for all cameras\nUpdate firmware to latest version`}
                  rows={3}
                  className="mt-1 text-sm font-mono"
                />
              </div>
            )}
          </div>

          {/* Lift Needed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                id="liftNeeded"
                checked={info.liftNeeded}
                onCheckedChange={checked => onChange({ ...info, liftNeeded: checked })}
              />
              <Label htmlFor="liftNeeded" className="text-xs">Lift Needed</Label>
            </div>
            {info.liftNeeded && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="liftHeight" className="text-xs">Height of Install</Label>
                  <Input
                    id="liftHeight"
                    value={info.liftHeight}
                    onChange={e => update('liftHeight', e.target.value)}
                    placeholder="e.g. 25"
                    className="h-8 text-sm w-20"
                  />
                  <span className="text-xs text-muted-foreground">ft</span>
                </div>
                <RadioGroup
                  value={info.liftEnvironment}
                  onValueChange={val => onChange({ ...info, liftEnvironment: val as 'indoor' | 'outdoor' })}
                  className="flex gap-3"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="indoor" id="indoor" />
                    <Label htmlFor="indoor" className="text-xs">Indoor</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="outdoor" id="outdoor" />
                    <Label htmlFor="outdoor" className="text-xs">Outdoor</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details: Material List, Notes */}
      <div className="rounded-lg border bg-card p-3 space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Details</h3>
        <div className="grid gap-2">
          <div>
            <Label htmlFor="scope" className="text-xs">Material List</Label>
            <Textarea
              id="scope"
              value={info.scope}
              onChange={e => update('scope', e.target.value)}
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="text-xs">Notes</Label>
            <Textarea
              id="notes"
              value={info.notes}
              onChange={e => update('notes', e.target.value)}
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-1">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={handleNext}>Continue to SOW →</Button>
      </div>
    </div>
  );
}
