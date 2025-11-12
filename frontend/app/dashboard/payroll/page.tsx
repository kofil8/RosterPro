'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PoundSterling, Plus, CheckCircle, FileText, Download } from 'lucide-react';
import apiClient from '@/lib/api';
import { Payroll, PayrollStatus, User } from '@/types';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function PayrollPage() {
  const { user } = useAuthStore();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending_approval' | 'approved' | 'paid'>('all');

  useEffect(() => {
    loadPayrolls();
  }, [filter]);

  const loadPayrolls = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter.toUpperCase();
      }
      const response = await apiClient.getPayrolls(params);
      if (response.success) {
        setPayrolls(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await apiClient.approvePayroll(id);
      if (response.success) {
        loadPayrolls();
      }
    } catch (error) {
      console.error('Failed to approve payroll:', error);
      alert('Failed to approve payroll');
    }
  };

  const getStatusBadge = (status: PayrollStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Paid
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Approved
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
            Pending Approval
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Draft
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canManagePayroll = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';
  const canApprove = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-gray-600 mt-1">Manage employee payroll and payments</p>
        </div>
        <div className="flex gap-2">
          {canManagePayroll && (
            <>
              <Link href="/dashboard/payroll/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Payroll
                </Button>
              </Link>
              <Link href="/dashboard/payroll/generate">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate from Attendance
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {['all', 'draft', 'pending_approval', 'approved', 'paid'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              filter === status
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Payroll List */}
      <div className="grid gap-4">
        {payrolls.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <PoundSterling className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No payroll records found</p>
            </CardContent>
          </Card>
        ) : (
          payrolls.map((payroll) => (
            <Card key={payroll.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {payroll.user?.firstName} {payroll.user?.lastName}
                      </h3>
                      {getStatusBadge(payroll.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Period: {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Regular Hours</p>
                        <p className="font-medium">{payroll.regularHours.toFixed(2)} hrs</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Overtime Hours</p>
                        <p className="font-medium">{payroll.overtimeHours.toFixed(2)} hrs</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hourly Rate</p>
                        <p className="font-medium">{formatCurrency(payroll.hourlyRate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Net Pay</p>
                        <p className="font-bold text-lg text-green-600">
                          {formatCurrency(payroll.netPay)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Regular Pay</p>
                        <p className="font-medium">{formatCurrency(payroll.regularPay)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Overtime Pay</p>
                        <p className="font-medium">{formatCurrency(payroll.overtimePay)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Bonuses</p>
                        <p className="font-medium">{formatCurrency(payroll.bonuses)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Deductions</p>
                        <p className="font-medium text-red-600">
                          -{formatCurrency(payroll.deductions)}
                        </p>
                      </div>
                    </div>
                    {payroll.notes && (
                      <p className="text-sm text-gray-600 mt-3">
                        <strong>Notes:</strong> {payroll.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {canApprove && payroll.status === 'PENDING_APPROVAL' && (
                      <Button size="sm" onClick={() => handleApprove(payroll.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {canManagePayroll && (
                      <Link href={`/dashboard/payroll/${payroll.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

