'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Users, Mail, Phone, AlertCircle, PoundSterling, Building2, CreditCard } from 'lucide-react';
import apiClient from '@/lib/api';
import { User, UserRole } from '@/types';
import { useAuthStore } from '@/store/authStore';

export default function TeamPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: UserRole.EMPLOYEE,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setError(null);
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        // API returns { users: [...], pagination: {...} }
        const usersArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data.users || []);
        setUsers(usersArray);
      } else {
        setError(response.error || 'Failed to load users');
      }
    } catch (error: any) {
      console.error('Failed to load users:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load users';
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

  // Check if user can add members (Admin or Manager only)
  const canAddMember = currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiClient.createUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        role: formData.role,
      });

      if (response.success) {
        // Reset form and close dialog
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          role: UserRole.EMPLOYEE,
        });
        setIsAddMemberOpen(false);
        // Reload users list
        await loadUsers();
      } else {
        setSubmitError(response.error || 'Failed to create member');
      }
    } catch (error: any) {
      console.error('Failed to create member:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create member';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
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
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-gray-600 mt-1">Manage your team</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading team members</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadUsers}>
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
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage your team</p>
        </div>
        {canAddMember && (
          <Button onClick={() => setIsAddMemberOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
            <p className="text-gray-600 mb-4">Add team members to get started</p>
            {canAddMember && (
              <Button onClick={() => setIsAddMemberOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Array.isArray(users) && users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your organization. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+44 123 456 7890"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.role === UserRole.ADMIN ? (
                      <>
                        <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                        <SelectItem value={UserRole.ACCOUNTANT}>Accountant</SelectItem>
                        <SelectItem value={UserRole.EMPLOYEE}>Employee</SelectItem>
                      </>
                    ) : (
                      <SelectItem value={UserRole.EMPLOYEE}>Employee</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {currentUser?.role === UserRole.MANAGER && (
                  <p className="text-xs text-gray-500">Managers can only create employees</p>
                )}
              </div>

              {submitError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {submitError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddMemberOpen(false);
                  setSubmitError(null);
                  setFormData({
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    role: UserRole.EMPLOYEE,
                  });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserCard({ user }: { user: User }) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold text-lg">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {user.role}
                </span>
              </div>
            </div>
            
            {/* Payroll Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <PoundSterling className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Hourly Rate</p>
                  <p className="font-medium">{formatCurrency(user.hourlyRate)}</p>
                </div>
              </div>
              {user.bankAccount && (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Bank Account</p>
                    <p className="font-medium text-sm">{user.bankAccount}</p>
                  </div>
                </div>
              )}
              {user.nationalInsuranceNumber && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">NI Number</p>
                    <p className="font-medium text-sm">{user.nationalInsuranceNumber}</p>
                  </div>
                </div>
              )}
            </div>
            {user.address && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="text-xs text-gray-500">Address</p>
                <p>{user.address}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

