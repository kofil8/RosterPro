"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/lib/api";
import { Roster, Shift } from "@/types";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ViewRosterPage() {
  const router = useRouter();
  const params = useParams();
  const rosterId = params?.id as string;

  const [roster, setRoster] = useState<Roster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoster = useCallback(async () => {
    if (!rosterId) return;

    try {
      setError(null);
      const response = await apiClient.getRosterById(rosterId);
      if (response.success && response.data) {
        setRoster(response.data);
      } else {
        setError(response.error || "Failed to load roster");
      }
    } catch (error: any) {
      console.error("Failed to load roster:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to load roster";
      setError(errorMessage);

      // Redirect to login if unauthorized
      if (error.response?.status === 401) {
        router.push("/login");
        return;
      }

      // Redirect to rosters list if not found
      if (error.response?.status === 404) {
        router.push("/dashboard/rosters");
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [rosterId, router]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-12 h-12 animate-spin text-blue-600' />
      </div>
    );
  }

  if (error || !roster) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Link href='/dashboard/rosters'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Roster Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <AlertCircle className='w-12 h-12 text-red-400 mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Error loading roster</h3>
            <p className='text-gray-600 mb-4'>{error || "Roster not found"}</p>
            <Link href='/dashboard/rosters'>
              <Button>Back to Rosters</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shifts = roster.shifts || [];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/dashboard/rosters'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>{roster.title}</h1>
            <p className='text-gray-600 mt-1'>
              {format(new Date(roster.startDate), "MMM d, yyyy")} -{" "}
              {format(new Date(roster.endDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              roster.isPublished
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {roster.isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {/* Roster Details */}
      <Card>
        <CardHeader>
          <CardTitle>Roster Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {roster.description && (
            <div>
              <h3 className='text-sm font-medium text-gray-600 mb-1'>
                Description
              </h3>
              <p className='text-gray-900'>{roster.description}</p>
            </div>
          )}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h3 className='text-sm font-medium text-gray-600 mb-1'>
                Start Date
              </h3>
              <p className='text-gray-900 flex items-center gap-2'>
                <Calendar className='w-4 h-4' />
                {format(new Date(roster.startDate), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-600 mb-1'>
                End Date
              </h3>
              <p className='text-gray-900 flex items-center gap-2'>
                <Calendar className='w-4 h-4' />
                {format(new Date(roster.endDate), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-600 mb-1'>
              Total Shifts
            </h3>
            <p className='text-gray-900'>
              {shifts.length} shift{shifts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <div className='text-center py-12'>
              <Clock className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No shifts yet</h3>
              <p className='text-gray-600 mb-4'>
                Add shifts to this roster to get started
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {shifts.map((shift: Shift) => (
                <div
                  key={shift.id}
                  className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg mb-2'>
                        {shift.title}
                      </h3>
                      {shift.description && (
                        <p className='text-sm text-gray-600 mb-3'>
                          {shift.description}
                        </p>
                      )}
                      <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
                        <div className='flex items-center gap-2'>
                          <Clock className='w-4 h-4' />
                          <span>
                            {format(new Date(shift.startTime), "MMM d, h:mm a")}{" "}
                            - {format(new Date(shift.endTime), "h:mm a")}
                          </span>
                        </div>
                        {shift.location && (
                          <div className='flex items-center gap-2'>
                            <MapPin className='w-4 h-4' />
                            <span>{shift.location}</span>
                          </div>
                        )}
                        {shift.assignedUser && (
                          <div className='flex items-center gap-2'>
                            <User className='w-4 h-4' />
                            <span>
                              {shift.assignedUser.firstName}{" "}
                              {shift.assignedUser.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                      {shift.clientName && (
                        <div className='mt-3 pt-3 border-t'>
                          <p className='text-sm font-medium text-gray-700 mb-1'>
                            Client: {shift.clientName}
                          </p>
                          {shift.clientNotes && (
                            <p className='text-sm text-gray-600'>
                              <span className='font-medium'>Care Notes: </span>
                              {shift.clientNotes}
                            </p>
                          )}
                        </div>
                      )}
                      {shift.notes && (
                        <div className='mt-3 pt-3 border-t'>
                          <p className='text-sm text-gray-600'>
                            <span className='font-medium'>Notes: </span>
                            {shift.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className='ml-4'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          shift.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : shift.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-700"
                            : shift.status === "CANCELED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {shift.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
