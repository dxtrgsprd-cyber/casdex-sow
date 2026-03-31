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
}

// Pattern → spec lookup. Patterns are matched against part numbers (case-insensitive).
const DEVICE_DATABASE: { pattern: RegExp; spec: DeviceSpec }[] = [
  // ── Verkada ──
  {
    pattern: /TD53/i,
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
    pattern: /AC12/i,
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
    pattern: /AD34/i,
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
    pattern: /CD52/i,
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
