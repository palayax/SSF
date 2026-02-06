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
  Globe,
  ChevronDown,
  ChevronRight,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SystemValidation } from '@/types';

/**
 * Infrastructure Validation Page
 *
 * Validate documented systems:
 * - Auto-validation toggle
 * - Manual validation per system
 * - Validation results table
 * - Discrepancy alerts
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
    if (!showSummary && verifiedCount > 0) {
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
          continueLabel={showSummary ? 'Proceed to Triage' : (discrepancies.length > 0 ? 'View Summary' : 'View Summary')}
        />
      }
    >
      {/* INFRASTRUCTURE SUMMARY VIEW */}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Server className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{extractedEntities.systems.length}</p>
                <p className="text-xs text-slate-500">Systems</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Network className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{extractedEntities.networks.length}</p>
                <p className="text-xs text-slate-500">Networks</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Users className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">~1,250</p>
                <p className="text-xs text-slate-500">Employees</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Cloud className="w-5 h-5 mx-auto text-cyan-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">3</p>
                <p className="text-xs text-slate-500">Cloud Services</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Database className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{extractedEntities.processes.length}</p>
                <p className="text-xs text-slate-500">Processes</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <Shield className="w-5 h-5 mx-auto text-red-500 mb-1" />
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{extractedEntities.compliance.length}</p>
                <p className="text-xs text-slate-500">Compliance</p>
              </div>
            </div>
          </Card>

          {/* Drilldown Sections */}
          <SummaryDrilldown
            title="Systems & Servers"
            icon={<Server className="w-5 h-5 text-blue-500" />}
            count={extractedEntities.systems.length}
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
                    <th className="pb-2">Criticality</th>
                    <th className="pb-2">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {extractedEntities.systems.map((sys) => {
                    const val = systems.find((s) => s.hostname === sys.hostname);
                    return (
                      <tr key={sys.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2 font-medium">{sys.hostname}</td>
                        <td className="py-2 font-mono text-xs text-slate-500">{sys.ip || 'N/A'}</td>
                        <td className="py-2 text-slate-600 dark:text-slate-400">{sys.role}</td>
                        <td className="py-2 text-slate-500 text-xs">{sys.os || '-'}</td>
                        <td className="py-2">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            sys.criticality === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            sys.criticality === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          )}>{sys.criticality}</span>
                        </td>
                        <td className="py-2">
                          {val ? (
                            <span className={cn(
                              'flex items-center gap-1 text-xs',
                              val.overallStatus === 'verified' ? 'text-green-600' :
                              val.overallStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                            )}>
                              {val.overallStatus === 'verified' && <CheckCircle className="w-3 h-3" />}
                              {val.overallStatus === 'failed' && <XCircle className="w-3 h-3" />}
                              {val.overallStatus === 'pending' && <Clock className="w-3 h-3" />}
                              {val.overallStatus}
                            </span>
                          ) : <span className="text-xs text-slate-400">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Network Segments"
            icon={<Network className="w-5 h-5 text-green-500" />}
            count={extractedEntities.networks.length}
            isExpanded={expandedSection === 'networks'}
            onToggle={() => setExpandedSection(expandedSection === 'networks' ? null : 'networks')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extractedEntities.networks.map((net) => (
                <div key={net.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm">{net.name}</span>
                    {net.vlan && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 rounded">VLAN {net.vlan}</span>}
                  </div>
                  <p className="text-xs font-mono text-slate-500">{net.cidr}</p>
                  <p className="text-xs text-slate-400 mt-1">{net.description}</p>
                </div>
              ))}
            </div>
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Business Processes"
            icon={<Database className="w-5 h-5 text-orange-500" />}
            count={extractedEntities.processes.length}
            isExpanded={expandedSection === 'processes'}
            onToggle={() => setExpandedSection(expandedSection === 'processes' ? null : 'processes')}
          >
            {extractedEntities.processes.map((proc) => (
              <div key={proc.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{proc.name}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    proc.criticality === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-700'
                  )}>{proc.criticality}</span>
                </div>
                <p className="text-xs text-slate-500">{proc.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-400">
                  <span>RTO: {proc.rto}h</span>
                  <span>RPO: {proc.rpo}h</span>
                  <span>Depends: {proc.dependentSystems.join(', ')}</span>
                </div>
              </div>
            ))}
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Key Personnel & Employees"
            icon={<Users className="w-5 h-5 text-purple-500" />}
            count={8}
            isExpanded={expandedSection === 'employees'}
            onToggle={() => setExpandedSection(expandedSection === 'employees' ? null : 'employees')}
          >
            <div className="space-y-2">
              {[
                { name: 'John Smith', role: 'IT Director', dept: 'IT', access: 'Domain Admin', risk: 'high' },
                { name: 'Sarah Johnson', role: 'CISO', dept: 'Security', access: 'Security Admin', risk: 'high' },
                { name: 'Mike Chen', role: 'Sr. Network Engineer', dept: 'IT', access: 'Network Admin', risk: 'medium' },
                { name: 'Lisa Williams', role: 'Finance Manager', dept: 'Finance', access: 'Finance Share', risk: 'medium' },
                { name: 'svc-backup', role: 'Service Account', dept: 'System', access: 'Backup Operator', risk: 'high' },
                { name: 'svc-sql', role: 'Service Account', dept: 'System', access: 'SQL Server Agent', risk: 'high' },
                { name: 'admin.jsmith', role: 'Privileged Account', dept: 'IT', access: 'Domain Admin', risk: 'critical' },
                { name: 'helpdesk-svc', role: 'Service Account', dept: 'IT', access: 'Password Reset', risk: 'medium' },
              ].map((person, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                    person.role.includes('Service') || person.role.includes('Privileged')
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                  )}>
                    {person.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{person.name}</span>
                    <span className="text-slate-400 ml-2 text-xs">{person.role}</span>
                  </div>
                  <span className="text-xs text-slate-500">{person.dept}</span>
                  <span className="text-xs text-slate-400">{person.access}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs font-medium',
                    person.risk === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    person.risk === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  )}>{person.risk}</span>
                </div>
              ))}
            </div>
          </SummaryDrilldown>

          <SummaryDrilldown
            title="Compliance & Data Classification"
            icon={<Shield className="w-5 h-5 text-red-500" />}
            count={extractedEntities.compliance.length}
            isExpanded={expandedSection === 'compliance'}
            onToggle={() => setExpandedSection(expandedSection === 'compliance' ? null : 'compliance')}
          >
            {extractedEntities.compliance.map((comp) => (
              <div key={comp.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">{comp.framework}</span>
                  <span className="font-medium text-sm">{comp.requirement}</span>
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
                  {verifiedCount} of {systems.length} systems verified. All key resources have been documented and validated. Click "Proceed to Triage" to begin forensic analysis.
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
