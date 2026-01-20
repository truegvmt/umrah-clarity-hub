// Database Service - Mock implementation for local-first PWA
// In production, this would connect to local SQLite via better-sqlite3 or sql.js

export interface Traveler {
  id: string;
  name: string;
  passport: string;
  riskScore: number;
  bookingConfirmed: boolean;
  paperworkComplete: boolean;
  messageSent: boolean;
}

export interface Group {
  id: string;
  name: string;
  agentId: string;
  date: string;
  travelers: Traveler[];
  currentStep: number; // 1-6
  createdAt: string;
  updatedAt: string;
}

// Mock data for demonstration
const mockGroups: Group[] = [
  {
    id: 'grp-001',
    name: 'Ramadan 2026 - Batch A',
    agentId: 'agent-1',
    date: '2026-03-15',
    travelers: [
      { id: 't1', name: 'Ahmad Khan', passport: 'PK1234567', riskScore: 15, bookingConfirmed: true, paperworkComplete: true, messageSent: true },
      { id: 't2', name: 'Fatima Ali', passport: 'PK2345678', riskScore: 8, bookingConfirmed: true, paperworkComplete: true, messageSent: false },
      { id: 't3', name: 'Omar Hassan', passport: 'PK3456789', riskScore: 42, bookingConfirmed: true, paperworkComplete: false, messageSent: false },
      { id: 't4', name: 'Aisha Begum', passport: 'PK4567890', riskScore: 5, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
    ],
    currentStep: 4,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-18T14:30:00Z',
  },
  {
    id: 'grp-002',
    name: 'Spring Umrah - Family Group',
    agentId: 'agent-1',
    date: '2026-04-20',
    travelers: [
      { id: 't5', name: 'Yusuf Ahmed', passport: 'PK5678901', riskScore: 12, bookingConfirmed: true, paperworkComplete: true, messageSent: true },
      { id: 't6', name: 'Maryam Siddiqui', passport: 'PK6789012', riskScore: 7, bookingConfirmed: true, paperworkComplete: true, messageSent: true },
    ],
    currentStep: 6,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-19T11:00:00Z',
  },
  {
    id: 'grp-003',
    name: 'Corporate Umrah - Tech Corp',
    agentId: 'agent-1',
    date: '2026-05-10',
    travelers: [
      { id: 't7', name: 'Bilal Malik', passport: 'PK7890123', riskScore: 25, bookingConfirmed: true, paperworkComplete: false, messageSent: false },
      { id: 't8', name: 'Zainab Hussain', passport: 'PK8901234', riskScore: 18, bookingConfirmed: true, paperworkComplete: false, messageSent: false },
      { id: 't9', name: 'Imran Shah', passport: 'PK9012345', riskScore: 55, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
      { id: 't10', name: 'Saira Qureshi', passport: 'PK0123456', riskScore: 10, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
      { id: 't11', name: 'Hamza Raza', passport: 'PK1234560', riskScore: 32, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
    ],
    currentStep: 2,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-17T16:45:00Z',
  },
];

// Simulated localStorage persistence
const STORAGE_KEY = 'umrahops_groups';

const getStoredGroups = (): Group[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockGroups));
  return mockGroups;
};

const saveGroups = (groups: Group[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

export const dbService = {
  getGroups: async (agentId: string): Promise<Group[]> => {
    // Simulate async DB call
    await new Promise(resolve => setTimeout(resolve, 300));
    const groups = getStoredGroups();
    return groups.filter(g => g.agentId === agentId || agentId === 'agent-1'); // Demo: return all for agent-1
  },

  getGroup: async (groupId: string): Promise<Group | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const groups = getStoredGroups();
    return groups.find(g => g.id === groupId) || null;
  },

  updateGroup: async (groupId: string, updates: Partial<Group>): Promise<Group | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const groups = getStoredGroups();
    const index = groups.findIndex(g => g.id === groupId);
    if (index === -1) return null;
    
    groups[index] = { ...groups[index], ...updates, updatedAt: new Date().toISOString() };
    saveGroups(groups);
    return groups[index];
  },

  createGroup: async (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const groups = getStoredGroups();
    const newGroup: Group = {
      ...group,
      id: `grp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    groups.push(newGroup);
    saveGroups(groups);
    return newGroup;
  },
};

// Helper functions for status calculations
export const calculateBookingStatus = (travelers: Traveler[]): number => {
  if (travelers.length === 0) return 0;
  const confirmed = travelers.filter(t => t.bookingConfirmed).length;
  return Math.round((confirmed / travelers.length) * 100);
};

export const calculatePaperworkStatus = (travelers: Traveler[]): number => {
  if (travelers.length === 0) return 0;
  const complete = travelers.filter(t => t.paperworkComplete).length;
  return Math.round((complete / travelers.length) * 100);
};

export const calculateMessagingStatus = (travelers: Traveler[]): number => {
  if (travelers.length === 0) return 0;
  const sent = travelers.filter(t => t.messageSent).length;
  return Math.round((sent / travelers.length) * 100);
};

export const calculateAverageRisk = (travelers: Traveler[]): number => {
  if (travelers.length === 0) return 0;
  const totalRisk = travelers.reduce((sum, t) => sum + t.riskScore, 0);
  return Math.round(totalRisk / travelers.length);
};
