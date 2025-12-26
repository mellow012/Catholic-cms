// app/sacraments/baptism/new/page.tsx - Fixed Baptism entry form

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

const baptismSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', '']).optional(),
  baptismType: z.enum(['infant', 'adult']),
  baptismDate: z.string().min(1, 'Baptism date is required'),
  location: z.string().min(1, 'Location is required'),
  officiantName: z.string().min(1, 'Officiant name is required'),
  registryNumber: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  godfather: z.string().optional(),
  godfatherParish: z.string().optional(),
  godmother: z.string().optional(),
  godmotherParish: z.string().optional(),
  witnesses: z.string().optional(),
  notes: z.string().optional(),
});

type BaptismFormData = z.infer<typeof baptismSchema>;

export default function NewBaptismPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BaptismFormData>({
    resolver: zodResolver(baptismSchema),
    defaultValues: {
      baptismType: 'infant',
    },
  });

  // Debug: Log user data when component mounts
  useEffect(() => {
    console.log('User data:', {
      dioceseId: user?.dioceseId,
      parishId: user?.parishId,
      role: user?.role,
    });

    // Set location default if available
    if (user?.parishId) {
      setValue('location', user.parishId);
    }
  }, [user, setValue]);

  // Check if user has required data
  const canSubmit = user?.dioceseId && user?.parishId;

  const onSubmit = async (data: BaptismFormData) => {
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

      // Split witnesses string into array
      const witnessesArray = data.witnesses
        ? data.witnesses.split(',').map(w => w.trim()).filter(Boolean)
        : [];

      // Prepare payload
      const payload = {
        dioceseId: user.dioceseId,
        parishId: user.parishId,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth || null,
        placeOfBirth: data.placeOfBirth || null,
        gender: data.gender || null,
        baptismType: data.baptismType,
        baptismDate: data.baptismDate, // API expects this field name
        location: data.location,
        officiantName: data.officiantName,
        registryNumber: data.registryNumber || null,
        fatherName: data.fatherName || null,
        motherName: data.motherName || null,
        godfather: data.godfather || null,
        godfatherParish: data.godfatherParish || null,
        godmother: data.godmother || null,
        godmotherParish: data.godmotherParish || null,
        witnesses: witnessesArray,
        notes: data.notes || null,
      };

      console.log('Submitting payload:', payload);

      const response = await fetch('/api/sacraments/baptism', {
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
        toast.success('Baptism record created successfully!');
        router.push('/sacraments/baptism');
      } else {
        toast.error(result.error || 'Failed to create baptism record');
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
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/sacraments/baptism"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Baptisms
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Record New Baptism</h1>
        <p className="text-gray-600 mt-1">Enter details for a new baptism sacrament</p>
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
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Details of the person being baptized</CardDescription>
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
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Baptism Details */}
        <Card>
          <CardHeader>
            <CardTitle>Baptism Details</CardTitle>
            <CardDescription>Information about the baptism ceremony</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baptismType">
                  Baptism Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="baptismType"
                  {...register('baptismType')}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="infant">Infant Baptism</option>
                  <option value="adult">Adult Baptism</option>
                </select>
              </div>

              <div>
                <Label htmlFor="baptismDate">
                  Baptism Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="baptismDate"
                  type="date"
                  {...register('baptismDate')}
                  className={errors.baptismDate ? 'border-red-500' : ''}
                />
                {errors.baptismDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.baptismDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">
                  Church/Location <span className="text-red-500">*</span>
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

              <div>
                <Label htmlFor="officiantName">
                  Officiant (Priest) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="officiantName"
                  {...register('officiantName')}
                  placeholder="Fr. John Banda"
                  className={errors.officiantName ? 'border-red-500' : ''}
                />
                {errors.officiantName && (
                  <p className="text-sm text-red-500 mt-1">{errors.officiantName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="registryNumber">Registry/Book Number</Label>
              <Input
                id="registryNumber"
                {...register('registryNumber')}
                placeholder="Book 5, Page 123"
              />
            </div>
          </CardContent>
        </Card>

        {/* Parents Information */}
        <Card>
          <CardHeader>
            <CardTitle>Parents Information</CardTitle>
            <CardDescription>Details of the parents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input id="fatherName" {...register('fatherName')} />
              </div>

              <div>
                <Label htmlFor="motherName">Mother's Name</Label>
                <Input id="motherName" {...register('motherName')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Godparents */}
        <Card>
          <CardHeader>
            <CardTitle>Godparents</CardTitle>
            <CardDescription>Sponsors for the baptism</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="godfather">Godfather's Name</Label>
                <Input id="godfather" {...register('godfather')} />
              </div>

              <div>
                <Label htmlFor="godfatherParish">Godfather's Parish</Label>
                <Input id="godfatherParish" {...register('godfatherParish')} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="godmother">Godmother's Name</Label>
                <Input id="godmother" {...register('godmother')} />
              </div>

              <div>
                <Label htmlFor="godmotherParish">Godmother's Parish</Label>
                <Input id="godmotherParish" {...register('godmotherParish')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="witnesses">Witnesses</Label>
              <Input
                id="witnesses"
                {...register('witnesses')}
                placeholder="Separate multiple witnesses with commas"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: Mary Phiri, John Mwale
              </p>
            </div>

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
                Save Baptism Record
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}