'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContexts';
import { useRBAC } from '@/lib/hooks/useRBAC';
import { getAuthToken } from '@/lib/authHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '../components/Loading';
import { Plus, Search, Users, User } from 'lucide-react';
import Link from 'next/link';

interface Member {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  baptized: boolean;
  confirmed: boolean;
  married: boolean;
}

export default function MembersPage() {
  const { user } = useAuth();
  const { can } = useRBAC();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const params = new URLSearchParams({
        dioceseId: user?.dioceseId || '',
      });

      if (user?.parishId) {
        params.append('parishId', user.parishId);
      }

      const response = await fetch(`/api/members?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName} ${member.middleName || ''} ${member.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || member.email?.toLowerCase().includes(search);
  });

  if (loading) {
    return <PageLoading message="Loading members..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parish Members</h1>
          <p className="text-gray-600 mt-1">Manage member profiles and family records</p>
        </div>
        {can('CREATE_MEMBER') && (
          <Link href="/members/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
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
                <p className="text-sm text-gray-500">Total Members</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Baptized</p>
                <p className="text-2xl font-bold">{members.filter(m => m.baptized).length}</p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold">{members.filter(m => m.confirmed).length}</p>
              </div>
              <User className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Married</p>
                <p className="text-2xl font-bold">{members.filter(m => m.married).length}</p>
              </div>
              <User className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search members by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>All Members ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <Link key={member.id} href={`/members/${member.id}`}>
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.firstName} {member.middleName} {member.lastName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        {member.email && <span>{member.email}</span>}
                        {member.phone && <span>{member.phone}</span>}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {member.baptized && <Badge variant="default">Baptized</Badge>}
                        {member.confirmed && <Badge variant="default">Confirmed</Badge>}
                        {member.married && <Badge variant="secondary">Married</Badge>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}