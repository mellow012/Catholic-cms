// app/layout.tsx - Root layout with providers

import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContexts';
import { Toaster } from 'react-hot-toast';
import { ConditionalLayout } from './components/ConditionalLayouts';

const inter = Inter({ subsets: ['latin'] });
const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Malawi Catholic CMS',
  description: 'Church Management System for the Catholic Church in Malawi',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}