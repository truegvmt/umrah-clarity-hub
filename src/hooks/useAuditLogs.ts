import { useState, useEffect, useCallback } from 'react';
import { auditService, AuditEntry } from '@/services/auditService';

export interface AuditFilters {
  search?: string;
  actionType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const useAuditLogs = (agentId: string, filters: AuditFilters = {}) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLogs = useCallback(() => {
    try {
      setLoading(true);
      let allLogs = auditService.getLogs(500);

      // Filter by agent if needed (currently logs don't filter by agent in mock)
      // In production, this would be a backend query

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        allLogs = allLogs.filter(
          (log) =>
            log.action.toLowerCase().includes(searchLower) ||
            log.resource.toLowerCase().includes(searchLower) ||
            log.resourceId?.toLowerCase().includes(searchLower) ||
            log.userEmail.toLowerCase().includes(searchLower) ||
            JSON.stringify(log.details || {}).toLowerCase().includes(searchLower)
        );
      }

      // Filter by action type
      if (filters.actionType && filters.actionType !== 'all') {
        allLogs = allLogs.filter((log) => log.action === filters.actionType);
      }

      // Filter by date range
      if (filters.dateFrom) {
        allLogs = allLogs.filter(
          (log) => new Date(log.timestamp) >= filters.dateFrom!
        );
      }
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        allLogs = allLogs.filter(
          (log) => new Date(log.timestamp) <= endOfDay
        );
      }

      setLogs(allLogs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
    } finally {
      setLoading(false);
    }
  }, [agentId, filters.search, filters.actionType, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Get unique action types for filter dropdown
  const actionTypes = Array.from(
    new Set(auditService.getLogs(500).map((log) => log.action))
  ).sort();

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
    actionTypes,
  };
};
