// app/sacraments/anointing/new/page.tsx - Anointing of the Sick entry form

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

const anointingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  anointingDate: z.string().min(1, 'Anointing date is required'),
  location: z.string().min(1, 'Location is required'),
  priest: z.string().min(1, 'Priest name is required'),
  reason: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
});

type AnointingFormData = z.infer<typeof anointingSchema>;

export default function NewAnointingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnointingFormData>({
    resolver: zodResolver(anointingSchema),
    defaultValues: {
      location: user?.parishId || '',
    },
  });

  const onSubmit = async (data: AnointingFormData) => {
    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/sacraments/anointing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          dioceseId: user?.dioceseId,
          parishId: user?.parishId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Anointing record created successfully!');
        router.push('/sacraments/anointing');
      } else {
        toast.error(result.error || 'Failed to create anointing record');
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
          href="/sacraments/anointing"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Anointing Records
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Record Anointing of the Sick</h1>
        <p className="text-gray-600 mt-1">Enter details for an anointing sacrament</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Details of the person receiving anointing</CardDescription>
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

        {/* Anointing Details */}
        <Card>
          <CardHeader>
            <CardTitle>Anointing Details</CardTitle>
            <CardDescription>Information about the anointing ceremony</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anointingDate">
                  Anointing Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="anointingDate"
                  type="date"
                  {...register('anointingDate')}
                  className={errors.anointingDate ? 'border-red-500' : ''}
                />
                {errors.anointingDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.anointingDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Church, hospital, or home"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="priest">
                Priest <span className="text-red-500">*</span>
              </Label>
              <Input
                id="priest"
                {...register('priest')}
                placeholder="Fr. John Banda"
                className={errors.priest ? 'border-red-500' : ''}
              />
              {errors.priest && (
                <p className="text-sm text-red-500 mt-1">{errors.priest.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medical/Reason Information */}
        <Card>
          <CardHeader>
            <CardTitle>Reason & Condition</CardTitle>
            <CardDescription>Context for the anointing (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Anointing</Label>
              <select
                id="reason"
                {...register('reason')}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select reason...</option>
                <option value="serious_illness">Serious Illness</option>
                <option value="old_age">Old Age</option>
                <option value="before_surgery">Before Surgery</option>
                <option value="critical_condition">Critical Condition</option>
                <option value="chronic_disease">Chronic Disease</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="condition">Medical Condition (Optional)</Label>
              <Input
                id="condition"
                {...register('condition')}
                placeholder="Brief description of condition"
              />
              <p className="text-sm text-gray-500 mt-1">
                This information is confidential and for pastoral care records only
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Anointing Record
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}