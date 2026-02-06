import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageContainer, PageNavigation } from '@/components/layout';
import { useSessionStore, useContextStore, useValidationStore } from '@/store';
import { Card, Button, Tooltip, Badge, Spinner } from '@/components/common';
import { VALIDATION_METHOD_INFO } from '@/utils/constants';
import {
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  ToggleLeft,
  ToggleRight,
  Server,
  Network,
  Users,
  Shield,
  Database,
  Cloud,
  ChevronDown,
  ChevronRight,
  Layers,
  ArrowRight,
  Lock,
  Key,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SystemValidation } from '@/types';

// ==================== MOCK DEMO DATA ====================
const MOCK_SYSTEMS = [
  { id: 'sys-1', hostname: 'DC-MAIN-01', ip: '10.0.1.10', role: 'Primary Domain Controller', os: 'Windows Server 2022', criticality: 'critical' as const, status: 'verified' as const, services: ['DNS', 'Kerberos', 'LDAP', 'GPO'], lastSeen: '2 min ago', cpu: 12, memory: 68, disk: 45 },
  { id: 'sys-2', hostname: 'DC-BACKUP-01', ip: '10.0.1.11', role: 'Backup Domain Controller', os: 'Windows Server 2022', criticality: 'critical' as const, status: 'verified' as const, services: ['DNS', 'Kerberos', 'LDAP'], lastSeen: '2 min ago', cpu: 8, memory: 52, disk: 38 },
  { id: 'sys-3', hostname: 'FS-FINANCE-01', ip: '10.0.2.20', role: 'Finance File Server', os: 'Windows Server 2019', criticality: 'high' as const, status: 'verified' as const, services: ['SMB', 'DFS'], lastSeen: '2 min ago', cpu: 25, memory: 71, disk: 82 },
  { id: 'sys-4', hostname: 'SQL-DB-01', ip: '10.0.3.30', role: 'Primary Database Server', os: 'Windows Server 2019', criticality: 'high' as const, status: 'verified' as const, services: ['MSSQL', 'SQL Agent'], lastSeen: '2 min ago', cpu: 45, memory: 85, disk: 67 },
  { id: 'sys-5', hostname: 'WEB-APP-01', ip: '10.0.4.40', role: 'Web Application Server', os: 'Ubuntu 22.04 LTS', criticality: 'medium' as const, status: 'verified' as const, services: ['Apache', 'Node.js', 'Redis'], lastSeen: '2 min ago', cpu: 18, memory: 45, disk: 34 },
  { id: 'sys-6', hostname: 'EXCH-01', ip: '10.0.1.15', role: 'Exchange Server', os: 'Windows Server 2019', criticality: 'high' as const, status: 'failed' as const, services: ['SMTP', 'IMAP', 'OWA'], lastSeen: '15 min ago', cpu: 0, memory: 0, disk: 72 },
  { id: 'sys-7', hostname: 'BKP-SERVER-01', ip: '10.0.5.50', role: 'Backup Server', os: 'Windows Server 2022', criticality: 'high' as const, status: 'verified' as const, services: ['Veeam B&R', 'SMB'], lastSeen: '2 min ago', cpu: 5, memory: 32, disk: 89 },
  { id: 'sys-8', hostname: 'PRINT-SRV-01', ip: '10.0.1.25', role: 'Print Server', os: 'Windows Server 2016', criticality: 'low' as const, status: 'verified' as const, services: ['Spooler'], lastSeen: '5 min ago', cpu: 2, memory: 18, disk: 12 },
];

