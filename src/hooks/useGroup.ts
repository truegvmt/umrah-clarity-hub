// Hook for fetching and managing a single group with auto-refresh

import { useState, useEffect, useCallback } from 'react';
import { dbService, Group } from '@/services/dbService';
import { auditService } from '@/services/auditService';
import { aiService, RiskAssessment } from '@/services/aiService';

interface UseGroupResult {
  group: Group | null;
  loading: boolean;
  error: string | null;
  riskAssessments: RiskAssessment[];
  refetch: () => Promise<void>;
  updateTraveler: (travelerId: string, updates: Partial<Group['travelers'][0]>) => Promise<void>;
  batchUpdateTravelers: (updates: { id: string; changes: Partial<Group['travelers'][0]> }[]) => Promise<void>;
}

export const useGroup = (groupId: string | undefined, agentId: string = 'agent-1'): UseGroupResult => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);

  const fetchGroup = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await dbService.getGroup(groupId);
      if (data) {
        setGroup(data);
        
        // Log page view
        auditService.logAction('group_viewed', agentId, {
          groupId,
          groupName: data.name,
          travelerCount: data.travelers.length,
        });

        // Assess risks for all travelers
        const assessments = await aiService.batchAssessRisk(data.travelers);
        setRiskAssessments(assessments);
      } else {
        setError('Group not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch group');
    } finally {
      setLoading(false);
    }
  }, [groupId, agentId]);

  const updateTraveler = useCallback(async (
    travelerId: string,
    updates: Partial<Group['travelers'][0]>
  ) => {
    if (!group) return;

    const updatedTravelers = group.travelers.map(t =>
      t.id === travelerId ? { ...t, ...updates } : t
    );

    const updatedGroup = await dbService.updateGroup(group.id, {
      travelers: updatedTravelers,
    });

    if (updatedGroup) {
      setGroup(updatedGroup);
      
      // Log the update
      auditService.logAction('traveler_updated', agentId, {
        groupId: group.id,
        travelerId,
        updates,
      });

      // Re-assess risk for updated traveler
      const traveler = updatedTravelers.find(t => t.id === travelerId);
      if (traveler) {
        const assessment = await aiService.assessTravelerRisk(traveler);
        setRiskAssessments(prev => 
          prev.map(a => a.travelerId === travelerId ? assessment : a)
        );
      }
    }
  }, [group, agentId]);

  const batchUpdateTravelers = useCallback(async (
    updates: { id: string; changes: Partial<Group['travelers'][0]> }[]
  ) => {
    if (!group) return;

    const updatedTravelers = group.travelers.map(t => {
      const update = updates.find(u => u.id === t.id);
      return update ? { ...t, ...update.changes } : t;
    });

    const updatedGroup = await dbService.updateGroup(group.id, {
      travelers: updatedTravelers,
    });

    if (updatedGroup) {
      setGroup(updatedGroup);
      
      // Log batch update
      auditService.logAction('travelers_batch_updated', agentId, {
        groupId: group.id,
        updateCount: updates.length,
      });

      // Re-assess all risks
      const assessments = await aiService.batchAssessRisk(updatedTravelers);
      setRiskAssessments(assessments);
    }
  }, [group, agentId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  return {
    group,
    loading,
    error,
    riskAssessments,
    refetch: fetchGroup,
    updateTraveler,
    batchUpdateTravelers,
  };
};
