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
import { EmptyState } from '../components/EmptyState';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Calendar, MapPin, Users, Clock } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  type: string;
  startDate: string;
  endDate?: string;
  location: string;
  requiresRSVP: boolean;
  maxAttendees?: number;
  attendees: string[];
}

export default function EventsPage() {
  const { user } = useAuth();
  const { can } = useRBAC();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const params = new URLSearchParams({
        dioceseId: user?.dioceseId || '',
      });

      if (user?.parishId) {
        params.append('parishId', user.parishId);
      }

      const response = await fetch(`/api/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group events: upcoming vs past
  const now = new Date();
  const upcomingEvents = filteredEvents.filter(e => new Date(e.startDate) >= now);
  const pastEvents = filteredEvents.filter(e => new Date(e.startDate) < now);

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mass: 'bg-green-100 text-green-800',
      retreat: 'bg-blue-100 text-blue-800',
      feast: 'bg-yellow-100 text-yellow-800',
      meeting: 'bg-purple-100 text-purple-800',
      sacrament: 'bg-pink-100 text-pink-800',
      fundraiser: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  if (loading) {
    return <PageLoading message="Loading events..." />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events & Calendar</h1>
          <p className="text-gray-600 mt-1">Manage parish events, masses, and activities</p>
        </div>
        <div className="flex gap-3">
          <Link href="/events/calendar">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
          </Link>
          {can('CREATE_EVENT') && (
            <Link href="/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => {
                    const date = new Date(e.startDate);
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">With RSVP</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.requiresRSVP).length}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
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
              placeholder="Search events by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upcoming Events ({upcomingEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming events"
              description="Create a new event to get started"
              action={
                can('CREATE_EVENT')
                  ? {
                      label: 'Create Event',
                      onClick: () => window.location.href = '/events/create',
                    }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type.replace('_', ' ')}
                          </Badge>
                          {event.requiresRSVP && (
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              {event.attendees.length}
                              {event.maxAttendees && `/${event.maxAttendees}`}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Events ({pastEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastEvents.slice(0, 5).map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex items-center gap-6 text-sm text-gray-600 mt-1">
                          <span>{formatDate(event.startDate)}</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
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