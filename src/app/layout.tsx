import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import ServiceWorkerRegistrar from '@/components/common/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'Employee Wellness App',
  description: 'Comprehensive wellness and health tracking for employees',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-slate-50">
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
