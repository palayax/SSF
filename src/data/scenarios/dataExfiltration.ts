/**
 * Data Exfiltration Scenario
 *
 * Scenario: APT-style data exfiltration targeting intellectual property
 * with low-and-slow methodology over several weeks.
 */

import { Scenario } from './index';

export const dataExfiltrationScenario: Scenario = {
  id: 'data_exfiltration',
  name: 'Data Exfiltration',
  description: 'APT-style intellectual property theft with cloud staging and encrypted exfiltration',
  icon: 'Upload',
  severity: 'critical',

  incidentDescription: {
    description: `The Security Operations Center detected unusual outbound data transfers to an unknown cloud storage service over the past 3 weeks. Investigation reveals that an R&D engineer's account was compromised and used to systematically exfiltrate product designs and source code.

The attacker used legitimate cloud sync tools (rclone) to upload data to an attacker-controlled cloud storage bucket during off-hours. Approximately 15GB of sensitive data including CAD files, source code, and product roadmaps may have been stolen.`,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-21T14:00:00Z',
    patientZero: 'WS-RND-017',
    affectedSystems: [
      'WS-RND-017',
      'WS-RND-018',
      'FS-RND-01',
      'GIT-SERVER-01',
      'CAD-LICENSE-01',
    ],
    iocs: [
      { type: 'hash_sha256', value: 'abc123def456789abc123def456789abc123def456789abc123def456789abcd' },
      { type: 'ip', value: '45.33.32.156' },
      { type: 'domain', value: 'secure-backup-sync.com' },
      { type: 'domain', value: 'b2-storage-cdn.net' },
      { type: 'user_agent', value: 'rclone/v1.62.2' },
      { type: 'email', value: 'hr-benefits@acme-careers.com' },
    ],
  },

  organizationContext: {
    documents: [
      { id: 'doc-1', filename: 'IP_Classification_Policy.pdf', type: 'pdf', status: 'parsed' },
      { id: 'doc-2', filename: 'Network_Topology_2024.xlsx', type: 'xlsx', status: 'parsed' },
      { id: 'doc-3', filename: 'Data_Loss_Prevention_Policy.docx', type: 'docx', status: 'parsed' },
    ],
    extractedSystems: [
      { hostname: 'FS-RND-01', ip: '10.10.1.10', role: 'R&D File Server', criticality: 'critical' },
      { hostname: 'GIT-SERVER-01', ip: '10.10.1.20', role: 'Source Code Repository', criticality: 'critical' },
      { hostname: 'CAD-LICENSE-01', ip: '10.10.1.30', role: 'CAD License Server', criticality: 'high' },
      { hostname: 'WS-RND-017', ip: '10.10.2.117', role: 'R&D Workstation', criticality: 'high' },
      { hostname: 'WS-RND-018', ip: '10.10.2.118', role: 'R&D Workstation', criticality: 'high' },
      { hostname: 'PROXY-01', ip: '10.0.100.10', role: 'Web Proxy', criticality: 'high' },
      { hostname: 'FW-EDGE-01', ip: '10.0.100.1', role: 'Edge Firewall', criticality: 'critical' },
    ],
    extractedNetworks: [
      { name: 'R&D Network', cidr: '10.10.0.0/16', vlan: 100, purpose: 'Research & Development' },
      { name: 'DMZ', cidr: '10.0.100.0/24', vlan: 200, purpose: 'Internet Edge' },
      { name: 'Corporate', cidr: '10.0.0.0/16', vlan: 10, purpose: 'Corporate Network' },
    ],
  },

  connectors: [
    { id: 'conn-1', name: 'Zscaler Web Proxy', type: 'proxy', category: 'peripheral', status: 'connected' },
    { id: 'conn-2', name: 'Palo Alto NGFW', type: 'firewall', category: 'peripheral', status: 'connected' },
    { id: 'conn-3', name: 'Carbon Black EDR', type: 'edr', category: 'endpoint', status: 'connected' },
    { id: 'conn-4', name: 'Azure AD', type: 'identity', category: 'cloud', status: 'connected' },
    { id: 'conn-5', name: 'Varonis DatAdvantage', type: 'dlp', category: 'endpoint', status: 'connected' },
  ],

  timelineEvents: [
    {
      id: 'evt-001',
      timestamp: '2024-01-01T08:15:00Z',
      source: 'Azure AD',
      category: 'authentication',
      severity: 'medium',
      title: 'Unusual Login Location',
      description: 'Login from new location for user david.chen (RND Engineer)',
      rawLog: `SignInId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
UserPrincipalName: david.chen@acme.com
Location: Amsterdam, Netherlands
DeviceDetail: Unknown
IPAddress: 45.33.32.156
Status: Success
ConditionalAccess: Not Applied`,
    },
    {
      id: 'evt-002',
      timestamp: '2024-01-01T08:30:00Z',
      source: 'Carbon Black',
      category: 'process',
      severity: 'medium',
      title: 'rclone Installation',
      description: 'Cloud sync tool rclone installed on WS-RND-017',
      rawLog: `ProcessName: rclone.exe
ProcessPath: C:\\Users\\david.chen\\AppData\\Local\\rclone\\rclone.exe
SHA256: abc123def456789abc123def456789abc123def456789abc123def456789abcd
ParentProcess: powershell.exe
User: ACME\\david.chen
CommandLine: rclone.exe config`,
    },
    {
      id: 'evt-003',
      timestamp: '2024-01-02T23:45:00Z',
      source: 'Proxy Logs',
      category: 'network',
      severity: 'high',
      title: 'Large Upload to Cloud Storage',
      description: 'Significant data upload to unknown cloud storage during off-hours',
      rawLog: `Timestamp: 2024-01-02T23:45:00Z
User: david.chen
DestDomain: secure-backup-sync.com
Category: Cloud Storage
Method: PUT
BytesSent: 524288000
Duration: 1847s
UserAgent: rclone/v1.62.2`,
    },
    {
      id: 'evt-004',
      timestamp: '2024-01-05T00:15:00Z',
      source: 'Varonis',
      category: 'file_access',
      severity: 'high',
      title: 'Bulk File Access - CAD Files',
      description: 'User accessed 847 CAD files in 30 minutes (baseline: 15/hour)',
      rawLog: `User: ACME\\david.chen
Path: \\\\FS-RND-01\\Projects\\ProductX\\CAD\\
FilesAccessed: 847
TimeWindow: 30 minutes
Baseline: 15 files/hour
RiskScore: 94
Anomaly: Bulk access pattern`,
    },
    {
      id: 'evt-005',
      timestamp: '2024-01-07T01:00:00Z',
      source: 'Git Server',
      category: 'source_code',
      severity: 'critical',
      title: 'Repository Clone - All Branches',
      description: 'Complete clone of flagship product repository',
      rawLog: `Repository: acme/flagship-product
User: david.chen
Action: clone --mirror
Size: 2.3GB
Branches: 47
Tags: 156
Timestamp: 2024-01-07T01:00:00Z
SourceIP: 10.10.2.117`,
    },
    {
      id: 'evt-006',
      timestamp: '2024-01-10T02:30:00Z',
      source: 'Firewall',
      category: 'network',
      severity: 'high',
      title: 'Encrypted Tunnel to Unknown Host',
      description: 'TLS tunnel to unrecognized IP with high data transfer',
      rawLog: `SrcIP: 10.10.2.117
DstIP: 45.33.32.156
DstPort: 443
Protocol: TLS 1.3
BytesSent: 3221225472
Duration: 7200s
Category: Unknown
Action: Allow`,
    },
    {
      id: 'evt-007',
      timestamp: '2024-01-15T00:00:00Z',
      source: 'Proxy Logs',
      category: 'network',
      severity: 'high',
      title: 'Continued Exfiltration Pattern',
      description: 'Recurring nightly uploads to cloud storage',
      rawLog: `Pattern: Daily 00:00-04:00
User: david.chen
TotalBytesUploaded: 8589934592
DestDomains: secure-backup-sync.com, b2-storage-cdn.net
SessionCount: 12`,
    },
    {
      id: 'evt-008',
      timestamp: '2024-01-21T14:00:00Z',
      source: 'SOC Alert',
      category: 'incident',
      severity: 'critical',
      title: 'DLP Alert - Data Exfiltration Detected',
      description: 'SOC analyst identified pattern and escalated',
      rawLog: `Alert: DATA_EXFIL_PATTERN
Confidence: High
TotalDataExfiltrated: ~15GB
Duration: 21 days
Affected: R&D Intellectual Property
Escalation: IR Team Activated`,
    },
  ],

  findings: [
    {
      id: 'find-001',
      title: 'Compromised Account - Unusual Location',
      description: 'Account david.chen logged in from Netherlands but user is based in California. Likely credential compromise.',
      severity: 'high',
      confidence: 85,
      category: 'Initial Access',
      evidence: [
        { type: 'authentication', content: 'Azure AD login from Amsterdam, Netherlands IP 45.33.32.156' },
        { type: 'hr_data', content: 'Employee david.chen is based in San Jose, CA office' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-002',
      title: 'Unauthorized Cloud Sync Tool',
      description: 'rclone cloud sync tool installed and configured without IT approval',
      severity: 'high',
      confidence: 90,
      category: 'Exfiltration',
      evidence: [
        { type: 'process', content: 'rclone.exe installed in user AppData folder' },
        { type: 'policy', content: 'Cloud sync tools require IT approval per DLP policy' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-003',
      title: 'After-Hours Data Transfer',
      description: 'Large data uploads consistently occurring between midnight and 4 AM over 3 weeks',
      severity: 'critical',
      confidence: 95,
      category: 'Exfiltration',
      evidence: [
        { type: 'network', content: '15GB total uploaded to external cloud storage' },
        { type: 'timing', content: 'All uploads occurred outside business hours' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-004',
      title: 'Anomalous File Access Pattern',
      description: 'User accessed 847 CAD files in 30 minutes versus baseline of 15/hour',
      severity: 'high',
      confidence: 88,
      category: 'Collection',
      evidence: [
        { type: 'file_access', content: 'Bulk access to ProductX CAD files' },
        { type: 'baseline', content: '56x normal access rate for this user' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-005',
      title: 'Source Code Repository Clone',
      description: 'Complete mirror clone of flagship product repository including all branches',
      severity: 'critical',
      confidence: 92,
      category: 'Collection',
      evidence: [
        { type: 'git', content: 'git clone --mirror of 2.3GB repository' },
        { type: 'timing', content: 'Performed at 1 AM outside normal work hours' },
      ],
      suggestedClassification: 'malicious',
    },
    {
      id: 'find-006',
      title: 'Connection to Known Suspicious IP',
      description: 'Workstation connected to IP 45.33.32.156 which was also the login source',
      severity: 'high',
      confidence: 82,
      category: 'Command & Control',
      evidence: [
        { type: 'network', content: 'TLS tunnel with 3GB data transfer' },
        { type: 'correlation', content: 'Same IP used for suspicious Azure AD login' },
      ],
      suggestedClassification: 'needs_investigation',
    },
  ],

  reportData: {
    executiveSummary: 'An advanced persistent threat actor compromised an R&D engineer\'s credentials and systematically exfiltrated approximately 15GB of intellectual property over a 3-week period. The attacker used legitimate tools (rclone) and operated during off-hours to avoid detection. Stolen data includes CAD designs, source code, and product roadmaps for flagship products.',
    businessImpact: {
      operational: 'medium',
      financial: 'high',
      reputational: 'high',
      regulatory: 'medium',
    },
    recommendations: [
      {
        priority: 'immediate',
        title: 'Disable Compromised Account',
        description: 'Immediately disable david.chen account and reset credentials.',
      },
      {
        priority: 'immediate',
        title: 'Block Exfiltration Domains',
        description: 'Block secure-backup-sync.com and b2-storage-cdn.net at firewall and proxy.',
      },
      {
        priority: 'immediate',
        title: 'Assess Data Exposure',
        description: 'Inventory all accessed files to understand full scope of potential data loss.',
      },
      {
        priority: 'short_term',
        title: 'Implement Cloud App Controls',
        description: 'Deploy CASB to detect and block unauthorized cloud storage services.',
      },
      {
        priority: 'short_term',
        title: 'Enable Conditional Access',
        description: 'Implement location-based and device-based conditional access policies.',
      },
      {
        priority: 'long_term',
        title: 'Deploy DLP on Endpoints',
        description: 'Implement endpoint DLP to prevent unauthorized bulk file operations.',
      },
      {
        priority: 'long_term',
        title: 'Enhanced Monitoring for R&D',
        description: 'Implement stricter monitoring and controls for high-value R&D assets.',
      },
    ],
    gaps: [
      { category: 'Cloud Security', current: 1, target: 5, gap: 'No CASB, unauthorized cloud apps allowed' },
      { category: 'Data Loss Prevention', current: 2, target: 5, gap: 'DLP not deployed to endpoints' },
      { category: 'Identity Security', current: 2, target: 5, gap: 'No conditional access or MFA' },
      { category: 'Monitoring', current: 3, target: 5, gap: 'Alerts not correlated across systems' },
    ],
  },
};
