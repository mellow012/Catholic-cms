// components/ConditionalLayout.tsx - Conditional header/footer wrapper

'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show header/footer on dashboard pages (they have sidebar)
  const isDashboardPage = pathname?.startsWith('/dashboard');
  const isAuthPage = pathname?.startsWith('/auth');
  
  return (
    <>
      {/* Show header on landing and auth pages, but NOT on dashboard */}
      {!isDashboardPage && <Header showNav={!isAuthPage} />}
      
      {children}
      
      {/* Show footer on landing pages, but NOT on dashboard or auth */}
      {!isDashboardPage && !isAuthPage && <Footer />}
    </>
  );
}