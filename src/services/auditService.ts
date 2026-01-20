// Audit Service - Immutable logging for compliance
// Logs to localStorage with optional remote push to LOG_SERVER_URL

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

const AUDIT_STORAGE_KEY = 'umrahops_audit_logs';
const LOG_SERVER_URL = import.meta.env.VITE_LOG_SERVER_URL;

const getStoredLogs = (): AuditEntry[] => {
  const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveLogs = (logs: AuditEntry[]) => {
  // Keep last 1000 entries to prevent storage bloat
  const trimmed = logs.slice(-1000);
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(trimmed));
};

const pushToRemote = async (entry: AuditEntry) => {
  if (!LOG_SERVER_URL) return;
  
  try {
    await fetch(LOG_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (error) {
    console.warn('Failed to push audit log to remote:', error);
  }
};

export const auditService = {
  log: async (
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>
  ): Promise<AuditEntry> => {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
    };

    const logs = getStoredLogs();
    logs.push(entry);
    saveLogs(logs);

    // Optionally push to remote
    pushToRemote(entry);

    return entry;
  },

  logPageView: async (userId: string, userEmail: string, pageName: string) => {
    return auditService.log(userId, userEmail, 'PAGE_VIEW', 'page', pageName);
  },

  logNavigation: async (userId: string, userEmail: string, from: string, to: string) => {
    return auditService.log(userId, userEmail, 'NAVIGATION', 'route', to, { from, to });
  },

  logGroupOpen: async (userId: string, userEmail: string, groupId: string, groupName: string) => {
    return auditService.log(userId, userEmail, 'GROUP_OPEN', 'group', groupId, { groupName });
  },

  logLogout: async (userId: string, userEmail: string) => {
    return auditService.log(userId, userEmail, 'LOGOUT', 'auth');
  },

  // Simple action logger for hooks (userId as agentId, email defaults)
  logAction: async (action: string, userId: string, details?: Record<string, unknown>) => {
    return auditService.log(userId, '', action.toUpperCase(), 'action', undefined, details);
  },

  logExport: async (userId: string, userEmail: string, groupId: string, format: string) => {
    return auditService.log(userId, userEmail, 'EXPORT', 'group', groupId, { format });
  },

  getLogs: (limit = 100): AuditEntry[] => {
    const logs = getStoredLogs();
    return logs.slice(-limit).reverse();
  },

  clearLogs: () => {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  },
};
