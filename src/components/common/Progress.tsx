import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/utils/cn';

/**
 * Linear Progress Bar
 */
interface ProgressProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Show percentage label */
  showLabel?: boolean;
  /** Animation enabled */
  animated?: boolean;
  /** Additional class name */
  className?: string;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantStyles = {
  default: 'bg-forensic-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  animated = true,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <ProgressPrimitive.Root
        value={value}
        max={max}
        className={cn(
          'w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700',
          sizeStyles[size]
        )}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full rounded-full',
            variantStyles[variant],
            animated && 'transition-all duration-300 ease-out'
          )}
          style={{ width: `${percentage}%` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}

/**
 * Circular Progress Indicator
 */
interface CircularProgressProps {
  /** Progress value (0-100) */
  value: number;
  /** Size of the circle in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Show percentage in center */
  showLabel?: boolean;
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Custom label instead of percentage */
  label?: React.ReactNode;
  /** Additional class name */
  className?: string;
}

const circularVariantStyles = {
  default: 'stroke-forensic-500',
  success: 'stroke-green-500',
  warning: 'stroke-yellow-500',
  danger: 'stroke-red-500',
};

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  variant = 'default',
  label,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            circularVariantStyles[variant],
            'transition-all duration-500 ease-out'
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          {label || (
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Indeterminate Loading Spinner
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn(
        'animate-spin text-forensic-500',
        spinnerSizes[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Step Progress Indicator
 */
interface StepProgressProps {
  steps: { id: string; label: string }[];
  currentStep: number;
  className?: string;
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                'transition-colors duration-200',
                index < currentStep
                  ? 'bg-forensic-500 text-white'
                  : index === currentStep
                  ? 'bg-forensic-500 text-white ring-4 ring-forensic-100 dark:ring-forensic-900/50'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              )}
            >
              {index < currentStep ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                'mt-2 text-xs font-medium',
                index <= currentStep
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {step.label}
            </span>
          </div>
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2',
                index < currentStep
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
