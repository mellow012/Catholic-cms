// app/dashboard/layout.tsx - Dashboard layout with navigation

'use client';

import { NavSidebar } from './../components/NavSidebar';
import { CompactFooter } from './../components/Footer';
import { RoleGuard } from './../components/RoleGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard redirectTo="/auth/sign-in">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <NavSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-64">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <CompactFooter />
        </div>
      </div>
    </RoleGuard>
  );
}