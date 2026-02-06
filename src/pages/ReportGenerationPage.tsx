import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageContainer } from '@/components/layout';
import { useSessionStore } from '@/store';
import { Card, CardHeader, Button, Tooltip, Badge, Progress } from '@/components/common';
import {
  Download,
  FileText,
  FileCode,
  Printer,
  Share2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Target,
  Activity,
  ChevronDown,
  ChevronRight,
  Info,
  Monitor,
  Server,
  HardDrive,
  Network,
  Lock,
  ArrowRight,
  Skull,
  UserX,
  Mail,
  Cloud,
  Unlock,
  RotateCw,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Enriched recommendation data with tooltips, examples, and affected assets
const ENHANCED_RECOMMENDATIONS = [
  {
    priority: 'immediate',
    title: 'Isolate affected systems',
    status: 'pending',
    tooltip: 'Network-isolate all compromised systems to prevent further lateral movement and data exfiltration.',
    example: 'Disable network ports for WS-FIN-042, DC-MAIN-01 on the switch. Use firewall rules to block inter-VLAN traffic from Finance segment. In Palo Alto: set security policy deny from zone "Finance" to zone "any".',
    steps: ['Identify all confirmed compromised hosts', 'Disable switch ports or apply ACLs', 'Block C2 IPs at perimeter firewall', 'Monitor for new outbound connections'],
    affectedAssets: [
      { name: 'WS-FIN-042', type: 'Workstation', os: 'Windows 10', ip: '10.0.2.42', severity: 'critical' },
      { name: 'DC-MAIN-01', type: 'Domain Controller', os: 'Windows Server 2022', ip: '10.0.1.10', severity: 'critical' },
      { name: 'FS-FINANCE-01', type: 'File Server', os: 'Windows Server 2019', ip: '10.0.2.20', severity: 'high' },
    ],
  },
  {
    priority: 'immediate',
    title: 'Reset compromised credentials',
    status: 'pending',
    tooltip: 'Force password reset for all compromised accounts including service accounts. Revoke all active tokens and sessions.',
    example: 'In Active Directory: Right-click user → Reset Password → Check "User must change password at next logon". For service accounts: Update password in AD and all services referencing it. Revoke Azure AD tokens: Revoke-AzureADUserAllRefreshToken -ObjectId <user-object-id>',
    steps: ['Reset passwords for jsmith, admin.jsmith, svc-backup', 'Revoke all OAuth tokens and API keys', 'Invalidate Kerberos TGTs (krbtgt reset twice)', 'Update service account passwords in all dependent services'],
    affectedAssets: [
      { name: 'jsmith@company.com', type: 'User Account', os: 'AD/Azure AD', ip: '-', severity: 'critical' },
      { name: 'admin.jsmith', type: 'Admin Account', os: 'Active Directory', ip: '-', severity: 'critical' },
      { name: 'svc-backup', type: 'Service Account', os: 'Active Directory', ip: '-', severity: 'high' },
    ],
  },
  {
    priority: 'short_term',
    title: 'Implement MFA for all admin accounts',
    status: 'pending',
    tooltip: 'Deploy multi-factor authentication for all privileged accounts to prevent credential-based attacks.',
    example: 'Azure AD: Security → MFA → Conditional Access → New Policy → Target: "All Admin Roles" → Grant: "Require MFA". For on-prem: Deploy Duo or Azure MFA Server for RDP and VPN access. Use FIDO2 keys for domain admins.',
    steps: ['Audit all accounts with admin privileges', 'Enable Azure AD Conditional Access with MFA requirement', 'Deploy hardware tokens (FIDO2) for domain admins', 'Configure MFA for VPN and RDP gateways'],
    affectedAssets: [
      { name: 'All Admin Accounts', type: 'Identity', os: 'Azure AD / AD', ip: '-', severity: 'high' },
      { name: 'VPN Gateway', type: 'Network Device', os: 'Palo Alto GlobalProtect', ip: '10.0.0.1', severity: 'high' },
    ],
  },
  {
    priority: 'short_term',
    title: 'Deploy EDR solution',
    status: 'pending',
    tooltip: 'Install endpoint detection and response (EDR) on all endpoints for real-time threat detection and automated response.',
    example: 'Deploy CrowdStrike Falcon or Microsoft Defender for Endpoint. Use Group Policy to push MSI: msiexec /i WindowsSensor.exe CID=<your-customer-id> /quiet. Set detection policy to "Extra Aggressive" during incident recovery.',
    steps: ['Select EDR vendor (CrowdStrike, SentinelOne, MDE)', 'Deploy agent to all Windows and Linux endpoints via GPO/SCCM', 'Configure detection policies and automated response', 'Integrate with SIEM for centralized alerting'],
    affectedAssets: [
      { name: 'All Endpoints', type: 'Fleet', os: 'Windows/Linux', ip: 'Multiple', severity: 'medium' },
      { name: 'DC-MAIN-01', type: 'Domain Controller', os: 'Windows Server 2022', ip: '10.0.1.10', severity: 'critical' },
    ],
  },
  {
    priority: 'long_term',
    title: 'Security awareness training',
    status: 'pending',
    tooltip: 'Conduct organization-wide security awareness training with focus on phishing identification and reporting procedures.',
    example: 'Use KnowBe4 or Proofpoint Security Awareness: Set up monthly phishing simulations. Track click rates by department. Finance dept gets additional targeted training due to this incident. Add "Report Phish" button to Outlook.',
    steps: ['Select awareness training platform', 'Conduct baseline phishing simulation', 'Deploy monthly phishing tests with increasing difficulty', 'Require completion of anti-phishing training module', 'Implement phishing report button in email client'],
    affectedAssets: [
      { name: 'Finance Department', type: 'Department', os: '-', ip: '-', severity: 'high' },
      { name: 'All Employees', type: 'Organization', os: '-', ip: '-', severity: 'medium' },
    ],
  },
];

// Enhanced gap analysis data
const ENHANCED_GAPS = [
  {
    category: 'Detection',
    current: 2,
    target: 4,
    gap: 'No behavioral analytics',
    remediation: 'Deploy UEBA solution (e.g., Microsoft Sentinel UEBA, Exabeam) to detect anomalous user behavior patterns like unusual login times, impossible travel, and mass file access.',
    example: 'In Microsoft Sentinel: Analytics → UEBA → Enable for all users. Configure detection rules for: Anomalous login locations, First-time VPN connections, Mass file downloads exceeding baseline by 3x.',
  },
  {
    category: 'Response',
    current: 3,
    target: 4,
    gap: 'Manual playbooks only',
    remediation: 'Implement SOAR platform (e.g., Palo Alto XSOAR, Splunk SOAR) to automate incident response playbooks for common scenarios like phishing, ransomware, and unauthorized access.',
    example: 'Create automated playbook: Phishing detected → Extract IOCs → Block sender in email gateway → Search mailboxes for similar → Isolate affected endpoints → Notify SOC analyst → Create ticket.',
  },
  {
    category: 'Prevention',
    current: 2,
    target: 5,
    gap: 'Limited email security',
    remediation: 'Upgrade email security with advanced threat protection: sandboxing, URL rewriting, impersonation protection, and DMARC/DKIM/SPF enforcement.',
    example: 'Deploy Proofpoint or Mimecast ATP. Configure: Attachment sandboxing (detonate in VM), URL rewriting with click-time analysis, Brand impersonation protection, DMARC policy p=reject.',
  },
];

/**
 * Report Generation Page
 */
export default function ReportGenerationPage() {
  const navigate = useNavigate();
  const { goToPreviousStep } = useSessionStore();

  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'html' | 'json'>('pdf');
  const [includeRawLogs, setIncludeRawLogs] = useState(false);
  const [redactSensitive, setRedactSensitive] = useState(true);
  const [expandedRec, setExpandedRec] = useState<number | null>(null);
  const [expandedGap, setExpandedGap] = useState<number | null>(null);
  const [showAttackFlow, setShowAttackFlow] = useState(false);

  const handleBack = () => {
    goToPreviousStep();
    navigate('/verification');
  };

  const handleExport = () => {
    alert(`Exporting report as ${selectedFormat.toUpperCase()}...`);
  };

  const handleNewInvestigation = () => {
    navigate('/');
  };

  const reportData = {
    incidentSummary: 'Ransomware attack via phishing email targeting finance department',
    affectedSystems: 12,
    totalFindings: 23,
    criticalFindings: 5,
    timeToDetection: '4 hours',
    dataAtRisk: 'Customer PII, Financial Records',
    businessImpact: {
      operational: 'high',
      financial: 'medium',
      reputational: 'low',
      regulatory: 'high',
    },
  };

  return (
    <PageContainer
      title="Report Generation"
      subtitle="Review and export the investigation report"
      footer={
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            Back to Verification
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleNewInvestigation}>
              New Investigation
            </Button>
            <Tooltip content={`Export report as ${selectedFormat.toUpperCase()}`}>
              <Button onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
                Export Report
              </Button>
            </Tooltip>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Preview */}
        <div className="lg:col-span-3 space-y-6">
          {/* Executive Summary */}
          <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-forensic-100 dark:bg-forensic-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-forensic-600 dark:text-forensic-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Executive Summary
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {reportData.incidentSummary}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard icon={<Target className="w-4 h-4" />} label="Affected Systems" value={reportData.affectedSystems} />
                  <MetricCard icon={<AlertTriangle className="w-4 h-4" />} label="Total Findings" value={reportData.totalFindings} subValue={`${reportData.criticalFindings} critical`} />
                  <MetricCard icon={<Clock className="w-4 h-4" />} label="Time to Detect" value={reportData.timeToDetection} />
                  <MetricCard icon={<Activity className="w-4 h-4" />} label="Data at Risk" value={reportData.dataAtRisk} small />
                </div>
              </div>
            </div>
          </Card>

          {/* Visual Attack Summary (matching Timeline) */}
          <Card>
            <button
              onClick={() => setShowAttackFlow(!showAttackFlow)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">Attack Chain Visualization</span>
              </div>
              {showAttackFlow ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>
            {showAttackFlow && (
              <div className="mt-4 space-y-4">
                {/* Compact Attack Chain */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {[
                    { phase: 'Initial Access', icon: <Mail className="w-3 h-3" />, color: 'bg-red-500' },
                    { phase: 'Execution', icon: <Activity className="w-3 h-3" />, color: 'bg-red-600' },
                    { phase: 'Persistence', icon: <RotateCw className="w-3 h-3" />, color: 'bg-orange-500' },
                    { phase: 'Priv. Escalation', icon: <Unlock className="w-3 h-3" />, color: 'bg-orange-600' },
                    { phase: 'Lateral Movement', icon: <Network className="w-3 h-3" />, color: 'bg-yellow-500' },
                    { phase: 'Collection', icon: <HardDrive className="w-3 h-3" />, color: 'bg-yellow-600' },
                    { phase: 'Exfiltration', icon: <Cloud className="w-3 h-3" />, color: 'bg-purple-500' },
                    { phase: 'Impact', icon: <Lock className="w-3 h-3" />, color: 'bg-red-700' },
                  ].map((step, idx, arr) => (
                    <div key={idx} className="flex items-center">
                      <div className={cn('flex items-center gap-1 px-2 py-1 rounded text-white text-[10px] font-medium whitespace-nowrap', step.color)}>
                        {step.icon}
                        {step.phase}
                      </div>
                      {idx < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300 mx-0.5 flex-shrink-0" />}
                    </div>
                  ))}
                </div>

                {/* Compromised entities summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Skull className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-medium text-red-700 dark:text-red-400">Threat Actor</span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400">External, IP: 185.220.101.42</p>
                    <p className="text-xs text-red-500">Tools: PsExec, Mimikatz</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/50">
                    <div className="flex items-center gap-2 mb-1">
                      <UserX className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Compromised Users</span>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400">jsmith, admin.jsmith, svc-backup</p>
                    <p className="text-xs text-orange-500">3 accounts compromised</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-900/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Affected Systems</span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400">12 systems across 4 segments</p>
                    <p className="text-xs text-purple-500">5 critical, 4 high, 3 medium</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Business Impact Assessment */}
          <Card>
            <CardHeader
              title="Business Impact Assessment"
              description="Impact across key business dimensions"
            />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(reportData.businessImpact).map(([key, value]) => (
                <ImpactCard key={key} dimension={key} level={value as string} />
              ))}
            </div>
          </Card>

          {/* Enhanced Recommendations with Tooltips, Examples, and Drill-down */}
          <Card>
            <CardHeader
              title="Recommendations & Mitigations"
              description="Prioritized actions with implementation guidance"
            />
            <div className="mt-4 space-y-3">
              {ENHANCED_RECOMMENDATIONS.map((rec, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedRec(expandedRec === idx ? null : idx)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <Badge
                      variant={rec.priority === 'immediate' ? 'danger' : rec.priority === 'short_term' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {rec.priority.replace('_', ' ')}
                    </Badge>
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 text-left">
                      {rec.title}
                    </span>
                    <Tooltip content={rec.tooltip}>
                      <Info className="w-4 h-4 text-slate-400 hover:text-forensic-500" />
                    </Tooltip>
                    <Badge variant="secondary" size="sm">{rec.status}</Badge>
                    {expandedRec === idx ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {expandedRec === idx && (
                    <div className="px-4 pb-4 space-y-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                      {/* How-to Steps */}
                      <div className="pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-forensic-500" />
                          <span className="text-xs font-medium text-slate-500 uppercase">Implementation Steps</span>
                        </div>
                        <ol className="space-y-1.5 ml-4">
                          {rec.steps.map((step, sIdx) => (
                            <li key={sIdx} className="text-xs text-slate-600 dark:text-slate-400 flex gap-2">
                              <span className="w-5 h-5 rounded-full bg-forensic-100 dark:bg-forensic-900/30 text-forensic-600 dark:text-forensic-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                {sIdx + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Example */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-medium text-slate-500 uppercase">Practical Example</span>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
                          <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">{rec.example}</p>
                        </div>
                      </div>

                      {/* Affected Assets Drill-down */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Monitor className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-slate-500 uppercase">Affected Assets ({rec.affectedAssets.length})</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-slate-400 uppercase">
                                <th className="pb-1.5 pr-3">Asset</th>
                                <th className="pb-1.5 pr-3">Type</th>
                                <th className="pb-1.5 pr-3">OS/Platform</th>
                                <th className="pb-1.5 pr-3">IP</th>
                                <th className="pb-1.5">Severity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                              {rec.affectedAssets.map((asset, aIdx) => (
                                <tr key={aIdx}>
                                  <td className="py-1.5 pr-3 font-medium text-slate-700 dark:text-slate-300">{asset.name}</td>
                                  <td className="py-1.5 pr-3 text-slate-500">{asset.type}</td>
                                  <td className="py-1.5 pr-3 text-slate-500">{asset.os}</td>
                                  <td className="py-1.5 pr-3 font-mono text-slate-500">{asset.ip}</td>
                                  <td className="py-1.5">
                                    <span className={cn(
                                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                      asset.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                      asset.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    )}>
                                      {asset.severity}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Enhanced Gap Analysis with Examples */}
          <Card>
            <CardHeader
              title="Gap Analysis"
              description="Security maturity assessment with remediation guidance"
            />
            <div className="mt-4 space-y-4">
              {ENHANCED_GAPS.map((gap, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedGap(expandedGap === idx ? null : idx)}
                    className="w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {gap.category}
                        </span>
                        <Tooltip content={gap.remediation}>
                          <Info className="w-3.5 h-3.5 text-slate-400 hover:text-forensic-500" />
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{gap.current}/{gap.target}</span>
                        {expandedGap === idx ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <Progress
                      value={(gap.current / gap.target) * 100}
                      variant={gap.current < gap.target * 0.5 ? 'danger' : 'warning'}
                    />
                    <p className="text-xs text-slate-500 mt-1 text-left">{gap.gap}</p>
                  </button>

                  {expandedGap === idx && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-forensic-500" />
                          <span className="text-xs font-medium text-slate-500 uppercase">Remediation Plan</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{gap.remediation}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-medium text-slate-500 uppercase">Example Configuration</span>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
                          <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">{gap.example}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Export Options Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader title="Export Options" />
            <div className="mt-4 space-y-4">
              {/* Format Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Format
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'pdf', icon: <FileText className="w-4 h-4" />, label: 'PDF Document' },
                    { id: 'html', icon: <FileCode className="w-4 h-4" />, label: 'Interactive HTML' },
                    { id: 'json', icon: <FileCode className="w-4 h-4" />, label: 'JSON Data' },
                  ].map((format) => (
                    <Tooltip key={format.id} content={`Export as ${format.label}`}>
                      <button
                        onClick={() => setSelectedFormat(format.id as 'pdf' | 'html' | 'json')}
                        className={cn(
                          'w-full flex items-center gap-2 p-2 rounded-lg border transition-colors',
                          selectedFormat === format.id
                            ? 'border-forensic-500 bg-forensic-50 dark:bg-forensic-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        )}
                      >
                        {format.icon}
                        <span className="text-sm">{format.label}</span>
                        {selectedFormat === format.id && (
                          <CheckCircle className="w-4 h-4 text-forensic-500 ml-auto" />
                        )}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Content Options */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Content Options
                </label>
                <div className="space-y-2">
                  <Tooltip content="Include raw log data in export">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeRawLogs}
                        onChange={(e) => setIncludeRawLogs(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Include raw logs</span>
                    </label>
                  </Tooltip>
                  <Tooltip content="Automatically redact sensitive data">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={redactSensitive}
                        onChange={(e) => setRedactSensitive(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Redact sensitive data</span>
                    </label>
                  </Tooltip>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <Tooltip content="Generate downloadable PDF report with current findings">
                  <Button fullWidth onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
                    Export Report
                  </Button>
                </Tooltip>
                <Tooltip content="Open print preview">
                  <Button variant="outline" fullWidth leftIcon={<Printer className="w-4 h-4" />}>
                    Print Preview
                  </Button>
                </Tooltip>
                <Tooltip content="Generate shareable link">
                  <Button variant="ghost" fullWidth leftIcon={<Share2 className="w-4 h-4" />}>
                    Share Link
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  small?: boolean;
}

function MetricCard({ icon, label, value, subValue, small }: MetricCardProps) {
  return (
    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={cn(
        'font-bold text-slate-900 dark:text-slate-100',
        small ? 'text-sm' : 'text-lg'
      )}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-red-500">{subValue}</p>
      )}
    </div>
  );
}

/**
 * Impact Card Component
 */
interface ImpactCardProps {
  dimension: string;
  level: string;
}

function ImpactCard({ dimension, level }: ImpactCardProps) {
  const levelColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <p className="text-xs text-slate-500 uppercase mb-1 capitalize">{dimension}</p>
      <span className={cn('px-3 py-1 rounded-full text-sm font-medium capitalize', levelColors[level as keyof typeof levelColors])}>
        {level}
      </span>
    </div>
  );
}
