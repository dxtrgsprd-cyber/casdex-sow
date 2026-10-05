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
