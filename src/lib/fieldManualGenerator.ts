/**
 * Field Installation Manual Generator
 * Generates a professional .docx Field Manual from project data + BOM + device knowledge base.
 * Ported from generate_field_manual_gui.js to browser-side TypeScript.
 */
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, VerticalAlign,
  TabStopType, TabStopPosition,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ProjectInfo, BomItem } from '@/types/sow';
import { matchDevicesFromBom, detectSystemType, detectVms } from './deviceKnowledge';
import type { DeviceSpec } from './deviceKnowledge';

// ─── CONSTANTS ───
const PAGE_WIDTH = 12240;
const PAGE_HEIGHT = 15840;
const MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

const HTS_BLUE = '1F4E79';
const HTS_ORANGE = 'E87722';
const HEADER_BG = '1F4E79';
const ROW_ALT = 'F2F7FB';
const WHITE = 'FFFFFF';
const DARK_GRAY = '333333';
const MED_GRAY = '666666';
const BORDER_GRAY = 'CCCCCC';
const WARNING_BG = 'FFF3CD';
const WARNING_BORDER = 'FFCC00';
const CRITICAL_BG = 'F8D7DA';
const CRITICAL_BORDER = 'DC3545';

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

// ─── HELPERS ───
function headerCell(text: string, width: number, opts: { align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: HEADER_BG, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text, bold: true, color: WHITE, font: 'Arial', size: 20 })],
    })],
  });
}

function dataCell(text: string, width: number, opts: { shading?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; bold?: boolean; color?: string; size?: number } = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({
        text,
        font: 'Arial',
        size: opts.size || 20,
        bold: opts.bold || false,
        color: opts.color || DARK_GRAY,
      })],
    })],
  });
}

function checkboxCell(width: number, opts: { shading?: string } = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '\u2610', font: 'Arial', size: 24 })],
    })],
  });
}

function sectionHeading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, font: 'Arial', size: 32, bold: true, color: HTS_BLUE })],
  });
}

function subHeading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: 'Arial', size: 26, bold: true, color: HTS_ORANGE })],
  });
}

function bodyText(text: string, opts: { bold?: boolean; color?: string; noSpace?: boolean } = {}) {
  return new Paragraph({
    spacing: { after: opts.noSpace ? 0 : 120 },
    children: [new TextRun({
      text,
      font: 'Arial',
      size: 20,
      bold: opts.bold || false,
      color: opts.color || DARK_GRAY,
    })],
  });
}

function calloutBox(type: 'CRITICAL' | 'WARNING' | 'NOTE', text: string) {
  const bg = type === 'CRITICAL' ? CRITICAL_BG : WARNING_BG;
  const borderColor = type === 'CRITICAL' ? CRITICAL_BORDER : WARNING_BORDER;
  const leftBorder = { style: BorderStyle.SINGLE, size: 12, color: borderColor };
  const otherBorder = { style: BorderStyle.SINGLE, size: 1, color: borderColor };
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    rows: [new TableRow({
      children: [new TableCell({
        borders: { left: leftBorder, top: otherBorder, bottom: otherBorder, right: otherBorder },
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: [new Paragraph({
          children: [
            new TextRun({ text: `${type}: `, bold: true, font: 'Arial', size: 20, color: borderColor }),
            new TextRun({ text, font: 'Arial', size: 20, color: DARK_GRAY }),
          ],
        })],
      })],
    })],
  });
}

function spacer() {
  return new Paragraph({ spacing: { before: 0, after: 0 }, children: [] });
}

function numberedItem(text: string, ref: string) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: 'Arial', size: 20, color: DARK_GRAY })],
  });
}

function bulletItem(text: string, ref: string) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: 'Arial', size: 20, color: DARK_GRAY })],
  });
}

// ─── BOM TABLE ───
const bomColWidths = [600, 500, 500, 1200, 1800, 3560, 1200];

function bomHeaderRow() {
  const labels = ['\u2713', '#', 'Qty', 'Vendor', 'P/N', 'Description', 'Notes'];
  return new TableRow({
    children: labels.map((l, i) =>
      headerCell(l, bomColWidths[i], { align: i < 3 ? AlignmentType.CENTER : AlignmentType.LEFT })
    ),
  });
}

