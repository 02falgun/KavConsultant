'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('CRITICAL: Fatal root exception caught:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 space-y-6 bg-slate-50 dark:bg-slate-950">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full text-rose-600 dark:text-rose-400">
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
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Critical System Failure
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              A fatal boundary was triggered in the core layout framework. The application crashed during root processing.
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => reset()} className="px-6 h-10 font-bold shadow-md bg-indigo-600 hover:bg-indigo-700 text-white">
              Recover System
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
