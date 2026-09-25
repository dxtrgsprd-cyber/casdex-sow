export interface SowSectionTemplate {
  id: string;
  title: string;
  template: string;
}

export const SOW_SECTION_TEMPLATES: SowSectionTemplate[] = [
  {
    id: 'install_cameras',
    title: 'Install Cameras according to hardware schedule',
    template: `Mount {{NEW_CAMERA_TOTAL}} new {{CAMERA_BRAND}} cameras ({{CAMERA_MODELS}}), consisting of:
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
    template: `Install {{SERVER_TOTAL}} new {{SERVER_BRAND}} Server/NVR ({{SERVER_MODELS}})
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
    template: `Provide and install {{POE_SWITCH_COUNT}} PoE network switch(es) ({{SWITCH_MODELS}}).
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
{{NEW_DOOR_COUNT}} new door(s)
Field-verify each opening, handing, frame condition, available backbox space, pathway accessibility, and hardware compatibility before installation.
Coordinate mounting locations, rough-in requirements, and final device heights with site conditions and the hardware schedule.`,
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
    template: `Install {{CONTROLLER_COUNT}} new {{CONTROLLER_BRAND}} door controllers ({{CONTROLLER_MODELS}})
Secure controllers in accordance with manufacturer installation guidelines.
Provide required controller boards, enclosure terminations, and supervised connections as applicable.
Connect controller(s) to network, power, locking hardware, readers, DPS, REX, and Fire Alarm interface where applicable.
Dress and label all field wiring inside controller enclosures for serviceability.`,
  },
  {
    id: 'ac_intercom',
    title: 'Intercom Installation',
    template: `Install {{INTERCOM_TOTAL}} new {{INTERCOM_BRAND}} intercom device(s) ({{INTERCOM_MODELS}}).
Mount intercom units secure and level.
Terminate power/network cabling, configure call routing, and verify audio/video performance and door release operation where applicable.`,
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
Install {{NEW_READER_COUNT}} new {{READER_BRAND}} readers ({{READER_MODELS}})
Provide proper trim plates, sealants, and mullion/single-gang mounting hardware as required.
Verify reader orientation, credential read range, LED/buzzer behavior, and final mounting height per project standards.`,
  },
  {
    id: 'ac_dps_rex',
    title: 'DPS, REX, Push Button Installation',
    template: `Install {{DPS_COUNT}} Door Position Sensors
Install {{REX_COUNT}} request to exits
Install {{PUSH_COUNTS}} push to exit buttons
Adjust each device for proper operation, secure mounting, and code-compliant free egress behavior where required.`,
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
Confirm controller, lock, REX, DPS, reader, and intercom connections as applicable.
Verify polarity, end-of-line supervision, and continuity before final energization.`,
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
Confirm fire marshal free egress compliance
Document final operational status for each opening and note any site-dependent exceptions requiring customer follow-up.`,
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
  {
    id: 'vape_detection',
    title: 'Vape Detection Sensors',
    template: `Provide and install {{VAPE_SENSOR_COUNT}} {{VAPE_SENSOR_BRAND}} vape detection sensor(s) ({{VAPE_SENSOR_MODELS}}).
Mount sensors securely to ceiling/wall per manufacturer specifications and coverage guidelines.
Provide and terminate {{CAT6_COUNT}} Cat6 cabling to each sensor location as required.
Connect sensors to network and PoE power source.
Configure sensor detection thresholds for vape, THC, smoke, and sound anomalies (bullying/aggression) as applicable.
Integrate sensor alerts with VMS/access control platform where supported.
Configure notification recipients and escalation rules.
Test each sensor for proper detection and alert delivery.
Provide end-user training on sensor dashboard and alert management.`,
  },
  {
    id: 'alarm_system',
    title: 'Intrusion / Alarm System',
    template: `Provide and install {{ALARM_PANEL_COUNT}} {{ALARM_BRAND}} alarm control panel(s) ({{ALARM_PANEL_MODELS}}).
Install {{ALARM_KEYPAD_COUNT}} alarm keypad(s) at designated entry/exit locations.
Install {{MOTION_DETECTOR_COUNT}} interior motion detector(s).
Install {{DOOR_CONTACT_COUNT}} door/window contact(s).
Install {{GLASSBREAK_COUNT}} glassbreak detector(s).
Install {{SIREN_COUNT}} siren(s)/horn strobe(s).
Install {{PANIC_BUTTON_COUNT}} panic/duress button(s).
Install {{ALARM_COMMUNICATOR_COUNT}} cellular/IP communicator(s) for central station reporting.
Install {{WIRELESS_HUB_COUNT}} wireless hub(s)/receiver(s) and enroll all wireless devices.
Provide and install {{ALARM_BATTERY_COUNT}} backup battery/batteries and enclosure(s) for the alarm panel(s).
Provide and install batteries in all panels and power supplies; verify charging voltage and 4-hour backup operation.
Run and terminate all required device cabling; label both ends and dress wiring neatly inside enclosures.
Program zones, partitions, entry/exit delays, user codes, and arming schedules.
Configure central station account, reporting formats, and test all signals with the monitoring center.
Walk-test every device and verify alarm, trouble, and restore conditions.
Provide end-user training on arming/disarming, user code management, and alarm response.`,
  },
  {
    id: 'enclosure_power_cellular',
    title: 'Enclosure / Power / Cellular',
    template: `Provide and install {{ENCLOSURE_COUNT}} equipment enclosure(s) ({{ENCLOSURE_MODELS}}) at designated location(s).
Assemble and mount all internal components: {{DIN_RAIL_COUNT}} DIN rail(s), {{BUS_BAR_COUNT}} ground/bus bar(s), and panel hardware.
Install {{BREAKER_COUNT}} circuit breaker(s)/switch(es) and {{POWER_STRIP_COUNT}} power strip(s)/PDU(s) inside the enclosure.
Install {{CELLULAR_ROUTER_COUNT}} cellular router(s)/gateway(s) ({{CELLULAR_ROUTER_MODELS}}) and {{ANTENNA_COUNT}} antenna(s); route and secure antenna leads.
Install {{IR_ILLUMINATOR_COUNT}} IR illuminator(s) and aim/align for proper coverage.
Provide {{EXTENSION_CORD_COUNT}} extension/power cord(s) and {{GLAND_COUNT}} cable gland(s)/cord grip(s) for weather-tight cable entry.
Dress, label, and strain-relieve all wiring inside the enclosure.
Verify power distribution, breaker operation, cellular signal strength, and network connectivity.
Test all enclosure-mounted equipment for proper operation.`,
  },
  {
    id: 'misc_items',
    title: 'Miscellaneous Materials',
    template: `Provide and install the following additional materials listed on the BOM that are not covered in the sections above:
{{MISC_ITEMS}}
Install all miscellaneous materials per manufacturer specifications and project requirements.`,
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
  { key: 'CAMERA_MODELS', label: 'Camera Models', autoFillable: true },
  { key: 'EXTERIOR_CAMERA_COUNT', label: 'Exterior Camera Count', autoFillable: false },
  { key: 'INTERIOR_CAMERA_COUNT', label: 'Interior Camera Count', autoFillable: false },
  { key: 'CAT6_COUNT', label: 'Cat6 Cable Count', autoFillable: true },
  { key: 'CAT6_FOOTAGE', label: 'Cat6 Total Footage', autoFillable: false },
  { key: 'RELOCATE_COUNT', label: 'Relocate Count', autoFillable: false },
  { key: 'CONDUIT_FOOTAGE', label: 'Conduit Footage', autoFillable: false },
  { key: 'PTP_COUNT', label: 'Point-to-Point Count', autoFillable: true },
  { key: 'LICENSE_COUNT', label: 'License Count', autoFillable: true },
  { key: 'POE_SWITCH_COUNT', label: 'PoE Switch Count', autoFillable: true },
  { key: 'SWITCH_MODELS', label: 'Switch Models', autoFillable: true },
  { key: 'POE_INJECTOR_COUNT', label: 'PoE Injector Count', autoFillable: true },
  { key: 'MOUNT_COUNT', label: 'Mount/Accessory Count', autoFillable: true },
  { key: 'SERVER_TOTAL', label: 'Server/NVR Total', autoFillable: true },
  { key: 'SERVER_BRAND', label: 'Server Brand', autoFillable: true },
  { key: 'SERVER_MODELS', label: 'Server/NVR Models', autoFillable: true },
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
  { key: 'CONTROLLER_MODELS', label: 'Controller Models', autoFillable: true },
  { key: 'INTERCOM_TOTAL', label: 'Intercom Total', autoFillable: true },
  { key: 'INTERCOM_BRAND', label: 'Intercom Brand', autoFillable: true },
  { key: 'INTERCOM_MODELS', label: 'Intercom Models', autoFillable: true },
  { key: 'LOCK_TOTAL', label: 'Lock Total', autoFillable: true },
  { key: 'ELECTRIC_STRIKE_COUNT', label: 'Electric Strike Count', autoFillable: true },
  { key: 'MAGLOCK_COUNT', label: 'Maglock Count', autoFillable: true },
  { key: 'MOTORIZED_LATCH_COUNT', label: 'Motorized Latch Count', autoFillable: true },
  { key: 'OTHER_LOCK_COUNT', label: 'Other Lock Count', autoFillable: false },
  { key: 'POWER_TRANSFER_COUNT', label: 'Power Transfer Count', autoFillable: true },
  { key: 'EXISTING_READER_COUNT', label: 'Existing Reader Count', autoFillable: false },
  { key: 'NEW_READER_COUNT', label: 'New Reader Count', autoFillable: true },
  { key: 'READER_BRAND', label: 'Reader Brand', autoFillable: true },
  { key: 'READER_MODELS', label: 'Reader Models', autoFillable: true },
  { key: 'DPS_COUNT', label: 'DPS Count', autoFillable: true },
  { key: 'REX_COUNT', label: 'REX Count', autoFillable: true },
  { key: 'PUSH_COUNTS', label: 'Push Button Count', autoFillable: true },
  { key: 'POWER_SUPPLY_COUNT', label: 'Power Supply Count', autoFillable: true },
  { key: 'PROGRAMMING_DETAILS', label: 'Programming Details', autoFillable: false },
  { key: 'PROGRAMMING_CCTV_DETAILS', label: 'Programming CCTV Details', autoFillable: false },
  { key: 'PROGRAMMING_AC_DETAILS', label: 'Programming AC Details', autoFillable: false },
  { key: 'NVR_COUNT', label: 'NVR Count', autoFillable: true },
  { key: 'VAPE_SENSOR_COUNT', label: 'Vape Sensor Count', autoFillable: true },
  { key: 'VAPE_SENSOR_BRAND', label: 'Vape Sensor Brand', autoFillable: true },
  { key: 'VAPE_SENSOR_MODELS', label: 'Vape Sensor Models', autoFillable: true },
  { key: 'ALARM_PANEL_COUNT', label: 'Alarm Panel Count', autoFillable: true },
  { key: 'ALARM_BRAND', label: 'Alarm Brand', autoFillable: true },
  { key: 'ALARM_PANEL_MODELS', label: 'Alarm Panel Models', autoFillable: true },
  { key: 'ALARM_KEYPAD_COUNT', label: 'Alarm Keypad Count', autoFillable: true },
  { key: 'MOTION_DETECTOR_COUNT', label: 'Motion Detector Count', autoFillable: true },
  { key: 'DOOR_CONTACT_COUNT', label: 'Door/Window Contact Count', autoFillable: true },
  { key: 'GLASSBREAK_COUNT', label: 'Glassbreak Detector Count', autoFillable: true },
  { key: 'SIREN_COUNT', label: 'Siren / Horn Strobe Count', autoFillable: true },
  { key: 'ALARM_COMMUNICATOR_COUNT', label: 'Alarm Communicator Count', autoFillable: true },
  { key: 'PANIC_BUTTON_COUNT', label: 'Panic/Duress Button Count', autoFillable: true },
  { key: 'WIRELESS_HUB_COUNT', label: 'Wireless Hub Count', autoFillable: true },
  { key: 'ALARM_BATTERY_COUNT', label: 'Alarm Backup Battery Count', autoFillable: true },
  { key: 'ENCLOSURE_COUNT', label: 'Enclosure Count', autoFillable: true },
  { key: 'ENCLOSURE_MODELS', label: 'Enclosure Models', autoFillable: true },
  { key: 'DIN_RAIL_COUNT', label: 'DIN Rail Count', autoFillable: true },
  { key: 'BUS_BAR_COUNT', label: 'Bus/Ground Bar Count', autoFillable: true },
  { key: 'BREAKER_COUNT', label: 'Breaker Count', autoFillable: true },
  { key: 'POWER_STRIP_COUNT', label: 'Power Strip/PDU Count', autoFillable: true },
  { key: 'CELLULAR_ROUTER_COUNT', label: 'Cellular Router Count', autoFillable: true },
  { key: 'CELLULAR_ROUTER_MODELS', label: 'Cellular Router Models', autoFillable: true },
  { key: 'ANTENNA_COUNT', label: 'Antenna Count', autoFillable: true },
  { key: 'IR_ILLUMINATOR_COUNT', label: 'IR Illuminator Count', autoFillable: true },
  { key: 'EXTENSION_CORD_COUNT', label: 'Extension/Power Cord Count', autoFillable: true },
  { key: 'GLAND_COUNT', label: 'Cable Gland/Cord Grip Count', autoFillable: true },
  { key: 'MISC_ITEMS', label: 'Miscellaneous BOM Items', autoFillable: true },
  { key: 'MISC_ITEM_COUNT', label: 'Miscellaneous Item Count', autoFillable: true },
];

export const AUTO_FILLABLE_VARIABLE_KEYS = new Set(
  SOW_VARIABLES.filter((variable) => variable.autoFillable).map((variable) => variable.key)
);

function hasPositiveValue(vars: Record<string, string>, key: string): boolean {
  const value = parseInt((vars[key] || '').trim(), 10);
  return Number.isFinite(value) && value > 0;
}

export function getRecommendedSectionsFromBom(vars: Record<string, string>): string[] {
  const enabled = new Set<string>();

  const hasCctv = hasPositiveValue(vars, 'NEW_CAMERA_TOTAL');
  const hasAccessControl = [
    'DOOR_TOTAL',
    'CONTROLLER_COUNT',
    'INTERCOM_TOTAL',
    'LOCK_TOTAL',
    'NEW_READER_COUNT',
    'DPS_COUNT',
    'REX_COUNT',
    'PUSH_COUNTS',
    'POWER_SUPPLY_COUNT',
  ].some((key) => hasPositiveValue(vars, key));

  if (hasCctv) {
    enabled.add('install_cameras');
    if (hasPositiveValue(vars, 'CAT6_COUNT')) enabled.add('provide_cabling');
    if (hasPositiveValue(vars, 'POE_SWITCH_COUNT')) enabled.add('poe_switches');
    if (hasPositiveValue(vars, 'POE_INJECTOR_COUNT')) enabled.add('poe_injectors');
    if (hasPositiveValue(vars, 'MOUNT_COUNT')) enabled.add('mounts_accessories');
    if (hasPositiveValue(vars, 'SERVER_TOTAL') || hasPositiveValue(vars, 'NVR_COUNT')) enabled.add('server_nvr');
    if (hasPositiveValue(vars, 'LICENSE_COUNT') || hasPositiveValue(vars, 'CAMERA_LICENSES')) enabled.add('licenses');
    if (hasPositiveValue(vars, 'PTP_COUNT')) enabled.add('wireless_ptp');
    enabled.add('cable_termination');
    enabled.add('testing_commissioning');
    enabled.add('programming_cctv');
  }

  if (hasAccessControl) {
    enabled.add('ac_install');
    if (hasPositiveValue(vars, 'COMPOSITE_COUNT') || hasPositiveValue(vars, 'CAT6_COUNT')) enabled.add('ac_composite_cabling');
    if (hasPositiveValue(vars, 'CONTROLLER_COUNT')) enabled.add('ac_controller');
    if (hasPositiveValue(vars, 'INTERCOM_TOTAL')) enabled.add('ac_intercom');
    if (hasPositiveValue(vars, 'LOCK_TOTAL') || hasPositiveValue(vars, 'POWER_TRANSFER_COUNT')) enabled.add('ac_locking');
    if (hasPositiveValue(vars, 'NEW_READER_COUNT') || hasPositiveValue(vars, 'EXISTING_READER_COUNT')) enabled.add('ac_readers');
    if (hasPositiveValue(vars, 'DPS_COUNT') || hasPositiveValue(vars, 'REX_COUNT') || hasPositiveValue(vars, 'PUSH_COUNTS')) enabled.add('ac_dps_rex');
    if (hasPositiveValue(vars, 'POWER_SUPPLY_COUNT') || hasPositiveValue(vars, 'CONTROLLER_COUNT')) enabled.add('ac_power');
    enabled.add('ac_termination');
    enabled.add('ac_testing');
    enabled.add('programming_ac');
  }

  if (hasPositiveValue(vars, 'VAPE_SENSOR_COUNT')) {
    enabled.add('vape_detection');
  }

  const hasAlarm = [
    'ALARM_PANEL_COUNT',
    'ALARM_KEYPAD_COUNT',
    'MOTION_DETECTOR_COUNT',
    'DOOR_CONTACT_COUNT',
    'GLASSBREAK_COUNT',
    'SIREN_COUNT',
    'ALARM_COMMUNICATOR_COUNT',
    'PANIC_BUTTON_COUNT',
    'WIRELESS_HUB_COUNT',
    'ALARM_BATTERY_COUNT',
  ].some((key) => hasPositiveValue(vars, key));
  if (hasAlarm) enabled.add('alarm_system');

  if ((vars['MISC_ITEMS'] || '').trim()) enabled.add('misc_items');

  if (enabled.size == 0) {
    return ['install_cameras', 'provide_cabling', 'testing_commissioning'];
  }

  return SOW_SECTION_TEMPLATES.map((section) => section.id).filter((id) => enabled.has(id));
}

/** Extract variable values from BOM items */
export function autoFillFromBom(bomItems: import('@/types/sow').BomItem[]): Record<string, string> {
  const vars: Record<string, string> = {};

  type Item = import('@/types/sow').BomItem;
  type Rule = { cat: string; kw?: string[]; pn?: RegExp[]; exclude?: RegExp };

  // Whole-word keyword match so short tokens ("cam", "acm", "rex") don't hit inside other words.
  const esc = (k: string) => k.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const kwRegex = (kws: string[]) => new RegExp(`(^|[^a-z0-9])(${kws.map(esc).join('|')})(?=[^a-z0-9]|$)`, 'i');

  const isLicense = (item: Item) => {
    const desc = (item.description || '').toLowerCase();
    const pn = (item.partNumber || '').toLowerCase();
    return /\blicen[cs]e|subscription|\bsaas\b|cloud service|support term|\d+\s*-?\s*(yr|year)s?\b/.test(desc)
      || /^lic-|(^|[-_])lic([-_]|$)|-\d+y(r)?$|-\d+yr?-/.test(pn);
  };

  // Ordered, mutually-exclusive classification rules. Each BOM line lands in the FIRST
  // category that matches, so accessories (power supplies, mounts, batteries) are claimed
  // before broad device categories (controllers, cameras) can grab them.
  const RULES: Rule[] = [
    { cat: 'power_supply', kw: ['power supply', 'power supplies', 'pwr supply', 'psu', 'altronix', 'al400', 'al600', 'al1024', 'al1012', 'eflow', 'trove', 'supply/charger', 'power distribution', 'fused distribution', 'acm8', 'acm4', 'transformer', 'power module', 'power adapter', 'lifesafety power', 'life safety power', 'power controller', 'access power'], pn: [/^acm\d/i, /^al\d{3,4}/i, /^eflow/i, /^t\d-/i, /^ma-pwr/i] },
    { cat: 'alarm_battery', kw: ['backup battery', 'battery enclosure', 'acc-vbx', 'sla battery', 'backup batteries', 'battery', 'batteries'] },
    { cat: 'power_transfer', kw: ['power transfer', 'epc', 'ept', 'elec hinge', 'electric hinge', 'power hinge', 'electrified hinge', 'door loop', 'armored door loop', 'door cord'] },
    { cat: 'mount', kw: ['mount', 'mounting', 'bracket', 'arm', 'pendant', 'pole adapter', 'junction box', 'j-box', 'back box', 'backbox', 'wall mount', 'corner', 'gooseneck', 'parapet', 'adapter plate', 'housing'], pn: [/^ma-(mnt|mount|brkt|pole|wall)/i], exclude: /din rail|breaker|receptacle|outlet|power strip/i },
    { cat: 'cable', kw: ['cat6', 'cat 6', 'cat6a', 'cable', 'cabling', 'cat5', 'cat 5', 'cat5e', 'utp', 'patch cord', 'wire'], exclude: /gland|grommet|extension cord|power cord|antenna|cable tie|zip tie|strain relief/i },
    { cat: 'poe_injector', kw: ['poe injector', 'poe adapter', 'midspan', 'injector', 'u-poe', 'ins-3af', 'poe-24', 'poe-48', 'poe-54'], pn: [/^ma-inj/i], exclude: /switch/i },
    { cat: 'poe_switch', kw: ['poe switch', 'poe+ switch', 'network switch', 'managed switch', 'unmanaged switch', 'switch'], pn: [/^ms\d{3}/i], exclude: /reed|position|key ?switch|tamper|contact|rocker|breaker|toggle/i },
    { cat: 'ptp', kw: ['point-to-point', 'point to point', 'ptp', 'wireless bridge', 'airfiber', 'nanobeam', 'nanostation', 'litebeam'] },
    { cat: 'intercom', kw: ['intercom', 'video intercom', 'door station', 'call station', 'entry panel', 'talk-a-phone', 'aiphone', '2n', 'td52', 'td33'] },
    { cat: 'strike', kw: ['electric strike', 'e-strike', 'door strike', 'strike', 'hes', 'von duprin strike'] },
    { cat: 'maglock', kw: ['maglock', 'mag lock', 'magnetic lock', 'electromagnetic lock', 'em lock', 'mag-lock'] },
    { cat: 'motorized', kw: ['motorized latch', 'electrified latch', 'electric latch', 'exit device', 'electrified exit', 'e-latch', 'motorized trim', 'latch retraction', 'electrified lever', 'electrified lock'] },
    { cat: 'reader', kw: ['reader', 'card reader', 'proximity reader', 'smart reader', 'multi-tech reader', 'iclass', 'multiclass', 'signo', 'r10', 'r40', 'r90', 'osdp reader', 'ad32', 'ad33', 'ad34', 'ad62', 'ad63', 'ad64'] },
    { cat: 'rex', kw: ['request to exit', 'rex', 'motion sensor exit', 'exit sensor', 'request-to-exit', 'pir exit', 'rex sensor'] },
    { cat: 'push', kw: ['push to exit', 'push-to-exit', 'push button', 'exit button', 'egress button', 'mushroom button'] },
    { cat: 'dps', kw: ['door position sensor', 'dps', 'door position switch'] },
    { cat: 'vape', kw: ['vape', 'vaping', 'halo smart', 'halo 3c', 'halo sensor', 'halo', 'triton', 'vape detector', 'vape sensor', 'thc sensor', 'air quality sensor', 'iaq sensor', 'environmental sensor', 'sv11', 'sv20', 'sv23', 'sv25'] },
    { cat: 'alarm_panel', kw: ['alarm panel', 'alarm control panel', 'intrusion panel', 'burglar panel', 'security panel', 'vista', 'powerseries', 'iq panel', 'qolsys', 'lyric', 'napco', 'gemini panel', 'concord', 'alarm console', 'bc81', 'bc61', 'bp52', 'verkada alarm', 'alarm hub', 'proseries', 'proa7', 'pro a7', 'vista20', 'vista 20', 'vista128', 'brivo alarm'] },
    { cat: 'keypad', kw: ['alarm keypad', 'keypad', 'touchpad', 'arming station', 'ak11', 'bk22', '6160', 'tuxedo'] },
    { cat: 'motion', kw: ['motion detector', 'pir detector', 'dual tec', 'dual-tec', 'intrusion motion', 'occupancy detector', 'motion sensor', 'ms11', '5800pir', 'sixpir'] },
    { cat: 'contact', kw: ['window contact', 'door/window contact', 'overhead door contact', 'recessed contact', 'surface contact', 'reed switch', 'door sensor', 'door contact', 'magnetic contact', 'ds10', '5816', 'sixminict'] },
    { cat: 'glassbreak', kw: ['glassbreak', 'glass break', 'glass-break', 'shock sensor', 'gb21', '5853', 'sixgb'] },
    { cat: 'siren', kw: ['siren', 'horn strobe', 'horn/strobe', 'sounder', 'strobe', 'bz32', 'wave2', 'sixsiren'] },
    { cat: 'communicator', kw: ['communicator', 'lte module', 'acc-cel-lte', 'cellular backup', 'alarmnet', 'telguard', 'dialer', 'lte-xa', 'lte-ia', 'cell module'] },
    { cat: 'panic', kw: ['panic button', 'pb11', 'br33', 'duress button', 'hold-up button', 'holdup button'] },
    { cat: 'wireless_hub', kw: ['wireless hub', 'wh52', 'wireless receiver', 'rf receiver'] },
    { cat: 'controller', kw: ['door controller', 'access controller', 'access control controller', 'controller', 'access panel', 'access control panel', 'mercury', 'lp1501', 'lp1502', 'lp4502', 'mr52', 'mr62', 'hid edge', 'vertx', 'ac41', 'ac42', 'ac12', 'acu', 'door module', 'interface board', 'reader interface'] },
    { cat: 'server', kw: ['server', 'nvr', 'recorder', 'recording server', 'command connector', 'cc300', 'cc500', 'workstation'] },
    { cat: 'vms', kw: ['vms', 'milestone', 'genetec', 'exacq', 'wisenet wave', 'nx witness', 'video management'] },
    { cat: 'camera', kw: ['camera', 'cam', 'dome', 'bullet', 'turret', 'ptz', 'ip cam', 'fisheye', 'panoramic', 'multisensor', 'multi-sensor', 'fixed dome', 'fixed lens', 'mini dome', 'box cam', 'wedge', 'eyeball'], pn: [/^mv\d{2}/i, /^c[bdm]\d{2}/i] },
  ];
  const compiled = RULES.map(r => ({ ...r, re: r.kw ? kwRegex(r.kw) : null }));

  const classify = (item: Item): string | null => {
    if (isLicense(item)) return 'license';
    const desc = (item.description || '').toLowerCase();
    const pn = (item.partNumber || '').toLowerCase().trim();
    for (const r of compiled) {
      if (r.exclude && r.exclude.test(desc)) continue;
      if ((r.pn && r.pn.some(x => x.test(pn))) || (r.re && (r.re.test(desc) || r.re.test(pn)))) return r.cat;
    }
    return null;
  };
  const categoryOf = new Map<Item, string | null>(bomItems.map(i => [i, classify(i)]));
  const byCat = (cat: string) => bomItems.filter(i => categoryOf.get(i) === cat);
  if (import.meta.env.DEV) console.log('[AutoFill] Classified:', bomItems.map(i => `${categoryOf.get(i) ?? 'misc'} ← ${i.partNumber || ''} ${i.description}`));

  const sumQty = (items: typeof bomItems) => items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  /** Collect unique, non-empty part numbers from matched items */
  const collectModels = (items: typeof bomItems): string => {
    const models = new Set<string>();
    items.forEach(item => {
      const pn = (item.partNumber || '').trim();
      if (pn && pn !== 'undefined' && pn !== 'n/a' && pn !== 'N/A') {
        models.add(pn);
      }
    });
    return Array.from(models).join(', ');
  };
  const getDoorCapacityFromController = (item: import('@/types/sow').BomItem) => {
    const text = `${item.partNumber || ''} ${item.description || ''}`.toLowerCase();
    const match = text.match(/(?:^|\b)(1|2|4|8|16)\s*[- ]?door\b/);
    return match ? Number(match[1]) * (item.quantity || 0) : 0;
  };

  // Cameras
  const cameraItems = byCat('camera');
  const cameraTotal = sumQty(cameraItems);
  if (cameraTotal > 0) vars['NEW_CAMERA_TOTAL'] = String(cameraTotal);

  // Camera models (part numbers)
  const cameraModels = collectModels(cameraItems);
  if (cameraModels) vars['CAMERA_MODELS'] = cameraModels;

  // Camera brand
  const vendorCounts: Record<string, number> = {};
  cameraItems.forEach(item => {
    if (item.vendor) vendorCounts[item.vendor] = (vendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topVendor = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topVendor) vars['CAMERA_BRAND'] = topVendor[0];

  // Cables
  const cat6Total = sumQty(byCat('cable'));
  if (cat6Total > 0) vars['CAT6_COUNT'] = String(cat6Total);

  // Point-to-Point
  const ptpTotal = sumQty(byCat('ptp'));
  if (ptpTotal > 0) vars['PTP_COUNT'] = String(ptpTotal);

  // Licenses
  const licenseTotal = sumQty(byCat('license'));
  if (licenseTotal > 0) vars['LICENSE_COUNT'] = String(licenseTotal);

  // PoE Switches (must match "switch" to avoid catching injectors)
  const poeSwitchItems = byCat('poe_switch');
  const poeSwitchTotal = sumQty(poeSwitchItems);
  if (poeSwitchTotal > 0) vars['POE_SWITCH_COUNT'] = String(poeSwitchTotal);
  const switchModels = collectModels(poeSwitchItems);
  if (switchModels) vars['SWITCH_MODELS'] = switchModels;

  // PoE Injectors
  const poeInjectorItems = byCat('poe_injector');
  const poeInjectorTotal = sumQty(poeInjectorItems);
  if (poeInjectorTotal > 0) vars['POE_INJECTOR_COUNT'] = String(poeInjectorTotal);

  // Mounts & Accessories
  const mountTotal = sumQty(byCat('mount'));
  if (mountTotal > 0) vars['MOUNT_COUNT'] = String(mountTotal);

  // Server/NVR
  const serverItems = byCat('server');
  const serverTotal = sumQty(serverItems);
  if (serverTotal > 0) vars['SERVER_TOTAL'] = String(serverTotal);
  if (serverTotal > 0) vars['NVR_COUNT'] = String(serverTotal);
  const serverModels = collectModels(serverItems);
  if (serverModels) vars['SERVER_MODELS'] = serverModels;

  // Server brand
  const serverVendorCounts: Record<string, number> = {};
  serverItems.forEach(item => {
    if (item.vendor) serverVendorCounts[item.vendor] = (serverVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topServerVendor = Object.entries(serverVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topServerVendor) vars['SERVER_BRAND'] = topServerVendor[0];

  // VMS Platform
  const vmsItems = byCat('vms');
  if (vmsItems.length > 0) vars['VMS_PLATFORM'] = vmsItems[0].description || vmsItems[0].vendor || '';

  // Camera Licenses
  const camLicKeywords = ['camera license', 'channel license', 'cam license', 'device license'];
  const camLicItems = byCat('license').filter(i => (camLicKeywords.some(k => i.description.toLowerCase().includes(k)) || /lic-mv|mv.*licen|camera/i.test(`${i.partNumber || ''} ${i.description}`)));
  const camLicTotal = sumQty(camLicItems);
  if (camLicTotal > 0) vars['CAMERA_LICENSES'] = String(camLicTotal);

  // Camera count (reuse camera total)
  if (cameraTotal > 0) vars['CAMERA_COUNT'] = String(cameraTotal);


  // Access Control Controllers
  const controllerItems = byCat('controller');
  const controllerTotal = sumQty(controllerItems);
  if (controllerTotal > 0) vars['CONTROLLER_COUNT'] = String(controllerTotal);
  const controllerModels = collectModels(controllerItems);
  if (controllerModels) vars['CONTROLLER_MODELS'] = controllerModels;
  const controllerVendorCounts: Record<string, number> = {};
  controllerItems.forEach(item => {
    if (item.vendor) controllerVendorCounts[item.vendor] = (controllerVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topControllerVendor = Object.entries(controllerVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topControllerVendor) vars['CONTROLLER_BRAND'] = topControllerVendor[0];

  // Intercoms
  const intercomItems = byCat('intercom');
  const intercomTotal = sumQty(intercomItems);
  if (intercomTotal > 0) vars['INTERCOM_TOTAL'] = String(intercomTotal);
  const intercomModels = collectModels(intercomItems);
  if (intercomModels) vars['INTERCOM_MODELS'] = intercomModels;
  const intercomVendorCounts: Record<string, number> = {};
  intercomItems.forEach(item => {
    if (item.vendor) intercomVendorCounts[item.vendor] = (intercomVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topIntercomVendor = Object.entries(intercomVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topIntercomVendor) vars['INTERCOM_BRAND'] = topIntercomVendor[0];

  // Electric Strikes
  const strikeTotal = sumQty(byCat('strike'));
  if (strikeTotal > 0) vars['ELECTRIC_STRIKE_COUNT'] = String(strikeTotal);

  // Maglocks
  const maglockTotal = sumQty(byCat('maglock'));
  if (maglockTotal > 0) vars['MAGLOCK_COUNT'] = String(maglockTotal);

  // Motorized Latch / Electrified Exit Devices
  const motorizedTotal = sumQty(byCat('motorized'));
  if (motorizedTotal > 0) vars['MOTORIZED_LATCH_COUNT'] = String(motorizedTotal);

  // Lock total (sum of all lock types found)
  const lockTotal = strikeTotal + maglockTotal + motorizedTotal;
  if (lockTotal > 0) vars['LOCK_TOTAL'] = String(lockTotal);

  // Power Transfers (hinge/loop)
  const powerTransferTotal = sumQty(byCat('power_transfer'));
  if (powerTransferTotal > 0) vars['POWER_TRANSFER_COUNT'] = String(powerTransferTotal);

  // Readers
  const readerItems = byCat('reader');
  const readerTotal = sumQty(readerItems);
  if (readerTotal > 0) vars['NEW_READER_COUNT'] = String(readerTotal);
  const readerModels = collectModels(readerItems);
  if (readerModels) vars['READER_MODELS'] = readerModels;
  const readerVendorCounts: Record<string, number> = {};
  readerItems.forEach(item => {
    if (item.vendor) readerVendorCounts[item.vendor] = (readerVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topReaderVendor = Object.entries(readerVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topReaderVendor) vars['READER_BRAND'] = topReaderVendor[0];

  // Door Position Sensors
  const dpsTotal = sumQty(byCat('dps'));
  if (dpsTotal > 0) vars['DPS_COUNT'] = String(dpsTotal);

  // REX (Request to Exit)
  const rexItems = byCat('rex');
  const rexTotal = sumQty(rexItems);
  if (rexTotal > 0) vars['REX_COUNT'] = String(rexTotal);

  // Push-to-Exit Buttons
  const pushTotal = sumQty(byCat('push'));
  if (pushTotal > 0) vars['PUSH_COUNTS'] = String(pushTotal);

  // Power Supplies
  const powerSupplyTotal = sumQty(byCat('power_supply'));
  if (powerSupplyTotal > 0) vars['POWER_SUPPLY_COUNT'] = String(powerSupplyTotal);

  // Vape Detection Sensors (Verkada, Halo, Triton)
  const vapeItems = byCat('vape');
  const vapeTotal = sumQty(vapeItems);
  if (vapeTotal > 0) vars['VAPE_SENSOR_COUNT'] = String(vapeTotal);
  const vapeModels = collectModels(vapeItems);
  if (vapeModels) vars['VAPE_SENSOR_MODELS'] = vapeModels;
  const vapeVendorCounts: Record<string, number> = {};
  vapeItems.forEach(item => {
    if (item.vendor) vapeVendorCounts[item.vendor] = (vapeVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topVapeVendor = Object.entries(vapeVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topVapeVendor) vars['VAPE_SENSOR_BRAND'] = topVapeVendor[0];


  // Intrusion / Alarm System
  const alarmPanelItems = byCat('alarm_panel');
  const alarmPanelTotal = sumQty(alarmPanelItems);
  if (alarmPanelTotal > 0) vars['ALARM_PANEL_COUNT'] = String(alarmPanelTotal);
  const alarmPanelModels = collectModels(alarmPanelItems);
  if (alarmPanelModels) vars['ALARM_PANEL_MODELS'] = alarmPanelModels;
  const alarmVendorCounts: Record<string, number> = {};
  alarmPanelItems.forEach(item => {
    if (item.vendor) alarmVendorCounts[item.vendor] = (alarmVendorCounts[item.vendor] || 0) + item.quantity;
  });
  const topAlarmVendor = Object.entries(alarmVendorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topAlarmVendor) {
    vars['ALARM_BRAND'] = topAlarmVendor[0];
  } else {
    // Infer brand from item text when vendor column is absent
    const alarmText = alarmPanelItems
      .map(i => `${i.description || ''} ${i.partNumber || ''}`.toLowerCase())
      .join(' ');
    const brandGuess = /verkada|bc81|bc61|bp52|ak11|bk22/.test(alarmText)
      ? 'Verkada'
      : /honeywell|vista|proa7|proseries|resideo/.test(alarmText)
      ? 'Honeywell'
      : /brivo|acs300|acs6000/.test(alarmText)
      ? 'Brivo'
      : '';
    if (brandGuess) vars['ALARM_BRAND'] = brandGuess;
  }

  const keypadTotal = sumQty(byCat('keypad'));
  if (keypadTotal > 0) vars['ALARM_KEYPAD_COUNT'] = String(keypadTotal);

  const motionTotal = sumQty(byCat('motion'));
  if (motionTotal > 0) vars['MOTION_DETECTOR_COUNT'] = String(motionTotal);

  const contactTotal = sumQty(byCat('contact'));
  if (contactTotal > 0) vars['DOOR_CONTACT_COUNT'] = String(contactTotal);

  const glassbreakTotal = sumQty(byCat('glassbreak'));
  if (glassbreakTotal > 0) vars['GLASSBREAK_COUNT'] = String(glassbreakTotal);

  const sirenTotal = sumQty(byCat('siren'));
  if (sirenTotal > 0) vars['SIREN_COUNT'] = String(sirenTotal);

  const communicatorTotal = sumQty(byCat('communicator'));
  if (communicatorTotal > 0) vars['ALARM_COMMUNICATOR_COUNT'] = String(communicatorTotal);

  const panicTotal = sumQty(byCat('panic'));
  if (panicTotal > 0) vars['PANIC_BUTTON_COUNT'] = String(panicTotal);

  const wirelessHubTotal = sumQty(byCat('wireless_hub'));
  if (wirelessHubTotal > 0) vars['WIRELESS_HUB_COUNT'] = String(wirelessHubTotal);

  const alarmBatteryTotal = sumQty(byCat('alarm_battery'));
  if (alarmBatteryTotal > 0) vars['ALARM_BATTERY_COUNT'] = String(alarmBatteryTotal);



  // Miscellaneous: anything on the BOM not recognized by any section above
  const miscItems = bomItems.filter(item => !categoryOf.get(item));
  if (miscItems.length > 0) {
    vars['MISC_ITEMS'] = miscItems
      .map(item => {
        const qty = item.quantity || 0;
        const desc = (item.description || '').trim() || (item.partNumber || '').trim() || 'Unspecified item';
        const pn = (item.partNumber || '').trim();
        const showPn = pn && pn.toLowerCase() !== 'n/a' && !desc.toLowerCase().includes(pn.toLowerCase());
        return `${qty} x ${desc}${showPn ? ` (${pn})` : ''}`;
      })
      .join('\n');
    vars['MISC_ITEM_COUNT'] = String(sumQty(miscItems));
  }

  const inferredDoorTotal = Math.max(
    controllerItems.reduce((sum, item) => sum + getDoorCapacityFromController(item), 0),
    intercomTotal,
    lockTotal,
    readerTotal,
    dpsTotal,
    rexTotal,
    pushTotal,
    powerTransferTotal
  );

  if (inferredDoorTotal > 0) {
    vars['DOOR_TOTAL'] = String(inferredDoorTotal);
    vars['NEW_DOOR_COUNT'] = String(inferredDoorTotal);
    vars['COMPOSITE_COUNT'] = String(inferredDoorTotal);
  }

  return vars;
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
