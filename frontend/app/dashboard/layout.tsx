'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Calendar, Users, Clock, FileText, BarChart3, Settings, LogOut, Menu, PoundSterling, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, loadUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Roster & Payroll</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <NavLink href="/dashboard" icon={<BarChart3 className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink href="/dashboard/rosters" icon={<Calendar className="w-5 h-5" />}>
              Rosters
            </NavLink>
            <NavLink href="/dashboard/team" icon={<Users className="w-5 h-5" />}>
              Team
            </NavLink>
            <NavLink href="/dashboard/attendance" icon={<Clock className="w-5 h-5" />}>
              Attendance
            </NavLink>
            <NavLink href="/dashboard/payroll" icon={<PoundSterling className="w-5 h-5" />}>
              Payroll
            </NavLink>
            <NavLink href="/dashboard/reports" icon={<Download className="w-5 h-5" />}>
              Reports
            </NavLink>
            <NavLink href="/dashboard/settings" icon={<Settings className="w-5 h-5" />}>
              Settings
            </NavLink>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="text-sm text-gray-600">
              {user.email}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        {icon}
        <span className="text-sm font-medium">{children}</span>
      </div>
    </Link>
  );
}

