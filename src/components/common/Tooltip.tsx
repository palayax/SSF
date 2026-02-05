import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils/cn';

/**
 * Tooltip Provider - Wrap the entire app with this
 */
export const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Tooltip component for displaying helpful information on hover
 *
 * Every interactive element in the app should have a tooltip describing its functionality.
 */
interface TooltipProps {
  /** The content to display in the tooltip */
  content: React.ReactNode;
  /** The element that triggers the tooltip */
  children: React.ReactNode;
  /** Side of the trigger to show the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the tooltip relative to the trigger */
  align?: 'start' | 'center' | 'end';
  /** Delay before showing tooltip in ms */
  delayDuration?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Additional class names for the content */
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  disabled = false,
  className,
}: TooltipProps) {
  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={5}
          className={cn(
            'z-50 overflow-hidden rounded-md px-3 py-1.5 text-sm',
            'bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900',
            'shadow-md animate-fade-in',
            'max-w-xs',
            className
          )}
        >
          {content}
          <TooltipPrimitive.Arrow
            className="fill-slate-900 dark:fill-slate-50"
            width={10}
            height={5}
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/**
 * Icon with tooltip - Common pattern for info icons
 */
interface TooltipIconProps {
  content: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function TooltipIcon({ content, icon, className }: TooltipIconProps) {
  return (
    <Tooltip content={content}>
      <span
        className={cn(
          'inline-flex items-center justify-center',
          'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300',
          'cursor-help',
          className
        )}
      >
        {icon || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        )}
      </span>
    </Tooltip>
  );
}
