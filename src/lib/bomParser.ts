import * as XLSX from 'xlsx';
import type { BomItem } from '@/types/sow';

export function parseBomFile(file: File): Promise<{ items: BomItem[]; scopeText: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
        
        if (jsonData.length === 0) {
          reject(new Error('No data found in spreadsheet'));
          return;
        }

        // Try to identify columns by common header names
        const headers = Object.keys(jsonData[0]);
        const descCol = findColumn(headers, ['description', 'desc', 'item', 'name', 'product', 'material']);
        const qtyCol = findColumn(headers, ['quantity', 'qty', 'count', 'amount']);
        const partCol = findColumn(headers, ['part', 'part number', 'pn', 'sku', 'model', 'part#']);
        const priceCol = findColumn(headers, ['unit price', 'price', 'unit cost', 'cost']);
        const totalCol = findColumn(headers, ['total', 'total price', 'ext price', 'extended', 'line total']);

        const items: BomItem[] = jsonData
          .filter(row => {
            const desc = descCol ? String(row[descCol]).trim() : '';
            return desc.length > 0 && desc !== '';
          })
          .map(row => ({
            description: descCol ? String(row[descCol]).trim() : '',
            quantity: qtyCol ? Number(row[qtyCol]) || 0 : 0,
            partNumber: partCol ? String(row[partCol]).trim() : undefined,
            unitPrice: priceCol ? Number(row[priceCol]) || undefined : undefined,
            totalPrice: totalCol ? Number(row[totalCol]) || undefined : undefined,
          }));

        const scopeText = items
          .map(item => `• ${item.quantity}x ${item.description}${item.partNumber ? ` (${item.partNumber})` : ''}`)
          .join('\n');

        resolve({ items, scopeText });
      } catch (err) {
        reject(new Error('Failed to parse spreadsheet: ' + (err as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

function findColumn(headers: string[], keywords: string[]): string | null {
  for (const header of headers) {
    const lower = header.toLowerCase().trim();
    if (keywords.some(k => lower.includes(k))) {
      return header;
    }
  }
  return null;
}
