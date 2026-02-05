import * as React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the card has hover effects */
  hoverable?: boolean;
  /** Whether the card has a selected state */
  selected?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hoverable = false,
      selected = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'bg-white dark:bg-slate-800',
          'rounded-lg',
          'border border-slate-200 dark:border-slate-700',
          'shadow-sm',
          // Padding
          paddingStyles[padding],
          // Hoverable
          hoverable && [
            'transition-all duration-200',
            'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
            'cursor-pointer',
          ],
          // Selected state
          selected && [
            'ring-2 ring-forensic-500 ring-offset-2 dark:ring-offset-slate-900',
            'border-forensic-500',
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header component
 */
interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Title text */
  title?: React.ReactNode;
  /** Description text */
  description?: React.ReactNode;
  /** Action elements to display on the right */
  action?: React.ReactNode;
}

export function CardHeader({
  className,
  title,
  description,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4', className)}
      {...props}
    >
      <div className="space-y-1">
        {title && (
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Card Content component
 */
export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Footer component
 */
export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-4 pt-4',
        'border-t border-slate-200 dark:border-slate-700',
        'flex items-center justify-end gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Scenario Card - Specialized card for scenario selection
 */
interface ScenarioCardProps extends Omit<CardProps, 'children'> {
  /** Scenario icon */
  icon: React.ReactNode;
  /** Scenario title */
  title: string;
  /** Scenario description */
  description: string;
  /** Difficulty badge */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Whether the scenario is selected */
  isSelected?: boolean;
  /** Click handler */
  onSelect?: () => void;
}

export function ScenarioCard({
  icon,
  title,
  description,
  difficulty,
  isSelected,
  onSelect,
  className,
  ...props
}: ScenarioCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Card
      hoverable
      selected={isSelected}
      onClick={onSelect}
      className={cn('text-center', className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center text-forensic-500 dark:text-forensic-400">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {description}
          </p>
        </div>
        {difficulty && (
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              difficultyColors[difficulty]
            )}
          >
            {difficulty}
          </span>
        )}
      </div>
    </Card>
  );
}
