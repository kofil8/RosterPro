'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';
import { Company } from '@/types';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    overtimeMultiplier: 1.5,
    weeklyHoursThreshold: 40,
  });

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      const response = await apiClient.getCompanyStats();
      if (response.success && response.data) {
        setCompany(response.data);
        setSettings({
          overtimeMultiplier: response.data.overtimeMultiplier || 1.5,
          weeklyHoursThreshold: response.data.weeklyHoursThreshold || 40,
        });
      }
    } catch (error) {
      console.error('Failed to load company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanySettings = async () => {
    if (user?.role !== 'ADMIN') {
      alert('Only admins can update company settings');
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.updateCompanySettings(settings);
      if (response.success) {
        alert('Settings saved successfully');
        loadCompanySettings();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue={user?.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue={user?.lastName} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" defaultValue={user?.phone} />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      {/* Company Settings (Admin Only) */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <Card>
          <CardHeader>
            <CardTitle>Company Payroll Settings</CardTitle>
            <CardDescription>Configure overtime and payroll calculations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overtimeMultiplier">Overtime Multiplier</Label>
                <Input
                  id="overtimeMultiplier"
                  type="number"
                  step="0.1"
                  min="1"
                  max="3"
                  value={settings.overtimeMultiplier}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      overtimeMultiplier: parseFloat(e.target.value) || 1.5,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Multiplier for overtime pay (e.g., 1.5 = time-and-a-half)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyHoursThreshold">Weekly Hours Threshold</Label>
                <Input
                  id="weeklyHoursThreshold"
                  type="number"
                  min="0"
                  max="60"
                  value={settings.weeklyHoursThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weeklyHoursThreshold: parseInt(e.target.value) || 40,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Hours per week before overtime applies
                </p>
              </div>
            </div>
            {user?.role === 'ADMIN' && (
              <Button onClick={handleSaveCompanySettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Company Settings'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

