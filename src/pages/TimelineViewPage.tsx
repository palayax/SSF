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
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDateTime, formatTimestamp } from '@/utils/formatters';

// ===================== ATTACK TIMELINE DATA =====================
interface AttackTimelineEvent {
  id: string;
  date: string;       // e.g. '2024-01-15'
  time: string;        // e.g. '02:15'
  timestamp: Date;
  phase: string;
  phaseIndex: number;
  title: string;
  description: string;
  riskScore: number;   // 0-100
  severity: 'critical' | 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  color: string;
  iocs: { type: string; value: string; }[];
  ttps: { id: string; name: string; tactic: string; }[];
  affectedAssets: string[];
  details: string;
}

const ATTACK_TIMELINE: AttackTimelineEvent[] = [
  {
    id: 'atk-1',
    date: '2024-01-15',
    time: '02:15',
    timestamp: new Date('2024-01-15T02:15:00'),
    phase: 'Initial Access',
    phaseIndex: 0,
    title: 'Phishing Email Delivered',
    description: 'Spear-phishing email with malicious attachment delivered to jsmith@company.com',
    riskScore: 85,
    severity: 'high',
    icon: <Mail className="w-4 h-4" />,
    color: 'bg-red-500',
    iocs: [
      { type: 'Email', value: 'invoice-update@mail-service.xyz' },
      { type: 'Hash (SHA256)', value: 'a1b2c3d4e5f6...9876543210ab' },
      { type: 'Domain', value: 'mail-service.xyz' },
      { type: 'IP', value: '198.51.100.23' },
    ],
    ttps: [
      { id: 'T1566.001', name: 'Spear-phishing Attachment', tactic: 'Initial Access' },
      { id: 'T1204.002', name: 'User Execution: Malicious File', tactic: 'Execution' },
    ],
    affectedAssets: ['WS-FIN-042', 'jsmith@company.com'],
    details: 'Email impersonated a vendor invoice. Contained a macro-enabled Excel document (.xlsm) that executed PowerShell on open. The macro was obfuscated using string concatenation and base64 encoding. Email passed SPF/DKIM checks as the sending domain was newly registered.',
  },
  {
    id: 'atk-2',
    date: '2024-01-15',
    time: '02:18',
    timestamp: new Date('2024-01-15T02:18:00'),
    phase: 'Execution',
    phaseIndex: 1,
    title: 'Macro Execution → PowerShell Stager',
    description: 'Malicious macro spawned PowerShell process downloading second-stage payload',
    riskScore: 90,
    severity: 'critical',
    icon: <Activity className="w-4 h-4" />,
    color: 'bg-red-600',
    iocs: [
      { type: 'Process', value: 'powershell.exe -enc <base64>' },
      { type: 'URL', value: 'https://cdn-update.xyz/payload.ps1' },
      { type: 'IP', value: '185.220.101.42' },
      { type: 'Hash', value: 'payload.ps1: e7f8a9b0c1d2...' },
    ],
    ttps: [
      { id: 'T1059.001', name: 'PowerShell', tactic: 'Execution' },
      { id: 'T1105', name: 'Ingress Tool Transfer', tactic: 'Command and Control' },
    ],
    affectedAssets: ['WS-FIN-042'],
    details: 'Excel macro used WMI to spawn powershell.exe with encoded command. The stager connected to cdn-update.xyz over HTTPS (port 443) to download the main payload. Cobalt Strike beacon was loaded in memory via reflective DLL injection. Process tree: EXCEL.EXE → cmd.exe → powershell.exe.',
  },
  {
    id: 'atk-3',
    date: '2024-01-15',
    time: '02:22',
    timestamp: new Date('2024-01-15T02:22:00'),
    phase: 'Command & Control',
    phaseIndex: 2,
    title: 'C2 Channel Established',
    description: 'Cobalt Strike beacon established HTTPS C2 channel to attacker infrastructure',
    riskScore: 92,
    severity: 'critical',
    icon: <Network className="w-4 h-4" />,
    color: 'bg-purple-600',
    iocs: [
      { type: 'C2 Domain', value: 'update-service.xyz' },
      { type: 'C2 IP', value: '185.220.101.42' },
      { type: 'C2 Port', value: '443 (HTTPS)' },
      { type: 'Beacon Config', value: 'Sleep: 60s, Jitter: 25%' },
      { type: 'User-Agent', value: 'Mozilla/5.0 (compatible)' },
    ],
    ttps: [
      { id: 'T1071.001', name: 'Web Protocols (HTTPS)', tactic: 'Command and Control' },
      { id: 'T1573.002', name: 'Encrypted Channel: Asymmetric', tactic: 'Command and Control' },
    ],
    affectedAssets: ['WS-FIN-042'],
    details: 'Cobalt Strike beacon configured with HTTPS C2 profile mimicking legitimate web traffic. Beacon sleep interval: 60 seconds with 25% jitter. JA3 fingerprint matches known Cobalt Strike malleable profile. DNS over HTTPS used for domain resolution. Traffic blended with legitimate web browsing.',
  },
  {
    id: 'atk-4',
    date: '2024-01-15',
    time: '02:25',
    timestamp: new Date('2024-01-15T02:25:00'),
    phase: 'Persistence',
    phaseIndex: 3,
    title: 'Scheduled Task Persistence',
    description: 'Created "WindowsUpdate" scheduled task for persistence across reboots',
    riskScore: 75,
    severity: 'high',
    icon: <RotateCw className="w-4 h-4" />,
    color: 'bg-orange-500',
    iocs: [
      { type: 'Task Name', value: 'WindowsUpdate' },
      { type: 'Executable', value: 'C:\\Users\\Public\\update.exe' },
      { type: 'Trigger', value: 'At system startup' },
      { type: 'Hash', value: 'update.exe: c3d4e5f6a7b8...' },
    ],
    ttps: [
      { id: 'T1053.005', name: 'Scheduled Task/Job', tactic: 'Persistence' },
      { id: 'T1036.005', name: 'Masquerading: Match Name', tactic: 'Defense Evasion' },
    ],
    affectedAssets: ['WS-FIN-042'],
    details: 'Scheduled task "WindowsUpdate" created via schtasks.exe with SYSTEM privileges. Executable placed in C:\\Users\\Public\\ to avoid UAC. Task configured to run at system startup with highest privileges. File was timestomped to match legitimate system files. The binary is a packed Cobalt Strike loader.',
  },
  {
    id: 'atk-5',
    date: '2024-01-15',
    time: '02:28',
    timestamp: new Date('2024-01-15T02:28:00'),
    phase: 'Privilege Escalation',
    phaseIndex: 4,
    title: 'Credential Theft via Mimikatz',
    description: 'Mimikatz DCSync attack harvested Domain Admin credentials',
    riskScore: 98,
    severity: 'critical',
    icon: <Unlock className="w-4 h-4" />,
    color: 'bg-orange-600',
    iocs: [
      { type: 'Tool', value: 'Mimikatz 2.2.0' },
      { type: 'Technique', value: 'DCSync (lsadump::dcsync)' },
      { type: 'Account', value: 'admin.jsmith (Domain Admin)' },
      { type: 'Account', value: 'svc-backup (Backup Operator)' },
      { type: 'Hash Type', value: 'NTLM, Kerberos AES256' },
    ],
    ttps: [
      { id: 'T1003.006', name: 'DCSync', tactic: 'Credential Access' },
      { id: 'T1078.002', name: 'Domain Accounts', tactic: 'Privilege Escalation' },
    ],
    affectedAssets: ['WS-FIN-042', 'DC-MAIN-01', 'admin.jsmith', 'svc-backup'],
    details: 'Attacker used in-memory Mimikatz to perform DCSync attack against DC-MAIN-01. Replicated password hashes for all domain admin accounts. The DCSync required replication permissions - attacker exploited the initial user\'s existing DACL permissions. NTLM hashes and Kerberos AES256 keys were extracted for admin.jsmith and svc-backup accounts.',
  },
  {
    id: 'atk-6',
    date: '2024-01-15',
    time: '02:30',
    timestamp: new Date('2024-01-15T02:30:00'),
    phase: 'Lateral Movement',
    phaseIndex: 5,
    title: 'PsExec Lateral Movement',
    description: 'Used PsExec with admin credentials to move to DC-MAIN-01 and FS-FINANCE-01',
    riskScore: 95,
    severity: 'critical',
    icon: <Network className="w-4 h-4" />,
    color: 'bg-yellow-500',
    iocs: [
      { type: 'Tool', value: 'PsExec.exe (SysInternals)' },
      { type: 'Source', value: 'WS-FIN-042 (10.0.10.42)' },
      { type: 'Target 1', value: 'DC-MAIN-01 (10.0.1.10)' },
      { type: 'Target 2', value: 'FS-FINANCE-01 (10.0.2.20)' },
      { type: 'Port', value: 'TCP 445 (SMB)' },
    ],
    ttps: [
      { id: 'T1570', name: 'Lateral Tool Transfer', tactic: 'Lateral Movement' },
      { id: 'T1021.002', name: 'SMB/Windows Admin Shares', tactic: 'Lateral Movement' },
      { id: 'T1047', name: 'WMI Execution', tactic: 'Execution' },
    ],
    affectedAssets: ['WS-FIN-042', 'DC-MAIN-01', 'FS-FINANCE-01'],
    details: 'PsExec.exe used admin.jsmith credentials to create remote services on DC-MAIN-01 and FS-FINANCE-01 via SMB (port 445). New PSEXESVC service installed on both targets. WMI was also used as backup execution method. Lateral movement completed in under 90 seconds across both targets.',
  },
  {
    id: 'atk-7',
    date: '2024-01-15',
    time: '02:33',
    timestamp: new Date('2024-01-15T02:33:00'),
    phase: 'Discovery',
    phaseIndex: 6,
    title: 'Internal Reconnaissance',
    description: 'Network scanning and AD enumeration from compromised domain controller',
    riskScore: 70,
    severity: 'high',
    icon: <Crosshair className="w-4 h-4" />,
    color: 'bg-yellow-600',
    iocs: [
      { type: 'Tool', value: 'ADFind.exe, SharpHound' },
      { type: 'Queries', value: 'Domain Trust, GPO, OU mapping' },
      { type: 'Output', value: 'C:\\Windows\\Temp\\ad_enum.json' },
    ],
    ttps: [
      { id: 'T1018', name: 'Remote System Discovery', tactic: 'Discovery' },
      { id: 'T1087.002', name: 'Domain Account Discovery', tactic: 'Discovery' },
      { id: 'T1482', name: 'Domain Trust Discovery', tactic: 'Discovery' },
    ],
    affectedAssets: ['DC-MAIN-01'],
    details: 'From DC-MAIN-01, attacker ran ADFind.exe and SharpHound (BloodHound collector) to enumerate the entire Active Directory. Mapped domain trusts, Group Policy Objects, OUs, and high-value targets. Output saved to C:\\Windows\\Temp\\ad_enum.json. This provided the attacker with a complete map of the environment.',
  },
  {
    id: 'atk-8',
    date: '2024-01-15',
    time: '02:35',
    timestamp: new Date('2024-01-15T02:35:00'),
    phase: 'Collection',
    phaseIndex: 7,
    title: 'Finance Data Harvested',
    description: 'Bulk file download of 1,247 files from Finance share and SharePoint',
    riskScore: 88,
    severity: 'critical',
    icon: <HardDrive className="w-4 h-4" />,
    color: 'bg-purple-500',
    iocs: [
      { type: 'File Count', value: '1,247 files' },
      { type: 'Total Size', value: '~4.2 GB' },
      { type: 'Source 1', value: '\\\\FS-FINANCE-01\\Finance' },
      { type: 'Source 2', value: 'SharePoint Online - Finance' },
      { type: 'Staging Dir', value: 'C:\\Windows\\Temp\\exfil\\' },
    ],
    ttps: [
      { id: 'T1005', name: 'Data from Local System', tactic: 'Collection' },
      { id: 'T1039', name: 'Data from Network Shared Drive', tactic: 'Collection' },
      { id: 'T1074.001', name: 'Local Data Staging', tactic: 'Collection' },
    ],
    affectedAssets: ['FS-FINANCE-01', 'SharePoint Online', 'jsmith@company.com'],
    details: 'Files collected from Finance share (\\\\FS-FINANCE-01\\Finance) and SharePoint Online using jsmith\'s credentials. Includes financial reports, customer PII, contracts, and internal strategy docs. Files staged in C:\\Windows\\Temp\\exfil\\ and compressed into split RAR archives for exfiltration. Total data: 1,247 files, approximately 4.2 GB.',
  },
  {
    id: 'atk-9',
    date: '2024-01-15',
    time: '02:37',
    timestamp: new Date('2024-01-15T02:37:00'),
    phase: 'Exfiltration',
    phaseIndex: 8,
    title: 'Data Exfiltrated via C2',
    description: 'Compressed data exfiltrated through Cobalt Strike C2 channel',
    riskScore: 93,
    severity: 'critical',
    icon: <Cloud className="w-4 h-4" />,
    color: 'bg-purple-600',
    iocs: [
      { type: 'Method', value: 'HTTPS via C2 channel' },
      { type: 'Destination', value: '185.220.101.42:443' },
      { type: 'Protocol', value: 'Cobalt Strike HTTP malleable' },
      { type: 'Volume', value: '~1.8 GB (compressed)' },
      { type: 'Duration', value: '~15 minutes' },
    ],
    ttps: [
      { id: 'T1041', name: 'Exfiltration Over C2 Channel', tactic: 'Exfiltration' },
      { id: 'T1560.001', name: 'Archive via Utility (RAR)', tactic: 'Collection' },
    ],
    affectedAssets: ['FS-FINANCE-01', 'WS-FIN-042'],
    details: 'Data exfiltrated through the existing Cobalt Strike HTTPS C2 channel to 185.220.101.42. Split RAR archives transferred in chunks to blend with normal HTTPS traffic. Total exfiltrated volume: ~1.8 GB compressed (4.2 GB uncompressed). Transfer took approximately 15 minutes. DNS beaconing used as backup exfiltration channel.',
  },
  {
    id: 'atk-10',
    date: '2024-01-15',
    time: '02:40',
    timestamp: new Date('2024-01-15T02:40:00'),
    phase: 'Impact',
    phaseIndex: 9,
    title: 'Ransomware Deployment',
    description: 'File encryption initiated across domain via Group Policy Object',
    riskScore: 100,
    severity: 'critical',
    icon: <Lock className="w-4 h-4" />,
    color: 'bg-red-700',
    iocs: [
      { type: 'Ransomware', value: 'BlackCat/ALPHV variant' },
      { type: 'Extension', value: '.encrypted' },
      { type: 'Ransom Note', value: 'RECOVER-FILES.txt' },
      { type: 'GPO Name', value: 'Windows Update Policy' },
      { type: 'Bitcoin Address', value: 'bc1q...xyz' },
    ],
    ttps: [
      { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' },
      { id: 'T1484.001', name: 'Domain Policy Modification: GPO', tactic: 'Defense Evasion' },
      { id: 'T1490', name: 'Inhibit System Recovery', tactic: 'Impact' },
    ],
    affectedAssets: ['DC-MAIN-01', 'FS-FINANCE-01', 'SQL-DB-01', 'WEB-APP-01', 'EXCH-01', 'BKP-SERVER-01'],
    details: 'Ransomware deployed via malicious GPO "Windows Update Policy" pushed from DC-MAIN-01. BlackCat/ALPHV variant with .encrypted extension. Ransom note (RECOVER-FILES.txt) dropped in every directory. Volume shadow copies deleted (vssadmin delete shadows /all). Backup server (BKP-SERVER-01) specifically targeted first. Recovery inhibited by disabling Windows Recovery Environment.',
  },
];

// Time slots for horizontal axis (every 5 minutes from 02:10 to 02:45)
const TIME_SLOTS = ['02:10', '02:15', '02:20', '02:25', '02:30', '02:35', '02:40', '02:45'];

// Mock timeline events for the lower section
const MOCK_EVENTS = [
  {
    id: '1',
    timestamp: new Date('2024-01-15T02:30:15'),
    source: 'windows_security',
    severity: 'critical' as const,
    title: 'Suspicious Process Execution',
    summary: 'PsExec.exe executed with SYSTEM privileges',
    category: 'process_execution',
    rawLog: 'EventID: 4688\nProcess Name: C:\\Windows\\System32\\PsExec.exe\nUser: NT AUTHORITY\\SYSTEM',
    relatedCount: 3,
  },
  {
    id: '2',
    timestamp: new Date('2024-01-15T02:31:00'),
    source: 'firewall',
    severity: 'high' as const,
    title: 'Outbound Connection to Known C2',
    summary: 'Connection to 185.220.101.42:443 blocked',
    category: 'network_connection',
    rawLog: 'Action: Block\nDirection: Outbound\nDest IP: 185.220.101.42\nDest Port: 443',
    relatedCount: 5,
  },
  {
    id: '3',
    timestamp: new Date('2024-01-15T02:32:30'),
    source: 'windows_security',
    severity: 'medium' as const,
    title: 'Scheduled Task Created',
    summary: 'New scheduled task "WindowsUpdate" created',
    category: 'persistence',
    rawLog: 'Task Name: WindowsUpdate\nAction: C:\\Users\\Public\\update.exe\nTrigger: At startup',
    relatedCount: 1,
  },
  {
    id: '4',
    timestamp: new Date('2024-01-15T02:35:00'),
    source: 'azure_activity',
    severity: 'high' as const,
    title: 'Bulk File Download',
    summary: '1,247 files downloaded from SharePoint',
    category: 'data_exfiltration',
    rawLog: 'Operation: FileDownloaded\nCount: 1247\nUser: jsmith@company.com',
    relatedCount: 2,
  },
  {
    id: '5',
    timestamp: new Date('2024-01-15T02:40:00'),
    source: 'windows_security',
    severity: 'critical' as const,
    title: 'Lateral Movement Detected',
    summary: 'Remote WMI execution on DC-MAIN-01',
    category: 'lateral_movement',
    rawLog: 'EventID: 4624\nLogon Type: 3\nTarget: DC-MAIN-01\nSource: ACCT-WS-042',
    relatedCount: 8,
  },
];

/**
 * Timeline View Page
 */
export default function TimelineViewPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useSessionStore();

  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_EVENTS[0] | null>(null);
  const [selectedAttackEvent, setSelectedAttackEvent] = useState<AttackTimelineEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAttackFlow, setShowAttackFlow] = useState(true);

  const handleBack = () => {
    goToPreviousStep();
    navigate('/triage');
  };

  const handleContinue = () => {
    goToNextStep();
    navigate('/verification');
  };

  const filteredEvents = MOCK_EVENTS.filter(
    (event) =>
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
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
      info: 'bg-blue-500',
    };
    return colors[severity] || colors.info;
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-red-500', text: 'text-red-700 dark:text-red-400', ring: 'ring-red-500' };
    if (score >= 75) return { bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400', ring: 'ring-orange-500' };
    if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-400', ring: 'ring-yellow-500' };
    return { bg: 'bg-green-500', text: 'text-green-700 dark:text-green-400', ring: 'ring-green-500' };
  };

  // Calculate position on horizontal axis based on time
  const getTimePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 2 * 60 + 10; // 02:10
    const endMinutes = 2 * 60 + 45;   // 02:45
    return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  };

  return (
    <PageContainer
      title="Timeline View"
      subtitle="Interactive timeline of security events"
      actions={
        <div className="flex items-center gap-2">
          <Tooltip content="Zoom out on timeline">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </Tooltip>
          <span className="text-sm text-slate-500">{Math.round(zoomLevel * 100)}%</span>
          <Tooltip content="Zoom in on timeline">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      }
      footer={
        <PageNavigation
          onBack={handleBack}
          backLabel="Triage"
          onContinue={handleContinue}
          continueLabel="Proceed to Review"
        />
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            tooltip="Search events by keyword"
          />
        </div>
        <Tooltip content="Filter by data source">
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
            Source
          </Button>
        </Tooltip>
        <Tooltip content="Filter by severity level">
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
            Severity
          </Button>
        </Tooltip>
        <Tooltip content="Filter events by date range">
          <Button variant="outline" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
            Date Range
          </Button>
        </Tooltip>
      </div>

      {/* Attack Flow Timeline — Multi-Dimensional Graph */}
      <Card className="mb-6">
        <button
          onClick={() => setShowAttackFlow(!showAttackFlow)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">Attack Flow Timeline</span>
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">Multi-Dimensional</span>
          </div>
          {showAttackFlow ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </button>

        {showAttackFlow && (
          <div className="mt-4 space-y-4">
            {/* Graph Legend / Summary */}
            <div className="flex flex-wrap gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500">AXIS:</span>
                <span className="text-slate-400">Vertical = Date/Phase</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">Horizontal = Time</span>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Critical</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> High</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Medium</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700 px-1 font-bold text-slate-600">95</span> Risk Score</div>
              </div>
            </div>

            {/* Multi-Dimensional Timeline Graph */}
            <div className="relative overflow-x-auto">
              {/* Time axis (horizontal) */}
              <div className="flex items-end mb-1 ml-[140px]">
                {TIME_SLOTS.map((slot) => (
                  <div key={slot} className="flex-1 text-center">
                    <span className="text-[10px] font-mono text-slate-400">{slot}</span>
                  </div>
                ))}
              </div>
              <div className="ml-[140px] mb-2 h-px bg-slate-200 dark:bg-slate-700" />

              {/* Event Rows - each phase is a row on the vertical axis */}
              <div className="space-y-1">
                {ATTACK_TIMELINE.map((event) => {
                  const pos = getTimePosition(event.time);
                  const riskColors = getRiskScoreColor(event.riskScore);
                  const isSelected = selectedAttackEvent?.id === event.id;

                  return (
                    <div key={event.id} className="flex items-center gap-0 group">
                      {/* Vertical axis label (Phase) */}
                      <div className="w-[140px] flex-shrink-0 pr-2 text-right">
                        <span className="text-[10px] font-medium text-slate-500 leading-none">{event.phase}</span>
                        <br />
                        <span className="text-[9px] font-mono text-slate-400">{event.time}</span>
                      </div>

                      {/* Horizontal timeline bar */}
                      <div className="flex-1 relative h-12 bg-slate-50 dark:bg-slate-800/30 rounded border border-slate-100 dark:border-slate-800">
                        {/* Grid lines */}
                        {TIME_SLOTS.map((_, idx) => (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800"
                            style={{ left: `${(idx / (TIME_SLOTS.length - 1)) * 100}%` }}
                          />
                        ))}

                        {/* Connection line to previous event */}
                        {event.phaseIndex > 0 && (
                          <div
                            className="absolute top-0 h-px bg-red-300 dark:bg-red-700 z-0"
                            style={{
                              left: `${getTimePosition(ATTACK_TIMELINE[event.phaseIndex - 1].time)}%`,
                              width: `${pos - getTimePosition(ATTACK_TIMELINE[event.phaseIndex - 1].time)}%`,
                            }}
                          />
                        )}

                        {/* Event node */}
                        <Tooltip content={
                          <div className="max-w-xs">
                            <div className="font-semibold">{event.title}</div>
                            <div className="text-xs mt-1 opacity-80">{event.description}</div>
                            <div className="text-xs mt-1 font-mono opacity-60">Risk Score: {event.riskScore}/100</div>
                            <div className="text-xs opacity-60">TTPs: {event.ttps.map(t => t.id).join(', ')}</div>
                            <div className="text-xs mt-1 opacity-60">Click for full details →</div>
                          </div>
                        }>
                          <button
                            onClick={() => setSelectedAttackEvent(isSelected ? null : event)}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-200"
                            style={{ left: `${pos}%` }}
                          >
                            <div className={cn(
                              'flex items-center gap-1.5 px-2 py-1 rounded-lg border-2 transition-all',
                              isSelected ? 'scale-110 shadow-lg' : 'hover:scale-105',
                              event.severity === 'critical' ? 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-600' :
                              event.severity === 'high' ? 'bg-orange-50 border-orange-400 dark:bg-orange-900/20 dark:border-orange-600' :
                              'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-600',
                              isSelected && 'ring-2 ring-offset-1 ' + riskColors.ring
                            )}>
                              <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0', event.color)}>
                                {event.icon}
                              </div>
                              {/* KPI-style Risk Score */}
                              <span className={cn(
                                'text-sm font-black tabular-nums leading-none',
                                riskColors.text
                              )}>
                                {event.riskScore}
                              </span>
                            </div>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attack Event Detail Panel (drill-down) */}
            {selectedAttackEvent && (
              <div className="border-2 border-forensic-300 dark:border-forensic-700 rounded-xl overflow-hidden">
                <div className={cn('p-4', selectedAttackEvent.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10' : selectedAttackEvent.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white', selectedAttackEvent.color)}>
                        {selectedAttackEvent.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedAttackEvent.title}</h3>
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs font-bold',
                            selectedAttackEvent.severity === 'critical' ? 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                            selectedAttackEvent.severity === 'high' ? 'bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' :
                            'bg-yellow-200 text-yellow-800'
                          )}>{selectedAttackEvent.severity.toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{selectedAttackEvent.phase} — {selectedAttackEvent.date} at {selectedAttackEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Large KPI Risk Score */}
                      <div className="text-center">
                        <span className={cn('text-3xl font-black tabular-nums', getRiskScoreColor(selectedAttackEvent.riskScore).text)}>
                          {selectedAttackEvent.riskScore}
                        </span>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">Risk Score</p>
                      </div>
                      <button onClick={() => setSelectedAttackEvent(null)} className="p-1 hover:bg-white/50 rounded">
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> Description</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedAttackEvent.details}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* IOCs */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Indicators of Compromise ({selectedAttackEvent.iocs.length})
                      </h4>
                      <div className="space-y-1">
                        {selectedAttackEvent.iocs.map((ioc, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                            <span className="text-slate-500 w-20 flex-shrink-0">{ioc.type}:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{ioc.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TTPs */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <Crosshair className="w-3 h-3" /> MITRE ATT&CK TTPs ({selectedAttackEvent.ttps.length})
                      </h4>
                      <div className="space-y-1">
                        {selectedAttackEvent.ttps.map((ttp, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded text-xs">
                            <span className="px-1.5 py-0.5 bg-forensic-100 dark:bg-forensic-900/30 text-forensic-700 dark:text-forensic-300 rounded font-mono font-bold text-[10px]">{ttp.id}</span>
                            <span className="text-slate-700 dark:text-slate-300 flex-1">{ttp.name}</span>
                            <span className="text-slate-400 text-[10px]">{ttp.tactic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Affected Assets */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      <Server className="w-3 h-3" /> Affected Assets ({selectedAttackEvent.affectedAssets.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedAttackEvent.affectedAssets.map((asset, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-lg border border-red-200 dark:border-red-800 font-mono">
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Affected Resources Summary */}
            <div>
              <h4 className="text-xs font-medium text-slate-500 uppercase mb-3">Affected Resources</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'WS-FIN-042', role: 'Patient Zero', severity: 'critical', icon: <Monitor className="w-4 h-4" /> },
                  { name: 'DC-MAIN-01', role: 'Domain Controller', severity: 'critical', icon: <Server className="w-4 h-4" /> },
                  { name: 'FS-FINANCE-01', role: 'File Server', severity: 'high', icon: <HardDrive className="w-4 h-4" /> },
                  { name: 'BKP-SERVER-01', role: 'Backup Server', severity: 'high', icon: <Server className="w-4 h-4" /> },
                  { name: 'WEB-APP-01', role: 'Web Server', severity: 'medium', icon: <Cloud className="w-4 h-4" /> },
                  { name: 'EXCH-01', role: 'Exchange Server', severity: 'medium', icon: <Mail className="w-4 h-4" /> },
                  { name: 'PRINT-SRV-01', role: 'Print Server', severity: 'low', icon: <Server className="w-4 h-4" /> },
                  { name: 'VPN Gateway', role: 'Network Device', severity: 'high', icon: <Shield className="w-4 h-4" /> },
                ].map((res, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-2 rounded-lg border text-xs',
                      res.severity === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50' :
                      res.severity === 'high' ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/50' :
                      res.severity === 'medium' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/50' :
                      'border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400">{res.icon}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{res.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{res.role}</span>
                      <span className={cn(
                        'px-1 py-0.5 rounded text-[10px] font-medium',
                        res.severity === 'critical' ? 'bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                        res.severity === 'high' ? 'bg-orange-200 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                        'bg-yellow-200 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                      )}>{res.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card className="min-h-[500px]">
            <CardHeader
              title="Event Timeline"
              description={`${filteredEvents.length} events • Jan 15, 2024`}
            />

            {/* Timeline visualization */}
            <div className="mt-6 relative">
              {/* Time axis */}
              <div className="flex justify-between text-xs text-slate-400 mb-4">
                <span>02:30</span>
                <span>02:35</span>
                <span>02:40</span>
                <span>02:45</span>
              </div>

              {/* Event lanes */}
              <div className="space-y-4">
                {['Windows', 'Cloud', 'Network'].map((lane) => (
                  <div key={lane} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-slate-500 text-right">{lane}</span>
                    <div className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 rounded relative">
                      {filteredEvents
                        .filter((e) => {
                          if (lane === 'Windows') return e.source.includes('windows');
                          if (lane === 'Cloud') return e.source.includes('azure');
                          return e.source.includes('firewall');
                        })
                        .map((event) => (
                          <Tooltip key={event.id} content={event.title}>
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className={cn(
                                'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full',
                                'transition-transform hover:scale-150',
                                'ring-2 ring-white dark:ring-slate-900',
                                getSeverityColor(event.severity),
                                selectedEvent?.id === event.id && 'ring-4 ring-forensic-400'
                              )}
                              style={{
                                left: `${((event.timestamp.getMinutes() - 30) / 15) * 100}%`,
                              }}
                            />
                          </Tooltip>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Correlation lines (simplified) */}
              <svg className="absolute inset-0 pointer-events-none opacity-30">
                <line
                  x1="20%"
                  y1="30%"
                  x2="40%"
                  y2="70%"
                  stroke="currentColor"
                  strokeDasharray="4"
                  className="text-forensic-500"
                />
              </svg>
            </div>

            {/* Event List */}
            <div className="mt-8 space-y-2">
              {filteredEvents.map((event) => (
                <EventListItem
                  key={event.id}
                  event={event}
                  isSelected={selectedEvent?.id === event.id}
                  onClick={() => setSelectedEvent(event)}
                  sourceIcon={getSourceIcon(event.source)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Event Detail Panel */}
        <div>
          <Card className="sticky top-24 min-h-[500px]">
            {selectedEvent ? (
              <EventDetailPanel
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
              />
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

/**
 * Event List Item
 */
interface EventListItemProps {
  event: typeof MOCK_EVENTS[0];
  isSelected: boolean;
  onClick: () => void;
  sourceIcon: React.ReactNode;
}

function EventListItem({ event, isSelected, onClick, sourceIcon }: EventListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
        isSelected
          ? 'bg-forensic-50 dark:bg-forensic-900/20 ring-1 ring-forensic-500'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      )}
    >
      <span className="text-slate-400">{sourceIcon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {event.title}
        </p>
        <p className="text-xs text-slate-500 truncate">{event.summary}</p>
      </div>
      <div className="flex items-center gap-2">
        <SeverityBadge severity={event.severity} size="sm" />
        <span className="text-xs text-slate-400">{formatTimestamp(event.timestamp)}</span>
      </div>
    </button>
  );
}

/**
 * Event Detail Panel
 */
interface EventDetailPanelProps {
  event: typeof MOCK_EVENTS[0];
  onClose: () => void;
}

function EventDetailPanel({ event, onClose }: EventDetailPanelProps) {
  const [showRawLog, setShowRawLog] = useState(false);

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {event.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {formatDateTime(event.timestamp)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <SeverityBadge severity={event.severity} />
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Summary</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{event.summary}</p>
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Source</h4>
          <Badge variant="secondary">{event.source.replace('_', ' ')}</Badge>
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-1">Category</h4>
          <Badge variant="info">{event.category.replace('_', ' ')}</Badge>
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-500 uppercase mb-1">
            Related Events
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {event.relatedCount} correlated event{event.relatedCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div>
          <Tooltip content="View full raw log data">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawLog(!showRawLog)}
              fullWidth
            >
              {showRawLog ? 'Hide' : 'View'} Raw Log
            </Button>
          </Tooltip>

          {showRawLog && (
            <div className="mt-3 relative">
              <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
                {event.rawLog}
              </pre>
              <Tooltip content="Copy raw log to clipboard">
                <button
                  onClick={() => navigator.clipboard.writeText(event.rawLog)}
                  className="absolute top-2 right-2 p-1 hover:bg-slate-700 rounded"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
