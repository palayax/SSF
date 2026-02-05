import { cn } from '@/utils/cn';
import { useThemeStore } from '@/store';
import { Tooltip } from './Tooltip';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeToggleProps {
  /** Size of the toggle */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class name */
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

/**
 * Theme Toggle Button
 *
 * Cycles through light -> dark -> auto modes
 */
export function ThemeToggle({ size = 'md', className }: ThemeToggleProps) {
  const { mode, setMode } = useThemeStore();

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  const tooltipContent = {
    light: 'Switch to dark mode',
    dark: 'Switch to auto mode',
    auto: 'Switch to light mode',
  };

  const icons = {
    light: (
      <svg
        className={iconSizes[size]}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    dark: (
      <svg
        className={iconSizes[size]}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
    auto: (
      <svg
        className={iconSizes[size]}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  };

  return (
    <Tooltip content={tooltipContent[mode]}>
      <button
        onClick={cycleTheme}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-lg',
          'text-slate-600 dark:text-slate-400',
          'hover:bg-slate-100 dark:hover:bg-slate-800',
          'hover:text-slate-900 dark:hover:text-slate-100',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-forensic-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
          sizeStyles[size],
          className
        )}
        aria-label={`Current theme: ${mode}. Click to change.`}
      >
        {icons[mode]}
      </button>
    </Tooltip>
  );
}

/**
 * Theme Mode Indicator
 *
 * Shows the current theme mode with a label
 */
interface ThemeModeIndicatorProps {
  className?: string;
}

export function ThemeModeIndicator({ className }: ThemeModeIndicatorProps) {
  const { mode, effectiveTheme } = useThemeStore();

  const modeLabels: Record<ThemeMode, string> = {
    light: 'Light',
    dark: 'Dark',
    auto: `Auto (${effectiveTheme})`,
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400',
        className
      )}
    >
      <span className="capitalize">{modeLabels[mode]}</span>
    </div>
  );
}
