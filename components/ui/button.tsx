import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { Spinner } from '@/components/ui/spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

export function Button({ className, variant = 'default', size = 'default', loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950',
        variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100',
        variant === 'outline' && 'border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
        variant === 'ghost' && 'hover:bg-slate-100 dark:hover:bg-slate-800',
        size === 'default' && 'h-10 px-4 py-2',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'lg' && 'h-11 px-8',
        size === 'icon' && 'h-9 w-9 p-0',
        className
      )}
      {...props}
    >
      {loading ? <Spinner className={cn('h-4 w-4', size !== 'icon' && children ? 'mr-2' : '')} /> : null}
      {children}
    </button>
  );
}
