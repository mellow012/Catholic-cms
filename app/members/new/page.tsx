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

const memberSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name required'),
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  baptized: z.boolean(),
  confirmed: z.boolean(),
  married: z.boolean(),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function NewMemberPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      baptized: false,
      confirmed: false,
      married: false,
    },
  });

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/members', {
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
        toast.success('Member added successfully!');
        router.push('/members');
      } else {
        toast.error(result.error || 'Failed to add member');
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
        <Link href="/members" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Members
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Member</h1>
        <p className="text-gray-600 mt-1">Create a new member profile</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
              </div>
              <div>
                <Label htmlFor="placeOfBirth">Place of Birth</Label>
                <Input id="placeOfBirth" {...register('placeOfBirth')} />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  {...register('gender')}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} placeholder="+265..." />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Church Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="baptized" {...register('baptized')} className="w-4 h-4" />
              <Label htmlFor="baptized">Baptized</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="confirmed" {...register('confirmed')} className="w-4 h-4" />
              <Label htmlFor="confirmed">Confirmed</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="married" {...register('married')} className="w-4 h-4" />
              <Label htmlFor="married">Married</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              id="notes"
              {...register('notes')}
              className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes..."
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
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
                Add Member
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}