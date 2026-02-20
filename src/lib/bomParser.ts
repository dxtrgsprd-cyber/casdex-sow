import * as XLSX from 'xlsx';
import type { BomItem } from '@/types/sow';

function normalizeHeader(header: unknown): string {
  if (!header) return '';
  return String(header)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function parseNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;

  let cleaned = String(value).replace(/\s/g, '').replace(/[R$€$]/g, '');

  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');

  if (lastDot === -1 && lastComma === -1) {
    return parseFloat(cleaned) || null;
  }
  if (lastDot > lastComma) {
    cleaned = cleaned.replace(/,/g, '');
  } else if (lastComma > lastDot) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

const FIELD_KEYWORDS: Record<string, string[]> = {
  description: ['description', 'desc', 'item', 'name', 'product', 'material', 'equipment', 'component', 'line item'],
  quantity: ['quantity', 'qty', 'count', 'amount', 'units'],
  partNumber: ['part', 'part number', 'pn', 'sku', 'model', 'part#', 'catalog', 'mfr', 'manufacturer'],
  unitPrice: ['unit price', 'price', 'unit cost', 'cost', 'each'],
  totalPrice: ['total', 'total price', 'ext price', 'extended', 'line total', 'ext cost', 'extended price'],
};

function matchesField(normalizedHeader: string, fieldKeywords: string[]): boolean {
  return fieldKeywords.some(k => normalizedHeader.includes(k));
}

interface ColumnMap {
  description: number;
  quantity: number;
  partNumber: number;
  unitPrice: number;
  totalPrice: number;
  headerRow: number;
}

function buildColumnMap(sheet: XLSX.WorkSheet): ColumnMap | null {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const maxScanRow = Math.min(range.e.r, 20); // scan up to 20 rows for headers

  for (let row = range.s.r; row <= maxScanRow; row++) {
    const map: Partial<Record<keyof typeof FIELD_KEYWORDS, number>> = {};
    let matchCount = 0;

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = sheet[cellAddr];
      if (!cell) continue;

      const normalized = normalizeHeader(cell.v);
      if (!normalized) continue;

      for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
        if (!map[field as keyof typeof FIELD_KEYWORDS] && matchesField(normalized, keywords)) {
          map[field as keyof typeof FIELD_KEYWORDS] = col;
          matchCount++;
          break;
        }
      }
    }

    // Need at least description OR 2+ fields to consider this a header row
    if (map.description !== undefined || matchCount >= 2) {
      return {
        description: map.description ?? -1,
        quantity: map.quantity ?? -1,
        partNumber: map.partNumber ?? -1,
        unitPrice: map.unitPrice ?? -1,
        totalPrice: map.totalPrice ?? -1,
        headerRow: row,
      };
    }
  }

  return null;
}

export function parseBomFile(file: File): Promise<{ items: BomItem[]; scopeText: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Try each sheet until we find data
        let bestItems: BomItem[] = [];

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const colMap = buildColumnMap(sheet);

          if (!colMap) continue;

          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
          const items: BomItem[] = [];

          for (let row = colMap.headerRow + 1; row <= range.e.r; row++) {
            const getCellValue = (col: number): unknown => {
              if (col < 0) return '';
              const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = sheet[cellAddr];
              return cell ? cell.v : '';
            };

            const descRaw = String(getCellValue(colMap.description)).trim();
            if (!descRaw || descRaw === '' || descRaw === 'undefined') continue;

            // Skip rows that look like subtotals or headers
            const descLower = descRaw.toLowerCase();
            if (descLower.includes('total') && descLower.length < 20) continue;
            if (descLower === 'subtotal' || descLower === 'grand total') continue;

            const qty = parseNumericValue(getCellValue(colMap.quantity));
            const unitPrice = parseNumericValue(getCellValue(colMap.unitPrice));
            const totalPrice = parseNumericValue(getCellValue(colMap.totalPrice));
            const partNumber = colMap.partNumber >= 0
              ? String(getCellValue(colMap.partNumber)).trim()
              : undefined;

            items.push({
              description: descRaw,
              quantity: qty ?? 0,
              partNumber: partNumber && partNumber !== '' && partNumber !== 'undefined' ? partNumber : undefined,
              unitPrice: unitPrice ?? undefined,
              totalPrice: totalPrice ?? undefined,
            });
          }

          if (items.length > bestItems.length) {
            bestItems = items;
          }
        }

        if (bestItems.length === 0) {
          // Fallback: try raw JSON parse of first sheet
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
          
          if (jsonData.length > 0) {
            const items = jsonData
              .filter(row => {
                const vals = Object.values(row).map(v => String(v).trim());
                return vals.some(v => v.length > 2);
              })
              .map(row => {
                const vals = Object.values(row).map(v => String(v).trim());
                return {
                  description: vals.find(v => v.length > 3 && isNaN(Number(v))) || vals[0] || 'Unknown',
                  quantity: parseNumericValue(vals.find(v => !isNaN(Number(v)) && Number(v) > 0)) ?? 1,
                };
              });
            bestItems = items;
          }
        }

        if (bestItems.length === 0) {
          reject(new Error('No items found. Ensure your BOM has a header row with columns like Description, Quantity, Part Number.'));
          return;
        }

        const scopeText = bestItems
          .map(item => `• ${item.quantity}x ${item.description}${item.partNumber ? ` (${item.partNumber})` : ''}`)
          .join('\n');

        resolve({ items: bestItems, scopeText });
      } catch (err) {
        reject(new Error('Failed to parse spreadsheet: ' + (err as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
