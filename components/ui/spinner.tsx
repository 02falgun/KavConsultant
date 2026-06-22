import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  label?: string;
}

export function Spinner({ className, label, ...props }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label ?? 'Loading'}
      className={cn('h-4 w-4 animate-spin', className)}
      {...props}
    />
  );
}
