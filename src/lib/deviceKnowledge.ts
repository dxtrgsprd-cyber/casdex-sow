// Device Knowledge Base for Field Manual generation
// Maps vendor + part number patterns to device specs

export interface DeviceSpec {
  name: string;
  type: string;
  vendor: string;
  poe: string;
  defaultIp: string;
  defaultUsername: string;
  defaultPassword: string;
  managementPorts: string;
  relayOutput: string;
  communicationProtocol: string;
  vms: string;
  managementUrl: string;
  keySpecs: string;
  installNotes: string[];
  criticalNotes: string[];
  /** Brand/model-specific QC checks (item, spec) */
  qcChecks?: [string, string][];
}

// Pattern → spec lookup. Patterns are matched against part numbers (case-insensitive).
const DEVICE_DATABASE: { pattern: RegExp; spec: DeviceSpec }[] = [
  // ── Verkada ──
  {
    pattern: /\bTD53\b/i,
    spec: {
      name: 'TD53 Video Intercom',
      type: 'Video Intercom',
      vendor: 'Verkada',
      poe: '802.3af',
      defaultIp: 'DHCP auto',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: '443 (HTTPS)',
      relayOutput: 'Yes — dry contact relay',
      communicationProtocol: 'SIP / Cloud',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'Cloud-managed, relay output, SIP, Verkada Command',
      installNotes: [
        'Mount at 48" AFF to center of camera lens',
        'Connect single Cat6 cable to PoE switch (802.3af minimum)',
        'Device will auto-register to Verkada Command upon power-up',
        'Configure door release relay in Verkada Command after device is online',
        'Test intercom audio, video, and door release functionality',
      ],
      criticalNotes: [
        'Relay output requires configuration in Verkada Command before testing door release',
      ],
    },
  },
  {
    pattern: /\bAC12\b/i,
    spec: {
      name: 'AC12 1-Door Controller',
      type: 'Access Controller',
      vendor: 'Verkada',
      poe: '802.3af/at',
      defaultIp: 'DHCP auto',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: '443 (HTTPS)',
      relayOutput: 'Yes — lock relay + aux relay',
      communicationProtocol: 'OSDP / Wiegand',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'OSDP reader support, relay output, cloud-managed',
      installNotes: [
        'Mount controller inside secured enclosure near the door',
        'Connect Cat6 uplink to PoE switch (802.3at recommended)',
        'Wire OSDP readers: RS-485 A(+), B(-), +V, GND',
        'Wire lock relay: N.C./N.O. per lock type, verify DC 12V power to lock',
        'Wire REX and door contact sensors',
        'Device auto-registers to Verkada Command',
        'Configure door schedules, credentials, and lockdown behavior in Command',
      ],
      criticalNotes: [
        'Verify lock power supply is DC 12V — do NOT rely on controller PoE for lock power',
        'OSDP wiring is POLARITY SENSITIVE — reversed A/B will cause reader communication failure',
      ],
    },
  },
  {
    pattern: /\bAD34\b/i,
    spec: {
      name: 'AD34 OSDP Multi-Tech Reader',
      type: 'Card Reader',
      vendor: 'Verkada',
      poe: 'Powered by AC12 controller',
      defaultIp: 'N/A (wired to controller)',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'N/A (reader only)',
      communicationProtocol: 'OSDP RS-485',
      vms: 'Verkada Command',
      managementUrl: 'N/A',
      keySpecs: 'Multi-tech: card, fob, mobile credentials',
      installNotes: [
        'Mount reader at 48" AFF on secure side of door',
        'Wire 4-conductor to AC12: RS-485 A(+), B(-), +V, GND',
        'Reader will auto-discover in Verkada Command once controller is online',
        'Test card/fob/mobile credential read',
      ],
      criticalNotes: [
        'RS-485 A/B wiring is polarity sensitive — match colors consistently across all readers',
      ],
    },
  },
  {
    pattern: /\bCD52\b/i,
    spec: {
      name: 'CD52 Outdoor Dome Camera',
      type: 'CCTV Camera',
      vendor: 'Verkada',
      poe: '802.3af',
      defaultIp: 'DHCP auto',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: '443 (HTTPS)',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: '5MP, IR night vision, cloud-managed',
      installNotes: [
        'Mount per manufacturer specs — verify surface can support weight',
        'Connect single Cat6 to PoE switch (802.3af)',
        'Verify camera field of view matches approved drawings',
        'Device auto-registers to Verkada Command',
        'Adjust aim and focus via Command interface',
      ],
      criticalNotes: [],
    },
  },
  // ── Hanwha / Wisenet ──
  {
    pattern: /TID-600R/i,
    spec: {
      name: 'TID-600R Network Video Intercom',
      type: 'Video Intercom',
      vendor: 'Hanwha',
      poe: '802.3af (~9.1W typ, 12.95W max)',
      defaultIp: 'DHCP / fallback 192.168.1.100',
      defaultUsername: 'admin (fixed)',
      defaultPassword: 'Set on first login',
      managementPorts: '80 (HTTP), 554 (RTSP)',
      relayOutput: 'Yes — but requires DC 12V external power',
      communicationProtocol: 'SIP / ONVIF',
      vms: 'Wisenet Wave',
      managementUrl: 'http://<device-ip>',
      keySpecs: 'DC 12V required for door strike relay — PoE alone will NOT trigger relay',
      installNotes: [
        'Mount intercom at 48" AFF',
        'Connect Cat6 to PoE switch (802.3af)',
        'Connect DC 12V power supply to relay terminal for door strike',
        'Access web UI at device IP, set admin password on first login',
        'Configure SIP settings for intercom calling',
        'Add to Wisenet Wave VMS',
        'Test audio, video, and door release',
      ],
      criticalNotes: [
        'DC 12V REQUIRED for door strike relay — PoE alone will NOT power the relay output. This is the #1 field issue.',
      ],
    },
  },
  {
    pattern: /NHP-P200/i,
    spec: {
      name: 'NHP-P200 8-Door Controller',
      type: 'Access Controller',
      vendor: 'Hanwha',
      poe: '802.3at',
      defaultIp: 'DHCP / fallback 192.168.1.100',
      defaultUsername: 'admin',
      defaultPassword: 'Set on first login',
      managementPorts: '80 (HTTP)',
      relayOutput: 'Yes — 8 lock relays',
      communicationProtocol: 'OSDP / Wiegand',
      vms: 'Wisenet Wave',
      managementUrl: 'http://<device-ip>',
      keySpecs: 'DynaLock power supply, Wisenet Wave, 8-door capacity',
      installNotes: [
        'Mount controller in secured enclosure with dedicated power supply',
        'Connect Cat6 uplink to PoE switch (802.3at required)',
        'Wire OSDP readers on RS-485 bus: A(+), B(-), +V, GND',
        'Wire lock relays per door — verify N.C./N.O. configuration',
        'Wire REX buttons and door contact sensors',
        'Access web UI, set admin password, configure doors',
        'Add to Wisenet Wave VMS',
      ],
      criticalNotes: [
        'Requires 802.3at PoE — 802.3af switches will NOT provide sufficient power',
      ],
    },
  },
  {
    pattern: /NHP-P100/i,
    spec: {
      name: 'NHP-P100 1-Door Controller',
      type: 'Access Controller',
      vendor: 'Hanwha',
      poe: '802.3af',
      defaultIp: 'DHCP / fallback 192.168.1.100',
      defaultUsername: 'admin',
      defaultPassword: 'Set on first login',
      managementPorts: '80 (HTTP)',
      relayOutput: 'Yes — 1 lock relay',
      communicationProtocol: 'OSDP / Wiegand',
      vms: 'Wisenet Wave',
      managementUrl: 'http://<device-ip>',
      keySpecs: 'Single-door controller, Wisenet Wave',
      installNotes: [
        'Mount controller near door in secured location',
        'Connect Cat6 to PoE switch (802.3af)',
        'Wire OSDP reader: RS-485 A(+), B(-), +V, GND',
        'Wire lock relay — verify N.C./N.O.',
        'Wire REX and door contact',
        'Add to Wisenet Wave VMS',
      ],
      criticalNotes: [],
    },
  },
  {
    pattern: /NOD-AX10S/i,
    spec: {
      name: 'NOD-AX10S OSDP Card Reader',
      type: 'Card Reader',
      vendor: 'Hanwha',
      poe: 'Powered by controller',
      defaultIp: 'N/A',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'N/A',
      communicationProtocol: 'OSDP RS-485',
      vms: 'Wisenet Wave',
      managementUrl: 'N/A',
      keySpecs: 'Multi-tech, OSDP RS-485',
      installNotes: [
        'Mount at 48" AFF on secure side',
        'Wire 4-conductor to controller: RS-485 A(+), B(-), +V, GND',
        'Reader auto-discovers when controller is online',
      ],
      criticalNotes: [],
    },
  },
  // ── Avigilon ──
  {
    pattern: /AC-MER-CONT/i,
    spec: {
      name: 'Mercury Controller (Avigilon Unity)',
      type: 'Access Controller',
      vendor: 'Avigilon',
      poe: '802.3at',
      defaultIp: 'DHCP',
      defaultUsername: 'admin',
      defaultPassword: 'Set on first login',
      managementPorts: '443 (HTTPS)',
      relayOutput: 'Yes',
      communicationProtocol: 'OSDP / Wiegand',
      vms: 'Avigilon Unity',
      managementUrl: 'https://<appliance-ip>',
      keySpecs: 'Mercury-based controller, Avigilon Unity Access Control',
      installNotes: [
        'Mount controller in secured enclosure',
        'Connect Cat6 uplink to PoE switch (802.3at)',
        'Wire readers via OSDP RS-485 or Wiegand',
        'Wire lock power supply and relay outputs',
        'Controller registers to UA appliance automatically',
        'Configure doors, schedules, and credentials in Unity',
      ],
      criticalNotes: [
        'Requires 802.3at PoE minimum',
      ],
    },
  },
  {
    pattern: /AC-MER-CON-MR52/i,
    spec: {
      name: 'Mercury MR52-S3 2-Reader Interface',
      type: 'Reader Interface',
      vendor: 'Avigilon',
      poe: 'Powered by controller',
      defaultIp: 'N/A (downstream of controller)',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'Yes — 2 doors',
      communicationProtocol: 'OSDP / Wiegand',
      vms: 'Avigilon Unity',
      managementUrl: 'N/A',
      keySpecs: '2-reader downstream board for Mercury controllers',
      installNotes: [
        'Connect to Mercury controller via RS-485 downstream bus',
        'Wire readers and lock relays per door',
        'Board auto-discovers through controller',
      ],
      criticalNotes: [],
    },
  },
  {
    pattern: /AC-HID-READER|SIGNO/i,
    spec: {
      name: 'HID Signo Reader',
      type: 'Card Reader',
      vendor: 'HID (Avigilon)',
      poe: 'Powered by controller',
      defaultIp: 'N/A',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'N/A',
      communicationProtocol: 'OSDP RS-485',
      vms: 'Avigilon Unity',
      managementUrl: 'N/A',
      keySpecs: 'HID Signo 40 multi-tech reader, OSDP',
      installNotes: [
        'Mount at 48" AFF',
        'Wire OSDP: RS-485 A(+), B(-), +V, GND to controller/MR52',
        'Test credential read after controller is online',
      ],
      criticalNotes: [],
    },
  },
  {
    pattern: /UA-APP/i,
    spec: {
      name: 'Avigilon Unity Appliance',
      type: 'Server/Appliance',
      vendor: 'Avigilon',
      poe: 'N/A (AC powered)',
      defaultIp: 'DHCP',
      defaultUsername: 'admin',
      defaultPassword: 'Set during setup',
      managementPorts: '443 (HTTPS)',
      relayOutput: 'N/A',
      communicationProtocol: 'TCP/IP',
      vms: 'Avigilon Unity',
      managementUrl: 'https://<appliance-ip>',
      keySpecs: 'On-premise access control server appliance',
      installNotes: [
        'Rack-mount or place on stable surface in IDF/MDF',
        'Connect to network switch via Cat6',
        'Power on and access web UI for initial setup',
        'Configure site, doors, credentials, and controller enrollment',
      ],
      criticalNotes: [
        'Must be powered and online before controllers will register',
      ],
    },
  },
  // ── LiftMaster / Gate ──
  {
    pattern: /LMSC1000/i,
    spec: {
      name: 'LMSC1000 Long-Range RFID Reader',
      type: 'RFID Reader',
      vendor: 'LiftMaster',
      poe: 'N/A (12-24V DC)',
      defaultIp: 'N/A',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'Yes — trigger output',
      communicationProtocol: 'Wiegand',
      vms: 'N/A',
      managementUrl: 'N/A',
      keySpecs: 'Vehicular access, windshield/rearview mirror tags',
      installNotes: [
        'Mount reader at vehicle approach height per manufacturer specs',
        'Connect 12-24V DC power supply',
        'Wire Wiegand output to gate controller or access controller',
        'Program RFID tags per vehicle',
        'Test read range with vehicle approach',
      ],
      criticalNotes: [
        'Read range varies by tag type and mounting angle — test before final mount',
      ],
    },
  },
  {
    pattern: /SD50F|SlideDriver/i,
    spec: {
      name: 'LiftMaster SlideDriver II SD50F',
      type: 'Gate Operator',
      vendor: 'LiftMaster',
      poe: 'N/A (AC powered)',
      defaultIp: 'N/A',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'Accepts relay input for open/close',
      communicationProtocol: 'Dry contact relay',
      vms: 'N/A',
      managementUrl: 'N/A',
      keySpecs: 'Sliding gate operator, integrates with controller relays',
      installNotes: [
        'Install per manufacturer mechanical specifications',
        'Connect AC power per NEC requirements',
        'Wire relay input from access controller for open/close trigger',
        'Configure gate travel limits and safety sensors',
        'Test full open/close cycle with safety sensor verification',
      ],
      criticalNotes: [
        'Safety sensors MUST be operational before gate is put into service',
        'Gate travel limits must be set before automated operation',
      ],
    },
  },
  // ── Infrastructure ──
  {
    pattern: /NETWAY.*BT/i,
    spec: {
      name: 'Altronix NetWay PoE Switch',
      type: 'PoE Switch',
      vendor: 'Altronix',
      poe: '802.3bt (provides power)',
      defaultIp: 'N/A (unmanaged)',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'N/A',
      communicationProtocol: 'Ethernet',
      vms: 'N/A',
      managementUrl: 'N/A',
      keySpecs: 'Hardened 802.3bt PoE switch with power supply',
      installNotes: [
        'Mount in NEMA enclosure or equipment rack',
        'Connect AC power to integral power supply',
        'Connect uplink port to network backbone',
        'Connect PoE devices to downstream ports',
        'Verify link lights on all active ports',
      ],
      criticalNotes: [],
    },
  },
  {
    pattern: /DTK-120|DTK-240/i,
    spec: {
      name: 'DITEK AC Surge Protector',
      type: 'Surge Protection',
      vendor: 'DITEK',
      poe: 'N/A',
      defaultIp: 'N/A',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'N/A',
      communicationProtocol: 'N/A',
      vms: 'N/A',
      managementUrl: 'N/A',
      keySpecs: 'AC panel surge protection',
      installNotes: [
        'Install at AC feed point in gate/outdoor enclosure',
        'Wire per manufacturer specs — line, neutral, ground',
        'Verify protection indicator LED is green after power-up',
      ],
      criticalNotes: [
        'Must be installed BEFORE powering any downstream equipment',
      ],
    },
  },
  {
    pattern: /DTK-MRJPOE/i,
    spec: {
      name: 'DITEK PoE Ethernet Surge Protector',
      type: 'Surge Protection',
      vendor: 'DITEK',
      poe: 'Pass-through',
      defaultIp: 'N/A',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'N/A',
      communicationProtocol: 'Ethernet pass-through',
      vms: 'N/A',
      managementUrl: 'N/A',
      keySpecs: 'PoE Ethernet surge protection for outdoor/gate equipment',
      installNotes: [
        'Install inline on Cat6 cable at enclosure entry point',
        'Connect IN port to uplink, OUT port to device',
        'Ground to enclosure ground bus',
      ],
      criticalNotes: [],
    },
  },
  {
    pattern: /AL400UL|Altronix.*Power/i,
    spec: {
      name: 'Altronix Access Power Controller',
      type: 'Power Supply',
      vendor: 'Altronix',
      poe: 'N/A (AC powered)',
      defaultIp: 'N/A',
      defaultUsername: 'N/A',
      defaultPassword: 'N/A',
      managementPorts: 'N/A',
      relayOutput: 'Provides lock power outputs',
      communicationProtocol: 'N/A',
      vms: 'N/A',
      managementUrl: 'N/A',
      keySpecs: 'Access power controller with battery backup',
      installNotes: [
        'Mount in enclosure near access control hardware',
        'Connect AC input power',
        'Connect battery backup (12V SLA)',
        'Wire lock power outputs to door locks',
        'Verify output voltage under load',
      ],
      criticalNotes: [
        'Verify output voltage matches lock requirements before connecting',
      ],
    },
  },
  {
    pattern: /^MV\d{2}[A-Z]*(-HW)?\b/i,
    spec: {
      name: 'Cisco Meraki MV Smart Camera',
      type: 'CCTV Camera',
      vendor: 'Cisco Meraki',
      poe: 'PoE — class varies by model, confirm on model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound internet to Meraki cloud (see Dashboard > Help > Firewall info)',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Meraki Dashboard)',
      vms: 'Cisco Meraki Dashboard',
      managementUrl: 'https://dashboard.meraki.com',
      keySpecs: 'Cloud-managed camera, on-board storage, managed in Meraki Dashboard',
      installNotes: [
        'Confirm with PM that camera serials / order number are claimed into the correct Dashboard organization and network before arrival',
        'Mount using the Meraki mount accessory listed on the BOM for this model',
        'Run Cat6 to a PoE switch port and confirm the port supplies the PoE class required by the model',
        'Camera obtains an IP by DHCP and connects to Meraki cloud automatically — confirm status turns green in Dashboard',
        'Allow firmware to update in Dashboard before final aiming',
        'Aim and focus using the live view in Dashboard; set name and location to match the Hardware Schedule',
      ],
      criticalNotes: [
        'A valid MV license must be applied in Dashboard for every camera — unlicensed cameras put the organization out of compliance',
        'Do not factory reset or re-claim cameras without PM approval',
      ],
      qcChecks: [
        ['Camera online in Meraki Dashboard', 'Status green, correct network'],
        ['MV license applied', 'No license warnings in Organization > License info'],
        ['Camera named per Hardware Schedule', 'Name and address/location set in Dashboard'],
        ['Field of view and focus approved', 'Screenshot of live view saved'],
        ['Firmware up to date', 'No pending upgrade in Dashboard'],
      ],
    },
  },
  {
    pattern: /^MS\d{3}/i,
    spec: {
      name: 'Cisco Meraki MS Switch',
      type: 'PoE Switch',
      vendor: 'Cisco Meraki',
      poe: 'N/A (AC powered, provides PoE)',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound internet to Meraki cloud (see Dashboard > Help > Firewall info)',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Meraki Dashboard)',
      vms: 'Cisco Meraki Dashboard',
      managementUrl: 'https://dashboard.meraki.com',
      keySpecs: 'Cloud-managed switch',
      installNotes: [
        'Confirm switch serial is claimed in the correct Dashboard network',
        'Rack/mount and connect AC power',
        'Connect uplink port to the customer network per PM direction',
        'Confirm switch is online in Dashboard and firmware is current',
        'Label each device port per the Hardware Schedule',
      ],
      criticalNotes: [
        'Confirm VLAN and uplink configuration with PM before connecting to the customer network',
      ],
      qcChecks: [
        ['Switch online in Meraki Dashboard', 'Status green'],
        ['Port labels match Hardware Schedule', 'Device names set on switch ports'],
        ['PoE budget sufficient', 'No PoE overload alerts in Dashboard'],
      ],
    },
  },
  {
    pattern: /^MR\d{2}/i,
    spec: {
      name: 'Cisco Meraki MR Access Point',
      type: 'Wireless Access Point',
      vendor: 'Cisco Meraki',
      poe: 'PoE — confirm class on model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound internet to Meraki cloud (see Dashboard > Help > Firewall info)',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Meraki Dashboard)',
      vms: 'Cisco Meraki Dashboard',
      managementUrl: 'https://dashboard.meraki.com',
      keySpecs: 'Cloud-managed access point',
      installNotes: [
        'Confirm AP serial is claimed in Dashboard',
        'Mount with the Meraki mount supplied',
        'Connect Cat6 to PoE switch port',
        'Confirm AP online in Dashboard',
      ],
      criticalNotes: [
      ],
      qcChecks: [
        ['AP online in Meraki Dashboard', 'Status green'],
        ['AP named / placed on floor plan', 'Per Hardware Schedule'],
      ],
    },
  },
  {
    pattern: /^MX\d{2,3}/i,
    spec: {
      name: 'Cisco Meraki MX Security Appliance',
      type: 'Firewall / Gateway',
      vendor: 'Cisco Meraki',
      poe: 'N/A (AC powered)',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound internet to Meraki cloud (see Dashboard > Help > Firewall info)',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Meraki Dashboard)',
      vms: 'Cisco Meraki Dashboard',
      managementUrl: 'https://dashboard.meraki.com',
      keySpecs: 'Cloud-managed security appliance',
      installNotes: [
        'Confirm MX serial is claimed in Dashboard',
        'Connect WAN to customer ISP hand-off per PM',
        'Confirm MX online in Dashboard',
      ],
      criticalNotes: [
        'Do not connect the WAN port until PM confirms WAN addressing',
      ],
      qcChecks: [
        ['MX online in Meraki Dashboard', 'Status green'],
        ['WAN connectivity confirmed', 'Uplink status healthy'],
      ],
    },
  },
  {
    pattern: /^MT\d{2}/i,
    spec: {
      name: 'Cisco Meraki MT Sensor',
      type: 'Environmental Sensor',
      vendor: 'Cisco Meraki',
      poe: 'Battery powered',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Reports through a Meraki MV or MR gateway',
      relayOutput: 'N/A',
      communicationProtocol: 'Bluetooth to Meraki gateway',
      vms: 'Cisco Meraki Dashboard',
      managementUrl: 'https://dashboard.meraki.com',
      keySpecs: 'Cloud-managed sensor',
      installNotes: [
        'Confirm sensor is claimed in Dashboard',
        'Confirm a Meraki MV camera or MR AP gateway is within range',
        'Mount sensor per Hardware Schedule',
        'Confirm readings appear in Dashboard',
      ],
      criticalNotes: [
      ],
      qcChecks: [
        ['Sensor reporting in Dashboard', 'Readings visible'],
        ['Gateway assigned', 'Sensor shows connected gateway'],
      ],
    },
  },
  {
    pattern: /^(CD|CB|CM|CF|CP|CH)\d{2}(-E)?(-HW)?\b/i,
    spec: {
      name: 'Verkada Camera',
      type: 'CCTV Camera',
      vendor: 'Verkada',
      poe: 'PoE — class varies by model, confirm on model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound HTTPS (443) to Verkada cloud',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Verkada Command)',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'Cloud-managed camera with on-board storage',
      installNotes: [
        'Confirm with PM that cameras are added to the correct Verkada Command organization and site',
        'Mount using the Verkada mount accessory listed on the BOM',
        'Run Cat6 to a PoE switch port meeting the model PoE class',
        'Camera connects to Command automatically — confirm it appears online',
        'Aim and focus from live view in Command; name per Hardware Schedule',
      ],
      criticalNotes: [
        'Each camera requires an active Verkada license in Command',
      ],
      qcChecks: [
        ['Camera online in Verkada Command', 'Correct site'],
        ['License assigned', 'No license warning'],
        ['Camera named per Hardware Schedule', 'Name set in Command'],
        ['Field of view approved', 'Screenshot saved'],
      ],
    },
  },
  {
    pattern: /^BP52/i,
    spec: {
      name: 'Verkada BP52 Alarm Panel',
      type: 'Alarm Panel',
      vendor: 'Verkada',
      poe: 'Confirm power on model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound HTTPS (443) to Verkada cloud',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Verkada Command)',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'Verkada intrusion system component',
      installNotes: [
        'Add panel to the site in Verkada Command > Alarms',
        'Mount panel in secure location per Hardware Schedule',
        'Connect network uplink (and cellular communicator if on BOM)',
        'Install backup battery listed on BOM',
        'Confirm panel online in Command',
      ],
      criticalNotes: [
        'Notify monitoring/customer before any alarm test',
      ],
      qcChecks: [
        ['Device online in Verkada Command > Alarms', 'Correct site'],
        ['Device tested', 'Alarm event received in Command'],
      ],
    },
  },
  {
    pattern: /^BK22/i,
    spec: {
      name: 'Verkada BK22 Keypad',
      type: 'Alarm Keypad',
      vendor: 'Verkada',
      poe: 'See model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound HTTPS (443) to Verkada cloud',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Verkada Command)',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'Verkada intrusion system component',
      installNotes: [
        'Mount at entry location per Hardware Schedule',
        'Pair/enroll keypad to the BP52 panel in Command',
        'Test arm/disarm',
      ],
      criticalNotes: [
      ],
      qcChecks: [
        ['Device online in Verkada Command > Alarms', 'Correct site'],
        ['Device tested', 'Alarm event received in Command'],
      ],
    },
  },
  {
    pattern: /^BR33/i,
    spec: {
      name: 'Verkada BR33 Panic Button',
      type: 'Panic Button',
      vendor: 'Verkada',
      poe: 'Battery powered',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound HTTPS (443) to Verkada cloud',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Verkada Command)',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'Verkada intrusion system component',
      installNotes: [
        'Mount per Hardware Schedule (confirm height with PM)',
        'Enroll to panel in Command',
        'Test activation with monitoring placed on test',
      ],
      criticalNotes: [
        'Notify monitoring/customer before any alarm test',
      ],
      qcChecks: [
        ['Device online in Verkada Command > Alarms', 'Correct site'],
        ['Device tested', 'Alarm event received in Command'],
      ],
    },
  },
  {
    pattern: /^BZ32/i,
    spec: {
      name: 'Verkada BZ32 Siren',
      type: 'Siren',
      vendor: 'Verkada',
      poe: 'See model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound HTTPS (443) to Verkada cloud',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Verkada Command)',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'Verkada intrusion system component',
      installNotes: [
        'Mount per Hardware Schedule',
        'Enroll to panel in Command',
        'Test siren with customer notified',
      ],
      criticalNotes: [
        'Notify monitoring/customer before any alarm test',
      ],
      qcChecks: [
        ['Device online in Verkada Command > Alarms', 'Correct site'],
        ['Device tested', 'Alarm event received in Command'],
      ],
    },
  },
  {
    pattern: /^WH52/i,
    spec: {
      name: 'Verkada WH52 Wireless Hub',
      type: 'Wireless Hub',
      vendor: 'Verkada',
      poe: 'See model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound HTTPS (443) to Verkada cloud',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Verkada Command)',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'Verkada intrusion system component',
      installNotes: [
        'Mount centrally for wireless coverage',
        'Connect and add to site in Command',
        'Confirm wireless devices report signal strength',
      ],
      criticalNotes: [
      ],
      qcChecks: [
        ['Device online in Verkada Command > Alarms', 'Correct site'],
        ['Device tested', 'Alarm event received in Command'],
      ],
    },
  },
  {
    pattern: /^ACC-CEL-LTE/i,
    spec: {
      name: 'Verkada Cellular Communicator',
      type: 'Alarm Communicator',
      vendor: 'Verkada',
      poe: 'Powered from panel',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound HTTPS (443) to Verkada cloud',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Verkada Command)',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'Verkada intrusion system component',
      installNotes: [
        'Install communicator in BP52 panel per Verkada guide',
        'Confirm cellular signal in Command',
      ],
      criticalNotes: [
      ],
      qcChecks: [
        ['Device online in Verkada Command > Alarms', 'Correct site'],
        ['Device tested', 'Alarm event received in Command'],
      ],
    },
  },
  {
    pattern: /^SV\d{2}/i,
    spec: {
      name: 'Verkada SV Environmental / Vape Sensor',
      type: 'Vape Sensor',
      vendor: 'Verkada',
      poe: 'PoE — confirm on model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Outbound HTTPS (443) to Verkada cloud',
      relayOutput: 'N/A',
      communicationProtocol: 'Cloud (Verkada Command)',
      vms: 'Verkada Command',
      managementUrl: 'https://command.verkada.com',
      keySpecs: 'Cloud-managed air quality / vape sensor',
      installNotes: [
        'Confirm sensor is added to the correct site in Command',
        'Mount per Hardware Schedule away from HVAC supply vents',
        'Connect Cat6 to PoE switch',
        'Confirm readings and alert thresholds in Command',
      ],
      criticalNotes: [
      ],
      qcChecks: [
        ['Sensor online in Verkada Command', 'Readings visible'],
        ['Alert notifications configured', 'Recipients confirmed with PM'],
      ],
    },
  },
  {
    pattern: /\bHALO\b/i,
    spec: {
      name: 'HALO Smart Sensor (IPVideo)',
      type: 'Vape Sensor',
      vendor: 'IPVideo (HALO)',
      poe: 'PoE — confirm on model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Per IPVideo HALO documentation',
      relayOutput: 'Relay output available on some models — see datasheet',
      communicationProtocol: 'Network (PoE)',
      vms: 'HALO Cloud / HALO device web interface',
      managementUrl: 'Per IPVideo HALO documentation',
      keySpecs: 'Vape / air quality / sound-event sensor',
      installNotes: [
        'Mount per Hardware Schedule away from HVAC supply vents',
        'Connect Cat6 to PoE switch',
        'Register sensor in HALO Cloud (or configure via web interface) per IPVideo quick start',
        'Set alert thresholds and notification recipients with PM',
      ],
      criticalNotes: [
      ],
      qcChecks: [
        ['Sensor online in HALO Cloud', 'Readings visible'],
        ['Alerts configured', 'Test alert received by customer contact'],
      ],
    },
  },
  {
    pattern: /\bTRITON\b/i,
    spec: {
      name: 'Triton Vape Sensor',
      type: 'Vape Sensor',
      vendor: 'Triton',
      poe: 'Confirm on model datasheet',
      defaultIp: 'DHCP',
      defaultUsername: 'N/A (cloud-managed)',
      defaultPassword: 'N/A (cloud-managed)',
      managementPorts: 'Per Triton documentation',
      relayOutput: 'See model datasheet',
      communicationProtocol: 'Network',
      vms: 'Triton management platform',
      managementUrl: 'Per Triton documentation',
      keySpecs: 'Vape detection sensor',
      installNotes: [
        'Mount per Hardware Schedule away from HVAC supply vents',
        'Connect network/power per Triton install guide',
        'Register sensor in the Triton platform',
        'Set alert recipients with PM',
      ],
      criticalNotes: [
      ],
      qcChecks: [
        ['Sensor online in Triton platform', 'Readings visible'],
        ['Alerts configured', 'Test alert received'],
      ],
    },
  },
];

