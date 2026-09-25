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
  partNumber: ['part', 'part number', 'p/n', 'pn', 'sku', 'model', 'part#', 'catalog', 'mfr', 'manufacturer'],
  vendor: ['vendor', 'manufacturer', 'mfg', 'brand', 'supplier', 'make'],
  unitPrice: ['unit price', 'price', 'unit cost', 'cost', 'each'],
  totalPrice: ['total', 'total price', 'ext price', 'extended', 'line total', 'ext cost', 'extended price'],
};

function fieldMatchScore(normalizedHeader: string, field: keyof typeof FIELD_KEYWORDS): number {
  if (!normalizedHeader || normalizedHeader.length > 40) return 0;

  const compact = normalizedHeader.replace(/[^a-z0-9]/g, '');
  const exactAliases: Record<keyof typeof FIELD_KEYWORDS, string[]> = {
    description: ['description', 'desc', 'product description', 'material description', 'equipment description'],
    quantity: ['quantity', 'qty', 'qnty', 'units'],
    partNumber: ['part number', 'part no', 'part #', 'p/n', 'pn', 'sku', 'model', 'catalog number'],
    vendor: ['vendor', 'manufacturer', 'mfg', 'brand', 'supplier', 'make'],
    unitPrice: ['unit price', 'unit cost', 'each price', 'each cost'],
    totalPrice: ['total price', 'extended price', 'ext price', 'line total', 'extended cost', 'ext cost'],
  };

  if (exactAliases[field].some((alias) => normalizedHeader === alias)) return 100;
  if (field === 'partNumber' && ['partno', 'partnumber', 'part', 'pn'].includes(compact)) return 95;
  if (field === 'quantity' && compact === 'qty') return 100;
  if (field === 'description' && ['item', 'name', 'product', 'material', 'equipment', 'component', 'lineitem'].includes(compact)) return 20;

  return FIELD_KEYWORDS[field].some((keyword) => normalizedHeader.includes(keyword)) ? 10 : 0;
}

interface ColumnMap {
  description: number;
  quantity: number;
  partNumber: number;
  vendor: number;
  unitPrice: number;
  totalPrice: number;
  headerRow: number;
}

function buildColumnMap(sheet: XLSX.WorkSheet): ColumnMap | null {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const maxScanRow = Math.min(range.e.r, 200);
  let best: ColumnMap | null = null;
  let bestScore = -1;

  for (let row = range.s.r; row <= maxScanRow; row++) {
    const map: Partial<Record<keyof typeof FIELD_KEYWORDS, number>> = {};
    const scores: Partial<Record<keyof typeof FIELD_KEYWORDS, number>> = {};

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = sheet[cellAddr];
      if (!cell) continue;

      const normalized = normalizeHeader(cell.v);
      if (!normalized) continue;

      for (const field of Object.keys(FIELD_KEYWORDS) as Array<keyof typeof FIELD_KEYWORDS>) {
        const score = fieldMatchScore(normalized, field);
        if (score > (scores[field] ?? 0)) {
          map[field] = col;
          scores[field] = score;
        }
      }
    }

    if (map.description !== undefined && map.quantity !== undefined) {
      const matchCount = Object.keys(map).length;
      const rowScore = Object.values(scores).reduce((sum, score) => sum + (score ?? 0), 0) + matchCount * 25;
      if (rowScore > bestScore) {
        bestScore = rowScore;
        best = {
        description: map.description ?? -1,
        quantity: map.quantity ?? -1,
        partNumber: map.partNumber ?? -1,
        vendor: map.vendor ?? -1,
        unitPrice: map.unitPrice ?? -1,
        totalPrice: map.totalPrice ?? -1,
        headerRow: row,
        };
      }
    }
  }

  return best;
}

