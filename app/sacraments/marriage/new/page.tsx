// app/sacraments/marriage/new/page.tsx - Fixed Marriage entry form

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

const marriageSchema = z.object({
  groomFirstName: z.string().min(1, 'Groom first name required'),
  groomLastName: z.string().min(1, 'Groom last name required'),
  groomDateOfBirth: z.string().optional(),
  brideFirstName: z.string().min(1, 'Bride first name required'),
  brideLastName: z.string().min(1, 'Bride last name required'),
  brideDateOfBirth: z.string().optional(),
  marriageDate: z.string().min(1, 'Marriage date required'),
  location: z.string().min(1, 'Location required'),
  officiantName: z.string().min(1, 'Officiant name required'),
  witness1Name: z.string().min(1, 'First witness required'),
  witness2Name: z.string().min(1, 'Second witness required'),
  bannsPublished: z.boolean(),
  bannsDate1: z.string().optional(),
  bannsDate2: z.string().optional(),
  bannsDate3: z.string().optional(),
  premarriageCourseCompleted: z.boolean(),
  civilMarriageDate: z.string().optional(),
  civilRegistryNumber: z.string().optional(),
  notes: z.string().optional(),
});

type MarriageFormData = z.infer<typeof marriageSchema>;

export default function NewMarriagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MarriageFormData>({
    resolver: zodResolver(marriageSchema),
    defaultValues: {
      bannsPublished: false,
      premarriageCourseCompleted: false,
    },
  });

  const bannsPublished = watch('bannsPublished');

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

  const onSubmit = async (data: MarriageFormData) => {
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
        groomFirstName: data.groomFirstName,
        groomLastName: data.groomLastName,
        groomDateOfBirth: data.groomDateOfBirth || null,
        brideFirstName: data.brideFirstName,
        brideLastName: data.brideLastName,
        brideDateOfBirth: data.brideDateOfBirth || null,
        marriageDate: data.marriageDate,
        location: data.location,
        officiantName: data.officiantName,
        witness1Name: data.witness1Name,
        witness2Name: data.witness2Name,
        bannsPublished: data.bannsPublished,
        bannsDate1: data.bannsDate1 || null,
        bannsDate2: data.bannsDate2 || null,
        bannsDate3: data.bannsDate3 || null,
        premarriageCourseCompleted: data.premarriageCourseCompleted,
        civilMarriageDate: data.civilMarriageDate || null,
        civilRegistryNumber: data.civilRegistryNumber || null,
        notes: data.notes || null,
      };

      console.log('Submitting payload:', payload);

      const response = await fetch('/api/sacraments/marriage', {
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
        toast.success('Marriage record created successfully!');
        router.push('/sacraments/marriage');
      } else {
        toast.error(result.error || 'Failed to create marriage record');
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
        <Link href="/sacraments/marriage" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Marriages
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Record New Marriage</h1>
        <p className="text-gray-600 mt-1">Enter details for a new marriage sacrament</p>
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
            <CardTitle>Groom Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groomFirstName">First Name <span className="text-red-500">*</span></Label>
                <Input id="groomFirstName" {...register('groomFirstName')} className={errors.groomFirstName ? 'border-red-500' : ''} />
                {errors.groomFirstName && <p className="text-sm text-red-500 mt-1">{errors.groomFirstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="groomLastName">Last Name <span className="text-red-500">*</span></Label>
                <Input id="groomLastName" {...register('groomLastName')} className={errors.groomLastName ? 'border-red-500' : ''} />
                {errors.groomLastName && <p className="text-sm text-red-500 mt-1">{errors.groomLastName.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="groomDateOfBirth">Date of Birth</Label>
              <Input id="groomDateOfBirth" type="date" {...register('groomDateOfBirth')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bride Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brideFirstName">First Name <span className="text-red-500">*</span></Label>
                <Input id="brideFirstName" {...register('brideFirstName')} className={errors.brideFirstName ? 'border-red-500' : ''} />
                {errors.brideFirstName && <p className="text-sm text-red-500 mt-1">{errors.brideFirstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="brideLastName">Last Name <span className="text-red-500">*</span></Label>
                <Input id="brideLastName" {...register('brideLastName')} className={errors.brideLastName ? 'border-red-500' : ''} />
                {errors.brideLastName && <p className="text-sm text-red-500 mt-1">{errors.brideLastName.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="brideDateOfBirth">Date of Birth</Label>
              <Input id="brideDateOfBirth" type="date" {...register('brideDateOfBirth')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marriage Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marriageDate">Marriage Date <span className="text-red-500">*</span></Label>
                <Input id="marriageDate" type="date" {...register('marriageDate')} className={errors.marriageDate ? 'border-red-500' : ''} />
                {errors.marriageDate && <p className="text-sm text-red-500 mt-1">{errors.marriageDate.message}</p>}
              </div>
              <div>
                <Label htmlFor="location">Church/Location <span className="text-red-500">*</span></Label>
                <Input id="location" {...register('location')} className={errors.location ? 'border-red-500' : ''} />
                {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="officiantName">Officiant (Priest) <span className="text-red-500">*</span></Label>
              <Input id="officiantName" {...register('officiantName')} placeholder="Fr. John Banda" className={errors.officiantName ? 'border-red-500' : ''} />
              {errors.officiantName && <p className="text-sm text-red-500 mt-1">{errors.officiantName.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Witnesses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="witness1Name">First Witness <span className="text-red-500">*</span></Label>
                <Input id="witness1Name" {...register('witness1Name')} className={errors.witness1Name ? 'border-red-500' : ''} />
                {errors.witness1Name && <p className="text-sm text-red-500 mt-1">{errors.witness1Name.message}</p>}
              </div>
              <div>
                <Label htmlFor="witness2Name">Second Witness <span className="text-red-500">*</span></Label>
                <Input id="witness2Name" {...register('witness2Name')} className={errors.witness2Name ? 'border-red-500' : ''} />
                {errors.witness2Name && <p className="text-sm text-red-500 mt-1">{errors.witness2Name.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pre-Marriage Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="bannsPublished" {...register('bannsPublished')} className="w-4 h-4" />
              <Label htmlFor="bannsPublished">Banns were published</Label>
            </div>
            {bannsPublished && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                <div>
                  <Label htmlFor="bannsDate1">First Bann</Label>
                  <Input id="bannsDate1" type="date" {...register('bannsDate1')} />
                </div>
                <div>
                  <Label htmlFor="bannsDate2">Second Bann</Label>
                  <Input id="bannsDate2" type="date" {...register('bannsDate2')} />
                </div>
                <div>
                  <Label htmlFor="bannsDate3">Third Bann</Label>
                  <Input id="bannsDate3" type="date" {...register('bannsDate3')} />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="premarriageCourseCompleted" {...register('premarriageCourseCompleted')} className="w-4 h-4" />
              <Label htmlFor="premarriageCourseCompleted">Pre-marriage course completed</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Civil Marriage (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="civilMarriageDate">Civil Marriage Date</Label>
                <Input id="civilMarriageDate" type="date" {...register('civilMarriageDate')} />
              </div>
              <div>
                <Label htmlFor="civilRegistryNumber">Registry Number</Label>
                <Input id="civilRegistryNumber" {...register('civilRegistryNumber')} />
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
                Save Marriage Record
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}