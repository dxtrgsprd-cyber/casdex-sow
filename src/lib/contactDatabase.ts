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

export function deleteCustomer(id: string) {
  const customers = getCustomers().filter(c => c.id !== id);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function searchCustomers(query: string): CustomerContact[] {
  if (!query.trim()) return getCustomers().slice(0, 10);
  const q = query.toLowerCase();
  return getCustomers()
    .filter(c =>
      c.companyName.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q)
    )
    .slice(0, 10);
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
