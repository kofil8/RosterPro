import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Roster } from '@/types';

export function useRosters() {
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRosters = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getRosters(params);
      if (response.success && response.data) {
        // API returns { rosters: [...], pagination: {...} }
        const rostersArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data.rosters || []);
        setRosters(rostersArray);
      } else {
        setError(response.error || 'Failed to load rosters');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load rosters';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createRoster = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createRoster(data);
      if (response.success) {
        await loadRosters();
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create roster';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRoster = async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateRoster(id, data);
      if (response.success) {
        await loadRosters();
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update roster';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoster = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteRoster(id);
      await loadRosters();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete roster';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publishRoster = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.publishRoster(id);
      await loadRosters();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to publish roster';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    rosters,
    loading,
    error,
    loadRosters,
    createRoster,
    updateRoster,
    deleteRoster,
    publishRoster,
  };
}

