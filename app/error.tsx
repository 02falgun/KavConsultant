'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected errors to telemetry console
    console.error('Unhandled UI Exception caught at boundary:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
      <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full text-rose-600 dark:text-rose-450 animate-pulse">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Unexpected Page Failure
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          An error occurred while loading this page. Telemetry has tracked the exception details, and we are working to resolve it.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={() => reset()} className="px-6 h-10 font-semibold shadow-sm">
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/dashboard')}
          className="px-6 h-10 font-semibold"
        >
          Go Dashboard
        </Button>
      </div>
    </div>
  );
}
