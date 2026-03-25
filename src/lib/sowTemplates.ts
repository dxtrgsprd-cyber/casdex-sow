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
{{RIP_REPLACE_COUNT}} rip-and-replace door(s) — remove existing hardware, prep frame/door as needed
{{NEW_DOOR_COUNT}} new door(s) — core/prep door and frame for new hardware
Coordinate with GC/door hardware vendor for door prep and electrified hardware compatibility
Verify door swing, handing, and frame condition prior to installation
All installations shall comply with ADA, NFPA 101 Life Safety, and local fire code requirements`,
  },
  {
    id: 'ac_composite_cabling',
    title: 'Provide Composite Cabling',
    template: `Provide and install {{COMPOSITE_COUNT}} composite/multi-conductor cable run(s) (approx. {{COMPOSITE_FOOTAGE}} ft total)
Use manufacturer-recommended cable gauge and type for each device (locks, DPS, REX, readers)
Provide and run {{CAT6_COUNT}} Cat6 cable run(s) for intercom/network-connected AC devices
Use proper cable supports at max 5 ft intervals; secure within 12" of terminations
Label both ends of all cabling with permanent machine-printed labels
Maintain minimum separation from high-voltage wiring per NEC requirements
Use plenum-rated cable in air-handling spaces where applicable
Provide pull strings in all conduit runs for future use`,
  },
  {
    id: 'ac_controller',
    title: 'Controller Installation',
    template: `Install {{CONTROLLER_COUNT}} new {{CONTROLLER_BRAND}} door controller(s)
Mount controller(s) in approved enclosure(s) in a secure, accessible location
Secure controllers in accordance with manufacturer installation guidelines
Connect controller(s) to network infrastructure — verify IP connectivity and communication
Connect controller(s) to Fire Alarm Panel for emergency egress release (if applicable)
Provide and connect tamper switch on all controller enclosures
Ensure adequate ventilation and clearance for controller enclosures`,
  },
  {
    id: 'ac_intercom',
    title: 'Intercom Installation',
    template: `Install {{INTERCOM_TOTAL}} new {{INTERCOM_BRAND}} intercom device(s)
