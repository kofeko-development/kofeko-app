import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';
import { ModalRouteCleanup } from '@/components/modal-route-cleanup';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Kofeko',
  description: 'AI-Powered Recruitment Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} font-body antialiased`}>
        <AuthProvider>
          <ModalRouteCleanup />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
