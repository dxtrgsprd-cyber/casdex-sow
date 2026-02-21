export interface SowSectionTemplate {
  id: string;
  title: string;
  template: string;
}

export const SOW_SECTION_TEMPLATES: SowSectionTemplate[] = [
  {
    id: 'install_cameras',
    title: 'Install New Cameras',
    template: `Mount {{NEW_CAMERA_TOTAL}} new {{CAMERA_BRAND}} cameras, consisting of:

{{EXTERIOR_CAMERA_COUNT}} exterior cameras

{{INTERIOR_CAMERA_COUNT}} interior cameras

Mounting should be secure and level

Install approved junction boxes where required

Seal all exterior penetrations`,
  },
  {
    id: 'provide_cabling',
    title: 'Provide Cabling',
    template: `Provide and install {{CAT6_COUNT}} new Cat6 data cables.

Properly support cabling (no ceiling grid support)

Label both ends of all cables

Maintain separation from high-voltage wiring

Approximate total cable length: {{CAT6_FOOTAGE}} ft.`,
  },
  {
    id: 'relocate_cameras',
    title: 'Relocate Existing Cameras',
    template: `Relocate {{RELOCATE_COUNT}} existing cameras to new locations as directed by HTS.`,
  },
  {
    id: 'conduit_installation',
    title: 'Conduit Installation',
    template: `Provide and install conduit to protect exposed cabling where required.

Approximate conduit length: {{CONDUIT_FOOTAGE}} ft.`,
  },
  {
    id: 'cable_termination',
    title: 'Cable Termination',
    template: `Terminate {{CAT6_COUNT}} Cat6 cables at designated network/camera locations using punchdowns, keystone jacks, or approved termination hardware.`,
  },
  {
    id: 'testing_commissioning',
    title: 'Testing and Commissioning',
    template: `Test all newly installed and/or relocated cables.

Verify operational status of all cameras.

Verify all cameras power on

Confirm live video stream

Confirm proper focus and framing

Verify recording functionality

Coordinate with HTS and/or Customer for network configuration and final system verification.`,
  },
  {
    id: 'materials_responsibility',
    title: 'Materials Responsibility',
    template: `Subcontractor shall furnish all labor, supervision, tools, equipment, consumables, and incidental materials necessary to install, terminate, test, label, and commission a complete and fully operational CCTV system according to the above scope unless otherwise specified in writing by HTS.`,
  },
];

export interface SowVariable {
  key: string;
  label: string;
  autoFillable: boolean;
}

export const SOW_VARIABLES: SowVariable[] = [
  { key: 'NEW_CAMERA_TOTAL', label: 'New Camera Total', autoFillable: true },
  { key: 'CAMERA_BRAND', label: 'Camera Brand', autoFillable: true },
  { key: 'EXTERIOR_CAMERA_COUNT', label: 'Exterior Camera Count', autoFillable: false },
  { key: 'INTERIOR_CAMERA_COUNT', label: 'Interior Camera Count', autoFillable: false },
  { key: 'CAT6_COUNT', label: 'Cat6 Cable Count', autoFillable: true },
  { key: 'CAT6_FOOTAGE', label: 'Cat6 Total Footage', autoFillable: false },
  { key: 'RELOCATE_COUNT', label: 'Relocate Count', autoFillable: false },
  { key: 'CONDUIT_FOOTAGE', label: 'Conduit Footage', autoFillable: false },
];