const MOCK_NETWORKS = [
  { id: 'net-1', name: 'Corporate LAN', cidr: '10.0.0.0/16', vlan: '10', description: 'Main corporate network segment', devices: 342, gateway: '10.0.0.1', dhcp: true },
  { id: 'net-2', name: 'Server VLAN', cidr: '10.0.1.0/24', vlan: '20', description: 'Server and infrastructure VLAN', devices: 28, gateway: '10.0.1.1', dhcp: false },
  { id: 'net-3', name: 'Finance VLAN', cidr: '10.0.2.0/24', vlan: '30', description: 'Isolated finance department network', devices: 45, gateway: '10.0.2.1', dhcp: true },
  { id: 'net-4', name: 'DMZ', cidr: '10.0.4.0/24', vlan: '40', description: 'De-militarized zone for public-facing services', devices: 8, gateway: '10.0.4.1', dhcp: false },
  { id: 'net-5', name: 'Guest WiFi', cidr: '192.168.100.0/24', vlan: '99', description: 'Isolated guest wireless network', devices: 12, gateway: '192.168.100.1', dhcp: true },
];

const MOCK_CLOUD_SERVICES = [
  { id: 'cld-1', name: 'AWS Production', type: 'AWS', region: 'us-east-1', services: ['EC2 (12)', 'S3 (8 buckets)', 'RDS (3)', 'Lambda (15)', 'CloudTrail'], status: 'active', risk: 'high' },
  { id: 'cld-2', name: 'Azure AD Tenant', type: 'Azure', region: 'Global', services: ['Azure AD (1,250 users)', 'Conditional Access', 'MFA', 'PIM'], status: 'active', risk: 'critical' },
  { id: 'cld-3', name: 'Office 365', type: 'O365', region: 'Global', services: ['Exchange Online', 'SharePoint', 'Teams', 'OneDrive'], status: 'active', risk: 'high' },
  { id: 'cld-4', name: 'GCP Analytics', type: 'GCP', region: 'us-central1', services: ['BigQuery', 'Cloud Functions (4)', 'Storage (2 buckets)'], status: 'active', risk: 'medium' },
];

const MOCK_DATA_STORES = [
  { id: 'ds-1', name: 'Finance Share', path: '\\\\FS-FINANCE-01\\Finance', type: 'SMB File Share', size: '2.3 TB', classification: 'Confidential', encryption: 'No', backup: 'Daily' },
  { id: 'ds-2', name: 'SQL-DB-01\\Production', path: 'MSSQL Instance', type: 'SQL Database', size: '450 GB', classification: 'Highly Confidential', encryption: 'TDE Enabled', backup: 'Hourly' },
  { id: 'ds-3', name: 'SharePoint Docs', path: 'SharePoint Online', type: 'Cloud Storage', size: '850 GB', classification: 'Internal', encryption: 'At Rest', backup: 'Continuous' },
  { id: 'ds-4', name: 'Backup Repository', path: '\\\\BKP-SERVER-01\\Backups', type: 'Backup Storage', size: '8.5 TB', classification: 'Critical', encryption: 'AES-256', backup: 'Immutable' },
  { id: 'ds-5', name: 'AWS S3 - Reports', path: 's3://company-reports', type: 'Object Storage', size: '120 GB', classification: 'Internal', encryption: 'SSE-S3', backup: 'Versioned' },
];

const MOCK_EMPLOYEES = [
  { name: 'John Smith', role: 'IT Director', dept: 'IT', access: 'Domain Admin', risk: 'high' as const, lastLogon: '2024-01-15 02:15', mfa: true },
  { name: 'Sarah Johnson', role: 'CISO', dept: 'Security', access: 'Security Admin', risk: 'high' as const, lastLogon: '2024-01-14 18:30', mfa: true },
  { name: 'Mike Chen', role: 'Sr. Network Engineer', dept: 'IT', access: 'Network Admin', risk: 'medium' as const, lastLogon: '2024-01-15 01:45', mfa: true },
  { name: 'Lisa Williams', role: 'Finance Manager', dept: 'Finance', access: 'Finance Share (RW)', risk: 'medium' as const, lastLogon: '2024-01-14 17:00', mfa: true },
  { name: 'svc-backup', role: 'Service Account', dept: 'System', access: 'Backup Operator', risk: 'high' as const, lastLogon: '2024-01-15 02:30', mfa: false },
  { name: 'svc-sql', role: 'Service Account', dept: 'System', access: 'SQL Server Agent', risk: 'high' as const, lastLogon: '2024-01-15 02:00', mfa: false },
  { name: 'admin.jsmith', role: 'Privileged Account', dept: 'IT', access: 'Domain Admin', risk: 'critical' as const, lastLogon: '2024-01-15 02:28', mfa: true },
  { name: 'helpdesk-svc', role: 'Service Account', dept: 'IT', access: 'Password Reset', risk: 'medium' as const, lastLogon: '2024-01-14 16:00', mfa: false },
];

