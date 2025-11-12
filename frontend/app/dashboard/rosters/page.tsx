'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Eye, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Roster, UserRole } from '@/types';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';

export default function RostersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user can create rosters (Admin or Manager only)
  const canCreateRoster = user && (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER);

  useEffect(() => {
    loadRosters();
  }, []);

  const loadRosters = async () => {
    try {
      setError(null);
      const response = await apiClient.getRosters();
      if (response.success && response.data) {
        // API returns { rosters: [...], pagination: {...} }
        const rostersArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data.rosters || []);
        setRosters(rostersArray);
      } else {
        setError(response.error || 'Failed to load rosters');
      }
    } catch (error: any) {
      console.error('Failed to load rosters:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load rosters';
      setError(errorMessage);
      
      // Redirect to login if unauthorized
      if (error.response?.status === 401) {
        router.push('/login');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rosters</h1>
            <p className="text-gray-600 mt-1">Manage your team schedules</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading rosters</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadRosters}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rosters</h1>
          <p className="text-gray-600 mt-1">Manage your team schedules</p>
        </div>
        {canCreateRoster && (
          <Link href="/dashboard/rosters/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Roster
            </Button>
          </Link>
        )}
      </div>

      {rosters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rosters yet</h3>
            <p className="text-gray-600 mb-4">
              {canCreateRoster 
                ? "Create your first roster to get started" 
                : "No rosters available"}
            </p>
            {canCreateRoster && (
              <Link href="/dashboard/rosters/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Roster
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(rosters) && rosters.map((roster) => (
            <RosterCard key={roster.id} roster={roster} />
          ))}
        </div>
      )}
    </div>
  );
}

function RosterCard({ roster }: { roster: Roster }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{roster.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(roster.startDate), 'MMM d')} - {format(new Date(roster.endDate), 'MMM d, yyyy')}
            </p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            roster.isPublished 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {roster.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {roster.description && (
          <p className="text-sm text-gray-600 mb-4">{roster.description}</p>
        )}
        <div className="flex gap-2">
          <Link href={`/dashboard/rosters/${roster.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

