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

Set IP addresses of Cameras and equipment

Verify operational status of all cameras.

Verify all cameras power on

Confirm live video stream

Confirm proper focus and framing`,
  },
  {
    id: 'server_nvr',
    title: 'Server / NVR',
    template: `Install {{SERVER_TOTAL}} new {{SERVER_BRAND}} Server/NVR

Install {{NVR_COUNT}} NVR/VMS server(s).

Mount hardware and connect to power/UPS.

Connect and configure network settings.

Install/configure {{VMS_PLATFORM}}

Setup User access configuration

Apply {{CAMERA_LICENSES}}

Enroll up to {{CAMERA_COUNT}} cameras.

Configure Motion, object detection, AI tools etc.

Configure Recording profile

Configure retention for approximately {{RETENTION_DAYS}} days.

Test live view, recording, and playback.`,
  },
  {
    id: 'wireless_ptp',
    title: 'Wireless Point-to-Point',
    template: `Provide and install {{PTP_COUNT}} wireless point-to-point bridge(s).

Mount radios securely at designated locations with proper alignment and weatherproofing.

Configure and test wireless link(s) for connectivity and throughput.`,
  },
  {
    id: 'licenses',
    title: 'Licenses',
    template: `Provide and apply {{LICENSE_COUNT}} software/hardware license(s) as specified in the BOM.

Verify license activation and proper system registration.`,
  },
  {
    id: 'poe_switches',
    title: 'PoE Switches',
    template: `Provide and install {{POE_SWITCH_COUNT}} PoE network switch(es).

Rack-mount or surface-mount switches as directed.

Connect and configure switch ports for all PoE-powered devices.

Verify power delivery and network connectivity on all ports.`,
  },
  {
    id: 'poe_injectors',
    title: 'PoE Injectors',
    template: `Provide and install {{POE_INJECTOR_COUNT}} PoE injector(s) where dedicated PoE switch ports are not available.

Mount injectors in a secure, accessible location.

Verify proper power delivery to connected devices.`,
  },
  {
    id: 'mounts_accessories',
    title: 'Mounts & Accessories',
    template: `Provide and install {{MOUNT_COUNT}} mounting accessory(ies), including but not limited to:

Wall-mount arms, corner brackets, pendant mounts, pole adapters, and junction boxes as specified in the BOM.