/**
 * Match BOM items against the device knowledge base
 * Returns unique device specs found in the project
 */
export function matchDevicesFromBom(
  bomItems: { description: string; partNumber?: string; vendor?: string }[]
): DeviceSpec[] {
  const matched = new Map<string, DeviceSpec>();

  for (const item of bomItems) {
    const searchText = `${item.partNumber || ''} ${item.description || ''} ${item.vendor || ''}`;

    for (const entry of DEVICE_DATABASE) {
      if (entry.pattern.test(searchText) && !matched.has(entry.spec.name)) {
        matched.set(entry.spec.name, entry.spec);
      }
    }
  }

  return Array.from(matched.values());
}

export interface BomLineRef { partNumber: string; description: string; quantity: number }
export interface MatchedDevice { spec: DeviceSpec; lines: BomLineRef[]; quantity: number }
export interface BomMatchResult {
  devices: MatchedDevice[];
  /** Licenses, mounts, cable, power and other materials */
  accessories: BomLineRef[];
  /** Device lines with no verified manufacturer reference */
  unmatched: BomLineRef[];
}

const ACCESSORY_RE = /^LIC-|\b(licen[cs]e|subscription|warranty|mount|bracket|adapter|cable|cat ?6|patch|connector|battery|batteries|pole|arm|cap|plate|box|enclosure|surge|injector|power supply|transformer|conduit|fitting|label|software|service)\b/i;

