/**
 * Local contact database for customers and subcontractors.
 * Stored in localStorage for PWA offline support.
 */

const CUSTOMERS_KEY = 'sow-contacts-customers';
const SUBCONTRACTORS_KEY = 'sow-contacts-subcontractors';

export interface CustomerContact {
  id: string;
  companyName: string;
  companyAddress: string;
  cityStateZip: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vertical?: string;
  installLocation?: string;
  solutionArchitect?: string;
  lastUsed: string;
}

export interface SubcontractorContact {
  id: string;
  subcontractorName: string;
  subcontractorPoC: string;
  subcontractorEmail: string;
  subcontractorPhone: string;
  lastUsed: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ---- Customers ----

export function getCustomers(): CustomerContact[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomer(data: Omit<CustomerContact, 'id' | 'lastUsed'>): CustomerContact {
  const customers = getCustomers();
  // Update existing by companyName match or create new
  const existing = customers.findIndex(
    c => c.companyName.toLowerCase() === data.companyName.toLowerCase()
  );
  const entry: CustomerContact = {
    id: existing >= 0 ? customers[existing].id : generateId(),
    ...data,
    lastUsed: new Date().toISOString(),
  };
  if (existing >= 0) {
    customers[existing] = entry;
  } else {
    customers.unshift(entry);
  }
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  return entry;
}

export function updateCustomer(id: string, data: Omit<CustomerContact, 'id' | 'lastUsed'>) {
  const customers = getCustomers();
  const idx = customers.findIndex(c => c.id === id);
  if (idx < 0) return;
  customers[idx] = { ...customers[idx], ...data, lastUsed: new Date().toISOString() };
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function deleteCustomer(id: string) {
  const customers = getCustomers().filter(c => c.id !== id);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function searchCustomers(query: string): CustomerContact[] {
  const all = getCustomers();
  const q = query.trim().toLowerCase();
  if (!q) return all.slice(0, 12);
  const terms = q.split(/\s+/);

  const scored = all
    .map(c => {
      const name = (c.companyName || '').toLowerCase();
      const contact = (c.customerName || '').toLowerCase();
      const address = `${c.companyAddress || ''} ${c.cityStateZip || ''}`.toLowerCase();
      const location = (c.installLocation || '').toLowerCase();
      const haystack = [name, contact, address, location, (c.vertical || '').toLowerCase()].join(' ');

      // every term must appear somewhere
      if (!terms.every(t => haystack.includes(t))) return null;

      let score = 0;
      if (name.startsWith(q)) score += 100;
      else if (name.includes(q)) score += 60;
      if (contact.includes(q)) score += 30;
      if (address.includes(q)) score += 20;
      if (location.includes(q)) score += 20;
      return { c, score };
    })
    .filter((x): x is { c: CustomerContact; score: number } => x !== null);

  scored.sort(
    (a, b) => b.score - a.score || (b.c.lastUsed || '').localeCompare(a.c.lastUsed || '')
  );
  return scored.slice(0, 12).map(x => x.c);
}

// ---- Subcontractors ----

export function getSubcontractors(): SubcontractorContact[] {
  try {
    const raw = localStorage.getItem(SUBCONTRACTORS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSubcontractor(data: Omit<SubcontractorContact, 'id' | 'lastUsed'>): SubcontractorContact {
  const subs = getSubcontractors();
  const existing = subs.findIndex(
    s => s.subcontractorName.toLowerCase() === data.subcontractorName.toLowerCase()
  );
  const entry: SubcontractorContact = {
    id: existing >= 0 ? subs[existing].id : generateId(),
    ...data,
    lastUsed: new Date().toISOString(),
  };
  if (existing >= 0) {
    subs[existing] = entry;
  } else {
    subs.unshift(entry);
  }
  localStorage.setItem(SUBCONTRACTORS_KEY, JSON.stringify(subs));
  return entry;
}

export function updateSubcontractor(id: string, data: Omit<SubcontractorContact, 'id' | 'lastUsed'>) {
  const subs = getSubcontractors();
  const idx = subs.findIndex(s => s.id === id);
  if (idx < 0) return;
  subs[idx] = { ...subs[idx], ...data, lastUsed: new Date().toISOString() };
  localStorage.setItem(SUBCONTRACTORS_KEY, JSON.stringify(subs));
}

export function deleteSubcontractor(id: string) {
  const subs = getSubcontractors().filter(s => s.id !== id);
  localStorage.setItem(SUBCONTRACTORS_KEY, JSON.stringify(subs));
}

export function searchSubcontractors(query: string): SubcontractorContact[] {
  if (!query.trim()) return getSubcontractors().slice(0, 10);
  const q = query.toLowerCase();
  return getSubcontractors()
    .filter(s =>
      s.subcontractorName.toLowerCase().includes(q) ||
      s.subcontractorPoC.toLowerCase().includes(q)
    )
    .slice(0, 10);
}