All mounts shall be installed securely per manufacturer specifications.`,
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
  { key: 'PTP_COUNT', label: 'Point-to-Point Count', autoFillable: true },
  { key: 'LICENSE_COUNT', label: 'License Count', autoFillable: true },
  { key: 'POE_SWITCH_COUNT', label: 'PoE Switch Count', autoFillable: true },
  { key: 'POE_INJECTOR_COUNT', label: 'PoE Injector Count', autoFillable: true },
  { key: 'MOUNT_COUNT', label: 'Mount/Accessory Count', autoFillable: true },
  { key: 'SERVER_TOTAL', label: 'Server/NVR Total', autoFillable: true },
  { key: 'SERVER_BRAND', label: 'Server Brand', autoFillable: true },
  { key: 'NVR_COUNT', label: 'NVR/VMS Count', autoFillable: true },
  { key: 'VMS_PLATFORM', label: 'VMS Platform', autoFillable: true },
  { key: 'CAMERA_LICENSES', label: 'Camera Licenses', autoFillable: true },
  { key: 'CAMERA_COUNT', label: 'Camera Count', autoFillable: true },
  { key: 'RETENTION_DAYS', label: 'Retention Days', autoFillable: false },
];

/** Extract variable values from BOM items */
export function autoFillFromBom(bomItems: import('@/types/sow').BomItem[]): Record<string, string> {
  const vars: Record<string, string> = {};

  const cameraKeywords = ['camera', 'dome', 'bullet', 'turret', 'ptz', 'ip cam'];
  const cableKeywords = ['cat6', 'cat 6', 'cable', 'cat5', 'cat 5', 'utp', 'ethernet'];
  const ptpKeywords = ['point-to-point', 'point to point', 'ptp', 'wireless bridge', 'airfiber', 'nanobeam', 'nanostation', 'litebeam'];
  const licenseKeywords = ['license', 'licence', 'subscription', 'lic'];
  const poeSwitchKeywords = ['poe switch', 'poe+ switch', 'network switch', 'managed switch', 'unmanaged switch'];
  const poeInjectorKeywords = ['poe injector', 'poe adapter', 'midspan', 'poe+'];
  const mountKeywords = ['mount', 'bracket', 'arm', 'pendant', 'pole adapter', 'junction box', 'j-box', 'wall mount', 'corner', 'gooseneck', 'parapet'];

  const matchItems = (keywords: string[]) => bomItems.filter(item => {
    const desc = (item.description || '').toLowerCase();
    const pn = (item.partNumber || '').toLowerCase();
    return keywords.some(k => desc.includes(k) || pn.includes(k));
  });

  const sumQty = (items: typeof bomItems) => items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Cameras
  const cameraItems = matchItems(cameraKeywords);
  const cameraTotal = sumQty(cameraItems);
  if (cameraTotal > 0) vars['NEW_CAMERA_TOTAL'] = String(cameraTotal);

  // Camera brand
  const vendorCounts: Record<string, number> = {};
  cameraItems.forEach(item => {
    if (item.vendor) vendorCounts[item.vendor] = (vendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topVendor = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topVendor) vars['CAMERA_BRAND'] = topVendor[0];

  // Cables
  const cat6Total = sumQty(matchItems(cableKeywords));
  if (cat6Total > 0) vars['CAT6_COUNT'] = String(cat6Total);

  // Point-to-Point
  const ptpTotal = sumQty(matchItems(ptpKeywords));
  if (ptpTotal > 0) vars['PTP_COUNT'] = String(ptpTotal);

  // Licenses
  const licenseTotal = sumQty(matchItems(licenseKeywords));
  if (licenseTotal > 0) vars['LICENSE_COUNT'] = String(licenseTotal);

  // PoE Switches (must match "switch" to avoid catching injectors)
  const poeSwitchItems = bomItems.filter(item => {
    const desc = (item.description || '').toLowerCase();
    return poeSwitchKeywords.some(k => desc.includes(k)) || (desc.includes('switch') && desc.includes('poe'));
  });
  const poeSwitchTotal = sumQty(poeSwitchItems);
  if (poeSwitchTotal > 0) vars['POE_SWITCH_COUNT'] = String(poeSwitchTotal);

  // PoE Injectors
  const poeInjectorItems = bomItems.filter(item => {
    const desc = (item.description || '').toLowerCase();
    return poeInjectorKeywords.some(k => desc.includes(k)) && !desc.includes('switch');
  });
  const poeInjectorTotal = sumQty(poeInjectorItems);
  if (poeInjectorTotal > 0) vars['POE_INJECTOR_COUNT'] = String(poeInjectorTotal);

  // Mounts & Accessories
  const mountTotal = sumQty(matchItems(mountKeywords));
  if (mountTotal > 0) vars['MOUNT_COUNT'] = String(mountTotal);

  // Server/NVR
  const serverKeywords = ['server', 'nvr', 'recorder', 'recording server'];
  const serverItems = matchItems(serverKeywords);
  const serverTotal = sumQty(serverItems);
  if (serverTotal > 0) vars['SERVER_TOTAL'] = String(serverTotal);
  if (serverTotal > 0) vars['NVR_COUNT'] = String(serverTotal);

  // Server brand
  const serverVendorCounts: Record<string, number> = {};
  serverItems.forEach(item => {
    if (item.vendor) serverVendorCounts[item.vendor] = (serverVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topServerVendor = Object.entries(serverVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topServerVendor) vars['SERVER_BRAND'] = topServerVendor[0];

  // VMS Platform
  const vmsKeywords = ['vms', 'milestone', 'genetec', 'exacq', 'wisenet wave', 'nx witness', 'video management'];
  const vmsItems = matchItems(vmsKeywords);
  if (vmsItems.length > 0) vars['VMS_PLATFORM'] = vmsItems[0].description || vmsItems[0].vendor || '';

  // Camera Licenses
  const camLicKeywords = ['camera license', 'channel license', 'cam license', 'device license'];
  const camLicItems = matchItems(camLicKeywords);
  const camLicTotal = sumQty(camLicItems);
  if (camLicTotal > 0) vars['CAMERA_LICENSES'] = String(camLicTotal);

  // Camera count (reuse camera total)
  if (cameraTotal > 0) vars['CAMERA_COUNT'] = String(cameraTotal);

  return vars;
}

/** Generate scope of work text from enabled sections with variables filled in */
export function generateSowText(
  sectionOrder: string[],
  enabledSections: Set<string>,
  variables: Record<string, string>,
): string {
  const templates = new Map(SOW_SECTION_TEMPLATES.map(s => [s.id, s]));

  const parts: string[] = [];
  for (const id of sectionOrder) {
    if (!enabledSections.has(id)) continue;
    const tmpl = templates.get(id);
    if (!tmpl) continue;

    let text = tmpl.template;
    for (const [key, value] of Object.entries(variables)) {
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `[${key}]`);
    }
    text = text.replace(/\{\{(\w+)\}\}/g, '[$1]');

    parts.push(`${tmpl.title}\n\n${text}`);
  }

  return parts.join('\n\n');
}
