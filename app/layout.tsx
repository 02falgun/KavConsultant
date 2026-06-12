import type { ReactNode } from 'react';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
