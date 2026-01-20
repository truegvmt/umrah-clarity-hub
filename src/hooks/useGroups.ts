import { useState, useEffect, useCallback } from 'react';
import { dbService, Group } from '@/services/dbService';

interface UseGroupsOptions {
  agentId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseGroupsReturn {
  groups: Group[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useGroups = ({ 
  agentId, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: UseGroupsOptions): UseGroupsReturn => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    try {
      const data = await dbService.getGroups(agentId);
      setGroups(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Auto-refresh on interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchGroups, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchGroups]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'umrahops_groups') {
        fetchGroups();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    refresh: fetchGroups,
  };
};
