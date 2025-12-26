'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContexts';
import { getAuthToken } from '@/lib/authHelpers';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // Transform for FullCalendar
        const calendarEvents = data.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: event.startDate,
          end: event.endDate || event.startDate,
          allDay: event.allDay,
          backgroundColor: getEventColor(event.type),
          borderColor: getEventColor(event.type),
        }));
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      mass: '#22c55e',
      retreat: '#3b82f6',
      feast: '#f59e0b',
      meeting: '#8b5cf6',
      sacrament: '#ec4899',
      fundraiser: '#10b981',
      other: '#6b7280',
    };
    return colors[type] || colors.other;
  };

  const handleEventClick = (info: any) => {
    router.push(`/events/${info.event.id}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Events List
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Events Calendar</h1>
        <p className="text-gray-600 mt-1">Visual calendar of all parish events</p>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500">Loading calendar...</p>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            editable={false}
            selectable={true}
          />
        )}
      </Card>
    </div>
  );
}