const MOCK_SECURITY_CONTROLS = [
  { id: 'sc-1', name: 'Endpoint Protection', vendor: 'CrowdStrike Falcon', coverage: '92%', status: 'active', lastUpdate: '2024-01-14', health: 'good' },
  { id: 'sc-2', name: 'Firewall (Edge)', vendor: 'Palo Alto PA-5220', coverage: '100%', status: 'active', lastUpdate: '2024-01-13', health: 'good' },
  { id: 'sc-3', name: 'SIEM', vendor: 'Splunk Enterprise', coverage: '85%', status: 'active', lastUpdate: '2024-01-15', health: 'warning' },
  { id: 'sc-4', name: 'Email Security', vendor: 'Proofpoint', coverage: '100%', status: 'active', lastUpdate: '2024-01-14', health: 'good' },
  { id: 'sc-5', name: 'WAF', vendor: 'AWS WAF + CloudFront', coverage: '100%', status: 'active', lastUpdate: '2024-01-12', health: 'good' },
  { id: 'sc-6', name: 'Backup Solution', vendor: 'Veeam B&R v12', coverage: '95%', status: 'active', lastUpdate: '2024-01-15', health: 'critical' },
  { id: 'sc-7', name: 'PAM', vendor: 'CyberArk', coverage: '78%', status: 'degraded', lastUpdate: '2024-01-10', health: 'warning' },
];

const MOCK_COMPLIANCE = [
  { id: 'comp-1', framework: 'PCI-DSS', requirement: 'Requirement 10 - Logging', description: 'Track all access to network resources and cardholder data', applicableSystems: ['DC-MAIN-01', 'SQL-DB-01', 'FS-FINANCE-01'], status: 'partial' },
  { id: 'comp-2', framework: 'SOX', requirement: 'Section 404 - IT Controls', description: 'Internal controls over financial reporting systems', applicableSystems: ['SQL-DB-01', 'FS-FINANCE-01', 'EXCH-01'], status: 'compliant' },
  { id: 'comp-3', framework: 'GDPR', requirement: 'Article 32 - Security', description: 'Appropriate technical measures for data protection', applicableSystems: ['All Systems'], status: 'partial' },
  { id: 'comp-4', framework: 'NIST 800-53', requirement: 'IR-4 Incident Handling', description: 'Implement incident handling capability', applicableSystems: ['SIEM', 'All Servers'], status: 'compliant' },
];

/**
 * Infrastructure Validation Page
 */
