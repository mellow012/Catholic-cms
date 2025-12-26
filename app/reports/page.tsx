'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContexts';
import { getAuthToken } from '@/lib/authHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(
        `/api/reports/sacraments?dioceseId=${user?.dioceseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View statistics and generate reports</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Sacrament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats?.baptism || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Baptisms</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats?.confirmation || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Confirmations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats?.marriage || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Marriages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats?.holy_orders || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Holy Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-600">{stats?.anointing || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Anointings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <CardTitle>Sacrament Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Detailed statistics on all sacraments by type, date, and parish</p>
            <Button variant="outline" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <CardTitle>Attendance Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Event attendance and RSVP statistics</p>
            <Button variant="outline" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-600" />
              <CardTitle>Member Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Demographics and member statistics</p>
            <Button variant="outline" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}