import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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

  // Initialize validation systems from extracted entities
  useEffect(() => {
    if (extractedEntities.systems.length > 0 && systems.length === 0) {
      initializeFromSystems(extractedEntities.systems);
    }
  }, [extractedEntities.systems, systems.length, initializeFromSystems]);

  const handleBack = () => {
    goToPreviousStep();
    navigate('/connectors');
  };

  const handleContinue = () => {
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
          backLabel="Connectors"
          onContinue={handleContinue}
          continueLabel={discrepancies.length > 0 ? 'Continue with Warnings' : 'Continue'}
        />
      }
    >
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
    </PageContainer>
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
