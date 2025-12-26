'use client';
// app/sacraments/layout.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRBAC } from "@/lib/hooks/useRBAC";
import { LucideCross, LucideSearch, LucideTreePine, LucideFileText, LucideBaby, LucideBellRing, LucideChurch } from "lucide-react";

export default function SacramentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, hasClearance, hasRole } = useRBAC();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Loading permissions...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-600">Please sign in to access Sacraments Archive.</p>
      </div>
    );
  }

  // Clearance-based visibility
  const canCreateSacraments = hasClearance('parish') || hasClearance('diocese') || hasClearance('ecm');
  const canSearchCrossParish = hasClearance('deanery') || hasClearance('diocese') || hasClearance('ecm');
  const canViewGenealogy = hasClearance('diocese') || hasClearance('ecm');
  const canBulkImport = hasClearance('diocese') || hasClearance('ecm');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <LucideCross className="w-8 h-8 text-blue-600" />
                Sacraments Archive
              </h1>
              <p className="text-gray-600 mt-2">
                Secure, tamper-proof records of the sacred sacraments for the Catholic Church in Malawi.
              </p>
            </div>

            {/* Role-Based Sub-Navigation Tabs */}
            <Tabs defaultValue="dashboard" className="mb-8">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2 bg-gray-100 p-1 rounded-lg flex-wrap">
                <TabsTrigger value="dashboard" asChild>
                  <a href="/sacraments" className="flex items-center gap-2">
                    <LucideFileText className="w-4 h-4" />
                    Overview
                  </a>
                </TabsTrigger>

                {canCreateSacraments && (
                  <>
                    <TabsTrigger value="baptism" asChild>
                      <a href="/sacraments/baptism" className="flex items-center gap-2">
                        <LucideBaby className="w-4 h-4" />
                        Baptism
                      </a>
                    </TabsTrigger>
                    <TabsTrigger value="confirmation" asChild>
                      <a href="/sacraments/confirmation" className="flex items-center gap-2">
                        <LucideCross className="w-4 h-4" />
                        Confirmation
                      </a>
                    </TabsTrigger>
                    <TabsTrigger value="marriage" asChild>
                      <a href="/sacraments/marriage" className="flex items-center gap-2">
                        <LucideBellRing className="w-4 h-4" />
                        Marriage
                      </a>
                    </TabsTrigger>
                    <TabsTrigger value="holy-orders" asChild>
                      <a href="/sacraments/holy-orders" className="flex items-center gap-2">
                        <LucideChurch className="w-4 h-4" />
                        Holy Orders
                      </a>
                    </TabsTrigger>
                  </>
                )}

                {canSearchCrossParish && (
                  <TabsTrigger value="search" asChild>
                    <a href="/sacraments/search" className="flex items-center gap-2">
                      <LucideSearch className="w-4 h-4" />
                      Search Records
                    </a>
                  </TabsTrigger>
                )}

                {canViewGenealogy && (
                  <TabsTrigger value="genealogy" asChild>
                    <a href="/sacraments/genealogy" className="flex items-center gap-2">
                      <LucideTreePine className="w-4 h-4" />
                      Genealogy
                    </a>
                  </TabsTrigger>
                )}

                {canBulkImport && (
                  <TabsTrigger value="bulk-import" asChild>
                    <a href="/sacraments/bulk-import" className="flex items-center gap-2">
                      Bulk Import
                    </a>
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>

            {/* Main Content */}
            <div className="bg-white shadow-lg rounded-xl p-6 lg:p-8 border border-gray-200">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}