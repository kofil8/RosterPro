'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, Users, PoundSterling, Clock } from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rosterId, setRosterId] = useState('');
  const [importType, setImportType] = useState<'employees' | 'shifts'>('employees');

  const canExport = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'ACCOUNTANT';
  const canImport = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const handleExport = async (type: 'employees' | 'payroll' | 'attendance', params?: any) => {
    setLoading(type);
    try {
      let blob: Blob;
      let filename: string;

      switch (type) {
        case 'employees':
          blob = await apiClient.exportEmployees();
          filename = `employees-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'payroll':
          blob = await apiClient.exportPayroll(params);
          filename = `payroll-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'attendance':
          blob = await apiClient.exportAttendance(params);
          filename = `attendance-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
      }

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
      alert(`Failed to export ${type}. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (importType === 'shifts' && !rosterId) {
      alert('Please enter a roster ID');
      return;
    }

    setLoading(`import-${importType}`);
    try {
      let response;
      if (importType === 'employees') {
        response = await apiClient.importEmployees(file);
      } else {
        response = await apiClient.importShifts(file, rosterId);
      }

      if (response.success) {
        alert(`Successfully imported ${response.data.imported} records. ${response.data.failed} failed.`);
        setFile(null);
        setRosterId('');
      } else {
        alert('Import failed. Please check the file format.');
      }
    } catch (error) {
      console.error('Failed to import:', error);
      alert('Failed to import. Please check the file format and try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Exports</h1>
        <p className="text-gray-600 mt-1">Export data to Excel or import in bulk</p>
      </div>

      {/* Export Section */}
      {canExport && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Export Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Export all employee data including payroll information to Excel
              </p>
              <Button
                onClick={() => handleExport('employees')}
                disabled={loading === 'employees'}
                className="w-full"
              >
                {loading === 'employees' ? (
                  'Exporting...'
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Employees
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PoundSterling className="w-5 h-5" />
                Export Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Export payroll records with calculations for accounting
              </p>
              <Button
                onClick={() => handleExport('payroll')}
                disabled={loading === 'payroll'}
                className="w-full"
              >
                {loading === 'payroll' ? (
                  'Exporting...'
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Payroll
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Export Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Export attendance records for auditing and compliance
              </p>
              <Button
                onClick={() => handleExport('attendance')}
                disabled={loading === 'attendance'}
                className="w-full"
              >
                {loading === 'attendance' ? (
                  'Exporting...'
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Attendance
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Section */}
      {canImport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Import Type</label>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value as 'employees' | 'shifts')}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="employees">Import Employees</option>
                <option value="shifts">Import Shifts</option>
              </select>
            </div>

            {importType === 'shifts' && (
              <div>
                <label className="block text-sm font-medium mb-2">Roster ID</label>
                <input
                  type="text"
                  value={rosterId}
                  onChange={(e) => setRosterId(e.target.value)}
                  placeholder="Enter roster ID"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Excel File</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                {importType === 'employees'
                  ? 'Expected columns: firstName, lastName, email, phone, address, hourlyRate, bankAccount, nationalInsuranceNumber'
                  : 'Expected columns: title, description, startTime, endTime, location, clientName, clientNotes, assignedUserEmail'}
              </p>
            </div>

            <Button
              onClick={handleImport}
              disabled={!file || loading?.startsWith('import')}
              className="w-full"
            >
              {loading?.startsWith('import') ? (
                'Importing...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {importType === 'employees' ? 'Employees' : 'Shifts'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>File Format Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Employee Import Format</h3>
            <p className="text-sm text-gray-600 mb-2">
              Excel file should contain the following columns:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>firstName (required)</li>
              <li>lastName (required)</li>
              <li>email (required, unique)</li>
              <li>phone (optional)</li>
              <li>address (optional)</li>
              <li>hourlyRate (required, number)</li>
              <li>bankAccount (optional)</li>
              <li>nationalInsuranceNumber (optional)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Shift Import Format</h3>
            <p className="text-sm text-gray-600 mb-2">
              Excel file should contain the following columns:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>title (required)</li>
              <li>description (optional)</li>
              <li>startTime (required, ISO format)</li>
              <li>endTime (required, ISO format)</li>
              <li>location (optional)</li>
              <li>clientName (optional)</li>
              <li>clientNotes (optional)</li>
              <li>assignedUserEmail (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