export default function InfrastructureValidationPage() {
  const navigate = useNavigate();
  const { goToNextStep, goToPreviousStep } = useSessionStore();
  const { extractedEntities } = useContextStore();
  const {
    systems,
    autoValidateEnabled,
    discrepancies,
    isValidating,
    initializeFromSystems,
    setAutoValidate,
    validateSystem,
    validateAllSystems,
  } = useValidationStore();

  const [showSummary, setShowSummary] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Initialize validation systems from extracted entities
  useEffect(() => {
    if (extractedEntities.systems.length > 0 && systems.length === 0) {
      initializeFromSystems(extractedEntities.systems);
    }
  }, [extractedEntities.systems, systems.length, initializeFromSystems]);

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    goToPreviousStep();
    navigate('/connectors');
  };

  const handleContinue = () => {
    if (!showSummary) {
      setShowSummary(true);
      return;
    }
    goToNextStep();
    navigate('/triage');
  };

  const verifiedCount = systems.filter((s) => s.overallStatus === 'verified').length;
  const failedCount = systems.filter((s) => s.overallStatus === 'failed').length;
  const pendingCount = systems.filter((s) => s.overallStatus === 'pending').length;
  const unknownCount = systems.filter((s) => s.overallStatus === 'unknown').length;

  // Use mock data counts for summary (always show demo data)
  const summarySystemsCount = Math.max(extractedEntities.systems.length, MOCK_SYSTEMS.length);
  const summaryNetworksCount = Math.max(extractedEntities.networks.length, MOCK_NETWORKS.length);

  return (
    <PageContainer
      title="Infrastructure Validation"
      subtitle="Verify documented systems exist and match reality"
      actions={
        <div className="flex items-center gap-2">
          <Tooltip content="Automatically validate all documented systems when page loads">
            <button
              onClick={() => setAutoValidate(!autoValidateEnabled)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                autoValidateEnabled
                  ? 'bg-forensic-100 text-forensic-700 dark:bg-forensic-900/30 dark:text-forensic-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {autoValidateEnabled ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              Auto-Validate
            </button>
          </Tooltip>
          <Tooltip content="Run validation checks on all documented systems">
            <Button
              variant="primary"
              size="sm"
              onClick={validateAllSystems}
              isLoading={isValidating}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Validate All
            </Button>
          </Tooltip>
          <Tooltip content="Export validation results as CSV">
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          </Tooltip>
        </div>
      }
      footer={
        <PageNavigation
          onBack={handleBack}
          backLabel={showSummary ? 'Back to Validation' : 'Connectors'}
          onContinue={handleContinue}
          continueLabel={showSummary ? 'Proceed to Triage' : 'View Summary'}
        />
      }
    >
      {/* INFRASTRUCTURE SUMMARY VIEW with Demo Data */}
      {showSummary && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-forensic-50 to-white dark:from-forensic-900/20 dark:to-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-forensic-100 dark:bg-forensic-900/30 rounded-lg">
                <Layers className="w-6 h-6 text-forensic-600 dark:text-forensic-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Infrastructure Summary</h2>
                <p className="text-sm text-slate-500">Complete overview of discovered resources before triage begins</p>
              </div>
            </div>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Server className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{summarySystemsCount}</p>
                <p className="text-xs text-slate-500">Systems</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Network className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{summaryNetworksCount}</p>
                <p className="text-xs text-slate-500">Networks</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Cloud className="w-5 h-5 mx-auto text-cyan-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{MOCK_CLOUD_SERVICES.length}</p>
                <p className="text-xs text-slate-500">Cloud</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Users className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">1,250</p>
                <p className="text-xs text-slate-500">Users</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Database className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{MOCK_DATA_STORES.length}</p>
                <p className="text-xs text-slate-500">Data Stores</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Shield className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{MOCK_SECURITY_CONTROLS.length}</p>
                <p className="text-xs text-slate-500">Security</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Key className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{MOCK_EMPLOYEES.length}</p>
                <p className="text-xs text-slate-500">Accounts</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Lock className="w-5 h-5 mx-auto text-red-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{MOCK_COMPLIANCE.length}</p>
                <p className="text-xs text-slate-500">Compliance</p>
              </div>
            </div>
          </Card>

          {/* Drilldown Sections */}
          <SummaryDrilldown
            title="Systems & Servers"
            icon={<Server className="w-5 h-5 text-blue-500" />}
            count={MOCK_SYSTEMS.length}
            isExpanded={expandedSection === 'systems'}
            onToggle={() => setExpandedSection(expandedSection === 'systems' ? null : 'systems')}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase">
                    <th className="pb-2">Hostname</th>
                    <th className="pb-2">IP</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">OS</th>
                    <th className="pb-2">Services</th>
                    <th className="pb-2">Criticality</th>
                    <th className="pb-2">CPU</th>
                    <th className="pb-2">Memory</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {MOCK_SYSTEMS.map((sys) => (
                    <tr key={sys.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 font-medium">{sys.hostname}</td>
                      <td className="py-2 font-mono text-xs text-slate-500">{sys.ip}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400 text-xs">{sys.role}</td>
                      <td className="py-2 text-slate-500 text-xs">{sys.os}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {sys.services.slice(0, 3).map((svc) => (
                            <span key={svc} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] rounded">{svc}</span>
                          ))}
                          {sys.services.length > 3 && <span className="text-[10px] text-slate-400">+{sys.services.length - 3}</span>}
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          sys.criticality === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          sys.criticality === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          sys.criticality === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        )}>{sys.criticality}</span>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', sys.cpu > 80 ? 'bg-red-500' : sys.cpu > 50 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${sys.cpu}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400">{sys.cpu}%</span>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', sys.memory > 80 ? 'bg-red-500' : sys.memory > 60 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${sys.memory}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400">{sys.memory}%</span>
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={cn(
                          'flex items-center gap-1 text-xs',
                          sys.status === 'verified' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {sys.status === 'verified' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {sys.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Network Segments"
            icon={<Network className="w-5 h-5 text-green-500" />}
            count={MOCK_NETWORKS.length}
            isExpanded={expandedSection === 'networks'}
            onToggle={() => setExpandedSection(expandedSection === 'networks' ? null : 'networks')}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">CIDR</th>
                    <th className="pb-2">VLAN</th>
                    <th className="pb-2">Gateway</th>
                    <th className="pb-2">Devices</th>
                    <th className="pb-2">DHCP</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {MOCK_NETWORKS.map((net) => (
                    <tr key={net.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 font-medium">{net.name}</td>
                      <td className="py-2 font-mono text-xs text-slate-500">{net.cidr}</td>
                      <td className="py-2"><span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">VLAN {net.vlan}</span></td>
                      <td className="py-2 font-mono text-xs text-slate-500">{net.gateway}</td>
                      <td className="py-2 text-sm font-semibold">{net.devices}</td>
                      <td className="py-2">{net.dhcp ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-slate-300" />}</td>
                      <td className="py-2 text-xs text-slate-400">{net.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Cloud Services & Tenants"
            icon={<Cloud className="w-5 h-5 text-cyan-500" />}
            count={MOCK_CLOUD_SERVICES.length}
            isExpanded={expandedSection === 'cloud'}
            onToggle={() => setExpandedSection(expandedSection === 'cloud' ? null : 'cloud')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_CLOUD_SERVICES.map((svc) => (
                <div key={svc.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-cyan-500" />
                      <span className="font-medium text-sm">{svc.name}</span>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      svc.risk === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      svc.risk === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    )}>{svc.risk}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Region: {svc.region}</p>
                  <div className="flex flex-wrap gap-1">
                    {svc.services.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-[10px] rounded">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Data Stores & Repositories"
            icon={<Database className="w-5 h-5 text-orange-500" />}
            count={MOCK_DATA_STORES.length}
            isExpanded={expandedSection === 'datastores'}
            onToggle={() => setExpandedSection(expandedSection === 'datastores' ? null : 'datastores')}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Classification</th>
                    <th className="pb-2">Encryption</th>
                    <th className="pb-2">Backup</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {MOCK_DATA_STORES.map((ds) => (
                    <tr key={ds.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 font-medium text-xs">{ds.name}</td>
                      <td className="py-2 text-xs text-slate-500">{ds.type}</td>
                      <td className="py-2 text-xs font-semibold">{ds.size}</td>
                      <td className="py-2">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-medium',
                          ds.classification === 'Highly Confidential' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          ds.classification === 'Confidential' || ds.classification === 'Critical' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        )}>{ds.classification}</span>
                      </td>
                      <td className="py-2 text-xs">{ds.encryption === 'No' ? <span className="text-red-500 font-medium">None</span> : <span className="text-green-600">{ds.encryption}</span>}</td>
                      <td className="py-2 text-xs text-slate-500">{ds.backup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Key Personnel & Privileged Accounts"
            icon={<Users className="w-5 h-5 text-purple-500" />}
            count={MOCK_EMPLOYEES.length}
            isExpanded={expandedSection === 'employees'}
            onToggle={() => setExpandedSection(expandedSection === 'employees' ? null : 'employees')}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase">
                    <th className="pb-2">Account</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Dept</th>
                    <th className="pb-2">Access Level</th>
                    <th className="pb-2">Last Logon</th>
                    <th className="pb-2">MFA</th>
                    <th className="pb-2">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {MOCK_EMPLOYEES.map((person, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium',
                            person.role.includes('Service') || person.role.includes('Privileged')
                              ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                          )}>
                            {person.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-xs">{person.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-xs text-slate-500">{person.role}</td>
                      <td className="py-2 text-xs text-slate-500">{person.dept}</td>
                      <td className="py-2 text-xs">{person.access}</td>
                      <td className="py-2 text-xs font-mono text-slate-400">{person.lastLogon}</td>
                      <td className="py-2">{person.mfa ? <CheckCircle className="w-3 h-3 text-green-500" /> : <AlertTriangle className="w-3 h-3 text-yellow-500" />}</td>
                      <td className="py-2">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-xs font-medium',
                          person.risk === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          person.risk === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        )}>{person.risk}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Security Controls & Tools"
            icon={<Shield className="w-5 h-5 text-indigo-500" />}
            count={MOCK_SECURITY_CONTROLS.length}
            isExpanded={expandedSection === 'security'}
            onToggle={() => setExpandedSection(expandedSection === 'security' ? null : 'security')}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase">
                    <th className="pb-2">Control</th>
                    <th className="pb-2">Vendor / Product</th>
                    <th className="pb-2">Coverage</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Last Update</th>
                    <th className="pb-2">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {MOCK_SECURITY_CONTROLS.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 font-medium text-xs">{sc.name}</td>
                      <td className="py-2 text-xs text-slate-500">{sc.vendor}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', parseInt(sc.coverage) > 90 ? 'bg-green-500' : parseInt(sc.coverage) > 80 ? 'bg-yellow-500' : 'bg-orange-500')} style={{ width: sc.coverage }} />
                          </div>
                          <span className="text-[10px] text-slate-400">{sc.coverage}</span>
                        </div>
                      </td>
                      <td className="py-2"><span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', sc.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400')}>{sc.status}</span></td>
                      <td className="py-2 text-xs font-mono text-slate-400">{sc.lastUpdate}</td>
                      <td className="py-2">
                        <span className={cn(
                          'flex items-center gap-1 text-xs',
                          sc.health === 'good' ? 'text-green-600' : sc.health === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        )}>
                          <span className={cn('w-2 h-2 rounded-full', sc.health === 'good' ? 'bg-green-500' : sc.health === 'warning' ? 'bg-yellow-500' : 'bg-red-500')} />
                          {sc.health}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Compliance & Regulatory"
            icon={<Lock className="w-5 h-5 text-red-500" />}
            count={MOCK_COMPLIANCE.length}
            isExpanded={expandedSection === 'compliance'}
            onToggle={() => setExpandedSection(expandedSection === 'compliance' ? null : 'compliance')}
          >
            {MOCK_COMPLIANCE.map((comp) => (
              <div key={comp.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">{comp.framework}</span>
                  <span className="font-medium text-sm">{comp.requirement}</span>
                  <span className={cn(
                    'ml-auto px-2 py-0.5 rounded text-xs font-medium',
                    comp.status === 'compliant' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  )}>{comp.status}</span>
                </div>
                <p className="text-xs text-slate-500">{comp.description}</p>
                <p className="text-xs text-slate-400 mt-1">Applies to: {comp.applicableSystems.join(', ')}</p>
              </div>
            ))}
          </SummaryDrilldown>

          {/* Ready to proceed banner */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 dark:text-green-200">Ready for Triage</h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {MOCK_SYSTEMS.length} systems, {MOCK_NETWORKS.length} networks, {MOCK_CLOUD_SERVICES.length} cloud services, and {MOCK_EMPLOYEES.length} privileged accounts documented. All key resources have been validated. Click "Proceed to Triage" to begin forensic analysis.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-green-500" />
            </div>
          </Card>
        </div>
      )}

      {/* ORIGINAL VALIDATION VIEW */}
      {!showSummary && <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={<CheckCircle className="w-5 h-5" />}
          count={verifiedCount}
          label="Verified"
          color="green"
        />
        <SummaryCard
          icon={<XCircle className="w-5 h-5" />}
          count={failedCount}
          label="Failed"
          color="red"
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5" />}
          count={pendingCount}
          label="Pending"
          color="yellow"
        />
        <SummaryCard
          icon={<HelpCircle className="w-5 h-5" />}
          count={unknownCount}
          label="Unknown"
          color="slate"
        />
      </div>

      {/* Discrepancy Alerts */}
      {discrepancies.length > 0 && (
        <Card className="mb-6 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                Discrepancy Alerts ({discrepancies.length})
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                {discrepancies.slice(0, 3).map((d) => (
                  <li key={d.id}>
                    <span className="font-medium">{d.hostname}:</span> {d.description}
                  </li>
                ))}
                {discrepancies.length > 3 && (
                  <li className="text-yellow-600 dark:text-yellow-400">
                    +{discrepancies.length - 3} more discrepancies
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Validation Results Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  System
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Methods
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {systems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Server className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No systems to validate</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Upload documents with system information first
                    </p>
                  </td>
                </tr>
              ) : (
                systems.map((system) => (
                  <SystemRow
                    key={system.systemId}
                    system={system}
                    onValidate={() => validateSystem(system.systemId)}
                    isValidating={isValidating}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </>}
    </PageContainer>
  );
}

/**
 * Summary Drilldown Section
 */
interface SummaryDrilldownProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function SummaryDrilldown({ title, icon, count, isExpanded, onToggle, children }: SummaryDrilldownProps) {
  return (
    <Card>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{title}</span>
          <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-500">{count}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          {children}
        </div>
      )}
    </Card>
  );
}

/**
 * Summary Card Component
 */
interface SummaryCardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  color: 'green' | 'red' | 'yellow' | 'slate';
}

function SummaryCard({ icon, count, label, color }: SummaryCardProps) {
  const colors = {
    green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    red: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    slate: 'text-slate-400 bg-slate-50 dark:bg-slate-800/50',
  };

  return (
    <Card className={cn('text-center', colors[color])}>
      <div className="flex flex-col items-center gap-1">
        {icon}
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {count}
        </span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
    </Card>
  );
}

/**
 * System Row Component
 */
interface SystemRowProps {
  system: SystemValidation;
  onValidate: () => void;
  isValidating: boolean;
}

function SystemRow({ system, onValidate, isValidating }: SystemRowProps) {
  const statusIcons = {
    verified: <CheckCircle className="w-4 h-4 text-green-500" />,
    failed: <XCircle className="w-4 h-4 text-red-500" />,
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    unknown: <HelpCircle className="w-4 h-4 text-slate-400" />,
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
      <td className="px-4 py-3">
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {system.hostname}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-slate-600 dark:text-slate-400">
        {system.documentedIP}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {system.role}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {system.validationMethods.slice(0, 3).map((method) => (
            <Tooltip key={method} content={VALIDATION_METHOD_INFO[method].description}>
              <Badge variant="secondary" size="sm">
                {method.toUpperCase().slice(0, 3)}
              </Badge>
            </Tooltip>
          ))}
          {system.validationMethods.length > 3 && (
            <Badge variant="secondary" size="sm">
              +{system.validationMethods.length - 3}
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {statusIcons[system.overallStatus]}
          <span
            className={cn(
              'text-sm capitalize',
              system.overallStatus === 'verified' && 'text-green-600',
              system.overallStatus === 'failed' && 'text-red-600',
              system.overallStatus === 'pending' && 'text-yellow-600',
              system.overallStatus === 'unknown' && 'text-slate-500'
            )}
          >
            {system.overallStatus}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <Tooltip content="Run validation checks on this system">
          <Button
            variant="ghost"
            size="sm"
            onClick={onValidate}
            disabled={isValidating}
            leftIcon={
              isValidating && system.overallStatus === 'pending' ? (
                <Spinner size="sm" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )
            }
          >
            Validate
          </Button>
        </Tooltip>
      </td>
    </tr>
  );
}
