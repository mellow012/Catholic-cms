// app/sacraments/page.tsx - Sacraments overview page

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRBAC } from '@/lib/hooks/useRBAC';
import { Database, Plus, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { SACRAMENT_TYPES } from '@/lib/constants';

export default function SacramentsPage() {
  const { can } = useRBAC();

  const sacramentCards = [
    { type: 'baptism', count: 1247, thisMonth: 42, icon: '💧' },
    { type: 'confirmation', count: 856, thisMonth: 18, icon: '🕊️' },
    { type: 'eucharist', count: 923, thisMonth: 35, icon: '🍞' },
    { type: 'marriage', count: 234, thisMonth: 12, icon: '💍' },
    { type: 'holy_orders', count: 23, thisMonth: 2, icon: '✝️' },
    { type: 'anointing', count: 156, thisMonth: 8, icon: '🙏' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sacrament Records</h1>
        <p className="text-gray-600 mt-1">
          Manage and view all sacrament records in your parish
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {can('CREATE_SACRAMENT') && (
              <>
                <Link href="/sacraments/baptism/new">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                    <div className="text-2xl">💧</div>
                    <span className="font-medium">Record Baptism</span>
                  </Button>
                </Link>
                <Link href="/sacraments/marriage/new">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                    <div className="text-2xl">💍</div>
                    <span className="font-medium">Record Marriage</span>
                  </Button>
                </Link>
              </>
            )}
            <Link href="/sacraments/search">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Search className="w-6 h-6" />
                <span className="font-medium">Search Records</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Sacrament Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sacramentCards.map((sacrament) => (
          <Link key={sacrament.type} href={`/sacraments/${sacrament.type}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize flex items-center gap-2">
                    <span className="text-2xl">{sacrament.icon}</span>
                    {sacrament.type.replace('_', ' ')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Records</span>
                    <span className="text-2xl font-bold">{sacrament.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">This Month</span>
                    <span className="font-medium text-green-600">+{sacrament.thisMonth}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Records
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Sacraments</CardTitle>
          <CardDescription>Latest recorded sacraments across all types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                  💧
                </div>
                <div>
                  <p className="font-medium">Chikondi Banda - Baptism</p>
                  <p className="text-sm text-gray-500">St. Augustine Cathedral • 2 days ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                  💍
                </div>
                <div>
                  <p className="font-medium">John & Mary Phiri - Marriage</p>
                  <p className="text-sm text-gray-500">St. Patrick Parish • 4 days ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                  🕊️
                </div>
                <div>
                  <p className="font-medium">Limbani Mwale - Confirmation</p>
                  <p className="text-sm text-gray-500">St. Augustine Cathedral • 1 week ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}