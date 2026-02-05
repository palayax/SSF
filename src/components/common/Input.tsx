import * as React from 'react';
import { cn } from '@/utils/cn';
import { TooltipIcon } from './Tooltip';

/**
 * Base Input Props
 */
interface InputBaseProps {
  /** Label for the input */
  label?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Tooltip text */
  tooltip?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Left addon/icon */
  leftAddon?: React.ReactNode;
  /** Right addon/icon */
  rightAddon?: React.ReactNode;
}

/**
 * Text Input
 */
interface TextInputProps
  extends InputBaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  inputSize?: 'sm' | 'md' | 'lg';
}

const inputSizeStyles = {
  sm: 'h-8 text-sm px-2',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

export const Input = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      tooltip,
      required,
      leftAddon,
      rightAddon,
      inputSize = 'md',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <div className="flex items-center gap-1 mb-1">
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {tooltip && <TooltipIcon content={tooltip} />}
          </div>
        )}
        <div className="relative">
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full rounded-lg',
              'bg-white dark:bg-slate-800',
              'border border-slate-300 dark:border-slate-600',
              'text-slate-900 dark:text-slate-100',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:ring-2 focus:ring-forensic-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900',
              'transition-colors duration-200',
              inputSizeStyles[inputSize],
              leftAddon && 'pl-10',
              rightAddon && 'pr-10',
              error && 'border-red-500 focus:ring-red-500'
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {rightAddon}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p
            id={error ? `${inputId}-error` : undefined}
            className={cn(
              'mt-1 text-sm',
              error ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea
 */
interface TextareaProps
  extends InputBaseProps,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Minimum number of rows */
  minRows?: number;
  /** Maximum number of rows for auto-resize */
  maxRows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      tooltip,
      required,
      minRows = 3,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId();

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <div className="flex items-center gap-1 mb-1">
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {tooltip && <TooltipIcon content={tooltip} />}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={minRows}
          className={cn(
            'w-full rounded-lg px-3 py-2',
            'bg-white dark:bg-slate-800',
            'border border-slate-300 dark:border-slate-600',
            'text-slate-900 dark:text-slate-100',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:ring-2 focus:ring-forensic-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900',
            'transition-colors duration-200',
            'resize-y',
            error && 'border-red-500 focus:ring-red-500'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {(helperText || error) && (
          <p
            id={error ? `${textareaId}-error` : undefined}
            className={cn(
              'mt-1 text-sm',
              error ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Search Input with icon
 */
interface SearchInputProps extends Omit<TextInputProps, 'leftAddon'> {
  /** Called when search is submitted */
  onSearch?: (value: string) => void;
}

export function SearchInput({
  onSearch,
  onKeyDown,
  ...props
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.currentTarget.value);
    }
    onKeyDown?.(e);
  };

  return (
    <Input
      type="search"
      leftAddon={
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

/**
 * Input with character counter
 */
interface CharacterCountInputProps extends TextareaProps {
  maxLength: number;
}

export function CharacterCountTextarea({
  maxLength,
  value,
  onChange,
  ...props
}: CharacterCountInputProps) {
  const currentLength = String(value || '').length;

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        {...props}
      />
      <span
        className={cn(
          'absolute bottom-2 right-2 text-xs',
          currentLength > maxLength * 0.9
            ? 'text-red-500'
            : 'text-slate-400 dark:text-slate-500'
        )}
      >
        {currentLength}/{maxLength}
      </span>
    </div>
  );
}
