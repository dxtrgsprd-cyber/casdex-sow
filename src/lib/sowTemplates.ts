export interface SowSectionTemplate {
  id: string;
  title: string;
  template: string;
}

export const SOW_SECTION_TEMPLATES: SowSectionTemplate[] = [
  {
    id: 'install_cameras',
    title: 'Install Cameras according to hardware schedule',
    template: `Mount {{NEW_CAMERA_TOTAL}} new {{CAMERA_BRAND}} cameras, consisting of:
{{EXTERIOR_CAMERA_COUNT}} exterior cameras
{{INTERIOR_CAMERA_COUNT}} interior cameras
ALL Camera Mounting should be secure and level, according to manufacturer specs
Install approved junction boxes where required
Seal all exterior penetrations`,
  },
  {
    id: 'provide_cabling',
    title: 'Provide Cat6 Cabling',
    template: `Provide and install {{CAT6_COUNT}} new Cat6 data cables.
Indoor Cat6 (above-ceiling): Use space-rated cable (plenum where applicable)
Maintain min 2" separation from power lines unless an exception applies.
Supports: max 5 ft intervals, add within 12" of drops/terminations
Properly label each cable at each end
Approximate total cable length: {{CAT6_FOOTAGE}} ft.`,
  },
  {
    id: 'relocate_cameras',
    title: 'Relocate Existing Cameras',
    template: `Relocate {{RELOCATE_COUNT}} existing cameras to new locations according to hardware schedule.`,
  },
  {
    id: 'conduit_installation',
    title: 'Conduit Installation',
    template: `Provide and install conduit to protect exposed cabling where required.
Use listed transitions and raintight/wet-location fittings/boxes
Keep pull/junction points accessible
Strap EMT within 3 ft of terminations and max 10 ft intervals
Strap PVC within 3 ft of terminations and max 3 ft intervals
Estimated conduit length: {{CONDUIT_FOOTAGE}} ft.`,
  },
  {
    id: 'cable_termination',
    title: 'Cable Termination (Cat6)',
    template: `Terminate {{CAT6_COUNT}} Cat6 cables at designated locations
Terminate on Category-rated patch panels and keystone jacks (IDC) using T568B unless otherwise specified
No field-crimp RJ45 on horizontal cable unless MPTL is explicitly approved and tested.
Maintain pair twists to within 0.5 in (13 mm) of the termination, strip jacket only as needed
Provide strain relief, and dress cabling neat without damage.
Make device/outdoor terminations inside rated enclosures with wet-location/raintight components.`,
  },
  {
    id: 'testing_commissioning',
    title: 'Testing and Commissioning (CCTV)',
    template: `Test all newly installed and/or relocated cables.
Verify all cameras power on
Set IP addresses of Cameras and equipment according to schema obtained from PoC
Verify operational status of all cameras.
Confirm live video stream
Confirm proper focus and framing`,
  },
  {
    id: 'server_nvr',
    title: 'Server / NVR',
    template: `Install {{SERVER_TOTAL}} new {{SERVER_BRAND}} Server/NVR
Install {{NVR_COUNT}} NVR/VMS server(s).
Mount hardware and connect to power/UPS.
Connect and configure network settings according to IP Address schema obtained from PoC
Install/configure {{VMS_PLATFORM}}
Setup User access configuration
Apply {{CAMERA_LICENSES}} Camera Licenses
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
Configure and test wireless link(s) for connectivity and throughput.
Remove default settings, and logins
Provide updated settings to PoC`,
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
Wall-mount arms, corner brackets, pendant mounts, pole adapters, and junction boxes as specified in the Hardware Schedule.
All mounts shall be installed properly and securely per manufacturer specifications.`,
  },
  {
    id: 'ac_install',
    title: 'Install Access Control',
    template: `Install access control hardware on {{DOOR_TOTAL}} doors:
{{RIP_REPLACE_COUNT}} rip-and-replace
{{NEW_DOOR_COUNT}} new door(s)`,
  },
  {
    id: 'ac_composite_cabling',
    title: 'Provide Composite Cabling',
    template: `Provide and install {{COMPOSITE_COUNT}} composite/multi conductor cable run(s) (approx. {{COMPOSITE_FOOTAGE}} ft total)
Provide and run {{CAT6_COUNT}} Cat6 cable run(s) for intercom/network devices
Use proper cable supports and label both ends of all cabling
Maintain separation from high-voltage wiring`,
  },
  {
    id: 'ac_controller',
    title: 'Controller Installation',
    template: `Install {{CONTROLLER_COUNT}} new {{CONTROLLER_BRAND}} door controllers
Secure controllers in accordance with manufacturer installation guidelines.
Connect Controller(s) to Fire Alarm Panel (if Applicable)`,
  },
  {
    id: 'ac_intercom',
    title: 'Intercom Installation',
    template: `Install {{INTERCOM_TOTAL}} new {{INTERCOM_BRAND}} intercom device(s).
Mount intercom units secure and level.`,
  },
  {
    id: 'ac_locking',
    title: 'Electric Locking Installation',
    template: `Provide and install {{LOCK_TOTAL}} new locking hardware device(s), consisting of:
{{ELECTRIC_STRIKE_COUNT}} electric strike(s)
{{MAGLOCK_COUNT}} magnetic lock(s)
{{MOTORIZED_LATCH_COUNT}} electrified latch release exit device(s)
{{OTHER_LOCK_COUNT}} other electrified locking device(s)
Remove existing hardware where required.
Prep door/frame as necessary for proper fit and operation.
Install {{POWER_TRANSFER_COUNT}} devices (hinge/loop) where required.
Verify proper mechanical operation prior to energizing.
Test fail-safe / fail-secure functionality.
Verify proper door alignment and latch engagement/disengagement`,
  },
  {
    id: 'ac_readers',
    title: 'Reader Installation',
    template: `Remove {{EXISTING_READER_COUNT}} existing readers
Install {{NEW_READER_COUNT}} new {{READER_BRAND}} readers`,
  },
  {
    id: 'ac_dps_rex',
    title: 'DPS, REX, Push Button Installation',
    template: `Install {{DPS_COUNT}} Door Position Sensors
Install {{REX_COUNT}} request to exits
Install {{PUSH_COUNTS}} push to exit buttons`,
  },
  {
    id: 'ac_power',
    title: 'Power & Batteries',
    template: `Mount {{POWER_SUPPLY_COUNT}} power supplies
Install batteries in {{POWER_SUPPLY_COUNT}} power supplies and {{CONTROLLER_COUNT}} new controllers
Verify correct charging voltage and backup operation.`,
  },
  {
    id: 'ac_termination',
    title: 'Cable Termination (Access Control)',
    template: `Terminate {{COMPOSITE_COUNT}} composite cables and {{CAT6_COUNT}} Cat6 cables using approved termination hardware
Label all field wiring within enclosures for serviceability.
Confirm controller, lock, REX, DPS, and reader connections as applicable.`,
  },
  {
    id: 'ac_testing',
    title: 'Testing & Commissioning (Access Control)',
    template: `Test all newly installed cabling
Configure panel settings and network parameters
Confirm system communication and operational status
Ensure all devices are securely mounted
Verify proper reader mounting height
Verify proper locking hardware alignment
Verify lock/unlock operation at all {{DOOR_TOTAL}} doors
Verify reader credential functionality
Verify DPS and REX operation
Verify intercom communication
Verify proper ADA compliance where required
Confirm fire marshal free egress compliance`,
  },
  {
    id: 'programming_cctv',
    title: 'Programming (CCTV)',
    template: `Configure IP addresses for all cameras according to schema obtained from PoC
Update camera firmware to latest stable version
Configure motion detection zones and sensitivity
Configure AI/analytics features as specified
Set up recording profiles (continuous, motion, schedule)
Configure video stream settings (resolution, frame rate, bitrate)
Verify live view, recording, and playback functionality`,
  },
  {
    id: 'programming_ac',
    title: 'Programming (Access Control)',
    template: `Program access control panels and controllers
Enroll credentials and configure cardholder access levels
Configure door schedules and access groups
Program REX, DPS, and lock timing parameters
Configure intercom call stations and directory
Set up alarm monitoring and event notifications
Configure fire alarm integration and emergency unlock sequences
Verify all programmed functions at each door`,
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
  
  { key: 'VMS_PLATFORM', label: 'VMS Platform', autoFillable: true },
  { key: 'CAMERA_LICENSES', label: 'Camera Licenses', autoFillable: true },
  { key: 'CAMERA_COUNT', label: 'Camera Count', autoFillable: true },
  { key: 'RETENTION_DAYS', label: 'Retention Days', autoFillable: false },
  { key: 'DOOR_TOTAL', label: 'Door Total', autoFillable: false },
  { key: 'RIP_REPLACE_COUNT', label: 'Rip & Replace Count', autoFillable: false },
  { key: 'NEW_DOOR_COUNT', label: 'New Door Count', autoFillable: false },
  { key: 'COMPOSITE_COUNT', label: 'Composite Cable Count', autoFillable: false },
  { key: 'COMPOSITE_FOOTAGE', label: 'Composite Footage', autoFillable: false },
  { key: 'CONTROLLER_COUNT', label: 'Controller Count', autoFillable: true },
  { key: 'CONTROLLER_BRAND', label: 'Controller Brand', autoFillable: true },
  { key: 'INTERCOM_TOTAL', label: 'Intercom Total', autoFillable: true },
  { key: 'INTERCOM_BRAND', label: 'Intercom Brand', autoFillable: true },
  { key: 'LOCK_TOTAL', label: 'Lock Total', autoFillable: true },
  { key: 'ELECTRIC_STRIKE_COUNT', label: 'Electric Strike Count', autoFillable: true },
  { key: 'MAGLOCK_COUNT', label: 'Maglock Count', autoFillable: true },
  { key: 'MOTORIZED_LATCH_COUNT', label: 'Motorized Latch Count', autoFillable: true },
  { key: 'OTHER_LOCK_COUNT', label: 'Other Lock Count', autoFillable: false },
  { key: 'POWER_TRANSFER_COUNT', label: 'Power Transfer Count', autoFillable: true },
  { key: 'EXISTING_READER_COUNT', label: 'Existing Reader Count', autoFillable: false },
  { key: 'NEW_READER_COUNT', label: 'New Reader Count', autoFillable: true },
  { key: 'READER_BRAND', label: 'Reader Brand', autoFillable: true },
  { key: 'DPS_COUNT', label: 'DPS Count', autoFillable: true },
  { key: 'REX_COUNT', label: 'REX Count', autoFillable: true },
  { key: 'PUSH_COUNTS', label: 'Push Button Count', autoFillable: true },
  { key: 'POWER_SUPPLY_COUNT', label: 'Power Supply Count', autoFillable: true },
  { key: 'PROGRAMMING_DETAILS', label: 'Programming Details', autoFillable: false },
  { key: 'PROGRAMMING_CCTV_DETAILS', label: 'Programming CCTV Details', autoFillable: false },
  { key: 'PROGRAMMING_AC_DETAILS', label: 'Programming AC Details', autoFillable: false },
  { key: 'NVR_COUNT', label: 'NVR Count', autoFillable: true },
];

/** Extract variable values from BOM items */
export function autoFillFromBom(bomItems: import('@/types/sow').BomItem[]): Record<string, string> {
  const vars: Record<string, string> = {};

  const cameraKeywords = ['camera', 'cam', 'dome', 'bullet', 'turret', 'ptz', 'ip cam', 'fisheye', 'panoramic', 'multisensor', 'multi-sensor', 'fixed dome', 'fixed lens', 'mini dome', 'box cam', 'wedge', 'vandal', 'eyeball'];
  const cableKeywords = ['cat6', 'cat 6', 'cable', 'cat5', 'cat 5', 'utp', 'ethernet'];
  const ptpKeywords = ['point-to-point', 'point to point', 'ptp', 'wireless bridge', 'airfiber', 'nanobeam', 'nanostation', 'litebeam'];
  const licenseKeywords = ['license', 'licence', 'subscription', 'lic'];
  const poeSwitchKeywords = ['poe switch', 'poe+ switch', 'network switch', 'managed switch', 'unmanaged switch'];
  const poeInjectorKeywords = ['poe injector', 'poe adapter', 'midspan', 'injector', 'u-poe', 'ins-3af', 'poe-24', 'poe-48', 'poe-54'];
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
  console.log(`[AutoFill] Camera matching: found ${cameraItems.length} items, total qty=${cameraTotal}`);
  console.log(`[AutoFill] Matched cameras:`, cameraItems.map(i => `${i.quantity}x ${i.description}`));
  const unmatchedItems = bomItems.filter(item => !cameraItems.includes(item));
  console.log(`[AutoFill] Unmatched items:`, unmatchedItems.map(i => `${i.quantity}x ${i.description} (pn: ${i.partNumber || 'n/a'})`));
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
    const pn = (item.partNumber || '').toLowerCase();
    return (poeInjectorKeywords.some(k => desc.includes(k) || pn.includes(k))) && !desc.includes('switch');
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

const onesWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function numberToWords(n: number): string {
  if (n < 0) return 'negative ' + numberToWords(-n);
  if (n < 20) return onesWords[n];
  if (n < 100) return tensWords[Math.floor(n / 10)] + (n % 10 ? '-' + onesWords[n % 10] : '');
  if (n < 1000) return onesWords[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
  return String(n);
}

function formatNumericSpelling(value: string): string {
  return value;
}

/** Generate scope of work text from enabled sections with variables filled in */
export function generateSowText(
  sectionOrder: string[],
  enabledSections: Set<string>,
  variables: Record<string, string>,
  customTemplates?: Record<string, string>,
): string {
  const templates = new Map(SOW_SECTION_TEMPLATES.map(s => [s.id, s]));

  const parts: string[] = [];
  let num = 0;
  for (const id of sectionOrder) {
    if (!enabledSections.has(id)) continue;
    const tmpl = templates.get(id);
    if (!tmpl) continue;

    num++;
    let text = customTemplates?.[id] ?? tmpl.template;

    // First pass: substitute variables, marking empty/zero ones for line removal
    const emptyMarker = '\x00EMPTY_VAR\x00';
    for (const [key, value] of Object.entries(variables)) {
      const trimmed = (value || '').trim();
      const isEmptyOrZero = !trimmed || trimmed === '0';
      const display = isEmptyOrZero ? emptyMarker : formatNumericSpelling(trimmed);
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), display);
    }
    // Unfilled placeholders also mark for removal
    text = text.replace(/\{\{(\w+)\}\}/g, emptyMarker);

    // Remove any line that contains the empty marker
    text = text
      .split('\n')
      .filter(line => !line.includes(emptyMarker))
      .join('\n');

    // Indent all body lines under the header
    const indentedBody = text
      .split('\n')
      .map(line => (line.trim() ? `    ${line}` : ''))
      .join('\n');


    parts.push(`${num}. ${tmpl.title}\n\n${indentedBody}`);
  }

  return parts.join('\n\n');
}
