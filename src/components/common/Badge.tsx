import * as React from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Optional icon to display before the text */
  icon?: React.ReactNode;
  /** Whether the badge has a dot indicator */
  dot?: boolean;
  /** Dot color override */
  dotColor?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  primary: 'bg-forensic-100 text-forensic-800 dark:bg-forensic-900/30 dark:text-forensic-400',
  secondary: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-500',
  primary: 'bg-forensic-500',
  secondary: 'bg-slate-400',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  icon,
  dot,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColor || dotColors[variant]
          )}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

/**
 * Status Badge - For displaying system/validation status
 */
interface StatusBadgeProps {
  status: 'verified' | 'failed' | 'pending' | 'unknown' | 'success' | 'error' | 'warning';
  label?: string;
  size?: BadgeSize;
  className?: string;
}

export function StatusBadge({ status, label, size = 'md', className }: StatusBadgeProps) {
  const statusConfig: Record<StatusBadgeProps['status'], { variant: BadgeVariant; defaultLabel: string }> = {
    verified: { variant: 'success', defaultLabel: 'Verified' },
    success: { variant: 'success', defaultLabel: 'Success' },
    failed: { variant: 'danger', defaultLabel: 'Failed' },
    error: { variant: 'danger', defaultLabel: 'Error' },
    pending: { variant: 'warning', defaultLabel: 'Pending' },
    warning: { variant: 'warning', defaultLabel: 'Warning' },
    unknown: { variant: 'secondary', defaultLabel: 'Unknown' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {label || config.defaultLabel}
    </Badge>
  );
}

/**
 * Severity Badge - For displaying severity levels
 */
interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  size?: BadgeSize;
  className?: string;
}

export function SeverityBadge({ severity, size = 'md', className }: SeverityBadgeProps) {
  const severityLabels: Record<SeverityBadgeProps['severity'], string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info',
  };

  const variantMap: Record<SeverityBadgeProps['severity'], BadgeVariant> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
    info: 'info',
  };

  return (
    <Badge variant={variantMap[severity]} size={size} className={className}>
      {severityLabels[severity]}
    </Badge>
  );
}

/**
 * Count Badge - For displaying counts (e.g., notification counts)
 */
interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  className?: string;
}

export function CountBadge({ count, max = 99, variant = 'danger', className }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant={variant}
      size="sm"
      className={cn('min-w-[1.25rem] justify-center', className)}
    >
      {displayCount}
    </Badge>
  );
}
