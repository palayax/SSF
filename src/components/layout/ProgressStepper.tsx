import { cn } from '@/utils/cn';
import { Tooltip } from '@/components/common';
import { Check, Circle, Loader2 } from 'lucide-react';
import { WorkflowStep } from '@/types';

/**
 * Progress Stepper Component
 *
 * Displays workflow progress with connected steps.
 * Shows completed, current, and upcoming steps.
 */

interface Step {
  id: WorkflowStep;
  label: string;
  shortLabel: string;
  tooltip: string;
}

const WORKFLOW_STEPS: Step[] = [
  {
    id: 'organization_context',
    label: 'Organization Context',
    shortLabel: 'Context',
    tooltip: 'Upload documents and connect repositories to provide organizational context',
  },
  {
    id: 'incident_description',
    label: 'Incident Description',
    shortLabel: 'Incident',
    tooltip: 'Describe the incident using natural language and key indicators',
  },
  {
    id: 'connector_config',
    label: 'Connector Setup',
    shortLabel: 'Connectors',
    tooltip: 'Configure data source connections for log collection',
  },
  {
    id: 'infrastructure_validation',
    label: 'Infrastructure Validation',
    shortLabel: 'Validation',
    tooltip: 'Verify documented systems exist and match reality',
  },
  {
    id: 'triage',
    label: 'Triage Process',
    shortLabel: 'Triage',
    tooltip: 'Automated analysis of collected data and evidence',
  },
  {
    id: 'timeline',
    label: 'Timeline View',
    shortLabel: 'Timeline',
    tooltip: 'Interactive timeline of security events with drill-down',
  },
  {
    id: 'verification',
    label: 'Verification',
    shortLabel: 'Verify',
    tooltip: 'Review and classify ambiguous findings',
  },
  {
    id: 'report',
    label: 'Report Generation',
    shortLabel: 'Report',
    tooltip: 'Generate final report with recommendations',
  },
];

interface ProgressStepperProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick?: (step: WorkflowStep) => void;
  className?: string;
}

export function ProgressStepper({
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: ProgressStepperProps) {
  const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);

  const getStepStatus = (step: Step, index: number) => {
    if (completedSteps.includes(step.id)) return 'completed';
    if (step.id === currentStep) return 'current';
    if (index < currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <nav className={cn('flex items-center', className)} aria-label="Progress">
      <ol className="flex items-center space-x-1 md:space-x-2">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(step, index);
          const isClickable = status === 'completed' || status === 'current';

          return (
            <li key={step.id} className="flex items-center">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={cn(
                    'hidden sm:block w-4 md:w-8 h-0.5 mr-1 md:mr-2',
                    status === 'upcoming'
                      ? 'bg-slate-300 dark:bg-slate-600'
                      : 'bg-forensic-500'
                  )}
                />
              )}

              {/* Step indicator */}
              <Tooltip content={step.tooltip}>
                <button
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-forensic-500 focus:ring-offset-2',
                    isClickable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800',
                    !isClickable && 'cursor-default'
                  )}
                >
                  {/* Circle/Check indicator */}
                  <span
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors',
                      status === 'completed' && 'bg-forensic-500 text-white',
                      status === 'current' && 'bg-forensic-100 dark:bg-forensic-900 text-forensic-600 dark:text-forensic-400 ring-2 ring-forensic-500',
                      status === 'upcoming' && 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : status === 'current' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Circle className="w-3 h-3" />
                    )}
                  </span>

                  {/* Label - hide on small screens */}
                  <span
                    className={cn(
                      'hidden lg:block text-sm font-medium',
                      status === 'completed' && 'text-forensic-600 dark:text-forensic-400',
                      status === 'current' && 'text-slate-900 dark:text-slate-100',
                      status === 'upcoming' && 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {step.shortLabel}
                  </span>
                </button>
              </Tooltip>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Compact version for mobile
 */
export function ProgressStepperCompact({
  currentStep,
  completedSteps,
}: Pick<ProgressStepperProps, 'currentStep' | 'completedSteps'>) {
  const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
  const current = WORKFLOW_STEPS[currentIndex];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
          const isCurrent = step.id === currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                isCompleted && 'bg-forensic-500',
                isCurrent && 'bg-forensic-300 ring-2 ring-forensic-500',
                !isCompleted && !isCurrent && 'bg-slate-300 dark:bg-slate-600'
              )}
            />
          );
        })}
      </div>
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {current?.label}
      </span>
    </div>
  );
}
