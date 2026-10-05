import { describe, it, expect } from 'vitest';
import { matchBomToDevices } from '@/lib/deviceKnowledge';
import { buildQcChecks } from '@/lib/fieldManualGenerator';

describe('field manual follows the BOM', () => {
  const bom = [
    { partNumber: 'MV33-HW', description: 'Meraki MV33 camera', quantity: 4 },
    { partNumber: 'MV33M-HW', description: 'Meraki MV33M camera', quantity: 4 },
    { partNumber: 'LIC-MV-3YR', description: 'Meraki MV Enterprise License, 3 Years', quantity: 5 },
    { partNumber: 'XYZ-123', description: 'Unknown widget', quantity: 2 },
  ];
  const r = matchBomToDevices(bom);

  it('groups Meraki cameras with BOM quantities', () => {
    const cam = r.devices.find((d) => d.spec.vendor === 'Cisco Meraki');
    expect(cam?.quantity).toBe(8);
    expect(r.devices).toHaveLength(1);
  });

  it('never lists licenses as devices', () => {
    expect(r.accessories.map((a) => a.partNumber)).toEqual(['LIC-MV-3YR']);
  });

  it('flags equipment with no reference instead of guessing', () => {
    expect(r.unmatched.map((a) => a.partNumber)).toEqual(['XYZ-123']);
  });

  it('does not treat 120VAC text as a Verkada AC12', () => {
    const x = matchBomToDevices([{ partNumber: '', description: 'Outlet AC120V', quantity: 1 }]);
    expect(x.devices).toHaveLength(0);
  });

  it('QC only covers equipment on the BOM', () => {
    const qc = buildQcChecks(r.devices);
    expect(qc).toHaveLength(1);
    expect(qc[0].rows.some(([i]) => /Meraki/.test(i))).toBe(true);
    expect(qc.flatMap((g) => g.rows).some(([i]) => /Lock release/.test(i))).toBe(false);
  });
});

describe('uploaded camera/VMS field manuals', () => {
  const r = matchBomToDevices([
    { partNumber: 'XNV-8080R', description: 'Wisenet 5MP dome', quantity: 3 },
    { partNumber: '02367-001', description: 'AXIS P3265-LVE Dome', quantity: 2 },
    { partNumber: 'WV-S2136L', description: 'i-PRO dome', quantity: 1 },
    { partNumber: '5.0C-H5A-BO1-IR', description: 'Avigilon bullet', quantity: 4 },
    { partNumber: 'WAVE-PRO-04', description: 'Wisenet WAVE Professional License', quantity: 4 },
  ]);
  it('matches each brand with BOM quantities', () => {
    const q = (v: string) => r.devices.find((d) => d.spec.vendor === v)?.quantity;
    expect([q('Hanwha'), q('Axis'), q('i-PRO'), q('Avigilon')]).toEqual([3, 2, 1, 4]);
  });
  it('keeps VMS licenses out of devices', () => {
    expect(r.accessories.map((a) => a.partNumber)).toEqual(['WAVE-PRO-04']);
  });
});

describe('second batch of field manuals', () => {
  const r = matchBomToDevices([
    { partNumber: 'UDB-Pro-Sector', description: 'Ubiquiti sector', quantity: 1 },
    { partNumber: 'TID-600R', description: 'Hanwha intercom', quantity: 2 },
  ]);
  it('matches Ubiquiti and TID-600R with BOM quantities', () => {
    expect(r.devices.map((d) => [d.spec.vendor, d.quantity])).toEqual([['Hanwha', 2], ['Ubiquiti', 1]].sort(() => 0).filter(Boolean).length ? expect.arrayContaining([['Ubiquiti', 1], ['Hanwha', 2]]) : []);
  });
  it('TID-600R relay limit is 550mA', () => {
    expect(r.devices.find((d) => d.spec.vendor === 'Hanwha')?.spec.relayOutput).toMatch(/550mA/);
  });
});
