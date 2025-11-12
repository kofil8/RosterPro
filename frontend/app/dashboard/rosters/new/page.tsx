'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRosters } from '@/hooks/useRosters';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

export default function NewRosterPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createRoster, loading, error } = useRosters();
  
  // Protect route - only Admin and Manager can access
  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER) {
      toast.error('You do not have permission to create rosters');
      router.push('/dashboard/rosters');
    }
  }, [user, router]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate dates
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error('Please enter valid dates');
      return;
    }

    if (start >= end) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      // Format dates as ISO strings
      const rosterData = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };

      await createRoster(rosterData);
      toast.success('Roster created successfully!');
      router.push('/dashboard/rosters');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create roster';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/rosters">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Roster</h1>
          <p className="text-gray-600 mt-1">Set up a new schedule for your team</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Roster Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new roster
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., January 2024 Schedule"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional description for this roster..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Roster
                  </>
                )}
              </Button>
              <Link href="/dashboard/rosters" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

