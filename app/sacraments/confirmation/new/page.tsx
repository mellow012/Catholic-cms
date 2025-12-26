// app/sacraments/confirmation/new/page.tsx - Fixed Confirmation entry form

'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const confirmationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  confirmationDate: z.string().min(1, 'Confirmation date is required'),
  location: z.string().min(1, 'Location is required'),
  bishop: z.string().min(1, 'Bishop name is required'),
  confirmationName: z.string().optional(),
  sponsorName: z.string().optional(),
  sponsorParish: z.string().optional(),
  notes: z.string().optional(),
});

type ConfirmationFormData = z.infer<typeof confirmationSchema>;

export default function NewConfirmationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ConfirmationFormData>({
    resolver: zodResolver(confirmationSchema),
  });

  // Debug: Log user data when component mounts
  useEffect(() => {
    console.log('User data:', {
      dioceseId: user?.dioceseId,
      parishId: user?.parishId,
      role: user?.role,
      clearanceLevel: user?.clearanceLevel,
    });

    // Set location default if available
    if (user?.parishId) {
      setValue('location', user.parishId);
    }
  }, [user, setValue]);

  // Check if user has required data
  const canSubmit = user?.dioceseId && user?.parishId;

  const onSubmit = async (data: ConfirmationFormData) => {
    // Validate user data before submitting
    if (!user?.dioceseId || !user?.parishId) {
      toast.error('Missing user diocese or parish information. Please contact your administrator.');
      console.error('Missing user data:', { dioceseId: user?.dioceseId, parishId: user?.parishId });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Prepare payload with explicit field mapping
      const payload = {
        dioceseId: user.dioceseId,
        parishId: user.parishId,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth || null,
        confirmationDate: data.confirmationDate,
        location: data.location,
        bishop: data.bishop,
        confirmationName: data.confirmationName || null,
        sponsorName: data.sponsorName || null,
        sponsorParish: data.sponsorParish || null,
        notes: data.notes || null,
      };

      console.log('Submitting payload:', payload);

      const response = await fetch('/api/sacraments/confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (result.success) {
        toast.success('Confirmation record created successfully!');
        router.push('/sacraments/confirmation');
      } else {
        toast.error(result.error || 'Failed to create confirmation record');
        console.error('API error:', result);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while creating the record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/sacraments/confirmation"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Confirmations
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Record New Confirmation</h1>
        <p className="text-gray-600 mt-1">Enter details for a new confirmation sacrament</p>
      </div>

      {/* Warning if user data is missing */}
      {!canSubmit && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Missing Required Information</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Your account is missing diocese or parish information. Please contact your administrator to resolve this issue.
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Diocese ID: {user?.dioceseId || 'Missing'} | Parish ID: {user?.parishId || 'Missing'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Details of the person being confirmed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                <Input id="firstName" {...register('firstName')} className={errors.firstName ? 'border-red-500' : ''} />
                {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" {...register('middleName')} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                <Input id="lastName" {...register('lastName')} className={errors.lastName ? 'border-red-500' : ''} />
                {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
              </div>
              <div>
                <Label htmlFor="confirmationName">Confirmation Name (Saint)</Label>
                <Input id="confirmationName" {...register('confirmationName')} placeholder="St. Francis" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confirmation Details</CardTitle>
            <CardDescription>Information about the confirmation ceremony</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="confirmationDate">Confirmation Date <span className="text-red-500">*</span></Label>
                <Input id="confirmationDate" type="date" {...register('confirmationDate')} className={errors.confirmationDate ? 'border-red-500' : ''} />
                {errors.confirmationDate && <p className="text-sm text-red-500 mt-1">{errors.confirmationDate.message}</p>}
              </div>
              <div>
                <Label htmlFor="location">Church/Location <span className="text-red-500">*</span></Label>
                <Input id="location" {...register('location')} className={errors.location ? 'border-red-500' : ''} />
                {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="bishop">Bishop <span className="text-red-500">*</span></Label>
              <Input id="bishop" {...register('bishop')} placeholder="Rt. Rev. Montfort Stima" className={errors.bishop ? 'border-red-500' : ''} />
              {errors.bishop && <p className="text-sm text-red-500 mt-1">{errors.bishop.message}</p>}
              <p className="text-sm text-gray-500 mt-1">Confirmations are typically administered by a bishop</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sponsor Information</CardTitle>
            <CardDescription>Details of the confirmation sponsor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sponsorName">Sponsor's Name</Label>
                <Input id="sponsorName" {...register('sponsorName')} />
              </div>
              <div>
                <Label htmlFor="sponsorParish">Sponsor's Parish</Label>
                <Input id="sponsorParish" {...register('sponsorParish')} />
              </div>
            </div>
          </CardContent>
        </Card>

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
                placeholder="Any additional notes or remarks"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Confirmation Record
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}