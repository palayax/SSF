import * as React from 'react';
import { cn } from '@/utils/cn';
import { Tooltip } from './Tooltip';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Optional icon to display before the label */
  leftIcon?: React.ReactNode;
  /** Optional icon to display after the label */
  rightIcon?: React.ReactNode;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Tooltip text to display on hover */
  tooltip?: string;
  /** Full width button */
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-forensic-500 hover:bg-forensic-600 active:bg-forensic-700',
    'text-white',
    'border border-transparent',
    'shadow-sm'
  ),
  secondary: cn(
    'bg-slate-100 hover:bg-slate-200 active:bg-slate-300',
    'dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-500',
    'text-slate-900 dark:text-slate-100',
    'border border-transparent'
  ),
  ghost: cn(
    'bg-transparent hover:bg-slate-100 active:bg-slate-200',
    'dark:hover:bg-slate-800 dark:active:bg-slate-700',
    'text-slate-700 dark:text-slate-300',
    'border border-transparent'
  ),
  danger: cn(
    'bg-red-500 hover:bg-red-600 active:bg-red-700',
    'text-white',
    'border border-transparent',
    'shadow-sm'
  ),
  outline: cn(
    'bg-transparent hover:bg-slate-50 active:bg-slate-100',
    'dark:hover:bg-slate-800 dark:active:bg-slate-700',
    'text-slate-700 dark:text-slate-300',
    'border border-slate-300 dark:border-slate-600'
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      isLoading,
      tooltip,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const button = (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium rounded-lg',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
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
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );

    if (tooltip) {
      return <Tooltip content={tooltip}>{button}</Tooltip>;
    }

    return button;
  }
);

Button.displayName = 'Button';

/**
 * Icon-only button variant
 */
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  /** Accessible label for the button */
  'aria-label': string;
  /** The icon to display */
  icon: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', icon, ...props }, ref) => {
    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn('!p-0', sizeClasses[size], className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