/**
 * Match each BOM line to exactly one device spec. Part number is checked first,
 * then description/vendor. Licenses/materials are kept separate so they are
 * never presented as devices.
 */
export function matchBomToDevices(
  bomItems: { description: string; partNumber?: string; vendor?: string; quantity?: number }[]
): BomMatchResult {
  const map = new Map<string, MatchedDevice>();
  const accessories: BomLineRef[] = [];
  const unmatched: BomLineRef[] = [];
  for (const item of bomItems) {
    const ref: BomLineRef = { partNumber: (item.partNumber || '').trim(), description: (item.description || '').trim(), quantity: Number(item.quantity) || 0 };
    const pn = ref.partNumber;
    const isAccessory = ACCESSORY_RE.test(pn) || ACCESSORY_RE.test(ref.description);
    let entry = pn ? DEVICE_DATABASE.find((e) => e.pattern.test(pn)) : undefined;
    if (!entry && !isAccessory) {
      const text = `${ref.description} ${item.vendor || ''}`;
      entry = DEVICE_DATABASE.find((e) => e.pattern.test(text));
    }
    if (entry && !(isAccessory && !ACCESSORY_DEVICE_TYPES.has(entry.spec.type) && !(pn && entry.pattern.test(pn)))) {
      const m = map.get(entry.spec.name) ?? { spec: entry.spec, lines: [], quantity: 0 };
      m.lines.push(ref);
      m.quantity += ref.quantity;
      map.set(entry.spec.name, m);
    } else if (isAccessory) {
      accessories.push(ref);
    } else {
      unmatched.push(ref);
    }
  }
  return { devices: Array.from(map.values()), accessories, unmatched };
}

const ACCESSORY_DEVICE_TYPES = new Set(['Power Supply', 'Surge Protection']);

/**
 * Detect system type from matched devices
 */
export function detectSystemType(devices: DeviceSpec[]): string {
  const types = new Set(devices.map((d) => d.type));
  if (types.has('Access Controller') && types.has('CCTV Camera')) return 'Access Control + CCTV';
  if (types.has('Access Controller') && types.has('Video Intercom')) return 'Access Control + Intercom';
  if (types.has('Gate Operator')) return 'Gate Access Control';
  if (types.has('Access Controller')) return 'Access Control';
  if (types.has('CCTV Camera')) return 'CCTV';
  if (types.has('Video Intercom')) return 'Intercom';
  return '';
}

/**
 * Detect VMS platform from matched devices
 */
export function detectVms(devices: DeviceSpec[]): string {
  const vmsList = [...new Set(devices.map((d) => d.vms).filter((v) => v && v !== 'N/A'))];
  return vmsList.join(' / ');
}
