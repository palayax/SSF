import * as React from 'react';
import { cn } from '@/utils/cn';
import { Header } from './Header';

interface PageContainerProps {
  /** Page title */
  title?: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Whether to show the header progress stepper */
  showProgress?: boolean;
  /** Action buttons for the page header */
  actions?: React.ReactNode;
  /** Footer content (navigation buttons) */
  footer?: React.ReactNode;
  /** Page content */
  children: React.ReactNode;
  /** Maximum width variant */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Additional class name */
  className?: string;
}

const maxWidthStyles = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function PageContainer({
  title,
  subtitle,
  showProgress = true,
  actions,
  footer,
  children,
  maxWidth = '2xl',
  className,
}: PageContainerProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header showProgress={showProgress} />

      <main className="flex-1 flex flex-col">
        <div
          className={cn(
            'flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6',
            maxWidthStyles[maxWidth],
            className
          )}
        >
          {/* Page header */}
          {(title || actions) && (
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Page content */}
          <div className="flex-1">{children}</div>
        </div>

        {/* Page footer/navigation */}
        {footer && (
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div
              className={cn(
                'w-full mx-auto px-4 sm:px-6 lg:px-8 py-4',
                maxWidthStyles[maxWidth]
              )}
            >
              {footer}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Page Navigation Footer
 *
 * Standard navigation footer for workflow pages
 */
interface PageNavigationProps {
  /** Back button handler */
  onBack?: () => void;
  /** Back button label */
  backLabel?: string;
  /** Continue button handler */
  onContinue?: () => void;
  /** Continue button label */
  continueLabel?: string;
  /** Whether continue button is disabled */
  continueDisabled?: boolean;
  /** Whether continue button is loading */
  continueLoading?: boolean;
  /** Additional content in the middle */
  middleContent?: React.ReactNode;
}

export function PageNavigation({
  onBack,
  backLabel = 'Back',
  onContinue,
  continueLabel = 'Continue',
  continueDisabled,
  continueLoading,
  middleContent,
}: PageNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className={cn(
              'inline-flex items-center gap-2',
              'px-4 py-2 text-sm font-medium',
              'text-slate-600 dark:text-slate-400',
              'hover:text-slate-900 dark:hover:text-slate-100',
              'transition-colors duration-200'
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {backLabel}
          </button>
        )}
      </div>

      {middleContent && <div className="flex-1 flex justify-center">{middleContent}</div>}

      <div>
        {onContinue && (
          <button
            onClick={onContinue}
            disabled={continueDisabled || continueLoading}
            className={cn(
              'inline-flex items-center gap-2',
              'px-6 py-2 text-sm font-medium',
              'bg-forensic-500 hover:bg-forensic-600 text-white',
              'rounded-lg',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {continueLoading ? (
              <svg
                className="animate-spin w-4 h-4"
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
            ) : null}
            {continueLabel}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 *
 * For displaying when there's no content
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
