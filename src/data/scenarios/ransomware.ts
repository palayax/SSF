/**
 * Ransomware Attack Scenario
 *
 * Scenario: LockBit-style ransomware attack initiated via phishing email
 * targeting finance department. Lateral movement through RDP.
 */

import { Scenario } from './index';

export const ransomwareScenario: Scenario = {
  id: 'ransomware',
  name: 'Ransomware Attack',
  description: 'Phishing-initiated ransomware targeting finance department with lateral movement',
  icon: 'Lock',
  severity: 'critical',

  incidentDescription: {
    description: `On January 15, 2024, at approximately 09:30 AM, an employee in the finance department (Sarah Johnson) reported that she could not access files on her workstation. Investigation revealed that files were encrypted with a .lockbit extension. A ransom note was found on the desktop demanding 50 BTC.

Initial analysis suggests the attack originated from a phishing email containing a malicious Excel attachment received the previous day. The malware appears to have spread laterally to at least 12 systems via compromised RDP credentials.`,
    startDate: '2024-01-14T16:45:00Z',
    endDate: '2024-01-15T09:30:00Z',
    patientZero: 'WS-FIN-042',
    affectedSystems: [
      'WS-FIN-042',
      'WS-FIN-043',
      'WS-FIN-044',
      'FS-FIN-01',
      'DC-MAIN-01',
      'WS-HR-015',
      'WS-HR-016',
      'FS-HR-01',
      'WS-IT-003',
      'WS-IT-004',
      'BACKUP-01',
      'PRINT-FIN-01',
    ],
    iocs: [
      { type: 'hash_md5', value: 'a3b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5' },
      { type: 'hash_sha256', value: '8f7e6d5c4b3a2918273645546372819a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e' },
      { type: 'ip', value: '185.234.72.19' },
      { type: 'ip', value: '91.243.45.67' },
      { type: 'domain', value: 'update-service.net' },
      { type: 'domain', value: 'cdn-delivery.com' },
      { type: 'email', value: 'invoice.2024@financial-docs.com' },
      { type: 'file_extension', value: '.lockbit' },
    ],
  },

  organizationContext: {
    documents: [
      { id: 'doc-1', filename: 'Business_Impact_Analysis_2024.pdf', type: 'pdf', status: 'parsed' },
      { id: 'doc-2', filename: 'Network_Diagram_v3.visio', type: 'visio', status: 'parsed' },
      { id: 'doc-3', filename: 'DR_BCP_Plan.docx', type: 'docx', status: 'parsed' },
      { id: 'doc-4', filename: 'Asset_Inventory.xlsx', type: 'xlsx', status: 'parsed' },
    ],
    extractedSystems: [
      { hostname: 'DC-MAIN-01', ip: '10.0.1.10', role: 'Domain Controller', criticality: 'critical' },
      { hostname: 'DC-MAIN-02', ip: '10.0.1.11', role: 'Domain Controller (Backup)', criticality: 'critical' },
      { hostname: 'FS-FIN-01', ip: '10.0.2.20', role: 'Finance File Server', criticality: 'critical' },
      { hostname: 'FS-HR-01', ip: '10.0.3.20', role: 'HR File Server', criticality: 'high' },
      { hostname: 'SQL-FIN-01', ip: '10.0.2.30', role: 'Finance Database', criticality: 'critical' },
      { hostname: 'BACKUP-01', ip: '10.0.5.10', role: 'Backup Server', criticality: 'critical' },
      { hostname: 'BACKUP-02', ip: '10.0.5.11', role: 'Backup Server (Offsite)', criticality: 'high' },
      { hostname: 'WS-FIN-042', ip: '10.0.2.142', role: 'Finance Workstation', criticality: 'medium' },
      { hostname: 'WS-FIN-043', ip: '10.0.2.143', role: 'Finance Workstation', criticality: 'medium' },
      { hostname: 'WS-FIN-044', ip: '10.0.2.144', role: 'Finance Workstation', criticality: 'medium' },
      { hostname: 'PRINT-FIN-01', ip: '10.0.2.250', role: 'Finance Printer', criticality: 'low' },
      { hostname: 'WS-HR-015', ip: '10.0.3.115', role: 'HR Workstation', criticality: 'medium' },
      { hostname: 'WS-HR-016', ip: '10.0.3.116', role: 'HR Workstation', criticality: 'medium' },
      { hostname: 'WS-IT-003', ip: '10.0.4.103', role: 'IT Workstation', criticality: 'high' },
      { hostname: 'WS-IT-004', ip: '10.0.4.104', role: 'IT Workstation', criticality: 'high' },
    ],
    extractedNetworks: [
      { name: 'Core Infrastructure', cidr: '10.0.1.0/24', vlan: 10, purpose: 'Domain Controllers, Core Services' },
      { name: 'Finance Network', cidr: '10.0.2.0/24', vlan: 20, purpose: 'Finance Department' },
      { name: 'HR Network', cidr: '10.0.3.0/24', vlan: 30, purpose: 'Human Resources' },
      { name: 'IT Network', cidr: '10.0.4.0/24', vlan: 40, purpose: 'IT Department' },
      { name: 'Backup Network', cidr: '10.0.5.0/24', vlan: 50, purpose: 'Backup Infrastructure' },
      { name: 'DMZ', cidr: '10.0.100.0/24', vlan: 100, purpose: 'Internet-Facing Services' },
    ],
  },

  connectors: [
    { id: 'conn-1', name: 'Windows Event Logs', type: 'windows_events', category: 'endpoint', status: 'connected' },
    { id: 'conn-2', name: 'CrowdStrike Falcon', type: 'edr', category: 'endpoint', status: 'connected' },
    { id: 'conn-3', name: 'Palo Alto Firewall', type: 'firewall', category: 'peripheral', status: 'connected' },
    { id: 'conn-4', name: 'Microsoft 365', type: 'email', category: 'cloud', status: 'connected' },
    { id: 'conn-5', name: 'Active Directory', type: 'directory', category: 'endpoint', status: 'connected' },
  ],

  timelineEvents: [
    {
      id: 'evt-001',
      timestamp: '2024-01-14T16:42:00Z',
      source: 'Microsoft 365',
      category: 'email',
      severity: 'high',
      title: 'Malicious Email Received',
      description: 'Phishing email with Excel attachment "Invoice_Q4_2024.xlsm" received by sarah.johnson@acme.com',
      rawLog: `Date: Sun, 14 Jan 2024 16:42:00 +0000
From: invoice.2024@financial-docs.com
To: sarah.johnson@acme.com
Subject: URGENT: Outstanding Invoice - Immediate Payment Required
X-Originating-IP: 185.234.72.19
Attachment: Invoice_Q4_2024.xlsm (Size: 847KB, SHA256: 8f7e6d5c...)`,
    },
    {
      id: 'evt-002',
      timestamp: '2024-01-14T16:45:00Z',
      source: 'Windows Events',
      category: 'process',
      severity: 'critical',
      title: 'Macro Execution Detected',
      description: 'Excel macro executed PowerShell downloader on WS-FIN-042',
      rawLog: `EventID: 4688
ComputerName: WS-FIN-042
ProcessName: powershell.exe
ParentProcess: EXCEL.EXE
CommandLine: powershell -nop -w hidden -ep bypass -enc aWV4IChOZXctT2JqZWN0...
User: ACME\\sarah.johnson`,
      relatedEventIds: ['evt-001'],
    },
    {
      id: 'evt-003',
      timestamp: '2024-01-14T16:45:30Z',
      source: 'CrowdStrike',
      category: 'malware',
      severity: 'critical',
      title: 'Cobalt Strike Beacon Downloaded',
      description: 'Payload downloaded from C2 server and executed in memory',
      rawLog: `DetectionName: CobaltStrike.Beacon
Hostname: WS-FIN-042
SHA256: 8f7e6d5c4b3a2918273645546372819a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e
C2: 185.234.72.19:443
Protocol: HTTPS
Action: Allowed (Detection Only Mode)`,
      relatedEventIds: ['evt-002'],
    },
    {
      id: 'evt-004',
      timestamp: '2024-01-14T17:00:00Z',
      source: 'Windows Events',
      category: 'authentication',
      severity: 'high',
      title: 'Credential Dumping Detected',
      description: 'LSASS memory access detected - potential credential harvesting',
      rawLog: `EventID: 10
ComputerName: WS-FIN-042
SourceImage: C:\\Windows\\Temp\\update.exe
TargetImage: C:\\Windows\\System32\\lsass.exe
GrantedAccess: 0x1010
User: ACME\\sarah.johnson`,
    },
    {
      id: 'evt-005',
      timestamp: '2024-01-14T17:15:00Z',
      source: 'Active Directory',
      category: 'authentication',
      severity: 'medium',
      title: 'Unusual Authentication Pattern',
      description: 'Multiple failed login attempts followed by success for admin account',
      rawLog: `EventID: 4625, 4625, 4625, 4624
TargetUserName: admin.finance
TargetDomainName: ACME
LogonType: 10 (RemoteInteractive)
SourceNetworkAddress: 10.0.2.142
Status: 0xC000006D (3 failures), then 0x0 (success)`,
    },
    {
      id: 'evt-006',
      timestamp: '2024-01-14T17:30:00Z',
      source: 'Firewall',
      category: 'network',
      severity: 'high',
      title: 'RDP Lateral Movement',
      description: 'RDP connections from WS-FIN-042 to multiple internal systems',
      rawLog: `Action: Allow
SrcIP: 10.0.2.142
DstIP: 10.0.2.143, 10.0.2.144, 10.0.2.20
DstPort: 3389
Protocol: TCP
SessionDuration: Multiple sessions established`,
      relatedEventIds: ['evt-005'],
    },
    {
      id: 'evt-007',
      timestamp: '2024-01-14T18:00:00Z',
      source: 'CrowdStrike',
      category: 'malware',
      severity: 'critical',
      title: 'PsExec Remote Execution',
      description: 'PsExec used to deploy ransomware payload to multiple systems',
      rawLog: `DetectionName: RemoteAdmin.PsExec
SourceHost: WS-FIN-042
TargetHosts: WS-FIN-043, WS-FIN-044, FS-FIN-01
CommandLine: psexec.exe \\\\target -accepteula -s -d C:\\Windows\\Temp\\update.exe
User: ACME\\admin.finance`,
      relatedEventIds: ['evt-006'],
    },
    {
      id: 'evt-008',
      timestamp: '2024-01-14T23:00:00Z',
      source: 'Windows Events',
      category: 'system',
      severity: 'critical',
      title: 'VSS Deletion',
      description: 'Volume Shadow Copies deleted on multiple systems',
      rawLog: `EventID: 4688
ComputerName: FS-FIN-01
ProcessName: vssadmin.exe
CommandLine: vssadmin.exe delete shadows /all /quiet
User: ACME\\admin.finance`,
    },
    {
      id: 'evt-009',
      timestamp: '2024-01-15T02:00:00Z',
      source: 'CrowdStrike',
      category: 'malware',
      severity: 'critical',
      title: 'Ransomware Encryption Started',
      description: 'File encryption activity detected across multiple systems',
      rawLog: `DetectionName: Ransomware.LockBit
AffectedSystems: WS-FIN-042, WS-FIN-043, WS-FIN-044, FS-FIN-01, FS-HR-01
FilesEncrypted: 47,832
FileExtension: .lockbit
RansomNote: README_TO_RESTORE.txt`,
    },
    {
      id: 'evt-010',
      timestamp: '2024-01-15T09:30:00Z',
      source: 'User Report',
      category: 'incident',
      severity: 'critical',
      title: 'Incident Reported',
      description: 'User Sarah Johnson reports inability to access files, ransom note discovered',
      rawLog: `Ticket#: INC0047832
Reporter: Sarah Johnson (Finance)
Description: Cannot open any files. Desktop shows text file saying files are encrypted and demanding Bitcoin.
Priority: Critical
Assigned: Security Team`,
    },
  ],

  findings: [
    {
      id: 'find-001',
      title: 'Phishing Email with Malicious Macro',
      description: 'Initial access vector was a phishing email containing an Excel file with embedded macro that downloaded Cobalt Strike beacon.',
      severity: 'critical',
      confidence: 95,
      category: 'Initial Access',
      evidence: [
        { type: 'email', content: 'Email from invoice.2024@financial-docs.com with Invoice_Q4_2024.xlsm attachment' },
        { type: 'process', content: 'EXCEL.EXE spawned powershell.exe with encoded command' },
        { type: 'network', content: 'Connection to 185.234.72.19:443 immediately after macro execution' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-002',
      title: 'Credential Theft via LSASS Access',
      description: 'Attacker dumped credentials from LSASS memory using update.exe (Cobalt Strike)',
      severity: 'critical',
      confidence: 92,
      category: 'Credential Access',
      evidence: [
        { type: 'process', content: 'update.exe accessed lsass.exe memory with 0x1010 access rights' },
        { type: 'event_log', content: 'Sysmon Event ID 10 showing LSASS access from suspicious process' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-003',
      title: 'PsExec Remote Execution',
      description: 'PsExec was used to execute commands on remote systems. This tool has legitimate admin uses but was used here for malicious lateral movement.',
      severity: 'high',
      confidence: 75,
      category: 'Lateral Movement',
      evidence: [
        { type: 'process', content: 'psexec.exe executed from WS-FIN-042 targeting multiple systems' },
        { type: 'event_log', content: 'Event ID 4688 showing PsExec service installation on targets' },
      ],
      suggestedClassification: 'needs_investigation',
    },
    {
      id: 'find-004',
      title: 'Shadow Copy Deletion',
      description: 'Volume Shadow Copies were deleted to prevent file recovery, a common ransomware tactic.',
      severity: 'critical',
      confidence: 98,
      category: 'Impact',
      evidence: [
        { type: 'process', content: 'vssadmin.exe delete shadows /all /quiet executed on FS-FIN-01' },
        { type: 'event_log', content: 'VSS service reported successful deletion of all shadow copies' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-005',
      title: 'Admin Account Password Spray',
      description: 'Multiple failed authentication attempts for admin.finance account followed by successful login. Could indicate password guessing or use of harvested credentials.',
      severity: 'medium',
      confidence: 68,
      category: 'Credential Access',
      evidence: [
        { type: 'event_log', content: '3 failed logins (4625) followed by success (4624) for admin.finance' },
        { type: 'network', content: 'Source IP was the compromised workstation WS-FIN-042' },
      ],
      suggestedClassification: 'needs_investigation',
    },
    {
      id: 'find-006',
      title: 'Backup Server Accessed',
      description: 'BACKUP-01 was accessed from the compromised network. Need to verify if backups are intact or compromised.',
      severity: 'high',
      confidence: 85,
      category: 'Impact',
      evidence: [
        { type: 'network', content: 'RDP connection from WS-IT-003 to BACKUP-01 during attack window' },
        { type: 'file', content: 'Some files on BACKUP-01 have .lockbit extension' },
      ],
      suggestedClassification: 'malicious',
    },
  ],

  reportData: {
    executiveSummary: 'A LockBit ransomware attack was initiated via a phishing email targeting the finance department. The attacker gained initial access through a malicious Excel macro, deployed Cobalt Strike for command and control, harvested credentials, and moved laterally via RDP before deploying ransomware across 12 systems. Approximately 47,000 files were encrypted across finance and HR file servers.',
    businessImpact: {
      operational: 'high',
      financial: 'high',
      reputational: 'medium',
      regulatory: 'high',
    },
    recommendations: [
      {
        priority: 'immediate',
        title: 'Isolate Affected Systems',
        description: 'Immediately isolate all 12 affected systems from the network to prevent further spread.',
      },
      {
        priority: 'immediate',
        title: 'Reset All Privileged Credentials',
        description: 'Reset passwords for all admin accounts, especially admin.finance which was compromised.',
      },
      {
        priority: 'immediate',
        title: 'Verify Backup Integrity',
        description: 'Check offline and cloud backups for integrity. BACKUP-01 may be compromised.',
      },
      {
        priority: 'short_term',
        title: 'Implement MFA for All Admin Access',
        description: 'Deploy multi-factor authentication for all privileged accounts and remote access.',
      },
      {
        priority: 'short_term',
        title: 'Enable CrowdStrike Prevention Mode',
        description: 'Switch EDR from detection-only to prevention mode to block future threats.',
      },
      {
        priority: 'short_term',
        title: 'Block Macro Execution in Email Attachments',
        description: 'Configure email security to strip or block Office files with macros.',
      },
      {
        priority: 'long_term',
        title: 'Security Awareness Training',
        description: 'Implement phishing awareness training for all employees, especially finance.',
      },
      {
        priority: 'long_term',
        title: 'Network Segmentation',
        description: 'Implement proper network segmentation to limit lateral movement between departments.',
      },
    ],
    gaps: [
      { category: 'Email Security', current: 2, target: 5, gap: 'No macro blocking, limited phishing detection' },
      { category: 'Endpoint Protection', current: 3, target: 5, gap: 'EDR in detection-only mode' },
      { category: 'Access Control', current: 2, target: 5, gap: 'No MFA for admin accounts' },
      { category: 'Backup Security', current: 2, target: 5, gap: 'Backups accessible from compromised network' },
      { category: 'Network Segmentation', current: 1, target: 4, gap: 'Flat network allows easy lateral movement' },
    ],
  },
};
