import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Search, Building2, HardHat } from 'lucide-react';
import {
  getCustomers,
  saveCustomer,
  deleteCustomer,
  getSubcontractors,
  saveSubcontractor,
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

const emptyCustomer = { companyName: '', companyAddress: '', cityStateZip: '', customerName: '', customerEmail: '', customerPhone: '' };
const emptySub = { subcontractorName: '', subcontractorPoC: '', subcontractorEmail: '', subcontractorPhone: '' };

export default function ContactManagerDialog({ open, onOpenChange }: ContactManagerDialogProps) {
  const [customers, setCustomers] = useState<CustomerContact[]>([]);
  const [subs, setSubs] = useState<SubcontractorContact[]>([]);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<'customer' | 'sub' | null>(null);
  const [newCustomer, setNewCustomer] = useState(emptyCustomer);
  const [newSub, setNewSub] = useState(emptySub);

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
            <Button size="sm" variant="outline" className="w-full" onClick={() => setAdding(adding === 'customer' ? null : 'customer')}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Customer
            </Button>

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
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.companyName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[c.customerName, c.customerEmail, c.customerPhone].filter(Boolean).join(' · ')}
                  </p>
                  {c.companyAddress && (
                    <p className="text-xs text-muted-foreground truncate">{c.companyAddress}{c.cityStateZip ? `, ${c.cityStateZip}` : ''}</p>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0">
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
            ))}
          </TabsContent>

          <TabsContent value="subcontractors" className="flex-1 overflow-y-auto space-y-2 mt-2">
            <Button size="sm" variant="outline" className="w-full" onClick={() => setAdding(adding === 'sub' ? null : 'sub')}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Subcontractor
            </Button>

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
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.subcontractorName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[s.subcontractorPoC, s.subcontractorEmail, s.subcontractorPhone].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0">
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
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}