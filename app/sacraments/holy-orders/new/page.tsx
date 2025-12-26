// app/sacraments/holy-orders/new/page.tsx - Fixed Holy Orders entry form

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

const holyOrdersSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  orderType: z.enum(['deacon', 'priest', 'bishop'], {
    message: 'Please select an order type',
  }),
  ordinationDate: z.string().min(1, 'Ordination date is required'),
  ordinationLocation: z.string().min(1, 'Ordination location is required'),
  bishop: z.string().min(1, 'Ordaining bishop is required'),
  incardination: z.string().optional(),
  notes: z.string().optional(),
});

type HolyOrdersFormData = z.infer<typeof holyOrdersSchema>;

export default function NewHolyOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HolyOrdersFormData>({
    resolver: zodResolver(holyOrdersSchema),
  });

  // Debug: Log user data when component mounts
  useEffect(() => {
    console.log('User data:', {
      dioceseId: user?.dioceseId,
      parishId: user?.parishId,
      role: user?.role,
    });

    // Set incardination default if available
    if (user?.dioceseId) {
      setValue('incardination', user.dioceseId);
    }
  }, [user, setValue]);

  // Check if user has required data
  const canSubmit = user?.dioceseId;

  const onSubmit = async (data: HolyOrdersFormData) => {
    // Validate user data before submitting
    if (!user?.dioceseId) {
      toast.error('Missing user diocese information. Please contact your administrator.');
      console.error('Missing user data:', { dioceseId: user?.dioceseId });
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
        parishId: user.parishId || user.dioceseId, // Holy orders typically diocese-level
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth || null,
        orderType: data.orderType,
        ordinationDate: data.ordinationDate,
        ordinationLocation: data.ordinationLocation,
        bishop: data.bishop,
        incardination: data.incardination || user.dioceseId,
        notes: data.notes || null,
      };

      console.log('Submitting payload:', payload);

      const response = await fetch('/api/sacraments/holy-orders', {
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
        toast.success('Holy Orders record created successfully!');
        router.push('/sacraments/holy-orders');
      } else {
        toast.error(result.error || 'Failed to create holy orders record');
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
          href="/sacraments/holy-orders"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Holy Orders
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Record New Ordination</h1>
        <p className="text-gray-600 mt-1">Enter details for a new holy orders sacrament</p>
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
                  Your account is missing diocese information. Please contact your administrator to resolve this issue.
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Diocese ID: {user?.dioceseId || 'Missing'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Details of the person being ordained</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" {...register('middleName')} />
              </div>

              <div>
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
            </div>
          </CardContent>
        </Card>

        {/* Ordination Details */}
        <Card>
          <CardHeader>
            <CardTitle>Ordination Details</CardTitle>
            <CardDescription>Information about the ordination ceremony</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderType">
                  Order Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="orderType"
                  {...register('orderType')}
                  className={`flex h-10 w-full rounded-lg border ${
                    errors.orderType ? 'border-red-500' : 'border-gray-300'
                  } bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select order...</option>
                  <option value="deacon">Deacon</option>
                  <option value="priest">Priest</option>
                  <option value="bishop">Bishop</option>
                </select>
                {errors.orderType && (
                  <p className="text-sm text-red-500 mt-1">{errors.orderType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ordinationDate">
                  Ordination Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ordinationDate"
                  type="date"
                  {...register('ordinationDate')}
                  className={errors.ordinationDate ? 'border-red-500' : ''}
                />
                {errors.ordinationDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.ordinationDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="ordinationLocation">
                Ordination Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ordinationLocation"
                {...register('ordinationLocation')}
                placeholder="St. Augustine Cathedral"
                className={errors.ordinationLocation ? 'border-red-500' : ''}
              />
              {errors.ordinationLocation && (
                <p className="text-sm text-red-500 mt-1">{errors.ordinationLocation.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bishop">
                Ordaining Bishop <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bishop"
                {...register('bishop')}
                placeholder="Most Rev. Montfort Stima"
                className={errors.bishop ? 'border-red-500' : ''}
              />
              {errors.bishop && (
                <p className="text-sm text-red-500 mt-1">{errors.bishop.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Diocese Information */}
        <Card>
          <CardHeader>
            <CardTitle>Diocese Information</CardTitle>
            <CardDescription>Diocese of incardination (assignment)</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="incardination">Diocese of Incardination</Label>
              <Input
                id="incardination"
                {...register('incardination')}
                placeholder="Diocese of Mangochi"
              />
              <p className="text-sm text-gray-500 mt-1">
                The diocese to which the ordained person is assigned
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
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
          <Button type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Ordination Record
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}