/** Extract variable values from BOM items */
export function autoFillFromBom(bomItems: import('@/types/sow').BomItem[]): Record<string, string> {
  const vars: Record<string, string> = {};

  // Camera detection keywords
  const cameraKeywords = ['camera', 'dome', 'bullet', 'turret', 'ptz', 'ip cam', 'nvr'];
  const cableKeywords = ['cat6', 'cat 6', 'cable', 'cat5', 'cat 5', 'utp', 'ethernet'];

  const cameraItems = bomItems.filter(item => {
    const desc = (item.description || '').toLowerCase();
    const pn = (item.partNumber || '').toLowerCase();
    return cameraKeywords.some(k => desc.includes(k) || pn.includes(k));
  });

  const cableItems = bomItems.filter(item => {
    const desc = (item.description || '').toLowerCase();
    return cableKeywords.some(k => desc.includes(k));
  });

  // Camera total
  const cameraTotal = cameraItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  if (cameraTotal > 0) {
    vars['NEW_CAMERA_TOTAL'] = String(cameraTotal);
  }

  // Camera brand - most common vendor among camera items
  const vendorCounts: Record<string, number> = {};
  cameraItems.forEach(item => {
    if (item.vendor) {
      vendorCounts[item.vendor] = (vendorCounts[item.vendor] || 0) + item.quantity;
    }
  });
  const topVendor = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topVendor) {
    vars['CAMERA_BRAND'] = topVendor[0];
  }

  // Cat6 count
  const cat6Total = cableItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  if (cat6Total > 0) {
    vars['CAT6_COUNT'] = String(cat6Total);
  }

  return vars;
}

/** Document-type-specific headers and endings */
export const DOC_TYPE_WRAPPERS: Record<import('@/types/sow').DocumentType, { header: string; ending: string }> = {
  SOW_Customer: {
    header: '',
    ending: '',
  },
  SOW_SUB_Quoting: {
    header: `Proposed Scope for Labor Quoting

Subcontractor shall provide labor pricing based on the following assumed scope of work:`,
    ending: `Materials Assumption

Subcontractor shall furnish all labor, supervision, tools, equipment, consumables, and incidental materials necessary to install, terminate, test, label, and commission a complete and fully operational CCTV system according to the above scope unless otherwise specified in writing by HTS.

This scope is for labor pricing purposes only. Final execution scope will be governed by the issued HTS Purchase Order and Execution SOW. (Provide meaning Furnish and installation of)`,
  },
  SOW_SUB_Project: {
    header: `The Subcontractor is authorized to perform the following work in accordance with the HTS-approved hardware schedule, drawings, and project documentation:`,
    ending: `Coordinate with HTS and/or Customer for network configuration and final system verification.

Materials Responsibility

Subcontractor shall furnish all labor, supervision, tools, equipment, consumables, and incidental materials necessary to install, terminate, test, label, and commission a complete and fully operational CCTV system according to the above scope unless otherwise specified in writing by HTS.

All work shall comply with manufacturer specifications, applicable codes, and HTS installation standards. Deviations from this authorized scope require written approval from the HTS Project Manager prior to execution.`,
  },
};

/** Generate scope of work text from enabled sections with variables filled in */
export function generateSowText(
  sectionOrder: string[],
  enabledSections: Set<string>,
  variables: Record<string, string>,
  docType?: import('@/types/sow').DocumentType
): string {
  const templates = new Map(SOW_SECTION_TEMPLATES.map(s => [s.id, s]));

  // Filter out "materials_responsibility" and "testing_commissioning" for Labor/Project docs
  // since they have their own endings
  const skipForWrapped = docType && docType !== 'SOW_Customer'
    ? new Set(['materials_responsibility'])
    : new Set<string>();

  const parts: string[] = [];
  for (const id of sectionOrder) {
    if (!enabledSections.has(id)) continue;
    if (skipForWrapped.has(id)) continue;
    const tmpl = templates.get(id);
    if (!tmpl) continue;

    let text = tmpl.template;
    for (const [key, value] of Object.entries(variables)) {
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `[${key}]`);
    }
    text = text.replace(/\{\{(\w+)\}\}/g, '[$1]');

    parts.push(`${tmpl.title}\n\n${text}`);
  }

  const body = parts.join('\n\n');

  if (docType && DOC_TYPE_WRAPPERS[docType]) {
    const { header, ending } = DOC_TYPE_WRAPPERS[docType];
    const sections = [header, body, ending].filter(Boolean);
    return sections.join('\n\n');
  }

  return body;
}
