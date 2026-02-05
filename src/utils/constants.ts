import type { ConnectorCategory, ConnectorType, ValidationMethod } from '@/types';

/**
 * Application constants
 */
export const APP_NAME = 'Forensic Triage';
export const APP_DESCRIPTION = 'Self-Service Forensic Prototype';
export const APP_VERSION = '0.1.0';

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME: 'forensic-theme',
  SESSION: 'forensic-session',
  RECENT_SESSIONS: 'forensic-recent-sessions',
  TOOLTIPS_ENABLED: 'forensic-tooltips-enabled',
} as const;

/**
 * Connector categories and their types
 */
export const CONNECTOR_CATEGORIES: ConnectorCategory[] = [
  {
    id: 'endpoints',
    name: 'Endpoints',
    description: 'Collect data from workstations and servers',
    connectors: ['windows', 'linux', 'macos'],
  },
  {
    id: 'cloud',
    name: 'Cloud Services',
    description: 'Connect to cloud platforms and SaaS applications',
    connectors: ['aws', 'azure', 'gcp', 'o365', 'gsuite'],
  },
  {
    id: 'peripherals',
    name: 'Network & Peripherals',
    description: 'Access network devices and security appliances',
    connectors: ['firewall', 'storage', 'email_gateway', 'proxy_waf'],
  },
];

/**
 * Connector display information
 */
export const CONNECTOR_INFO: Record<ConnectorType, { name: string; icon: string; description: string }> = {
  windows: {
    name: 'Windows',
    icon: 'Monitor',
    description: 'Windows Event Logs, Registry, File System',
  },
  linux: {
    name: 'Linux',
    icon: 'Terminal',
    description: 'Auth logs, Syslog, File System artifacts',
  },
  macos: {
    name: 'macOS',
    icon: 'Apple',
    description: 'Unified Logs, FSEvents, Keychain',
  },
  aws: {
    name: 'AWS',
    icon: 'Cloud',
    description: 'CloudTrail, CloudWatch, VPC Flow Logs',
  },
  azure: {
    name: 'Azure',
    icon: 'Cloud',
    description: 'Activity Logs, Azure AD, Sentinel',
  },
  gcp: {
    name: 'Google Cloud',
    icon: 'Cloud',
    description: 'Cloud Audit Logs, VPC Flow Logs',
  },
  o365: {
    name: 'Microsoft 365',
    icon: 'Mail',
    description: 'Unified Audit Logs, Exchange, SharePoint',
  },
  gsuite: {
    name: 'Google Workspace',
    icon: 'Mail',
    description: 'Admin Reports, Gmail, Drive Activity',
  },
  firewall: {
    name: 'Firewall',
    icon: 'Shield',
    description: 'Traffic logs, Rule changes, Threat events',
  },
  storage: {
    name: 'Storage/NAS',
    icon: 'HardDrive',
    description: 'Access logs, File activity, Quota changes',
  },
  email_gateway: {
    name: 'Email Gateway',
    icon: 'MailWarning',
    description: 'Message tracking, Threat filtering',
  },
  proxy_waf: {
    name: 'Proxy/WAF',
    icon: 'Globe',
    description: 'Web traffic, Blocked requests, Attacks',
  },
};

/**
 * Validation method display information
 */
export const VALIDATION_METHOD_INFO: Record<ValidationMethod, { name: string; description: string }> = {
  ping: {
    name: 'Ping/ICMP',
    description: 'Send ICMP echo request to verify host is reachable',
  },
  dns: {
    name: 'DNS Resolution',
    description: 'Verify hostname resolves to documented IP address',
  },
  spn: {
    name: 'SPN Check',
    description: 'Validate Service Principal Name in Active Directory',
  },
  ad_lookup: {
    name: 'AD Lookup',
    description: 'Verify computer object exists in Active Directory',
  },
  port_scan: {
    name: 'Port Scan',
    description: 'Check if expected services are listening',
  },
  cert_check: {
    name: 'Certificate Check',
    description: 'Validate SSL/TLS certificate is valid',
  },
};

/**
 * Document type display information
 */
export const DOCUMENT_TYPE_INFO: Record<string, { name: string; icon: string; color: string }> = {
  pdf: { name: 'PDF', icon: 'FileText', color: 'text-red-500' },
  docx: { name: 'Word', icon: 'FileText', color: 'text-blue-500' },
  xlsx: { name: 'Excel', icon: 'FileSpreadsheet', color: 'text-green-500' },
  json: { name: 'JSON', icon: 'FileJson', color: 'text-yellow-500' },
  yaml: { name: 'YAML', icon: 'FileCode', color: 'text-purple-500' },
  visio: { name: 'Visio', icon: 'Network', color: 'text-blue-600' },
};

/**
 * Repository type display information
 */
export const REPOSITORY_TYPE_INFO: Record<string, { name: string; icon: string }> = {
  github: { name: 'GitHub', icon: 'Github' },
  gitlab: { name: 'GitLab', icon: 'GitBranch' },
  sharepoint: { name: 'SharePoint', icon: 'FileStack' },
  bitbucket: { name: 'Bitbucket', icon: 'GitBranch' },
};

/**
 * Triage phases configuration
 */
export const TRIAGE_PHASES = [
  {
    id: 'data_collection',
    name: 'Data Collection',
    description: 'Gathering logs and artifacts from configured sources',
    estimatedDuration: 3000, // ms for simulation
    steps: 5,
  },
  {
    id: 'log_analysis',
    name: 'Log Analysis',
    description: 'Parsing and analyzing collected log data',
    estimatedDuration: 4000,
    steps: 8,
  },
  {
    id: 'artifact_extraction',
    name: 'Artifact Extraction',
    description: 'Extracting forensic artifacts from systems',
    estimatedDuration: 2500,
    steps: 4,
  },
  {
    id: 'correlation',
    name: 'Correlation Engine',
    description: 'Correlating events and building timeline',
    estimatedDuration: 3500,
    steps: 6,
  },
  {
    id: 'anomaly_detection',
    name: 'Anomaly Detection',
    description: 'Identifying suspicious patterns and behaviors',
    estimatedDuration: 2000,
    steps: 3,
  },
];

/**
 * MITRE ATT&CK tactic colors
 */
export const MITRE_TACTIC_COLORS: Record<string, string> = {
  'Initial Access': 'bg-red-500',
  'Execution': 'bg-orange-500',
  'Persistence': 'bg-yellow-500',
  'Privilege Escalation': 'bg-lime-500',
  'Defense Evasion': 'bg-green-500',
  'Credential Access': 'bg-teal-500',
  'Discovery': 'bg-cyan-500',
  'Lateral Movement': 'bg-blue-500',
  'Collection': 'bg-indigo-500',
  'Command and Control': 'bg-violet-500',
  'Exfiltration': 'bg-purple-500',
  'Impact': 'bg-pink-500',
};
