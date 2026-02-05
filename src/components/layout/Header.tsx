import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { ThemeToggle, Tooltip, Button } from '@/components/common';
import { useSessionStore } from '@/store';
import { WORKFLOW_STEPS } from '@/types';

interface HeaderProps {
  /** Whether to show the progress stepper */
  showProgress?: boolean;
  /** Additional class name */
  className?: string;
}

export function Header({ showProgress = true, className }: HeaderProps) {
  const { currentSession, currentStep } = useSessionStore();

  // Determine current step number for progress display
  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.step === currentStep);
  const isInWorkflow = currentStepIndex >= 0;

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md',
        'border-b border-slate-200 dark:border-slate-700',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-900 dark:text-slate-100 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 flex items-center justify-center text-forensic-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M11 8v6" className="text-red-500" stroke="currentColor" />
                <path d="M8 11h6" className="text-red-500" stroke="currentColor" />
              </svg>
            </div>
            <span className="font-semibold text-lg hidden sm:inline">
              Forensic Triage
            </span>
          </Link>

          {/* Progress Stepper (when in workflow) */}
          {showProgress && isInWorkflow && currentSession && (
            <div className="hidden md:flex items-center">
              <WorkflowProgress
                currentStepIndex={currentStepIndex}
                totalSteps={WORKFLOW_STEPS.length}
              />
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Tooltip content="Get help and documentation">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Help"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Button>
            </Tooltip>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>

      {/* Mobile progress indicator */}
      {showProgress && isInWorkflow && currentSession && (
        <div className="md:hidden px-4 pb-3">
          <MobileProgress
            currentStepIndex={currentStepIndex}
            currentStepLabel={WORKFLOW_STEPS[currentStepIndex]?.label || ''}
            totalSteps={WORKFLOW_STEPS.length}
          />
        </div>
      )}
    </header>
  );
}

/**
 * Desktop workflow progress display
 */
interface WorkflowProgressProps {
  currentStepIndex: number;
  totalSteps: number;
}

function WorkflowProgress({ currentStepIndex, totalSteps }: WorkflowProgressProps) {
  return (
    <div className="flex items-center gap-1">
      {WORKFLOW_STEPS.map((step, index) => (
        <React.Fragment key={step.step}>
          <Tooltip content={step.label}>
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-colors duration-200',
                index < currentStepIndex
                  ? 'bg-forensic-500'
                  : index === currentStepIndex
                  ? 'bg-forensic-500 ring-2 ring-forensic-200 dark:ring-forensic-800'
                  : 'bg-slate-200 dark:bg-slate-700'
              )}
            />
          </Tooltip>
          {index < totalSteps - 1 && (
            <div
              className={cn(
                'w-4 h-0.5',
                index < currentStepIndex
                  ? 'bg-forensic-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Mobile progress indicator
 */
interface MobileProgressProps {
  currentStepIndex: number;
  currentStepLabel: string;
  totalSteps: number;
}

function MobileProgress({
  currentStepIndex,
  currentStepLabel,
  totalSteps,
}: MobileProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-forensic-500 transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        Step {currentStepIndex + 1}/{totalSteps}: {currentStepLabel}
      </span>
    </div>
  );
}
