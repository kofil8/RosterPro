import { useState } from 'react';
import apiClient from '@/lib/api';
import { Shift } from '@/types';

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadShifts = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getShifts(params);
      if (response.success) {
        setShifts(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const createShift = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createShift(data);
      if (response.success) {
        await loadShifts();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create shift');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateShift = async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateShift(id, data);
      if (response.success) {
        await loadShifts();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update shift');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteShift = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteShift(id);
      await loadShifts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete shift');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignShift = async (id: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.assignShift(id, userId);
      await loadShifts();
    } catch (err: any) {
      setError(err.message || 'Failed to assign shift');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    shifts,
    loading,
    error,
    loadShifts,
    createShift,
    updateShift,
    deleteShift,
    assignShift,
  };
}