function bomDataRow(line: string, qty: string, vendor: string, pn: string, desc: string, alt: boolean) {
  const bg = alt ? ROW_ALT : undefined;
  return new TableRow({
    children: [
      checkboxCell(bomColWidths[0], { shading: bg }),
      dataCell(line, bomColWidths[1], { shading: bg, align: AlignmentType.CENTER }),
      dataCell(qty, bomColWidths[2], { shading: bg, align: AlignmentType.CENTER }),
      dataCell(vendor, bomColWidths[3], { shading: bg }),
      dataCell(pn, bomColWidths[4], { shading: bg, bold: true }),
      dataCell(desc, bomColWidths[5], { shading: bg }),
      dataCell('', bomColWidths[6], { shading: bg }),
    ],
  });
}

// ─── QC TABLE ───
const qcColWidths = [600, 5960, 2800];
function qcRow(item: string, spec: string, alt: boolean) {
  const bg = alt ? ROW_ALT : undefined;
  return new TableRow({
    children: [
      checkboxCell(qcColWidths[0], { shading: bg }),
      dataCell(item, qcColWidths[1], { shading: bg }),
      dataCell(spec, qcColWidths[2], { shading: bg }),
    ],
  });
}

// ─── TROUBLESHOOTING TABLE ───
const tsColWidths = [3680, 5680];
function tsRow(problem: string, fix: string, alt: boolean) {
  const bg = alt ? ROW_ALT : undefined;
  return new TableRow({
    children: [
      dataCell(problem, tsColWidths[0], { shading: bg, bold: true }),
      dataCell(fix, tsColWidths[1], { shading: bg }),
    ],
  });
}

// ─── DEVICE QUICK REF TABLE ───
const dqrColWidths = [3000, 6360];
function dqrRow(field: string, value: string, alt: boolean) {
  const bg = alt ? ROW_ALT : undefined;
  return new TableRow({
    children: [
      dataCell(field, dqrColWidths[0], { shading: bg, bold: true }),
      dataCell(value, dqrColWidths[1], { shading: bg }),
    ],
  });
}

const soColWidths = [3120, 3120, 3120];

// ─── BUILD DEVICE SECTIONS ───
function buildDeviceQuickRefSections(devices: DeviceSpec[]): (Paragraph | Table)[] {
  if (devices.length === 0) {
    return [
      subHeading('No devices matched from BOM'),
      bodyText('Populate Device Quick Reference manually based on project hardware.', { color: MED_GRAY }),
    ];
  }
  const elements: (Paragraph | Table)[] = [];
  devices.forEach((dev, i) => {
    elements.push(subHeading(`${5}.${i + 1}  ${dev.name}`));
    elements.push(new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: dqrColWidths,
      rows: [
        new TableRow({ children: [headerCell('Field', dqrColWidths[0]), headerCell('Value', dqrColWidths[1])] }),
        dqrRow('Type', dev.type, false),
        dqrRow('Vendor', dev.vendor, true),
        dqrRow('Default IP', dev.defaultIp, false),
        dqrRow('Default Username', dev.defaultUsername, true),
        dqrRow('Default Password', dev.defaultPassword, false),
        dqrRow('Management Ports', dev.managementPorts, true),
        dqrRow('PoE Requirement', dev.poe, false),
        dqrRow('Relay Output', dev.relayOutput, true),
        dqrRow('Communication Protocol', dev.communicationProtocol, false),
        dqrRow('VMS / Platform', dev.vms, true),
        dqrRow('Management URL', dev.managementUrl, false),
      ],
    }));
    elements.push(spacer());
  });
  return elements;
}

function buildInstallInstructionSections(devices: DeviceSpec[]): (Paragraph | Table)[] {
  if (devices.length === 0) {
    return [
      subHeading('6.1  [NODE TYPE]'),
      bodyText('[Populate installation steps per device type]', { color: MED_GRAY }),
    ];
  }
  const elements: (Paragraph | Table)[] = [];
  const installableDevices = devices.filter((d) => d.installNotes.length > 0);
  installableDevices.forEach((dev, i) => {
    elements.push(subHeading(`6.${i + 1}  ${dev.name}`));
    dev.installNotes.forEach((step) => {
      elements.push(numberedItem(step, `install-steps-${i}`));
    });
    if (dev.criticalNotes.length > 0) {
      elements.push(spacer());
      dev.criticalNotes.forEach((note) => {
        elements.push(calloutBox('CRITICAL', note));
      });
    }
    elements.push(spacer());
  });
  return elements;
}

