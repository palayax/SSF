import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageContainer, PageNavigation } from '@/components/layout';
import { useSessionStore } from '@/store';
import { Card, CardHeader, Button, Tooltip, Badge, SeverityBadge, SearchInput } from '@/components/common';
import {
  ZoomIn,
  ZoomOut,
  Filter,
  Calendar,
  Copy,
  X,
  Monitor,
  Cloud,
  Shield,
  Activity,
  Server,
  Lock,
  Unlock,
  Network,
  HardDrive,
  Mail,
  RotateCw,
  Skull,
  ChevronDown,
  ChevronRight,
  Info,
  Target,
  Crosshair,
  ArrowRight,
  Globe,
  Database,
  Eye,
  Layers,
  MapPin,
  Wifi,
  Users,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDateTime, formatTimestamp } from '@/utils/formatters';

// ===================== RESOURCE DEFINITIONS =====================
interface ResourceNode {
  id: string;
  name: string;
  type: 'workstation' | 'server' | 'cloud' | 'network' | 'user' | 'attacker' | 'service';
  icon: React.ReactNode;
  ip?: string;
  role: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
}

const RESOURCES: ResourceNode[] = [
  { id: 'attacker', name: 'Threat Actor', type: 'attacker', icon: <Skull className="w-4 h-4" />, ip: '185.220.101.42', role: 'External Attacker', severity: 'critical' },
  { id: 'email', name: 'Email Gateway', type: 'service', icon: <Mail className="w-4 h-4" />, role: 'Proofpoint', severity: 'none' },
  { id: 'jsmith', name: 'jsmith', type: 'user', icon: <Users className="w-4 h-4" />, role: 'Finance User', severity: 'high' },
  { id: 'ws-fin-042', name: 'WS-FIN-042', type: 'workstation', icon: <Monitor className="w-4 h-4" />, ip: '10.0.10.42', role: 'Patient Zero', severity: 'critical' },
  { id: 'c2', name: 'C2 Server', type: 'attacker', icon: <Globe className="w-4 h-4" />, ip: '185.220.101.42', role: 'update-service.xyz', severity: 'critical' },
  { id: 'dc-main', name: 'DC-MAIN-01', type: 'server', icon: <Server className="w-4 h-4" />, ip: '10.0.1.10', role: 'Domain Controller', severity: 'critical' },
  { id: 'fs-finance', name: 'FS-FINANCE-01', type: 'server', icon: <HardDrive className="w-4 h-4" />, ip: '10.0.2.20', role: 'File Server', severity: 'high' },
  { id: 'sharepoint', name: 'SharePoint', type: 'cloud', icon: <Cloud className="w-4 h-4" />, role: 'O365 SharePoint', severity: 'high' },
  { id: 'sql-db', name: 'SQL-DB-01', type: 'server', icon: <Database className="w-4 h-4" />, ip: '10.0.3.30', role: 'Database Server', severity: 'medium' },
  { id: 'web-app', name: 'WEB-APP-01', type: 'server', icon: <Cloud className="w-4 h-4" />, ip: '10.0.4.40', role: 'Web Server', severity: 'medium' },
  { id: 'exch', name: 'EXCH-01', type: 'server', icon: <Mail className="w-4 h-4" />, ip: '10.0.1.15', role: 'Exchange', severity: 'medium' },
  { id: 'bkp', name: 'BKP-SERVER-01', type: 'server', icon: <Server className="w-4 h-4" />, ip: '10.0.5.50', role: 'Backup Server', severity: 'high' },
];

// ===================== ATTACK FLOW DATA (Resource-centric) =====================
interface AttackFlowStep {
  id: string;
  time: string;
  date: string;
  timestamp: Date;
  phase: string;
  title: string;
  description: string;
  riskScore: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  color: string;
  icon: React.ReactNode;
  // Resource flow: from → process → to
  sourceResource: string;  // resource id
  targetResource: string;  // resource id
  process: string;         // short label for the activity/process
  processIcon: React.ReactNode;
  iocs: { type: string; value: string }[];
  ttps: { id: string; name: string; tactic: string }[];
  details: string;
}