Mount intercom units secure, level, and at ADA-compliant height (48" AFF to operable part)
Connect intercom(s) to network and verify IP communication
Wire intercom to door release relay / controller as applicable
Configure call button, camera (if equipped), and audio settings
Test two-way audio clarity and door release functionality
Install weather-protective housing or rain hood for exterior-mounted units`,
  },
  {
    id: 'ac_locking',
    title: 'Electric Locking Installation',
    template: `Provide and install {{LOCK_TOTAL}} new locking hardware device(s), consisting of:
{{ELECTRIC_STRIKE_COUNT}} electric strike(s) — verify proper voltage, fail-safe/fail-secure configuration, and door gap
{{MAGLOCK_COUNT}} magnetic lock(s) — mount header bracket and armature plate; verify 1200 lb holding force where specified
{{MOTORIZED_LATCH_COUNT}} electrified latch release exit device(s) — coordinate with door hardware for proper trim and function
{{OTHER_LOCK_COUNT}} other electrified locking device(s)
Remove existing hardware where required; patch/fill abandoned penetrations
Prep door/frame as necessary for proper fit and operation
Install {{POWER_TRANSFER_COUNT}} power transfer device(s) (electric hinge, door loop, or EPT) where required
Route and dress wiring neatly through door frame and header
Verify proper mechanical operation prior to energizing
Test fail-safe / fail-secure functionality per specification
Verify proper door alignment, latch engagement/disengagement, and positive latching
Confirm free egress from secured side at all times (NFPA 101 compliance)`,
  },
  {
    id: 'ac_readers',
    title: 'Reader Installation',
    template: `Remove {{EXISTING_READER_COUNT}} existing reader(s) and patch/cover abandoned mounting locations
Install {{NEW_READER_COUNT}} new {{READER_BRAND}} reader(s)
Mount readers at ADA-compliant height (48" AFF to center of reader) on latch side of door
Secure readers with security screws; conceal wiring within wall or raceway
Connect readers to controller using manufacturer-recommended wiring (Wiegand or OSDP as specified)
Verify LED and audio feedback on credential presentation
Test read range and ensure no interference from adjacent readers or metal surfaces`,
  },
  {
    id: 'ac_dps_rex',
    title: 'DPS, REX, Push Button Installation',
    template: `Install {{DPS_COUNT}} Door Position Sensor(s) (DPS)
Mount DPS on secure side of door frame; align magnet on door leaf for proper gap
Verify door held-open and forced-door alarm reporting to controller
Install {{REX_COUNT}} Request-to-Exit device(s) (REX)
Mount REX sensor/button on secure side at proper height per manufacturer specs
Adjust sensitivity and timing to prevent false triggers
Install {{PUSH_COUNTS}} push-to-exit button(s)
Mount push button at ADA-compliant height with clear signage
Wire all devices to appropriate controller inputs with proper supervision (EOL resistors where required)`,
  },
  {
    id: 'ac_power',
    title: 'Power & Batteries',
    template: `Mount {{POWER_SUPPLY_COUNT}} power supply/supplies in approved enclosure(s)
Connect power supplies to dedicated circuit(s); verify proper voltage and amperage
Install batteries in {{POWER_SUPPLY_COUNT}} power supply/supplies and {{CONTROLLER_COUNT}} controller(s)
Verify correct charging voltage, current draw, and battery backup operation
Calculate and verify sufficient battery capacity for minimum 4-hour standby (or per spec)
Label all power supply breakers at the electrical panel
Provide tamper switch on all power supply enclosures
Test failover — confirm locks and controllers operate properly on battery during AC power loss`,
  },
  {
    id: 'ac_termination',
    title: 'Cable Termination (Access Control)',
    template: `Terminate {{COMPOSITE_COUNT}} composite cable(s) and {{CAT6_COUNT}} Cat6 cable(s) using approved termination hardware
Terminate multi-conductor cables on terminal strips/blocks inside controller and device enclosures
Terminate Cat6 cables on Category-rated patch panels or keystone jacks using T568B standard
Label all field wiring within enclosures with permanent machine-printed labels for serviceability
Use proper wire management (tie wraps, wire duct) inside all enclosures
Confirm controller, lock, REX, DPS, and reader connections — verify continuity and supervision
Provide as-built wiring documentation for each door/controller`,
  },
  {
    id: 'ac_testing',
    title: 'Testing & Commissioning (Access Control)',
    template: `Test all newly installed cabling for continuity and proper termination
Configure panel/controller network settings and communication parameters
Confirm system communication between all controllers and head-end software
Ensure all devices are securely mounted with no exposed wiring
Verify proper reader mounting height (48" AFF) and orientation
Verify proper locking hardware alignment and positive latching
Verify lock/unlock operation at all {{DOOR_TOTAL}} door(s) — test from both sides
Verify reader credential read — present valid and invalid credentials
Verify DPS reporting — test door-held-open and door-forced alarms
Verify REX operation — confirm unlock timing and re-lock
Verify intercom communication — test call, answer, and door release
Verify emergency egress — confirm free egress and fire alarm release
Verify proper ADA compliance at all reader and intercom locations
Confirm fire marshal free egress compliance
Provide test report documenting results for each door`,
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
    template: `Program {{CONTROLLER_COUNT}} access control panel(s)/controller(s) with network and communication settings
Configure door parameters — lock timing, held-open delay, relock time, and extended unlock for ADA
Enroll credentials and configure cardholder access levels and access groups
Configure door schedules (auto-unlock/lock) and holiday schedules
Program REX, DPS, and lock timing parameters for each door
Configure intercom call stations, directory entries, and door release associations
Set up alarm monitoring — door forced, door held open, tamper, and communication loss
Configure event notifications and email/SMS alerts as specified
Configure fire alarm integration and emergency unlock sequences
Program elevator control floors and access levels (if applicable)
Verify all programmed functions at each door — test normal and alarm conditions
Provide programming documentation and system configuration backup`,
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

  console.log(`[AutoFill] Starting AC auto-fill with ${bomItems.length} items`);

  // Access Control Controllers
  const controllerKeywords = ['controller', 'door controller', 'access panel', 'access control panel', 'acm', 'mercury', 'hid edge', 'vertx'];
  const controllerItems = matchItems(controllerKeywords);
  const controllerTotal = sumQty(controllerItems);
  console.log(`[AutoFill] Controllers: ${controllerItems.length} items, qty=${controllerTotal}`, controllerItems.map(i => `${i.quantity}x ${i.description}`));
  if (controllerTotal > 0) vars['CONTROLLER_COUNT'] = String(controllerTotal);
  const controllerVendorCounts: Record<string, number> = {};
  controllerItems.forEach(item => {
    if (item.vendor) controllerVendorCounts[item.vendor] = (controllerVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topControllerVendor = Object.entries(controllerVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topControllerVendor) vars['CONTROLLER_BRAND'] = topControllerVendor[0];

  // Intercoms
  const intercomKeywords = ['intercom', 'video intercom', 'door station', 'call station', 'entry panel', 'talk-a-phone', 'aiphone', '2n'];
  const intercomItems = matchItems(intercomKeywords);
  const intercomTotal = sumQty(intercomItems);
  console.log(`[AutoFill] Intercoms: ${intercomItems.length} items, qty=${intercomTotal}`, intercomItems.map(i => `${i.quantity}x ${i.description}`));
  if (intercomTotal > 0) vars['INTERCOM_TOTAL'] = String(intercomTotal);
  const intercomVendorCounts: Record<string, number> = {};
  intercomItems.forEach(item => {
    if (item.vendor) intercomVendorCounts[item.vendor] = (intercomVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topIntercomVendor = Object.entries(intercomVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topIntercomVendor) vars['INTERCOM_BRAND'] = topIntercomVendor[0];

  // Electric Strikes
  const strikeKeywords = ['electric strike', 'e-strike', 'door strike', 'hes ', 'von duprin strike'];
  const strikeTotal = sumQty(matchItems(strikeKeywords));
  if (strikeTotal > 0) vars['ELECTRIC_STRIKE_COUNT'] = String(strikeTotal);

  // Maglocks
  const maglockKeywords = ['maglock', 'mag lock', 'magnetic lock', 'electromagnetic lock', 'em lock', 'mag-lock'];
  const maglockTotal = sumQty(matchItems(maglockKeywords));
  if (maglockTotal > 0) vars['MAGLOCK_COUNT'] = String(maglockTotal);

  // Motorized Latch / Electrified Exit Devices
  const motorizedKeywords = ['motorized latch', 'electrified latch', 'electric latch', 'exit device', 'electrified exit', 'e-latch', 'motorized trim'];
  const motorizedTotal = sumQty(matchItems(motorizedKeywords));
  if (motorizedTotal > 0) vars['MOTORIZED_LATCH_COUNT'] = String(motorizedTotal);

  // Lock total (sum of all lock types found)
  const lockTotal = strikeTotal + maglockTotal + motorizedTotal;
  if (lockTotal > 0) vars['LOCK_TOTAL'] = String(lockTotal);

  // Power Transfers (hinge/loop)
  const powerTransferKeywords = ['power transfer', 'epc', 'ept', 'elec hinge', 'electric hinge', 'power hinge', 'door loop', 'armored door loop', 'door cord'];
  const powerTransferTotal = sumQty(matchItems(powerTransferKeywords));
  if (powerTransferTotal > 0) vars['POWER_TRANSFER_COUNT'] = String(powerTransferTotal);

  // Readers
  const readerKeywords = ['reader', 'card reader', 'proximity reader', 'smart reader', 'multi-tech reader', 'iclass', 'multiclass', 'signo', 'r10', 'r40', 'r90', 'osdp reader'];
  const readerItems = matchItems(readerKeywords);
  const readerTotal = sumQty(readerItems);
  console.log(`[AutoFill] Readers: ${readerItems.length} items, qty=${readerTotal}`, readerItems.map(i => `${i.quantity}x ${i.description}`));
  if (readerTotal > 0) vars['NEW_READER_COUNT'] = String(readerTotal);
  const readerVendorCounts: Record<string, number> = {};
  readerItems.forEach(item => {
    if (item.vendor) readerVendorCounts[item.vendor] = (readerVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topReaderVendor = Object.entries(readerVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topReaderVendor) vars['READER_BRAND'] = topReaderVendor[0];

  // Door Position Sensors
  const dpsKeywords = ['door position sensor', 'dps', 'door contact', 'magnetic contact', 'door sensor'];
  const dpsTotal = sumQty(matchItems(dpsKeywords));
  if (dpsTotal > 0) vars['DPS_COUNT'] = String(dpsTotal);

  // REX (Request to Exit)
  const rexKeywords = ['request to exit', 'rex', 'motion sensor exit', 'exit sensor', 'request-to-exit', 'pir exit'];
  const rexItems = bomItems.filter(item => {
    const desc = (item.description || '').toLowerCase();
    const pn = (item.partNumber || '').toLowerCase();
    return rexKeywords.some(k => desc.includes(k) || pn.includes(k));
  });
  const rexTotal = sumQty(rexItems);
  if (rexTotal > 0) vars['REX_COUNT'] = String(rexTotal);

  // Push-to-Exit Buttons
  const pushKeywords = ['push to exit', 'push-to-exit', 'push button', 'exit button', 'egress button', 'mushroom button'];
  const pushTotal = sumQty(matchItems(pushKeywords));
  if (pushTotal > 0) vars['PUSH_COUNTS'] = String(pushTotal);

  // Power Supplies
  const powerSupplyKeywords = ['power supply', 'pwr supply', 'altronix', 'al400', 'al600', 'al1024', 'al1012', 'eflow', 'trove', 'supply/charger'];
  const powerSupplyTotal = sumQty(matchItems(powerSupplyKeywords));
  if (powerSupplyTotal > 0) vars['POWER_SUPPLY_COUNT'] = String(powerSupplyTotal);

  console.log(`[AutoFill] Final AC vars:`, vars);
  return vars;
}

/** Determine which SOW sections should be enabled based on BOM contents */
export function autoEnableSectionsFromBom(bomItems: import('@/types/sow').BomItem[]): string[] {
  const vars = autoFillFromBom(bomItems);
  const enabled: string[] = [];

  const has = (key: string) => {
    const v = vars[key];
    return v && v !== '0';
  };

  // CCTV sections
  if (has('NEW_CAMERA_TOTAL')) enabled.push('install_cameras');
  if (has('CAT6_COUNT')) enabled.push('provide_cabling');
  if (has('CAT6_COUNT')) enabled.push('cable_termination');
  if (has('NEW_CAMERA_TOTAL') || has('SERVER_TOTAL')) enabled.push('testing_commissioning');
  if (has('POE_SWITCH_COUNT')) enabled.push('poe_switches');
  if (has('POE_INJECTOR_COUNT')) enabled.push('poe_injectors');
  if (has('MOUNT_COUNT')) enabled.push('mounts_accessories');
  if (has('PTP_COUNT')) enabled.push('wireless_ptp');
  if (has('LICENSE_COUNT') || has('CAMERA_LICENSES')) enabled.push('licenses');
  if (has('SERVER_TOTAL') || has('NVR_COUNT')) enabled.push('server_nvr');
  if (has('NEW_CAMERA_TOTAL')) enabled.push('programming_cctv');

  // Access Control sections
  if (has('CONTROLLER_COUNT') || has('LOCK_TOTAL') || has('NEW_READER_COUNT')) enabled.push('ac_install');
  if (has('CONTROLLER_COUNT')) enabled.push('ac_controller');
  if (has('INTERCOM_TOTAL')) enabled.push('ac_intercom');
  if (has('LOCK_TOTAL') || has('ELECTRIC_STRIKE_COUNT') || has('MAGLOCK_COUNT') || has('MOTORIZED_LATCH_COUNT')) enabled.push('ac_locking');
  if (has('NEW_READER_COUNT')) enabled.push('ac_readers');
  if (has('DPS_COUNT') || has('REX_COUNT') || has('PUSH_COUNTS')) enabled.push('ac_dps_rex');
  if (has('POWER_SUPPLY_COUNT')) enabled.push('ac_power');
  if (has('COMPOSITE_COUNT')) enabled.push('ac_composite_cabling');
  if (has('COMPOSITE_COUNT') || has('CONTROLLER_COUNT')) enabled.push('ac_termination');
  if (has('CONTROLLER_COUNT') || has('NEW_READER_COUNT')) enabled.push('ac_testing');
  if (has('CONTROLLER_COUNT') || has('NEW_READER_COUNT')) enabled.push('programming_ac');

  return [...new Set(enabled)];
}

const onesWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function numberToWords(n: number): string {
  if (n < 0) return 'negative ' + numberToWords(-n);
  if (n === 0) return 'zero';
  if (n < 20) return onesWords[n];
  if (n < 100) return tensWords[Math.floor(n / 10)] + (n % 10 ? '-' + onesWords[n % 10] : '');
  if (n < 1000) return onesWords[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numberToWords(n % 100) : '');
  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    return numberToWords(thousands) + ' thousand' + (remainder ? (remainder < 100 ? ' and ' : ' ') + numberToWords(remainder) : '');
  }
  return String(n);
}

function formatNumericSpelling(value: string): string {
  const num = parseInt(value, 10);
  if (isNaN(num) || value.trim() === '' || String(num) !== value.trim()) return value;
  return `${numberToWords(num)} (${num})`;
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
