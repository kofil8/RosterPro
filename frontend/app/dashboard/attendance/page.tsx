"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Plus } from "lucide-react";
import apiClient from "@/lib/api";
import { Attendance, AttendanceStatus } from "@/types";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function AttendancePage() {
  const { user } = useAuthStore();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const loadAttendances = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== "all") {
        params.status = filter.toUpperCase();
      }
      // Employees can only see their own attendance
      if (user?.role === "EMPLOYEE") {
        // Filter handled by backend
      }
      const response = await apiClient.getAttendances(params);
      if (response.success) {
        setAttendances(response.data || []);
      } else {
        setAttendances([]);
      }
    } catch (error) {
      console.error("Failed to load attendances:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    loadAttendances();
  }, [loadAttendances]);

  const handleApprove = async (id: string) => {
    try {
      const response = await apiClient.approveAttendance(id);
      if (response.success) {
        loadAttendances();
      }
    } catch (error) {
      console.error("Failed to approve attendance:", error);
      alert("Failed to approve attendance");
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className='px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className='px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'>
            Rejected
          </span>
        );
      default:
        return (
          <span className='px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800'>
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHours = (hours?: number) => {
    if (!hours) return "N/A";
    return `${hours.toFixed(2)} hrs`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Attendance</h1>
          <p className='text-gray-600 mt-1'>
            Track employee clock-in/out times
          </p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
          <Link href='/dashboard/attendance/new'>
            <Button>
              <Plus className='w-4 h-4 mr-2' />
              Record Attendance
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className='flex gap-2 border-b'>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === "pending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === "approved"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === "rejected"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Attendance List */}
      <div className='grid gap-4'>
        {attendances.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <Clock className='w-12 h-12 mx-auto text-gray-400 mb-4' />
              <p className='text-gray-600'>No attendance records found</p>
            </CardContent>
          </Card>
        ) : (
          attendances.map((attendance) => (
            <Card key={attendance.id}>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='font-semibold text-lg'>
                        {attendance.user?.firstName} {attendance.user?.lastName}
                      </h3>
                      {getStatusBadge(attendance.status)}
                    </div>
                    {attendance.shift && (
                      <p className='text-sm text-gray-600 mb-2'>
                        Shift: {attendance.shift.title}
                        {attendance.shift.clientName &&
                          ` - ${attendance.shift.clientName}`}
                      </p>
                    )}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
                      <div>
                        <p className='text-xs text-gray-500'>Clock In</p>
                        <p className='font-medium'>
                          {formatDate(attendance.clockIn)}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Clock Out</p>
                        <p className='font-medium'>
                          {attendance.clockOut
                            ? formatDate(attendance.clockOut)
                            : "Not clocked out"}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Total Hours</p>
                        <p className='font-medium'>
                          {formatHours(attendance.totalHours)}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Break Duration</p>
                        <p className='font-medium'>
                          {attendance.breakDuration.toFixed(2)} hrs
                        </p>
                      </div>
                    </div>
                    {attendance.notes && (
                      <p className='text-sm text-gray-600 mt-3'>
                        <strong>Notes:</strong> {attendance.notes}
                      </p>
                    )}
                  </div>
                  {(user?.role === "ADMIN" || user?.role === "MANAGER") &&
                    attendance.status === "PENDING" && (
                      <div className='flex gap-2 ml-4'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => handleApprove(attendance.id)}
                        >
                          <CheckCircle className='w-4 h-4 mr-1' />
                          Approve
                        </Button>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
