import { useState } from 'react';
import apiClient from '@/lib/api';
import { User } from '@/types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getUsers(params);
      if (response.success && response.data) {
        // Handle both array and object with users property
        const usersArray = Array.isArray(response.data) 
          ? response.data 
          : response.data.users || [];
        setUsers(usersArray);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createUser(data);
      if (response.success) {
        await loadUsers();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateUser(id, data);
      if (response.success) {
        await loadUsers();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteUser(id);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}

