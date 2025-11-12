'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, AlertCircle, CheckCircle, PoundSterling, FileCheck } from 'lucide-react';
import apiClient from '@/lib/api';
import { DashboardAnalytics, UserRole } from '@/types';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user can create rosters (Admin or Manager only)
  const canCreateRoster = user && (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.getDashboardAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={analytics?.employees?.total || 0}
          subtitle={`${analytics?.employees?.active || 0} active`}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Rosters"
          value={analytics?.rosters?.total || 0}
          subtitle={`${analytics?.rosters?.published || 0} published`}
          icon={<Calendar className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Upcoming Shifts"
          value={analytics?.shifts?.upcoming || 0}
          subtitle={`${analytics?.shifts?.thisWeek || 0} this week`}
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Unassigned Shifts"
          value={analytics?.shifts?.unassigned || 0}
          subtitle="Need attention"
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Attendance & Payroll Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Attendance"
          value={analytics?.attendance?.pending || 0}
          subtitle="Awaiting approval"
          icon={<FileCheck className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          title="Total Payroll Records"
          value={analytics?.payroll?.total || 0}
          subtitle={`${analytics?.payroll?.pendingApproval || 0} pending approval`}
          icon={<PoundSterling className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {canCreateRoster && (
              <QuickActionButton href="/dashboard/rosters/new">
                Create New Roster
              </QuickActionButton>
            )}
            <QuickActionButton href="/dashboard/team">
              Manage Team
            </QuickActionButton>
            <QuickActionButton href="/dashboard/attendance">
              View Attendance
            </QuickActionButton>
            <QuickActionButton href="/dashboard/payroll">
              Manage Payroll
            </QuickActionButton>
            <QuickActionButton href="/dashboard/reports">
              Export Reports
            </QuickActionButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Shifts</span>
              <span className="font-semibold">{analytics?.shifts?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold">{analytics?.shifts?.thisMonth || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Draft Rosters</span>
              <span className="font-semibold">{analytics?.rosters?.draft || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Inactive Employees</span>
              <span className="font-semibold">{analytics?.employees?.inactive || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  subtitle: string; 
  icon: React.ReactNode; 
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'indigo';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block w-full px-4 py-2 text-left rounded-lg border hover:bg-gray-50 transition-colors"
    >
      {children}
    </a>
  );
}