const ATTACK_FLOW: AttackFlowStep[] = [
  {
    id: 'af-1', time: '02:15', date: '2024-01-15', timestamp: new Date('2024-01-15T02:15:00'),
    phase: 'Initial Access', title: 'Phishing Email Delivered',
    description: 'Spear-phishing email with malicious .xlsm attachment',
    riskScore: 85, severity: 'high', color: 'bg-red-500', icon: <Mail className="w-3.5 h-3.5" />,
    sourceResource: 'attacker', targetResource: 'email', process: 'Phishing Email', processIcon: <Mail className="w-3 h-3" />,
    iocs: [{ type: 'From', value: 'invoice-update@mail-service.xyz' }, { type: 'Hash', value: 'a1b2c3d4e5f6...' }, { type: 'Domain', value: 'mail-service.xyz' }],
    ttps: [{ id: 'T1566.001', name: 'Spear-phishing Attachment', tactic: 'Initial Access' }],
    details: 'Email impersonated vendor invoice. Macro-enabled .xlsm with obfuscated PowerShell payload. Passed SPF/DKIM checks.',
  },
  {
    id: 'af-1b', time: '02:16', date: '2024-01-15', timestamp: new Date('2024-01-15T02:16:00'),
    phase: 'Initial Access', title: 'Email Delivered to User',
    description: 'Phishing email bypasses gateway and reaches jsmith inbox',
    riskScore: 80, severity: 'high', color: 'bg-red-500', icon: <Mail className="w-3.5 h-3.5" />,
    sourceResource: 'email', targetResource: 'jsmith', process: 'Email Delivery', processIcon: <ArrowRight className="w-3 h-3" />,
    iocs: [{ type: 'Recipient', value: 'jsmith@company.com' }],
    ttps: [{ id: 'T1566.001', name: 'Spear-phishing Attachment', tactic: 'Initial Access' }],
    details: 'Email passed through Proofpoint gateway and was delivered to jsmith\'s Outlook inbox.',
  },
  {
    id: 'af-2', time: '02:18', date: '2024-01-15', timestamp: new Date('2024-01-15T02:18:00'),
    phase: 'Execution', title: 'Macro → PowerShell Stager',
    description: 'jsmith opened attachment, macro spawned PowerShell on WS-FIN-042',
    riskScore: 90, severity: 'critical', color: 'bg-red-600', icon: <Activity className="w-3.5 h-3.5" />,
    sourceResource: 'jsmith', targetResource: 'ws-fin-042', process: 'Macro Exec', processIcon: <Activity className="w-3 h-3" />,
    iocs: [{ type: 'Process', value: 'powershell.exe -enc <base64>' }, { type: 'URL', value: 'https://cdn-update.xyz/payload.ps1' }, { type: 'Hash', value: 'payload.ps1: e7f8a9b0...' }],
    ttps: [{ id: 'T1059.001', name: 'PowerShell', tactic: 'Execution' }, { id: 'T1204.002', name: 'User Execution: Malicious File', tactic: 'Execution' }],
    details: 'Excel macro used WMI to spawn powershell.exe with encoded command. Cobalt Strike beacon loaded via reflective DLL injection. Process tree: EXCEL.EXE → cmd.exe → powershell.exe.',
  },
  {
    id: 'af-3', time: '02:22', date: '2024-01-15', timestamp: new Date('2024-01-15T02:22:00'),
    phase: 'Command & Control', title: 'C2 Channel Established',
    description: 'Cobalt Strike beacon phones home from WS-FIN-042 to attacker C2',
    riskScore: 92, severity: 'critical', color: 'bg-purple-600', icon: <Wifi className="w-3.5 h-3.5" />,
    sourceResource: 'ws-fin-042', targetResource: 'c2', process: 'HTTPS Beacon', processIcon: <Wifi className="w-3 h-3" />,
    iocs: [{ type: 'C2', value: 'update-service.xyz:443' }, { type: 'IP', value: '185.220.101.42' }, { type: 'Config', value: 'Sleep:60s Jitter:25%' }],
    ttps: [{ id: 'T1071.001', name: 'Web Protocols (HTTPS)', tactic: 'C2' }, { id: 'T1573.002', name: 'Encrypted Channel', tactic: 'C2' }],
    details: 'Cobalt Strike HTTPS beacon. JA3 fingerprint matches known malleable profile. DNS over HTTPS for resolution.',
  },
  {
    id: 'af-4', time: '02:25', date: '2024-01-15', timestamp: new Date('2024-01-15T02:25:00'),
    phase: 'Persistence', title: 'Scheduled Task Created',
    description: 'Persistence mechanism installed on WS-FIN-042',
    riskScore: 75, severity: 'high', color: 'bg-orange-500', icon: <RotateCw className="w-3.5 h-3.5" />,
    sourceResource: 'ws-fin-042', targetResource: 'ws-fin-042', process: 'Sched Task', processIcon: <RotateCw className="w-3 h-3" />,
    iocs: [{ type: 'Task', value: 'WindowsUpdate' }, { type: 'Path', value: 'C:\\Users\\Public\\update.exe' }],
    ttps: [{ id: 'T1053.005', name: 'Scheduled Task/Job', tactic: 'Persistence' }, { id: 'T1036.005', name: 'Masquerading', tactic: 'Defense Evasion' }],
    details: 'Scheduled task "WindowsUpdate" runs at startup with SYSTEM privileges. Binary is packed Cobalt Strike loader.',
  },
  {
    id: 'af-5', time: '02:28', date: '2024-01-15', timestamp: new Date('2024-01-15T02:28:00'),
    phase: 'Priv. Escalation', title: 'DCSync → Domain Admin',
    description: 'Mimikatz DCSync from WS-FIN-042 targeting DC-MAIN-01',
    riskScore: 98, severity: 'critical', color: 'bg-orange-600', icon: <Unlock className="w-3.5 h-3.5" />,
    sourceResource: 'ws-fin-042', targetResource: 'dc-main', process: 'DCSync', processIcon: <Unlock className="w-3 h-3" />,
    iocs: [{ type: 'Tool', value: 'Mimikatz 2.2.0' }, { type: 'Account', value: 'admin.jsmith' }, { type: 'Account', value: 'svc-backup' }, { type: 'Hash', value: 'NTLM + AES256' }],
    ttps: [{ id: 'T1003.006', name: 'DCSync', tactic: 'Credential Access' }, { id: 'T1078.002', name: 'Domain Accounts', tactic: 'Priv. Escalation' }],
    details: 'In-memory Mimikatz performed DCSync against DC-MAIN-01. Harvested NTLM hashes and Kerberos AES256 keys for admin.jsmith and svc-backup.',
  },
  {
    id: 'af-6', time: '02:30', date: '2024-01-15', timestamp: new Date('2024-01-15T02:30:00'),
    phase: 'Lateral Movement', title: 'PsExec → DC-MAIN-01',
    description: 'Lateral movement from WS-FIN-042 to Domain Controller via SMB',
    riskScore: 95, severity: 'critical', color: 'bg-yellow-500', icon: <Network className="w-3.5 h-3.5" />,
    sourceResource: 'ws-fin-042', targetResource: 'dc-main', process: 'PsExec SMB', processIcon: <Network className="w-3 h-3" />,
    iocs: [{ type: 'Tool', value: 'PsExec.exe' }, { type: 'Port', value: 'TCP 445 (SMB)' }, { type: 'Creds', value: 'admin.jsmith' }],
    ttps: [{ id: 'T1021.002', name: 'SMB/Admin Shares', tactic: 'Lateral Movement' }, { id: 'T1570', name: 'Lateral Tool Transfer', tactic: 'Lateral Movement' }],
    details: 'PsExec used admin.jsmith credentials to create PSEXESVC on DC-MAIN-01 via port 445.',
  },
  {
    id: 'af-6b', time: '02:31', date: '2024-01-15', timestamp: new Date('2024-01-15T02:31:00'),
    phase: 'Lateral Movement', title: 'PsExec → FS-FINANCE-01',
    description: 'Lateral movement from WS-FIN-042 to File Server via SMB',
    riskScore: 92, severity: 'critical', color: 'bg-yellow-500', icon: <Network className="w-3.5 h-3.5" />,
    sourceResource: 'ws-fin-042', targetResource: 'fs-finance', process: 'PsExec SMB', processIcon: <Network className="w-3 h-3" />,
    iocs: [{ type: 'Tool', value: 'PsExec.exe' }, { type: 'Port', value: 'TCP 445 (SMB)' }, { type: 'Creds', value: 'admin.jsmith' }],
    ttps: [{ id: 'T1021.002', name: 'SMB/Admin Shares', tactic: 'Lateral Movement' }],
    details: 'PsExec used admin.jsmith credentials to create PSEXESVC on FS-FINANCE-01 via port 445.',
  },
  {
    id: 'af-7', time: '02:33', date: '2024-01-15', timestamp: new Date('2024-01-15T02:33:00'),
    phase: 'Discovery', title: 'AD Enumeration',
    description: 'ADFind + SharpHound ran on DC-MAIN-01 to map entire domain',
    riskScore: 70, severity: 'high', color: 'bg-yellow-600', icon: <Crosshair className="w-3.5 h-3.5" />,
    sourceResource: 'dc-main', targetResource: 'dc-main', process: 'AD Enum', processIcon: <Eye className="w-3 h-3" />,
    iocs: [{ type: 'Tools', value: 'ADFind.exe, SharpHound' }, { type: 'Output', value: 'ad_enum.json' }],
    ttps: [{ id: 'T1087.002', name: 'Domain Account Discovery', tactic: 'Discovery' }, { id: 'T1482', name: 'Domain Trust Discovery', tactic: 'Discovery' }],
    details: 'Full AD enumeration: domain trusts, GPOs, OUs, high-value targets mapped. BloodHound data collected.',
  },
  {
    id: 'af-8', time: '02:35', date: '2024-01-15', timestamp: new Date('2024-01-15T02:35:00'),
    phase: 'Collection', title: 'Finance Data Harvested',
    description: 'Bulk file download from FS-FINANCE-01 share',
    riskScore: 88, severity: 'critical', color: 'bg-purple-500', icon: <HardDrive className="w-3.5 h-3.5" />,
    sourceResource: 'fs-finance', targetResource: 'ws-fin-042', process: '1,247 files', processIcon: <HardDrive className="w-3 h-3" />,
    iocs: [{ type: 'Files', value: '1,247 (4.2 GB)' }, { type: 'Source', value: '\\\\FS-FINANCE-01\\Finance' }, { type: 'Staging', value: 'C:\\Windows\\Temp\\exfil\\' }],
    ttps: [{ id: 'T1039', name: 'Data from Network Share', tactic: 'Collection' }, { id: 'T1074.001', name: 'Local Data Staging', tactic: 'Collection' }],
    details: 'Finance reports, customer PII, contracts, strategy docs. Staged in C:\\Windows\\Temp\\exfil\\ as split RAR archives.',
  },
  {
    id: 'af-8b', time: '02:35', date: '2024-01-15', timestamp: new Date('2024-01-15T02:35:30'),
    phase: 'Collection', title: 'SharePoint Data Harvested',
    description: 'Bulk file download from SharePoint Online using stolen creds',
    riskScore: 85, severity: 'high', color: 'bg-purple-500', icon: <Cloud className="w-3.5 h-3.5" />,
    sourceResource: 'sharepoint', targetResource: 'ws-fin-042', process: 'SharePoint DL', processIcon: <Cloud className="w-3 h-3" />,
    iocs: [{ type: 'Source', value: 'SharePoint Online - Finance' }, { type: 'User', value: 'jsmith@company.com' }],
    ttps: [{ id: 'T1213.002', name: 'Data from SharePoint', tactic: 'Collection' }],
    details: 'SharePoint Online Finance site accessed using jsmith\'s session token. Documents synced to local staging directory.',
  },
  {
    id: 'af-9', time: '02:37', date: '2024-01-15', timestamp: new Date('2024-01-15T02:37:00'),
    phase: 'Exfiltration', title: 'Data Exfiltrated',
    description: 'Compressed data exfiltrated from WS-FIN-042 to C2 server',
    riskScore: 93, severity: 'critical', color: 'bg-purple-600', icon: <Cloud className="w-3.5 h-3.5" />,
    sourceResource: 'ws-fin-042', targetResource: 'c2', process: '1.8 GB → C2', processIcon: <Cloud className="w-3 h-3" />,
    iocs: [{ type: 'Method', value: 'HTTPS via C2' }, { type: 'Volume', value: '~1.8 GB compressed' }, { type: 'Duration', value: '~15 min' }],
    ttps: [{ id: 'T1041', name: 'Exfil Over C2 Channel', tactic: 'Exfiltration' }, { id: 'T1560.001', name: 'Archive via RAR', tactic: 'Collection' }],
    details: 'Split RAR archives sent through Cobalt Strike HTTPS C2 channel. Blended with normal HTTPS traffic.',
  },
  {
    id: 'af-10a', time: '02:40', date: '2024-01-15', timestamp: new Date('2024-01-15T02:40:00'),
    phase: 'Impact', title: 'GPO Ransomware Push',
    description: 'Malicious GPO "Windows Update Policy" deployed from DC-MAIN-01',
    riskScore: 100, severity: 'critical', color: 'bg-red-700', icon: <Lock className="w-3.5 h-3.5" />,
    sourceResource: 'dc-main', targetResource: 'fs-finance', process: 'GPO Deploy', processIcon: <Lock className="w-3 h-3" />,
    iocs: [{ type: 'Ransomware', value: 'BlackCat/ALPHV' }, { type: 'GPO', value: 'Windows Update Policy' }, { type: 'Extension', value: '.encrypted' }],
    ttps: [{ id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' }, { id: 'T1484.001', name: 'GPO Modification', tactic: 'Defense Evasion' }],
    details: 'Ransomware deployed via malicious GPO from DC-MAIN-01. Volume shadow copies deleted. BKP-SERVER-01 targeted first.',
  },
  {
    id: 'af-10b', time: '02:40', date: '2024-01-15', timestamp: new Date('2024-01-15T02:40:10'),
    phase: 'Impact', title: 'Backup Server Encrypted',
    description: 'BKP-SERVER-01 targeted first to prevent recovery',
    riskScore: 100, severity: 'critical', color: 'bg-red-700', icon: <Lock className="w-3.5 h-3.5" />,
    sourceResource: 'dc-main', targetResource: 'bkp', process: 'Encrypt', processIcon: <Lock className="w-3 h-3" />,
    iocs: [{ type: 'Target', value: 'BKP-SERVER-01' }, { type: 'Note', value: 'RECOVER-FILES.txt' }],
    ttps: [{ id: 'T1490', name: 'Inhibit System Recovery', tactic: 'Impact' }],
    details: 'Backup server encrypted first to prevent recovery. Veeam repositories destroyed.',
  },
  {
    id: 'af-10c', time: '02:41', date: '2024-01-15', timestamp: new Date('2024-01-15T02:41:00'),
    phase: 'Impact', title: 'Domain-wide Encryption',
    description: 'SQL-DB-01, WEB-APP-01, EXCH-01 encrypted via GPO',
    riskScore: 100, severity: 'critical', color: 'bg-red-700', icon: <Lock className="w-3.5 h-3.5" />,
    sourceResource: 'dc-main', targetResource: 'sql-db', process: 'Encrypt All', processIcon: <Lock className="w-3 h-3" />,
    iocs: [{ type: 'Targets', value: 'SQL-DB-01, WEB-APP-01, EXCH-01' }, { type: 'BTC', value: 'bc1q...xyz' }],
    ttps: [{ id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' }],
    details: 'Remaining servers encrypted. Recovery Environment disabled. Ransom note dropped in every directory.',
  },
];

// ===================== INCIDENT DIAGRAM DATA =====================
interface DiagramNode {
  id: string;
  label: string;
  type: 'attacker' | 'server' | 'workstation' | 'cloud' | 'user' | 'network' | 'external';
  icon: React.ReactNode;
  x: number;  // percentage position
  y: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  sublabel?: string;
}

interface DiagramEdge {
  from: string;
  to: string;
  label: string;
  type: 'attack' | 'lateral' | 'exfil' | 'c2' | 'normal';
  order: number;
}

const DIAGRAM_NODES: DiagramNode[] = [
  { id: 'dn-attacker', label: 'Threat Actor', type: 'attacker', icon: <Skull className="w-5 h-5" />, x: 5, y: 15, severity: 'critical', sublabel: '185.220.101.42' },
  { id: 'dn-internet', label: 'Internet', type: 'external', icon: <Globe className="w-5 h-5" />, x: 20, y: 8, severity: 'none', sublabel: 'Public Network' },
  { id: 'dn-email-gw', label: 'Email Gateway', type: 'network', icon: <Shield className="w-5 h-5" />, x: 35, y: 8, severity: 'none', sublabel: 'Proofpoint' },
  { id: 'dn-firewall', label: 'FW-EDGE-01', type: 'network', icon: <Shield className="w-5 h-5" />, x: 35, y: 30, severity: 'high', sublabel: 'Palo Alto' },
  { id: 'dn-vpn', label: 'VPN Gateway', type: 'network', icon: <Wifi className="w-5 h-5" />, x: 20, y: 30, severity: 'high', sublabel: 'vpn.company.com' },
  { id: 'dn-jsmith', label: 'jsmith', type: 'user', icon: <Users className="w-5 h-5" />, x: 50, y: 8, severity: 'high', sublabel: 'Finance User' },
  { id: 'dn-ws042', label: 'WS-FIN-042', type: 'workstation', icon: <Monitor className="w-5 h-5" />, x: 50, y: 30, severity: 'critical', sublabel: 'Patient Zero' },
  { id: 'dn-dc', label: 'DC-MAIN-01', type: 'server', icon: <Server className="w-5 h-5" />, x: 72, y: 30, severity: 'critical', sublabel: 'Domain Controller' },
  { id: 'dn-fs', label: 'FS-FINANCE-01', type: 'server', icon: <HardDrive className="w-5 h-5" />, x: 60, y: 55, severity: 'critical', sublabel: 'File Server' },
  { id: 'dn-sp', label: 'SharePoint', type: 'cloud', icon: <Cloud className="w-5 h-5" />, x: 40, y: 55, severity: 'high', sublabel: 'O365' },
  { id: 'dn-bkp', label: 'BKP-SERVER', type: 'server', icon: <Server className="w-5 h-5" />, x: 88, y: 55, severity: 'critical', sublabel: 'Backup' },
  { id: 'dn-sql', label: 'SQL-DB-01', type: 'server', icon: <Database className="w-5 h-5" />, x: 72, y: 55, severity: 'high', sublabel: 'Database' },
  { id: 'dn-web', label: 'WEB-APP-01', type: 'server', icon: <Cloud className="w-5 h-5" />, x: 88, y: 30, severity: 'medium', sublabel: 'Web Server' },
  { id: 'dn-exch', label: 'EXCH-01', type: 'server', icon: <Mail className="w-5 h-5" />, x: 50, y: 75, severity: 'medium', sublabel: 'Exchange' },
  { id: 'dn-c2', label: 'C2 Server', type: 'attacker', icon: <Globe className="w-5 h-5" />, x: 5, y: 55, severity: 'critical', sublabel: 'update-service.xyz' },
];

const DIAGRAM_EDGES: DiagramEdge[] = [
  { from: 'dn-attacker', to: 'dn-internet', label: 'Phishing', type: 'attack', order: 1 },
  { from: 'dn-internet', to: 'dn-email-gw', label: 'SMTP', type: 'attack', order: 2 },
  { from: 'dn-email-gw', to: 'dn-jsmith', label: 'Deliver', type: 'attack', order: 3 },
  { from: 'dn-jsmith', to: 'dn-ws042', label: 'Open .xlsm', type: 'attack', order: 4 },
  { from: 'dn-ws042', to: 'dn-c2', label: 'C2 Beacon', type: 'c2', order: 5 },
  { from: 'dn-ws042', to: 'dn-dc', label: 'DCSync + PsExec', type: 'lateral', order: 6 },
  { from: 'dn-ws042', to: 'dn-fs', label: 'PsExec', type: 'lateral', order: 7 },
  { from: 'dn-fs', to: 'dn-ws042', label: '1,247 files', type: 'exfil', order: 8 },
  { from: 'dn-sp', to: 'dn-ws042', label: 'SharePoint DL', type: 'exfil', order: 9 },
  { from: 'dn-ws042', to: 'dn-c2', label: '1.8 GB exfil', type: 'exfil', order: 10 },
  { from: 'dn-dc', to: 'dn-fs', label: 'GPO Encrypt', type: 'attack', order: 11 },
  { from: 'dn-dc', to: 'dn-bkp', label: 'Encrypt', type: 'attack', order: 12 },
  { from: 'dn-dc', to: 'dn-sql', label: 'Encrypt', type: 'attack', order: 13 },
  { from: 'dn-dc', to: 'dn-web', label: 'Encrypt', type: 'attack', order: 14 },
  { from: 'dn-dc', to: 'dn-exch', label: 'Encrypt', type: 'attack', order: 15 },
];

// ===================== MOCK RAW LOG EVENTS =====================
const MOCK_EVENTS = [
  { id: '1', timestamp: new Date('2024-01-15T02:30:15'), source: 'windows_security', severity: 'critical' as const, title: 'Suspicious Process Execution', summary: 'PsExec.exe executed with SYSTEM privileges', category: 'process_execution', rawLog: 'EventID: 4688\nProcess Name: C:\\Windows\\System32\\PsExec.exe\nUser: NT AUTHORITY\\SYSTEM', relatedCount: 3 },
  { id: '2', timestamp: new Date('2024-01-15T02:31:00'), source: 'firewall', severity: 'high' as const, title: 'Outbound Connection to Known C2', summary: 'Connection to 185.220.101.42:443 blocked', category: 'network_connection', rawLog: 'Action: Block\nDirection: Outbound\nDest IP: 185.220.101.42\nDest Port: 443', relatedCount: 5 },
  { id: '3', timestamp: new Date('2024-01-15T02:32:30'), source: 'windows_security', severity: 'medium' as const, title: 'Scheduled Task Created', summary: 'New scheduled task "WindowsUpdate" created', category: 'persistence', rawLog: 'Task Name: WindowsUpdate\nAction: C:\\Users\\Public\\update.exe\nTrigger: At startup', relatedCount: 1 },
  { id: '4', timestamp: new Date('2024-01-15T02:35:00'), source: 'azure_activity', severity: 'high' as const, title: 'Bulk File Download', summary: '1,247 files downloaded from SharePoint', category: 'data_exfiltration', rawLog: 'Operation: FileDownloaded\nCount: 1247\nUser: jsmith@company.com', relatedCount: 2 },
  { id: '5', timestamp: new Date('2024-01-15T02:40:00'), source: 'windows_security', severity: 'critical' as const, title: 'Lateral Movement Detected', summary: 'Remote WMI execution on DC-MAIN-01', category: 'lateral_movement', rawLog: 'EventID: 4624\nLogon Type: 3\nTarget: DC-MAIN-01\nSource: ACCT-WS-042', relatedCount: 8 },
];

// ===================== MAIN COMPONENT =====================
export default function TimelineViewPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useSessionStore();

  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_EVENTS[0] | null>(null);
  const [selectedFlowStep, setSelectedFlowStep] = useState<AttackFlowStep | null>(null);
  const [selectedDiagramNode, setSelectedDiagramNode] = useState<DiagramNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAttackFlow, setShowAttackFlow] = useState(true);
  const [showDiagram, setShowDiagram] = useState(true);
  const [activeView, setActiveView] = useState<'flow' | 'diagram'>('flow');

  const handleBack = () => { goToPreviousStep(); navigate('/triage'); };
  const handleContinue = () => { goToNextStep(); navigate('/verification'); };

  const filteredEvents = MOCK_EVENTS.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSourceIcon = (source: string) => {
    if (source.includes('windows')) return <Monitor className="w-4 h-4" />;
    if (source.includes('azure') || source.includes('cloud')) return <Cloud className="w-4 h-4" />;
    if (source.includes('firewall')) return <Shield className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500', info: 'bg-blue-500' };
    return colors[severity] || colors.info;
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
    if (score >= 75) return { text: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    if (score >= 50) return { text: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { text: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
  };

  const getResourceById = (id: string) => RESOURCES.find(r => r.id === id);

  const getNodeSeverityStyles = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-700 shadow-red-200 dark:shadow-red-900/50',
      high: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700',
      medium: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700',
      low: 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-700',
      none: 'border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600',
    };
    return styles[severity] || styles.none;
  };

  return (
    <PageContainer
      title="Timeline View"
      subtitle="Interactive timeline of security events"
      actions={
        <div className="flex items-center gap-2">
          <Tooltip content="Zoom out"><Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}><ZoomOut className="w-4 h-4" /></Button></Tooltip>
          <span className="text-sm text-slate-500">{Math.round(zoomLevel * 100)}%</span>
          <Tooltip content="Zoom in"><Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}><ZoomIn className="w-4 h-4" /></Button></Tooltip>
        </div>
      }
      footer={<PageNavigation onBack={handleBack} backLabel="Triage" onContinue={handleContinue} continueLabel="Proceed to Review" />}
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] max-w-md">
          <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events..." tooltip="Search events by keyword" />
        </div>
        <Tooltip content="Filter by data source"><Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>Source</Button></Tooltip>
        <Tooltip content="Filter by severity"><Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>Severity</Button></Tooltip>
        <Tooltip content="Filter by date"><Button variant="outline" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>Date Range</Button></Tooltip>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <Button variant={activeView === 'flow' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveView('flow')} leftIcon={<Activity className="w-4 h-4" />}>
          Attack Flow Timeline
        </Button>
        <Button variant={activeView === 'diagram' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveView('diagram')} leftIcon={<Layers className="w-4 h-4" />}>
          Incident Diagram
        </Button>
      </div>

      {/* ============================================================ */}
      {/* ATTACK FLOW TIMELINE — Vertical=Time, Horizontal=Resources   */}
      {/* ============================================================ */}
      {activeView === 'flow' && (
        <Card className="mb-6">
          <button onClick={() => setShowAttackFlow(!showAttackFlow)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">Attack Flow Timeline</span>
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">Resource View</span>
            </div>
            {showAttackFlow ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>

          {showAttackFlow && (
            <div className="mt-4 space-y-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-500">AXIS:</span>
                  <span className="text-slate-400">Vertical ↓ = Date & Time</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-400">Horizontal → = Resources & Processes</span>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Critical</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> High</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Medium</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700 px-1 font-bold text-slate-600">95</span> Risk</div>
                </div>
              </div>

              {/* Timeline Grid */}
              <div className="overflow-x-auto">
                <div style={{ minWidth: '900px' }}>
                  {/* Resource Header (horizontal axis) — only show resources involved */}
                  {(() => {
                    // Collect all unique resources referenced in the flow
                    const usedResourceIds = new Set<string>();
                    ATTACK_FLOW.forEach(f => { usedResourceIds.add(f.sourceResource); usedResourceIds.add(f.targetResource); });
                    const usedResources = RESOURCES.filter(r => usedResourceIds.has(r.id));

                    return (
                      <>
                        {/* Resource columns header */}
                        <div className="flex items-end mb-2">
                          <div className="w-[80px] flex-shrink-0" /> {/* time column */}
                          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${usedResources.length}, 1fr)` }}>
                            {usedResources.map((res) => (
                              <Tooltip key={res.id} content={`${res.name} — ${res.role}${res.ip ? ' (' + res.ip + ')' : ''}`}>
                                <button
                                  onClick={() => setSelectedDiagramNode(DIAGRAM_NODES.find(n => n.label === res.name || n.sublabel === res.name) || null)}
                                  className={cn(
                                    'flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg border transition-all hover:scale-105 mx-0.5',
                                    getNodeSeverityStyles(res.severity)
                                  )}
                                >
                                  <span className={cn(
                                    'text-slate-500',
                                    res.severity === 'critical' && 'text-red-500',
                                    res.severity === 'high' && 'text-orange-500',
                                    res.type === 'attacker' && 'text-red-600'
                                  )}>
                                    {res.icon}
                                  </span>
                                  <span className="text-[9px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-full leading-tight">{res.name}</span>
                                  <span className="text-[8px] text-slate-400 truncate max-w-full">{res.role}</span>
                                </button>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                        <div className="ml-[80px] mb-1 h-px bg-slate-200 dark:bg-slate-700" />

                        {/* Attack Flow Rows (vertical axis = time) */}
                        <div className="space-y-0">
                          {ATTACK_FLOW.map((step) => {
                            const srcIdx = usedResources.findIndex(r => r.id === step.sourceResource);
                            const tgtIdx = usedResources.findIndex(r => r.id === step.targetResource);
                            const riskColors = getRiskScoreColor(step.riskScore);
                            const isSelected = selectedFlowStep?.id === step.id;
                            const isSelfLoop = step.sourceResource === step.targetResource;

                            const leftIdx = Math.min(srcIdx, tgtIdx);
                            const rightIdx = Math.max(srcIdx, tgtIdx);
                            const colCount = usedResources.length;

                            return (
                              <div key={step.id} className={cn(
                                'flex items-center border-b border-slate-100 dark:border-slate-800 transition-colors',
                                isSelected && 'bg-forensic-50/50 dark:bg-forensic-900/10'
                              )}>
                                {/* Time label (vertical axis) */}
                                <div className="w-[80px] flex-shrink-0 pr-2 text-right py-2">
                                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">{step.time}</span>
                                  <br />
                                  <span className="text-[9px] text-slate-400">{step.phase}</span>
                                </div>

                                {/* Resource-process visualization row */}
                                <div className="flex-1 relative py-2" style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
                                  {/* Background flow indicator spanning from source → target */}
                                  {!isSelfLoop && (
                                    <div
                                      className={cn(
                                        'absolute top-1/2 -translate-y-1/2 h-1 rounded-full z-0',
                                        step.severity === 'critical' ? 'bg-red-200 dark:bg-red-900/40' :
                                        step.severity === 'high' ? 'bg-orange-200 dark:bg-orange-900/40' :
                                        'bg-yellow-200 dark:bg-yellow-900/40'
                                      )}
                                      style={{
                                        left: `${((leftIdx + 0.5) / colCount) * 100}%`,
                                        width: `${((rightIdx - leftIdx) / colCount) * 100}%`,
                                      }}
                                    />
                                  )}

                                  {/* Source node dot */}
                                  <Tooltip content={
                                    <div>
                                      <div className="font-semibold">{getResourceById(step.sourceResource)?.name}</div>
                                      <div className="text-xs opacity-80">Source — {getResourceById(step.sourceResource)?.role}</div>
                                    </div>
                                  }>
                                    <button
                                      onClick={() => setSelectedFlowStep(isSelected ? null : step)}
                                      className="absolute z-10 top-1/2 -translate-y-1/2 -translate-x-1/2"
                                      style={{ left: `${((srcIdx + 0.5) / colCount) * 100}%` }}
                                    >
                                      <div className={cn(
                                        'w-6 h-6 rounded-full flex items-center justify-center text-white transition-all',
                                        step.color,
                                        isSelected && 'ring-2 ring-offset-1 ring-forensic-500 scale-125'
                                      )}>
                                        {step.icon}
                                      </div>
                                    </button>
                                  </Tooltip>

                                  {/* Process label in the middle */}
                                  {!isSelfLoop && (
                                    <Tooltip content={
                                      <div className="max-w-xs">
                                        <div className="font-semibold">{step.title}</div>
                                        <div className="text-xs mt-1 opacity-80">{step.description}</div>
                                        <div className="text-xs mt-1 font-mono opacity-60">Risk: {step.riskScore}/100 | {step.ttps.map(t => t.id).join(', ')}</div>
                                        <div className="text-xs mt-1 opacity-60">Click for details →</div>
                                      </div>
                                    }>
                                      <button
                                        onClick={() => setSelectedFlowStep(isSelected ? null : step)}
                                        className={cn(
                                          'absolute z-20 top-1/2 -translate-y-1/2 -translate-x-1/2',
                                          'flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-semibold transition-all whitespace-nowrap',
                                          isSelected ? 'bg-forensic-100 border-forensic-400 dark:bg-forensic-900/30 dark:border-forensic-600 scale-110' :
                                          'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:scale-105 hover:border-slate-400',
                                        )}
                                        style={{ left: `${(((leftIdx + rightIdx + 1) / 2) / colCount) * 100}%` }}
                                      >
                                        {step.processIcon}
                                        <span>{step.process}</span>
                                        <span className={cn('font-black tabular-nums text-[10px]', riskColors.text)}>{step.riskScore}</span>
                                      </button>
                                    </Tooltip>
                                  )}

                                  {/* Self-loop process label */}
                                  {isSelfLoop && (
                                    <Tooltip content={
                                      <div className="max-w-xs">
                                        <div className="font-semibold">{step.title}</div>
                                        <div className="text-xs mt-1 opacity-80">{step.description}</div>
                                        <div className="text-xs mt-1 font-mono opacity-60">Risk: {step.riskScore}/100</div>
                                      </div>
                                    }>
                                      <button
                                        onClick={() => setSelectedFlowStep(isSelected ? null : step)}
                                        className={cn(
                                          'absolute z-20 top-1/2 -translate-y-1/2',
                                          'flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-semibold transition-all whitespace-nowrap',
                                          isSelected ? 'bg-forensic-100 border-forensic-400 dark:bg-forensic-900/30' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:scale-105',
                                        )}
                                        style={{ left: `${((srcIdx + 0.8) / colCount) * 100}%` }}
                                      >
                                        {step.processIcon}
                                        <span>{step.process}</span>
                                        <span className={cn('font-black tabular-nums text-[10px]', riskColors.text)}>{step.riskScore}</span>
                                      </button>
                                    </Tooltip>
                                  )}

                                  {/* Target node dot (if different from source) */}
                                  {!isSelfLoop && (
                                    <Tooltip content={
                                      <div>
                                        <div className="font-semibold">{getResourceById(step.targetResource)?.name}</div>
                                        <div className="text-xs opacity-80">Target — {getResourceById(step.targetResource)?.role}</div>
                                      </div>
                                    }>
                                      <button
                                        onClick={() => setSelectedFlowStep(isSelected ? null : step)}
                                        className="absolute z-10 top-1/2 -translate-y-1/2 -translate-x-1/2"
                                        style={{ left: `${((tgtIdx + 0.5) / colCount) * 100}%` }}
                                      >
                                        <div className={cn(
                                          'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all',
                                          step.severity === 'critical' ? 'bg-red-100 border-red-500 text-red-600 dark:bg-red-900/30' :
                                          step.severity === 'high' ? 'bg-orange-100 border-orange-500 text-orange-600 dark:bg-orange-900/30' :
                                          'bg-yellow-100 border-yellow-500 text-yellow-600 dark:bg-yellow-900/30',
                                          isSelected && 'ring-2 ring-offset-1 ring-forensic-500 scale-125'
                                        )}>
                                          <MapPin className="w-2.5 h-2.5" />
                                        </div>
                                      </button>
                                    </Tooltip>
                                  )}

                                  {/* Directional arrow between source and target */}
                                  {!isSelfLoop && (
                                    <div
                                      className="absolute z-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
                                      style={{
                                        left: `${((srcIdx + 0.65) / colCount) * 100}%`,
                                      }}
                                    >
                                      <ArrowRight className={cn(
                                        'w-3 h-3',
                                        step.severity === 'critical' ? 'text-red-400' :
                                        step.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                                      )} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Flow Step Detail Panel (drill-down) */}
              {selectedFlowStep && (
                <div className="border-2 border-forensic-300 dark:border-forensic-700 rounded-xl overflow-hidden">
                  <div className={cn('p-4', selectedFlowStep.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10' : selectedFlowStep.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10')}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white', selectedFlowStep.color)}>{selectedFlowStep.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedFlowStep.title}</h3>
                            <span className={cn('px-2 py-0.5 rounded text-xs font-bold', selectedFlowStep.severity === 'critical' ? 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 'bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300')}>{selectedFlowStep.severity.toUpperCase()}</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {selectedFlowStep.phase} — {selectedFlowStep.date} at {selectedFlowStep.time}
                            <span className="mx-2">|</span>
                            <span className="font-medium">{getResourceById(selectedFlowStep.sourceResource)?.name}</span>
                            {selectedFlowStep.sourceResource !== selectedFlowStep.targetResource && (
                              <><span className="mx-1">→</span><span className="font-medium">{getResourceById(selectedFlowStep.targetResource)?.name}</span></>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <span className={cn('text-3xl font-black tabular-nums', getRiskScoreColor(selectedFlowStep.riskScore).text)}>{selectedFlowStep.riskScore}</span>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">Risk</p>
                        </div>
                        <button onClick={() => setSelectedFlowStep(null)} className="p-1 hover:bg-white/50 rounded"><X className="w-5 h-5 text-slate-400" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> Details</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{selectedFlowStep.details}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1"><Target className="w-3 h-3" /> IOCs ({selectedFlowStep.iocs.length})</h4>
                        <div className="space-y-1">
                          {selectedFlowStep.iocs.map((ioc, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              <span className="text-slate-500 w-16 flex-shrink-0">{ioc.type}:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{ioc.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1"><Crosshair className="w-3 h-3" /> MITRE ATT&CK ({selectedFlowStep.ttps.length})</h4>
                        <div className="space-y-1">
                          {selectedFlowStep.ttps.map((ttp, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded text-xs">
                              <span className="px-1.5 py-0.5 bg-forensic-100 dark:bg-forensic-900/30 text-forensic-700 dark:text-forensic-300 rounded font-mono font-bold text-[10px]">{ttp.id}</span>
                              <span className="text-slate-700 dark:text-slate-300 flex-1">{ttp.name}</span>
                              <span className="text-slate-400 text-[10px]">{ttp.tactic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ============================================================ */}
      {/* INCIDENT DIAGRAM — Interactive Infographic                    */}
      {/* ============================================================ */}
      {activeView === 'diagram' && (
        <Card className="mb-6">
          <button onClick={() => setShowDiagram(!showDiagram)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-forensic-500" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">Incident Diagram</span>
              <span className="text-xs bg-forensic-100 dark:bg-forensic-900/30 text-forensic-600 dark:text-forensic-400 px-2 py-0.5 rounded-full">Interactive Infographic</span>
            </div>
            {showDiagram ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>

          {showDiagram && (
            <div className="mt-4 space-y-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> Compromised (Critical)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> Affected (High)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Touched (Medium)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-slate-300" /> Clean</div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-red-400" /> Attack</div>
                  <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-yellow-400" /> Lateral</div>
                  <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-purple-400" /> Exfil</div>
                  <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-blue-400 border-dashed border-b" /> C2</div>
                </div>
              </div>

              {/* Diagram Canvas */}
              <div className="relative bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ minHeight: '480px' }}>
                {/* Zone labels */}
                <div className="absolute top-2 left-2 text-[10px] font-medium text-slate-400 uppercase flex flex-col gap-1">
                  <span className="bg-red-100 dark:bg-red-900/20 text-red-500 px-1.5 py-0.5 rounded">External / Internet</span>
                </div>
                <div className="absolute top-2 right-2 text-[10px] font-medium text-slate-400 uppercase">
                  <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-500 px-1.5 py-0.5 rounded">Internal Network</span>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-400 uppercase">
                  <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-500 px-1.5 py-0.5 rounded">Data / Services Tier</span>
                </div>

                {/* DMZ line */}
                <div className="absolute top-[22%] left-[30%] right-0 h-px border-t border-dashed border-slate-300 dark:border-slate-600" />
                <div className="absolute top-[22%] left-[30%] text-[8px] text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-1 -translate-y-1/2">DMZ / Perimeter</div>
                <div className="absolute top-[45%] left-0 right-0 h-px border-t border-dashed border-slate-300 dark:border-slate-600" />
                <div className="absolute top-[45%] left-2 text-[8px] text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-1 -translate-y-1/2">Server VLAN</div>

                {/* Edges (drawn as absolute divs — simplified) */}
                {DIAGRAM_EDGES.map((edge, idx) => {
                  const fromNode = DIAGRAM_NODES.find(n => n.id === edge.from);
                  const toNode = DIAGRAM_NODES.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const edgeColor = edge.type === 'attack' ? 'bg-red-300 dark:bg-red-700' :
                    edge.type === 'lateral' ? 'bg-yellow-300 dark:bg-yellow-700' :
                    edge.type === 'exfil' ? 'bg-purple-300 dark:bg-purple-700' :
                    'bg-blue-300 dark:bg-blue-700';

                  // Simplified line rendering: horizontal then vertical (L-shaped)
                  const x1 = fromNode.x;
                  const y1 = fromNode.y;
                  const x2 = toNode.x;
                  const y2 = toNode.y;

                  return (
                    <div key={idx} className="absolute pointer-events-none z-0">
                      {/* Horizontal segment */}
                      <div className={cn('absolute h-[2px] rounded', edgeColor)} style={{
                        top: `${y1}%`,
                        left: `${Math.min(x1, x2)}%`,
                        width: `${Math.abs(x2 - x1)}%`,
                        opacity: 0.6,
                      }} />
                      {/* Vertical segment */}
                      {y1 !== y2 && (
                        <div className={cn('absolute w-[2px] rounded', edgeColor)} style={{
                          left: `${x2}%`,
                          top: `${Math.min(y1, y2)}%`,
                          height: `${Math.abs(y2 - y1)}%`,
                          opacity: 0.6,
                        }} />
                      )}
                      {/* Edge label */}
                      <div className="absolute text-[7px] font-medium text-slate-500 bg-white/80 dark:bg-slate-800/80 px-0.5 rounded whitespace-nowrap"
                        style={{
                          top: `${(y1 + y2) / 2}%`,
                          left: `${(x1 + x2) / 2}%`,
                          transform: 'translate(-50%, -50%)',
                        }}>
                        {edge.label}
                      </div>
                    </div>
                  );
                })}

                {/* Nodes */}
                {DIAGRAM_NODES.map((node) => {
                  const isSelected = selectedDiagramNode?.id === node.id;
                  return (
                    <Tooltip key={node.id} content={
                      <div>
                        <div className="font-semibold">{node.label}</div>
                        <div className="text-xs opacity-80">{node.sublabel}</div>
                        <div className="text-xs opacity-60">Click for details</div>
                      </div>
                    }>
                      <button
                        onClick={() => setSelectedDiagramNode(isSelected ? null : node)}
                        className={cn(
                          'absolute z-10 flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 transition-all shadow-sm',
                          'hover:scale-110 hover:shadow-md min-w-[60px]',
                          getNodeSeverityStyles(node.severity),
                          isSelected && 'ring-2 ring-forensic-500 ring-offset-2 scale-110 shadow-lg',
                          node.type === 'attacker' && 'border-red-500 bg-red-100 dark:bg-red-900/30',
                        )}
                        style={{
                          left: `${node.x}%`,
                          top: `${node.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <span className={cn(
                          node.type === 'attacker' ? 'text-red-600' :
                          node.severity === 'critical' ? 'text-red-500' :
                          node.severity === 'high' ? 'text-orange-500' :
                          'text-slate-500'
                        )}>
                          {node.icon}
                        </span>
                        <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200 leading-none">{node.label}</span>
                        {node.sublabel && <span className="text-[7px] text-slate-400 leading-none">{node.sublabel}</span>}
                        {node.severity !== 'none' && (
                          <span className={cn(
                            'w-2 h-2 rounded-full absolute -top-0.5 -right-0.5',
                            node.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                            node.severity === 'high' ? 'bg-orange-500' :
                            node.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          )} />
                        )}
                      </button>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Selected Diagram Node Detail */}
              {selectedDiagramNode && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        selectedDiagramNode.type === 'attacker' ? 'bg-red-500 text-white' :
                        selectedDiagramNode.severity === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                        selectedDiagramNode.severity === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-700'
                      )}>
                        {selectedDiagramNode.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedDiagramNode.label}</h3>
                        <p className="text-sm text-slate-500">{selectedDiagramNode.sublabel} — {selectedDiagramNode.type}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedDiagramNode(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-slate-500 font-medium">Severity:</span>
                      <span className={cn('ml-2 font-bold', selectedDiagramNode.severity === 'critical' ? 'text-red-600' : selectedDiagramNode.severity === 'high' ? 'text-orange-600' : 'text-yellow-600')}>{selectedDiagramNode.severity.toUpperCase()}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-slate-500 font-medium">Connections:</span>
                      <span className="ml-2 text-slate-700 dark:text-slate-300">{DIAGRAM_EDGES.filter(e => e.from === selectedDiagramNode.id || e.to === selectedDiagramNode.id).length} edges</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg col-span-2">
                      <span className="text-slate-500 font-medium">Related Events:</span>
                      <div className="mt-1 space-y-1">
                        {DIAGRAM_EDGES.filter(e => e.from === selectedDiagramNode.id || e.to === selectedDiagramNode.id).map((edge, idx) => {
                          const otherNodeId = edge.from === selectedDiagramNode.id ? edge.to : edge.from;
                          const otherNode = DIAGRAM_NODES.find(n => n.id === otherNodeId);
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className={cn('w-1.5 h-1.5 rounded-full', edge.type === 'attack' ? 'bg-red-500' : edge.type === 'lateral' ? 'bg-yellow-500' : edge.type === 'exfil' ? 'bg-purple-500' : 'bg-blue-500')} />
                              <span className="text-slate-600 dark:text-slate-400">
                                {edge.from === selectedDiagramNode.id ? '→' : '←'} {otherNode?.label}: <span className="font-medium">{edge.label}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Raw Event Timeline + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="min-h-[500px]">
            <CardHeader title="Event Timeline" description={`${filteredEvents.length} events • Jan 15, 2024`} />
            <div className="mt-6 relative">
              <div className="flex justify-between text-xs text-slate-400 mb-4"><span>02:30</span><span>02:35</span><span>02:40</span><span>02:45</span></div>
              <div className="space-y-4">
                {['Windows', 'Cloud', 'Network'].map((lane) => (
                  <div key={lane} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-slate-500 text-right">{lane}</span>
                    <div className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 rounded relative">
                      {filteredEvents.filter((e) => { if (lane === 'Windows') return e.source.includes('windows'); if (lane === 'Cloud') return e.source.includes('azure'); return e.source.includes('firewall'); }).map((event) => (
                        <Tooltip key={event.id} content={event.title}>
                          <button onClick={() => setSelectedEvent(event)} className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-transform hover:scale-150 ring-2 ring-white dark:ring-slate-900', getSeverityColor(event.severity), selectedEvent?.id === event.id && 'ring-4 ring-forensic-400')} style={{ left: `${((event.timestamp.getMinutes() - 30) / 15) * 100}%` }} />
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 space-y-2">
              {filteredEvents.map((event) => (
                <button key={event.id} onClick={() => setSelectedEvent(event)} className={cn('w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors', selectedEvent?.id === event.id ? 'bg-forensic-50 dark:bg-forensic-900/20 ring-1 ring-forensic-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50')}>
                  <span className="text-slate-400">{getSourceIcon(event.source)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{event.title}</p>
                    <p className="text-xs text-slate-500 truncate">{event.summary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={event.severity} size="sm" />
                    <span className="text-xs text-slate-400">{formatTimestamp(event.timestamp)}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
        <div>
          <Card className="sticky top-24 min-h-[500px]">
            {selectedEvent ? (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{selectedEvent.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{formatDateTime(selectedEvent.timestamp)}</p>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <div className="space-y-4">
                  <div><SeverityBadge severity={selectedEvent.severity} /></div>
                  <div><h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Summary</h4><p className="text-sm text-slate-700 dark:text-slate-300">{selectedEvent.summary}</p></div>
                  <div><h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Source</h4><Badge variant="secondary">{selectedEvent.source.replace('_', ' ')}</Badge></div>
                  <div><h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Category</h4><Badge variant="info">{selectedEvent.category.replace('_', ' ')}</Badge></div>
                  <div><h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Related Events</h4><p className="text-sm text-slate-700 dark:text-slate-300">{selectedEvent.relatedCount} correlated event{selectedEvent.relatedCount !== 1 ? 's' : ''}</p></div>
                  <div>
                    <Tooltip content="View full raw log data"><Button variant="outline" size="sm" fullWidth><Copy className="w-3 h-3 mr-1" /> View Raw Log</Button></Tooltip>
                    <pre className="mt-2 text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">{selectedEvent.rawLog}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Activity className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500">Select an event to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
