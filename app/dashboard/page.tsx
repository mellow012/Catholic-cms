// app/dashboard/page.tsx - Main dashboard overview

'use client';

import { useAuth } from '@/lib/contexts/AuthContexts';
import { useRBAC } from '@/lib/hooks/useRBAC';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  FileText,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { can, hasClearance } = useRBAC();

  // Mock data - will be replaced with real data from Firestore
  const stats = {
    sacraments: 1247,
    members: 3842,
    events: 28,
    parishes: user?.clearanceLevel === 'ecm' ? 156 : user?.clearanceLevel === 'diocese' ? 25 : 1,
  };

  const recentSacraments = [
    {
      id: '1',
      type: 'Baptism',
      name: 'Chikondi Banda',
      date: '2024-12-20',
      parish: 'St. Augustine Cathedral',
      status: 'Approved',
    },
    {
      id: '2',
      type: 'Marriage',
      name: 'John & Mary Phiri',
      date: '2024-12-18',
      parish: 'St. Patrick Parish',
      status: 'Pending',
    },
    {
      id: '3',
      type: 'Confirmation',
      name: 'Limbani Mwale',
      date: '2024-12-15',
      parish: 'St. Augustine Cathedral',
      status: 'Approved',
    },
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Christmas Mass',
      type: 'Mass',
      date: '2024-12-25',
      time: '09:00',
      location: 'St. Augustine Cathedral',
      attendees: 500,
    },
    {
      id: '2',
      title: 'Youth Retreat',
      type: 'Retreat',
      date: '2024-12-28',
      time: '14:00',
      location: 'Mangochi Retreat Center',
      attendees: 85,
    },
    {
      id: '3',
      title: 'New Year Vigil Mass',
      type: 'Mass',
      date: '2024-12-31',
      time: '23:00',
      location: 'St. Augustine Cathedral',
      attendees: 350,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.displayName || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role.replace(/_/g, ' ')} - {user?.dioceseId ? user.dioceseId.charAt(0).toUpperCase() + user.dioceseId.slice(1) : 'Malawi'} Diocese
        </p>
      </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sacraments"
            value={stats.sacraments.toLocaleString()}
            icon={<Database className="w-6 h-6" />}
            trend="+12% from last month"
            color="bg-blue-500"
          />
          <StatCard
            title="Members"
            value={stats.members.toLocaleString()}
            icon={<Users className="w-6 h-6" />}
            trend="+8% from last month"
            color="bg-green-500"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.events.toString()}
            icon={<Calendar className="w-6 h-6" />}
            trend="This month"
            color="bg-purple-500"
          />
          <StatCard
            title={hasClearance('diocese') ? 'Parishes' : 'My Parish'}
            value={stats.parishes.toString()}
            icon={<MapPin className="w-6 h-6" />}
            trend={hasClearance('diocese') ? 'In diocese' : 'Active'}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        {(can('CREATE_SACRAMENT') || can('CREATE_EVENT') || can('CREATE_MEMBER')) && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for your role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {can('CREATE_SACRAMENT') && (
                  <QuickActionButton
                    href="/sacraments/baptism/new"
                    icon={<Database className="w-5 h-5" />}
                    label="Record Baptism"
                  />
                )}
                {can('CREATE_SACRAMENT') && (
                  <QuickActionButton
                    href="/sacraments/marriage/new"
                    icon={<Database className="w-5 h-5" />}
                    label="Record Marriage"
                  />
                )}
                  {can('CREATE_EVENT') && (
                  <QuickActionButton
                    href="/events/create"
                    icon={<Calendar className="w-5 h-5" />}
                    label="Create Event"
                  />
                )}
                {can('CREATE_MEMBER') && (
                  <QuickActionButton
                    href="/members/new"
                    icon={<Users className="w-5 h-5" />}
                    label="Add Member"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sacraments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Sacraments</CardTitle>
                <CardDescription>Latest recorded sacraments</CardDescription>
              </div>
              <Link href="/sacraments">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSacraments.map((sacrament) => (
                  <div
                    key={sacrament.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default">{sacrament.type}</Badge>
                        <span className="text-sm font-medium">{sacrament.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(sacrament.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {sacrament.parish}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={sacrament.status === 'Approved' ? 'default' : 'secondary'}
                    >
                      {sacrament.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Next scheduled events</CardDescription>
              </div>
              <Link href="/events">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex flex-col items-center justify-center text-blue-600">
                      <span className="text-xs font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {event.attendees} attendees
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section (for admins) */}
        {hasClearance('deanery') && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Sacraments recorded this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">42</div>
                  <div className="text-sm text-gray-600 mt-1">Baptisms</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">18</div>
                  <div className="text-sm text-gray-600 mt-1">Confirmations</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-gray-600 mt-1">Marriages</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">8</div>
                  <div className="text-sm text-gray-600 mt-1">Holy Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Action Button
function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link href={href}>
      <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </Button>
    </Link>
  );
}