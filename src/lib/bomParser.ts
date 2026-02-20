import * as XLSX from 'xlsx';
import type { BomItem, ProjectInfo } from '@/types/sow';

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
  const maxScanRow = Math.min(range.e.r, 30);

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

/** Extract project info from specific BOM cells */
function extractProjectInfo(sheet: XLSX.WorkSheet): Partial<ProjectInfo> {
  const info: Partial<ProjectInfo> = {};

  const cellVal = (ref: string): string => {
    const cell = sheet[ref];
    return cell ? String(cell.v).trim() : '';
  };

  // OPP # → C4 (row 4, col C = index 2)
  const opp = cellVal('C4');
  if (opp) info.oppNumber = opp;

  // Customer → C5
  const customer = cellVal('C5');
  if (customer) info.companyName = customer;

  // Job Name → C6
  const jobName = cellVal('C6');
  if (jobName) info.projectName = jobName;

  // Solution Architect → C7
  const sa = cellVal('C7');
  if (sa) info.solutionArchitect = sa;

  // City, State → C8, C9
  const city = cellVal('C8');
  const state = cellVal('C9');
  const cityState = [city, state].filter(Boolean).join(', ');
  if (cityState) info.cityStateZip = cityState;

  // Date → K5, fallback to today
  const dateVal = cellVal('K5');
  if (dateVal) {
    info.date = dateVal;
  } else {
    info.date = new Date().toLocaleDateString('en-US');
  }

  return info;
}

export interface BomParseResult {
  items: BomItem[];
  scopeText: string;
  projectInfo: Partial<ProjectInfo>;
}

export function parseBomFile(file: File): Promise<BomParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        let bestItems: BomItem[] = [];
        let extractedInfo: Partial<ProjectInfo> = {};
        const DATA_START_ROW = 19;
        const COL_B = 1;

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

          // Extract project info from the first sheet that has header data
          const sheetInfo = extractProjectInfo(sheet);
          if (Object.keys(sheetInfo).length > Object.keys(extractedInfo).length) {
            extractedInfo = { ...extractedInfo, ...sheetInfo };
          }

          // Check if B20 has data — skip sheet for material list if not
          const b20Addr = XLSX.utils.encode_cell({ r: DATA_START_ROW, c: COL_B });
          const b20Cell = sheet[b20Addr];
          if (!b20Cell || !String(b20Cell.v).trim()) continue;

          const colMap = buildColumnMap(sheet);

          const items: BomItem[] = [];
          const startRow = colMap ? Math.max(colMap.headerRow + 1, DATA_START_ROW) : DATA_START_ROW;

          for (let row = startRow; row <= range.e.r; row++) {
            const getCellValue = (col: number): unknown => {
              if (col < 0) return '';
              const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = sheet[cellAddr];
              return cell ? cell.v : '';
            };

            const colBValue = String(getCellValue(COL_B)).trim();
            if (!colBValue || colBValue === '' || colBValue === 'undefined') continue;

            const descCol = colMap && colMap.description >= 0 ? colMap.description : COL_B;
            const qtyCol = colMap && colMap.quantity >= 0 ? colMap.quantity : 2;
            const partCol = colMap && colMap.partNumber >= 0 ? colMap.partNumber : -1;
            const unitPriceCol = colMap && colMap.unitPrice >= 0 ? colMap.unitPrice : -1;
            const totalPriceCol = colMap && colMap.totalPrice >= 0 ? colMap.totalPrice : -1;

            const descRaw = String(getCellValue(descCol)).trim();
            if (!descRaw || descRaw === '' || descRaw === 'undefined') continue;

            const descLower = descRaw.toLowerCase();
            if (descLower.includes('total') && descLower.length < 20) continue;
            if (descLower === 'subtotal' || descLower === 'grand total') continue;

            const qty = parseNumericValue(getCellValue(qtyCol));
            const unitPrice = parseNumericValue(getCellValue(unitPriceCol));
            const totalPrice = parseNumericValue(getCellValue(totalPriceCol));
            const partNumber = partCol >= 0
              ? String(getCellValue(partCol)).trim()
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

        const scopeText = bestItems
          .map(item => `• ${item.quantity}x ${item.description}${item.partNumber ? ` (${item.partNumber})` : ''}`)
          .join('\n');

        resolve({ items: bestItems, scopeText, projectInfo: extractedInfo });
      } catch (err) {
        reject(new Error('Failed to parse spreadsheet: ' + (err as Error).message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
