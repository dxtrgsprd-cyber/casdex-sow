import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Search, Building2, HardHat, Upload, Pencil, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getCustomers,
  saveCustomer,
  updateCustomer,
  deleteCustomer,
  getSubcontractors,
  saveSubcontractor,
  updateSubcontractor,
  deleteSubcontractor,
  type CustomerContact,
  type SubcontractorContact,
} from '@/lib/contactDatabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ContactManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VERTICALS = ['K12', 'HED', 'BIZ', 'GOV', 'MED'];
const emptyCustomer = { companyName: '', companyAddress: '', cityStateZip: '', customerName: '', customerEmail: '', customerPhone: '', vertical: '' };
const emptySub = { subcontractorName: '', subcontractorPoC: '', subcontractorEmail: '', subcontractorPhone: '' };

export default function ContactManagerDialog({ open, onOpenChange }: ContactManagerDialogProps) {
  const [customers, setCustomers] = useState<CustomerContact[]>([]);
  const [subs, setSubs] = useState<SubcontractorContact[]>([]);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<'customer' | 'sub' | null>(null);
  const [newCustomer, setNewCustomer] = useState(emptyCustomer);
  const [newSub, setNewSub] = useState(emptySub);
  const [editingCustomer, setEditingCustomer] = useState<CustomerContact | null>(null);
  const [editingCustomerForm, setEditingCustomerForm] = useState(emptyCustomer);
  const [editingSub, setEditingSub] = useState<SubcontractorContact | null>(null);
  const [editingSubForm, setEditingSubForm] = useState(emptySub);

  const refresh = useCallback(() => {
    setCustomers(getCustomers());
    setSubs(getSubcontractors());
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const filteredCustomers = search.trim()
    ? customers.filter(c => c.companyName.toLowerCase().includes(search.toLowerCase()) || c.customerName.toLowerCase().includes(search.toLowerCase()))
    : customers;

  const filteredSubs = search.trim()
    ? subs.filter(s => s.subcontractorName.toLowerCase().includes(search.toLowerCase()) || s.subcontractorPoC.toLowerCase().includes(search.toLowerCase()))
    : subs;

  const handleAddCustomer = () => {
    if (!newCustomer.companyName.trim()) return;
    saveCustomer(newCustomer);
    setNewCustomer(emptyCustomer);
    setAdding(null);
    refresh();
    toast.success('Customer added');
  };

  const handleAddSub = () => {
    if (!newSub.subcontractorName.trim()) return;
    saveSubcontractor(newSub);
    setNewSub(emptySub);
    setAdding(null);
    refresh();
    toast.success('Subcontractor added');
  };

  const handleDeleteCustomer = (id: string) => {
    deleteCustomer(id);
    refresh();
    toast.success('Customer deleted');
  };

  const handleDeleteSub = (id: string) => {
    deleteSubcontractor(id);
    refresh();
    toast.success('Subcontractor deleted');
  };

  const startEditCustomer = (c: CustomerContact) => {
    setEditingCustomer(c);
    setEditingCustomerForm({ companyName: c.companyName, companyAddress: c.companyAddress, cityStateZip: c.cityStateZip, customerName: c.customerName, customerEmail: c.customerEmail, customerPhone: c.customerPhone, vertical: c.vertical ?? '' });
    setAdding(null);
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer) return;
    updateCustomer(editingCustomer.id, editingCustomerForm);
    setEditingCustomer(null);
    refresh();
    toast.success('Customer updated');
  };

  const startEditSub = (s: SubcontractorContact) => {
    setEditingSub(s);
    setEditingSubForm({ subcontractorName: s.subcontractorName, subcontractorPoC: s.subcontractorPoC, subcontractorEmail: s.subcontractorEmail, subcontractorPhone: s.subcontractorPhone });
    setAdding(null);
  };

  const handleUpdateSub = () => {
    if (!editingSub) return;
    updateSubcontractor(editingSub.id, editingSubForm);
    setEditingSub(null);
    refresh();
    toast.success('Subcontractor updated');
  };

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let current = '';
    let inQuotes = false;
    let row: string[] = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { row.push(current.trim()); current = ''; }
        else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && text[i + 1] === '\n') i++;
          row.push(current.trim()); current = '';
          if (row.some(c => c)) rows.push(row);
          row = [];
        } else { current += ch; }
      }
    }
    row.push(current.trim());
    if (row.some(c => c)) rows.push(row);
    return rows;
  };

  const handleExportTemplate = (type: 'customer' | 'sub') => {
    const headers = type === 'customer'
      ? 'companyName,companyAddress,cityStateZip,customerName,customerEmail,customerPhone,vertical'
      : 'companyName,companyAddress,cityStateZip,customerName,customerEmail,customerPhone';
    const blob = new Blob([headers + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'customer' ? 'customer_import_template.csv' : 'subcontractor_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (type: 'customer' | 'sub') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const rows = parseCSV(text);
        if (rows.length < 2) { toast.error('CSV must have a header row and at least one data row'); return; }
        const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
        const dataRows = rows.slice(1);
        let count = 0;

        if (type === 'customer') {
          const colMap = {
            company: headers.findIndex(h => (h.includes('company') && h.includes('name')) || h === 'company'),
            address: headers.findIndex(h => h.includes('address') && !h.includes('city') && !h.includes('state') && !h.includes('zip') && !h.includes('email')),
            cityStateZip: headers.findIndex(h => h.includes('city') || h.includes('state') || h.includes('zip')),
            name: headers.findIndex(h => (h.includes('contact') || h.includes('poc') || (h.includes('customer') && h.includes('name'))) && !h.includes('company')),
            email: headers.findIndex(h => h.includes('email')),
            phone: headers.findIndex(h => h.includes('phone')),
          };
          if (colMap.company < 0) colMap.company = 0;
          for (const row of dataRows) {
            const companyName = row[colMap.company] || '';
            if (!companyName) continue;
            saveCustomer({
              companyName,
              companyAddress: colMap.address >= 0 ? (row[colMap.address] || '') : '',
              cityStateZip: colMap.cityStateZip >= 0 ? (row[colMap.cityStateZip] || '') : '',
              customerName: colMap.name >= 0 ? (row[colMap.name] || '') : '',
              customerEmail: colMap.email >= 0 ? (row[colMap.email] || '') : '',
              customerPhone: colMap.phone >= 0 ? (row[colMap.phone] || '') : '',
            });
            count++;
          }
        } else {
          const colMap = {
            name: headers.findIndex(h => h.includes('company') || h.includes('subcontractor') || h.includes('name')),
            poc: headers.findIndex(h => h.includes('contact') || h.includes('poc')),
            email: headers.findIndex(h => h.includes('email')),
            phone: headers.findIndex(h => h.includes('phone')),
          };
          if (colMap.name < 0) colMap.name = 0;
          for (const row of dataRows) {
            const subName = row[colMap.name] || '';
            if (!subName) continue;
            saveSubcontractor({
              subcontractorName: subName,
              subcontractorPoC: colMap.poc >= 0 ? (row[colMap.poc] || '') : '',
              subcontractorEmail: colMap.email >= 0 ? (row[colMap.email] || '') : '',
              subcontractorPhone: colMap.phone >= 0 ? (row[colMap.phone] || '') : '',
            });
            count++;
          }
        }
        refresh();
        toast.success(`Imported ${count} ${type === 'customer' ? 'customers' : 'subcontractors'}`);
      } catch {
        toast.error('Failed to parse CSV file');
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Contact Database</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="customers" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="customers" className="flex-1 gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Customers ({filteredCustomers.length})
            </TabsTrigger>
            <TabsTrigger value="subcontractors" className="flex-1 gap-1.5">
              <HardHat className="w-3.5 h-3.5" />
              Subcontractors ({filteredSubs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="flex-1 overflow-y-auto space-y-2 mt-2">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setAdding(adding === 'customer' ? null : 'customer')}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Customer
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleImportCSV('customer')}>
                <Upload className="w-3.5 h-3.5 mr-1" />
                Import CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExportTemplate('customer')}>
                <Download className="w-3.5 h-3.5 mr-1" />
                Template
              </Button>
            </div>

            {adding === 'customer' && (
              <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Company Name *</Label>
                    <Input value={newCustomer.companyName} onChange={e => setNewCustomer(p => ({ ...p, companyName: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Point of Contact</Label>
                    <Input value={newCustomer.customerName} onChange={e => setNewCustomer(p => ({ ...p, customerName: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Address</Label>
                    <Input value={newCustomer.companyAddress} onChange={e => setNewCustomer(p => ({ ...p, companyAddress: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">City / State / Zip</Label>
                    <Input value={newCustomer.cityStateZip} onChange={e => setNewCustomer(p => ({ ...p, cityStateZip: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input value={newCustomer.customerEmail} onChange={e => setNewCustomer(p => ({ ...p, customerEmail: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={newCustomer.customerPhone} onChange={e => setNewCustomer(p => ({ ...p, customerPhone: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Vertical</Label>
                    <Select value={newCustomer.vertical} onValueChange={val => setNewCustomer(p => ({ ...p, vertical: val }))}>
                      <SelectTrigger className="h-8 text-sm mt-0"><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>{VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setAdding(null); setNewCustomer(emptyCustomer); }}>Cancel</Button>
                  <Button size="sm" onClick={handleAddCustomer} disabled={!newCustomer.companyName.trim()}>Save</Button>
                </div>
              </div>
            )}

            {filteredCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No customers saved yet</p>
            )}

            {filteredCustomers.map(c => (
              <div key={c.id} className="rounded-lg border bg-card">
                {editingCustomer?.id === c.id ? (
                  <div className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Company Name *</Label>
                        <Input value={editingCustomerForm.companyName} onChange={e => setEditingCustomerForm(p => ({ ...p, companyName: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Point of Contact</Label>
                        <Input value={editingCustomerForm.customerName} onChange={e => setEditingCustomerForm(p => ({ ...p, customerName: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Address</Label>
                        <Input value={editingCustomerForm.companyAddress} onChange={e => setEditingCustomerForm(p => ({ ...p, companyAddress: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">City / State / Zip</Label>
                        <Input value={editingCustomerForm.cityStateZip} onChange={e => setEditingCustomerForm(p => ({ ...p, cityStateZip: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input value={editingCustomerForm.customerEmail} onChange={e => setEditingCustomerForm(p => ({ ...p, customerEmail: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Phone</Label>
                        <Input value={editingCustomerForm.customerPhone} onChange={e => setEditingCustomerForm(p => ({ ...p, customerPhone: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Vertical</Label>
                        <Select value={editingCustomerForm.vertical ?? ''} onValueChange={val => setEditingCustomerForm(p => ({ ...p, vertical: val }))}>
                          <SelectTrigger className="h-8 text-sm mt-0"><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>{VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingCustomer(null)}>Cancel</Button>
                      <Button size="sm" onClick={handleUpdateCustomer} disabled={!editingCustomerForm.companyName.trim()}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {c.companyName}
                        {c.vertical && <span className="ml-1.5 text-xs font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded">{c.vertical}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[c.customerName, c.customerEmail, c.customerPhone].filter(Boolean).join(' · ')}
                      </p>
                      {c.companyAddress && (
                        <p className="text-xs text-muted-foreground truncate">{c.companyAddress}{c.cityStateZip ? `, ${c.cityStateZip}` : ''}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => startEditCustomer(c)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
                            <AlertDialogDescription>Remove "{c.companyName}" from the contact database.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCustomer(c.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="subcontractors" className="flex-1 overflow-y-auto space-y-2 mt-2">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setAdding(adding === 'sub' ? null : 'sub')}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Subcontractor
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleImportCSV('sub')}>
                <Upload className="w-3.5 h-3.5 mr-1" />
                Import CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExportTemplate('sub')}>
                <Download className="w-3.5 h-3.5 mr-1" />
                Template
              </Button>
            </div>

            {adding === 'sub' && (
              <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Company Name *</Label>
                    <Input value={newSub.subcontractorName} onChange={e => setNewSub(p => ({ ...p, subcontractorName: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Point of Contact</Label>
                    <Input value={newSub.subcontractorPoC} onChange={e => setNewSub(p => ({ ...p, subcontractorPoC: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input value={newSub.subcontractorEmail} onChange={e => setNewSub(p => ({ ...p, subcontractorEmail: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={newSub.subcontractorPhone} onChange={e => setNewSub(p => ({ ...p, subcontractorPhone: e.target.value }))} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setAdding(null); setNewSub(emptySub); }}>Cancel</Button>
                  <Button size="sm" onClick={handleAddSub} disabled={!newSub.subcontractorName.trim()}>Save</Button>
                </div>
              </div>
            )}

            {filteredSubs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No subcontractors saved yet</p>
            )}

            {filteredSubs.map(s => (
              <div key={s.id} className="rounded-lg border bg-card">
                {editingSub?.id === s.id ? (
                  <div className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Company Name *</Label>
                        <Input value={editingSubForm.subcontractorName} onChange={e => setEditingSubForm(p => ({ ...p, subcontractorName: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Point of Contact</Label>
                        <Input value={editingSubForm.subcontractorPoC} onChange={e => setEditingSubForm(p => ({ ...p, subcontractorPoC: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input value={editingSubForm.subcontractorEmail} onChange={e => setEditingSubForm(p => ({ ...p, subcontractorEmail: e.target.value }))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Phone</Label>
                        <Input value={editingSubForm.subcontractorPhone} onChange={e => setEditingSubForm(p => ({ ...p, subcontractorPhone: e.target.value }))} className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingSub(null)}>Cancel</Button>
                      <Button size="sm" onClick={handleUpdateSub} disabled={!editingSubForm.subcontractorName.trim()}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.subcontractorName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[s.subcontractorPoC, s.subcontractorEmail, s.subcontractorPhone].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => startEditSub(s)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete subcontractor?</AlertDialogTitle>
                            <AlertDialogDescription>Remove "{s.subcontractorName}" from the contact database.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSub(s.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}