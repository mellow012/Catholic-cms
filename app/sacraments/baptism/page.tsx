// app/sacraments/baptism/page.tsx - Baptism list page

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContexts';
import { useRBAC } from '@/lib/hooks/useRBAC';
import { getAuthToken } from '@/lib/authHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Download, FileText, Calendar, MapPin, User } from 'lucide-react';
import Link from 'next/link';

interface Baptism {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  baptismType: 'infant' | 'adult';
  date: string;
  location: string;
  officiantName: string;
  parishId: string;
  approved: boolean;
  createdAt: string;
}

export default function BaptismsPage() {
  const { user } = useAuth();
  const { can } = useRBAC();
  const [baptisms, setBaptisms] = useState<Baptism[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBaptisms();
  }, [user]);

  const fetchBaptisms = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const params = new URLSearchParams({
        dioceseId: user?.dioceseId || '',
        limit: '50',
      });

      if (user?.parishId) {
        params.append('parishId', user.parishId);
      }

      const response = await fetch(`/api/sacraments/baptism?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setBaptisms(data.data);
      }
    } catch (error) {
      console.error('Error fetching baptisms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBaptisms = baptisms.filter((baptism) => {
    const fullName = `${baptism.firstName} ${baptism.middleName || ''} ${baptism.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || baptism.location.toLowerCase().includes(search);
  });

  if (loading) {
    return <PageLoading message="Loading baptism records..." />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Baptism Records</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all baptism sacraments in your {user?.clearanceLevel}
          </p>
        </div>

        {can('CREATE_SACRAMENT') && (
          <Link href="/sacraments/baptism/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Baptism
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Baptisms</p>
                <p className="text-2xl font-bold">{baptisms.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Infant Baptisms</p>
                <p className="text-2xl font-bold">
                  {baptisms.filter((b) => b.baptismType === 'infant').length}
                </p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Adult Baptisms</p>
                <p className="text-2xl font-bold">
                  {baptisms.filter((b) => b.baptismType === 'adult').length}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">
                  {baptisms.filter((b) => {
                    const date = new Date(b.date);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Baptism List */}
      {filteredBaptisms.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={FileText}
              title="No baptism records found"
              description={
                searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by recording your first baptism'
              }
              action={
                can('CREATE_SACRAMENT')
                  ? {
                      label: 'Record Baptism',
                      onClick: () => window.location.href = '/sacraments/baptism/new',
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Baptism Records ({filteredBaptisms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredBaptisms.map((baptism) => (
                <Link
                  key={baptism.id}
                  href={`/sacraments/baptism/${baptism.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {baptism.firstName} {baptism.middleName} {baptism.lastName}
                        </h3>
                        <Badge variant={baptism.baptismType === 'infant' ? 'default' : 'secondary'}>
                          {baptism.baptismType}
                        </Badge>
                        <Badge variant={baptism.approved ? 'default' : 'destructive'}>
                          {baptism.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(baptism.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {baptism.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {baptism.officiantName}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}