// ─── MAIN GENERATOR ───
export async function generateFieldManual(
  info: ProjectInfo,
  bomItems: BomItem[],
  scopeOfWork: string
): Promise<Blob> {
  // Match devices from BOM
  const devices = matchDevicesFromBom(bomItems);
  const systemType = info.systemType || detectSystemType(devices);
  const vms = info.vms || detectVms(devices);

  // Map fields
  const oppNumber = info.oppNumber || 'OPP-XXXXXX';
  const projectName = info.projectName || 'PROJECT NAME';
  const siteName = info.siteName || info.installLocation || info.companyAddress || 'SITE';
  const customerName = info.companyName || 'CUSTOMER';
  const siteAddress = info.companyAddress ? `${info.companyAddress}, ${info.cityStateZip}`.replace(/,\s*$/, '') : 'SITE ADDRESS';
  const engineerName = info.solutionArchitect || '';
  const revision = info.revision || 'V1';
  const pocName = info.customerName || '';
  const pocPhone = info.customerPhone || '';
  const pocEmail = info.customerEmail || '';
  const pmName = info.pmName || '';
  const pmPhone = info.pmPhone || '';
  const pmEmail = info.pmEmail || '';
  const estimatedDuration = info.numberOfWorkDays || 'TBD';
  const projectDate = info.date || new Date().toLocaleDateString('en-US');
  const summary = scopeOfWork
    ? scopeOfWork.split('\n').slice(0, 3).join(' ').substring(0, 300)
    : 'Refer to Statement of Work for project details.';

  // Build BOM rows
  const bomRows = bomItems.length > 0
    ? bomItems.map((item, i) =>
        bomDataRow(
          String(i + 1),
          String(item.quantity),
          item.vendor || '',
          item.partNumber || '',
          item.description,
          i % 2 === 1
        )
      )
    : Array.from({ length: 6 }, (_, i) =>
        bomDataRow(String(i + 1), '', '', '', '', i % 2 === 1)
      );

  // Build numbering configs
  const numberingConfigs = [
    'mobilization-steps',
    ...devices.map((_, i) => `install-steps-${i}`),
  ].map((ref) => ({
    reference: ref,
    levels: [{
      level: 0,
      format: LevelFormat.DECIMAL,
      text: '%1.',
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  }));

  const bulletConfigs = ['bullets-reporting', 'bullets-change', 'bullets-safety'].map((ref) => ({
    reference: ref,
    levels: [{
      level: 0,
      format: LevelFormat.BULLET,
      text: '\u2022',
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  }));

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 20 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Arial', color: HTS_BLUE }, paragraph: { spacing: { before: 360, after: 200 } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, font: 'Arial', color: HTS_ORANGE }, paragraph: { spacing: { before: 240, after: 120 } } },
      ],
    },
    numbering: { config: [...numberingConfigs, ...bulletConfigs] },
    sections: [
      // ── COVER PAGE ──
      {
        properties: { page: { size: { width: PAGE_WIDTH, height: PAGE_HEIGHT }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
        children: [
          spacer(), spacer(), spacer(), spacer(),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'HOWARD TECHNOLOGY SOLUTIONS', font: 'Arial', size: 40, bold: true, color: HTS_BLUE })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: 'Professional Services', font: 'Arial', size: 28, color: HTS_ORANGE })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: HTS_BLUE, space: 1 } }, children: [] }),
          spacer(),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: projectDate, font: 'Arial', size: 24, color: MED_GRAY })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: projectName, font: 'Arial', size: 36, bold: true, color: HTS_BLUE })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: siteName, font: 'Arial', size: 24, color: MED_GRAY })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Field Installation Manual', font: 'Arial', size: 32, bold: true, color: HTS_ORANGE })] }),
          spacer(),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: oppNumber, font: 'Arial', size: 28, bold: true, color: HTS_ORANGE })] }),
          spacer(), spacer(),
          new Table({
            width: { size: 6000, type: WidthType.DXA }, columnWidths: [2400, 3600],
            rows: [
              new TableRow({ children: [dataCell('Customer:', 2400, { bold: true }), dataCell(customerName, 3600)] }),
              new TableRow({ children: [dataCell('Address:', 2400, { bold: true }), dataCell(siteAddress, 3600)] }),
              new TableRow({ children: [dataCell('Engineer:', 2400, { bold: true }), dataCell(engineerName, 3600)] }),
              new TableRow({ children: [dataCell('Revision:', 2400, { bold: true }), dataCell(revision, 3600)] }),
              new TableRow({ children: [dataCell('Onsite PoC:', 2400, { bold: true }), dataCell(pocName, 3600)] }),
              new TableRow({ children: [dataCell('PoC Phone:', 2400, { bold: true }), dataCell(pocPhone, 3600)] }),
            ],
          }),
          spacer(), spacer(),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'INTERNAL USE ONLY', font: 'Arial', size: 20, bold: true, color: CRITICAL_BORDER, italics: true })] }),
        ],
      },
      // ── MAIN CONTENT ──
      {
        properties: { page: { size: { width: PAGE_WIDTH, height: PAGE_HEIGHT }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
        headers: {
          default: new Header({
            children: [new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: HTS_BLUE, space: 4 } },
              children: [
                new TextRun({ text: `${oppNumber}  |  Field Installation Manual`, font: 'Arial', size: 16, color: MED_GRAY }),
                new TextRun({ text: '\tINTERNAL USE ONLY', font: 'Arial', size: 16, color: CRITICAL_BORDER, bold: true, italics: true }),
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: HTS_BLUE, space: 4 } },
              children: [
                new TextRun({ text: 'Howard Technology Solutions  |  Field Installation Manual', font: 'Arial', size: 16, color: MED_GRAY }),
                new TextRun({ text: '\t', font: 'Arial', size: 16 }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, color: MED_GRAY }),
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            })],
          }),
        },
        children: [
          // §1 Project Overview
          sectionHeading('1  |  Project Overview'),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [2800, 6560],
            rows: [
              new TableRow({ children: [headerCell('Field', 2800), headerCell('Detail', 6560)] }),
              new TableRow({ children: [dataCell('OPP Number', 2800, { bold: true }), dataCell(oppNumber, 6560)] }),
              new TableRow({ children: [dataCell('Project Name', 2800, { bold: true, shading: ROW_ALT }), dataCell(projectName, 6560, { shading: ROW_ALT })] }),
              ...(systemType ? [new TableRow({ children: [dataCell('System Type', 2800, { bold: true }), dataCell(systemType, 6560)] })] : []),
              new TableRow({ children: [dataCell('Customer', 2800, { bold: true, shading: ROW_ALT }), dataCell(customerName, 6560, { shading: ROW_ALT })] }),
              new TableRow({ children: [dataCell('Site Address', 2800, { bold: true }), dataCell(siteAddress, 6560)] }),
              new TableRow({ children: [dataCell('Estimated Duration', 2800, { bold: true, shading: ROW_ALT }), dataCell(`${estimatedDuration} business days`, 6560, { shading: ROW_ALT })] }),
              ...(pmName ? [new TableRow({ children: [dataCell('HTS Project Manager', 2800, { bold: true }), dataCell(`${pmName}${pmPhone ? ' | ' + pmPhone : ''}${pmEmail ? ' | ' + pmEmail : ''}`, 6560)] })] : []),
              new TableRow({ children: [dataCell('HTS Engineer', 2800, { bold: true, shading: ROW_ALT }), dataCell(engineerName, 6560, { shading: ROW_ALT })] }),
              ...(pocName ? [new TableRow({ children: [dataCell('Customer PoC', 2800, { bold: true }), dataCell(`${pocName}${pocPhone ? ' | ' + pocPhone : ''}${pocEmail ? ' | ' + pocEmail : ''}`, 6560)] })] : []),
              ...(vms ? [new TableRow({ children: [dataCell('VMS / Platform', 2800, { bold: true, shading: ROW_ALT }), dataCell(vms, 6560, { shading: ROW_ALT })] })] : []),
            ],
          }),
          spacer(),
          bodyText('Summary:'),
          bodyText(summary, { color: MED_GRAY }),
          spacer(),
          calloutBox('NOTE', 'All project-related decisions are made solely by the assigned HTS Project Manager. Subcontractor shall not make any changes according to Customer directives. All Customer requests must be referred to the HTS Project Manager.'),
          spacer(),

          // §2 First Day Site Mobilization
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('2  |  First Day Site Mobilization'),
          bodyText('Arrive on-site between 8-10 AM on the first day of installation. Upon arrival:', { bold: true }),
          spacer(),
          ...['Check in with the Customer\u2019s designated Point of Contact (PoC)',
            'Present equipment list, SOW, and this Field Manual for review',
            'Verify all installation locations match the Hardware Schedule',
            'Address any questions the Customer PoC may have regarding the installation',
            'Locate and verify all equipment is on-site. Inventory against BOM Checklist (Section 3)',
            'Notify PM immediately and document any missing, damaged, or incorrect equipment',
            'Confirm network readiness: IP addresses, VLANs, PoE switch ports, and power availability',
            'Identify trash disposal location designated by the Customer',
            'Take pre-install photos of all installation locations',
          ].map((text) => numberedItem(text, 'mobilization-steps')),
          spacer(),
          calloutBox('CRITICAL', 'Do NOT begin installation until all equipment has been verified and installation locations have been confirmed with the Customer PoC. Document any discrepancies before proceeding.'),
          spacer(),

          // §3 BOM Checklist
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('3  |  BOM Checklist'),
          bodyText('Verify all materials against this list upon arrival. Check each item as confirmed on-site.'),
          spacer(),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: bomColWidths,
            rows: [bomHeaderRow(), ...bomRows],
          }),
          spacer(),

          // §4 Device Quick Reference (auto-populated from knowledge base)
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('4  |  Device Quick Reference'),
          bodyText('Quick reference specs for each device type in this project.'),
          spacer(),
          ...buildDeviceQuickRefSections(devices),

          // §5 Installation Instructions (auto-populated from knowledge base)
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('5  |  Installation Instructions'),
          bodyText('Follow these steps per device type. All hardware installed per manufacturer specifications.'),
          spacer(),
          ...buildInstallInstructionSections(devices),

          // §6 Wiring & Connection Reference
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('6  |  Wiring & Connection Reference'),
          subHeading('6.1  OSDP Wiring Standard'),
          bodyText('RS-485: A(+), B(-), +V (power), GND — 4 wire from reader to controller'),
          bodyText('Cat6: T568B termination standard'),
          bodyText('NEC: Maintain AC/LV separation at all times'),
          bodyText('Cable max: Cat6 = 100m (328ft) from switch to device'),
          spacer(),
          bodyText('[Populate cable schedule, relay wiring, PoE budget, surge protection, and enclosure layout per project.]', { color: MED_GRAY }),
          spacer(),

          // §7 Network & Configuration
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('7  |  Network & Configuration'),
          bodyText('[Populate IP assignments, platform config, and security settings per project.]', { color: MED_GRAY }),
          spacer(),

          // §8 Quality Control Checklist
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('8  |  Quality Control Checklist'),
          bodyText('Complete all items before requesting customer walkthrough.'),
          spacer(),
          subHeading('8.1  Installation Verification'),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: qcColWidths,
            rows: [
              new TableRow({ children: [headerCell('\u2713', qcColWidths[0], { align: AlignmentType.CENTER }), headerCell('Item', qcColWidths[1]), headerCell('Detail / Spec', qcColWidths[2])] }),
              qcRow('All hardware mounted per manufacturer specs', 'Verify mounting height, orientation, fasteners', false),
              qcRow('No exposed wiring or connections', 'All cables properly routed and secured', true),
              qcRow('Weatherproofing applied where needed', 'Outdoor enclosures, conduit entries sealed', false),
              qcRow('Hardware matches approved Hardware Schedule', 'Verify every installed device against BOM', true),
              qcRow('All penetrations sealed and protected', 'Fire-stop, weatherproof as required', false),
            ],
          }),
          spacer(),
          subHeading('8.2  System Functionality'),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: qcColWidths,
            rows: [
              new TableRow({ children: [headerCell('\u2713', qcColWidths[0], { align: AlignmentType.CENTER }), headerCell('Item', qcColWidths[1]), headerCell('Detail / Spec', qcColWidths[2])] }),
              qcRow('All devices online in management platform', vms ? `Verified in ${vms}` : 'Verified in VMS', false),
              qcRow('Credential read tested at every access point', 'Card/fob/tag successfully reads', true),
              qcRow('Lock release confirmed', 'Lock engages and disengages correctly', false),
              qcRow('Video feed verified (if applicable)', 'Camera aim and image quality confirmed', true),
              qcRow('Firmware updated to latest supported version', 'Version number recorded', false),
              qcRow('Commissioning completed per PM direction', 'All programming and config verified', true),
            ],
          }),
          spacer(),

          // §9 Troubleshooting
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('9  |  Troubleshooting'),
          bodyText('Common field issues and resolutions. Escalate to PM if not resolved within 30 minutes.'),
          spacer(),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: tsColWidths,
            rows: [
              new TableRow({ children: [headerCell('Problem', tsColWidths[0]), headerCell('Fix', tsColWidths[1])] }),
              tsRow('Device not found on network', 'Confirm same subnet. Check PoE link light. Try direct connection.', false),
              tsRow('Cannot access web UI', 'Confirm IP via device manager. Use http:// not https://. Check port.', true),
              tsRow('Reader not communicating', 'Verify OSDP wiring (A/B, +V, GND). Check for reversed polarity.', false),
              tsRow('Lock / gate not releasing', 'Verify relay wiring. Check N.C./N.O. Confirm DC 12V connected.', true),
              tsRow('Camera image blurry', 'Check focus ring. Clean lens. Verify mounting angle matches design.', false),
              tsRow('Intercom no audio', 'Check SIP config. Verify network connectivity. Test with local call.', true),
              tsRow('PoE device not powering on', 'Verify switch port PoE enabled. Check cable run length (<100m). Try different port.', false),
              tsRow('Intermittent connectivity', 'Check cable terminations. Test with cable tester. Check for EMI near AC lines.', true),
            ],
          }),
          spacer(),
          calloutBox('WARNING', 'If you encounter conditions not covered in this guide, STOP work and contact the HTS Project Manager immediately.'),
          spacer(),

          // §10 Daily Reporting
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('10  |  Daily Reporting & Documentation'),
          bodyText('Submit the following to the HTS Project Manager at the end of each work day:'),
          spacer(),
          ...['Summary of work completed', 'Summary of work remaining', 'Issues, RFIs, or field conditions', 'Photo documentation', 'Equipment / material status'].map((text) => bulletItem(text, 'bullets-reporting')),
          spacer(),

          // §11 Change Management
          sectionHeading('11  |  Change Management & Field Conditions'),
          bodyText('If you encounter any condition that differs from the SOW or Hardware Schedule:'),
          spacer(),
          ...['STOP work on the affected task immediately', 'Document the condition with photos and written description', 'Notify the HTS Project Manager and await authorization', 'Do NOT proceed without written PM approval'].map((text) => bulletItem(text, 'bullets-change')),
          spacer(),

          // §12 Safety
          sectionHeading('12  |  Safety'),
          ...['Follow electrical safety procedures', 'Use PPE as needed', 'Ensure proper ladder safety', 'Maintain NEC separation', 'Report unsafe conditions immediately'].map((text) => bulletItem(text, 'bullets-safety')),
          spacer(),

          // §13 Sign-Off Sheet
          new Paragraph({ children: [new PageBreak()] }),
          sectionHeading('13  |  Sign-Off Sheet'),
          bodyText('This section must be completed upon project completion.'),
          spacer(),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [3120, 6240],
            rows: [
              new TableRow({ children: [headerCell('Field', 3120), headerCell('Detail', 6240)] }),
              new TableRow({ children: [dataCell('Project Completion Date', 3120, { bold: true }), dataCell('', 6240)] }),
              new TableRow({ children: [dataCell('Total Install Days', 3120, { bold: true, shading: ROW_ALT }), dataCell('', 6240, { shading: ROW_ALT })] }),
            ],
          }),
          spacer(),
          subHeading('Installer Verification'),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: soColWidths,
            rows: [
              new TableRow({ children: [headerCell('Installer Name', soColWidths[0]), headerCell('Signature', soColWidths[1]), headerCell('Date', soColWidths[2])] }),
              new TableRow({ children: [dataCell('', soColWidths[0]), dataCell('', soColWidths[1]), dataCell('', soColWidths[2])] }),
            ],
          }),
          spacer(),
          subHeading('Customer Acceptance'),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: soColWidths,
            rows: [
              new TableRow({ children: [headerCell('Customer PoC Name', soColWidths[0]), headerCell('Signature', soColWidths[1]), headerCell('Date', soColWidths[2])] }),
              new TableRow({ children: [dataCell('', soColWidths[0]), dataCell('', soColWidths[1]), dataCell('', soColWidths[2])] }),
            ],
          }),
          spacer(), spacer(),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 400 },
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: HTS_BLUE, space: 8 } },
            children: [new TextRun({ text: 'END OF FIELD INSTALLATION MANUAL', font: 'Arial', size: 20, bold: true, color: HTS_BLUE })],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function downloadFieldManual(
  info: ProjectInfo,
  bomItems: BomItem[],
  scopeOfWork: string
) {
  const blob = await generateFieldManual(info, bomItems, scopeOfWork);
  const fileName = `${info.oppNumber || 'Field_Manual'}_Field_Installation_Manual.docx`;
  saveAs(blob, fileName);
}
