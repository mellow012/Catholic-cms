// app/events/create/page.tsx - Create event form

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContexts';
import { getAuthToken } from '@/lib/authHelpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { EVENT_TYPES } from '@/lib/constants';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Event type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean(),
  location: z.string().min(1, 'Location is required'),
  requiresRSVP: z.boolean(),
  maxAttendees: z.string().optional(),
  resources: z.string().optional(),
  notes: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      allDay: false,
      requiresRSVP: false,
    },
  });

  const allDay = watch('allDay');
  const requiresRSVP = watch('requiresRSVP');

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Combine date and time
      let startDateTime = data.startDate;
      if (!data.allDay && data.startTime) {
        startDateTime = `${data.startDate}T${data.startTime}`;
      }

      let endDateTime = data.endDate || data.startDate;
      if (!data.allDay && data.endTime) {
        endDateTime = `${data.endDate || data.startDate}T${data.endTime}`;
      }

      // Parse resources
      const resourcesArray = data.resources
        ? data.resources.split(',').map(r => r.trim()).filter(Boolean)
        : [];

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          startDate: startDateTime,
          endDate: endDateTime,
          maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
          resources: resourcesArray,
          dioceseId: user?.dioceseId,
          parishId: user?.parishId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Event created successfully!');
        router.push('/events');
      } else {
        toast.error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Events
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-1">Schedule a mass, retreat, meeting, or other event</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>Basic details about the event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Sunday Mass, Youth Retreat, Parish Meeting..."
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide details about the event..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">
                  Event Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="type"
                  {...register('type')}
                  className={`flex h-10 w-full rounded-lg border ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  } bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select type...</option>
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="St. Augustine Cathedral"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time */}
        <Card>
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
            <CardDescription>When the event will take place</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                {...register('allDay')}
                className="w-4 h-4"
              />
              <Label htmlFor="allDay">All-day event</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
                )}
              </div>

              {!allDay && (
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" {...register('startTime')} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" {...register('endDate')} />
              </div>

              {!allDay && (
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" {...register('endTime')} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RSVP Settings */}
        <Card>
          <CardHeader>
            <CardTitle>RSVP Settings</CardTitle>
            <CardDescription>Manage attendance and registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresRSVP"
                {...register('requiresRSVP')}
                className="w-4 h-4"
              />
              <Label htmlFor="requiresRSVP">Require RSVP for this event</Label>
            </div>

            {requiresRSVP && (
              <div>
                <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  {...register('maxAttendees')}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Equipment or rooms needed</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="resources">Resources Needed</Label>
              <Input
                id="resources"
                {...register('resources')}
                placeholder="Main Hall, Projector, Sound System (separate with commas)"
              />
              <p className="text-sm text-gray-500 mt-1">
                List any rooms, equipment, or resources needed for this event
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                {...register('notes')}
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes or special instructions"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}