/** Extract project info from specific BOM cells */
function extractProjectInfo(sheet: XLSX.WorkSheet): Partial<ProjectInfo> {
  const info: Partial<ProjectInfo> = {};

  const cellVal = (ref: string): string => {
    const cell = sheet[ref];
    return cell ? String(cell.v).trim() : '';
  };

  // OPP # → C4
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

  // City/State/Zip → C8 + C9 combined (BOM splits city and state across two cells)
  const rawC8 = cellVal('C8');
  const rawC9 = cellVal('C9');
  // Skip C9 when C8 already contains it (e.g. "Gulfport, MS" + "MS")
  const c9Dup = rawC9 && new RegExp(`\\b${rawC9.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(rawC8);
  const cityStateZip = [rawC8, c9Dup ? '' : rawC9].filter(Boolean).join(', ');
  if (cityStateZip) info.cityStateZip = cityStateZip;

  if (import.meta.env.DEV) {
    console.log(`[BOM] City/State/Zip parsed (dev only)`);
  }


  // Date → K5, fallback to today
  const dateCell = sheet['K5'];
  const dateVal = cellVal('K5');
  if (dateCell && dateCell.v instanceof Date) {
    info.date = dateCell.v.toLocaleDateString('en-US', { timeZone: 'UTC' });
  } else if (dateVal) {
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
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          cellStyles: false, // reduce attack surface
        });


        let bestItems: BomItem[] = [];
        let extractedInfo: Partial<ProjectInfo> = {};
        const DATA_START_ROW = 19;
        const COL_B = 1;

        // Only use the "Equipment" sheet for everything
        const equipmentSheetName = workbook.SheetNames.find(s => s.toLowerCase() === 'equipment');
        if (!equipmentSheetName) {
          reject(new Error('No "Equipment" sheet found in workbook'));
          return;
        }

        {
          const sheetName = equipmentSheetName;
          const sheet = workbook.Sheets[sheetName];
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

          if (import.meta.env.DEV) {
            console.log(`[BOM] Processing sheet: "${sheetName}"`);
          }

          // Extract project info from Equipment sheet
          extractedInfo = extractProjectInfo(sheet);

          const colMap = buildColumnMap(sheet);
          if (import.meta.env.DEV) {
            console.log(`[BOM] Column map resolved (dev only)`);
          }


          // Determine which column to use for "has data" check
          const descCol = colMap && colMap.description >= 0 ? colMap.description : COL_B;
          const qtyCol = colMap && colMap.quantity >= 0 ? colMap.quantity : 2;
          const partCol = colMap && colMap.partNumber >= 0 ? colMap.partNumber : -1;
          const vendorCol = colMap && colMap.vendor >= 0 ? colMap.vendor : -1;
          const unitPriceCol = colMap && colMap.unitPrice >= 0 ? colMap.unitPrice : -1;
          const totalPriceCol = colMap && colMap.totalPrice >= 0 ? colMap.totalPrice : -1;

          const startRow = colMap ? colMap.headerRow + 1 : DATA_START_ROW;
          const hasDataAtStart = Array.from(
            { length: Math.max(0, range.e.r - startRow + 1) },
            (_, offset) => startRow + offset,
          ).some((row) => {
            const addr = XLSX.utils.encode_cell({ r: row, c: descCol });
            return Boolean(sheet[addr] && String(sheet[addr].v).trim());
          });
          if (!hasDataAtStart) {
            if (import.meta.env.DEV) {
              console.log(`[BOM] Sheet skipped: no data at expected start row`);
            }
          } else {


          const items: BomItem[] = [];
          for (let row = startRow; row <= range.e.r; row++) {
            const getCellValue = (col: number): unknown => {
              if (col < 0) return '';
              const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = sheet[cellAddr];
              return cell ? cell.v : '';
            };

            // Check description column for data (not hardcoded column B)
            const descRaw = String(getCellValue(descCol)).trim();
            if (!descRaw || descRaw === '' || descRaw === 'undefined') continue;

            // Line-number columns are not material descriptions.
            if (/^\d+(?:\.\d+)?$/.test(descRaw)) continue;

            const descLower = descRaw.toLowerCase();
            if (descLower.includes('total') && descLower.length < 20) continue;
            if (descLower === 'subtotal' || descLower === 'grand total') continue;

            const qty = parseNumericValue(getCellValue(qtyCol));
            // A material row must have a real, positive quantity. This also prevents
            // a failed column match from displaying blank zero-quantity rows.
            if (qty === null || qty <= 0) continue;
            const unitPrice = parseNumericValue(getCellValue(unitPriceCol));
            const totalPrice = parseNumericValue(getCellValue(totalPriceCol));
            const partNumber = partCol >= 0
              ? String(getCellValue(partCol)).trim()
              : undefined;
            const vendor = vendorCol >= 0
              ? String(getCellValue(vendorCol)).trim()
              : undefined;

            items.push({
              description: descRaw,
              quantity: qty,
              partNumber: partNumber && partNumber !== '' && partNumber !== 'undefined' ? partNumber : undefined,
              vendor: vendor && vendor !== '' && vendor !== 'undefined' ? vendor : undefined,
              unitPrice: unitPrice ?? undefined,
              totalPrice: totalPrice ?? undefined,
            });
          }
          const MAX_ITEMS = 5000;
          if (items.length > MAX_ITEMS) {
            reject(new Error(`BOM contains too many rows (max ${MAX_ITEMS})`));
            return;
          }
          if (items.length === 0) {
            reject(new Error('No material rows with descriptions and positive quantities were found'));
            return;
          }
          if (import.meta.env.DEV) {
            console.log(`[BOM] Extracted ${items.length} items`);
          }
          bestItems = items;
          }
        }


        const scopeText = bestItems
          .map(item => {
            const parts = [
              `${item.quantity}x`,
              item.vendor || '',
              item.partNumber || '',
              item.description,
            ].filter(Boolean);
            return `• ${parts.join(' - ')}`;
          })
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
