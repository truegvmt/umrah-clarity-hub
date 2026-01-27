import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Traveler, Group } from '@/services/dbService';
import type { RiskAssessment } from '@/services/aiService';

// Demo scenario: "Ramadan 2026 - VIP Group" with 8 travelers
export const DEMO_GROUP: Group = {
  id: 'demo-grp-001',
  name: 'Ramadan 2026 - VIP Group',
  agentId: 'demo-agent',
  date: '2026-03-10',
  travelers: [
    { id: 'dt1', name: 'Muhammad Farooq', passport: 'PK9876543', riskScore: 8, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
    { id: 'dt2', name: 'Ayesha Bibi', passport: 'PK8765432', riskScore: 12, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
    { id: 'dt3', name: 'Hassan Ali Khan', passport: 'PK7654321', riskScore: 45, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
    { id: 'dt4', name: 'Fatima Zahra', passport: 'PK6543210', riskScore: 5, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
    { id: 'dt5', name: 'Imran Ahmed', passport: 'SHORT', riskScore: 62, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
    { id: 'dt6', name: 'Zainab Hussain', passport: 'PK5432109', riskScore: 18, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
    { id: 'dt7', name: 'Bilal Malik', passport: 'PK4321098', riskScore: 22, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
    { id: 'dt8', name: 'Maryam Siddiqui', passport: 'PK3210987', riskScore: 7, bookingConfirmed: false, paperworkComplete: false, messageSent: false },
  ],
  currentStep: 1,
  createdAt: '2026-01-15T09:00:00Z',
  updatedAt: '2026-01-15T09:00:00Z',
};

// Demo hotels with availability
export const DEMO_HOTELS = [
  { id: 'h1', name: 'Makkah Towers', city: 'Makkah', capacity: 50, assigned: 42 },
  { id: 'h2', name: 'Al Safwa Hotel', city: 'Makkah', capacity: 30, assigned: 28 },
  { id: 'h3', name: 'Madinah Grand', city: 'Madinah', capacity: 40, assigned: 35 },
];

export type DemoStep = 
  | 'welcome'
  | 'import'
  | 'verify'
  | 'hotels'
  | 'paperwork'
  | 'messaging'
  | 'export'
  | 'complete';

interface DemoContextType {
  isDemoMode: boolean;
  startDemo: () => void;
  endDemo: () => void;
  currentStep: DemoStep;
  setStep: (step: DemoStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  demoGroup: Group;
  updateDemoGroup: (updates: Partial<Group>) => void;
  demoRiskAssessments: RiskAssessment[];
  simulateRiskScoring: () => Promise<void>;
  simulateValidation: () => Promise<{ valid: Traveler[]; flagged: Traveler[] }>;
  simulateMessaging: (travelerId: string) => Promise<void>;
  stepProgress: number;
  totalSteps: number;
}

const STEP_ORDER: DemoStep[] = ['welcome', 'import', 'verify', 'hotels', 'paperwork', 'messaging', 'export', 'complete'];

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentStep, setCurrentStep] = useState<DemoStep>('welcome');
  const [demoGroup, setDemoGroup] = useState<Group>(DEMO_GROUP);
  const [demoRiskAssessments, setDemoRiskAssessments] = useState<RiskAssessment[]>([]);

  const startDemo = useCallback(() => {
    setIsDemoMode(true);
    setCurrentStep('welcome');
    setDemoGroup(DEMO_GROUP);
    setDemoRiskAssessments([]);
  }, []);

  const endDemo = useCallback(() => {
    setIsDemoMode(false);
    setCurrentStep('welcome');
    setDemoGroup(DEMO_GROUP);
    setDemoRiskAssessments([]);
  }, []);

  const setStep = useCallback((step: DemoStep) => {
    setCurrentStep(step);
    // Update group currentStep based on demo step
    const stepMap: Record<DemoStep, number> = {
      welcome: 0,
      import: 1,
      verify: 2,
      hotels: 3,
      paperwork: 4,
      messaging: 5,
      export: 6,
      complete: 6,
    };
    setDemoGroup(prev => ({ ...prev, currentStep: stepMap[step] }));
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [currentStep, setStep]);

  const prevStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setStep(STEP_ORDER[currentIndex - 1]);
    }
  }, [currentStep, setStep]);

  const updateDemoGroup = useCallback((updates: Partial<Group>) => {
    setDemoGroup(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
  }, []);

  // Simulate AI risk scoring with animated progress
  const simulateRiskScoring = useCallback(async () => {
    const assessments: RiskAssessment[] = [];
    
    for (const traveler of demoGroup.travelers) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      
      const reasons: string[] = [];
      let riskScore = traveler.riskScore;
      
      // AI logic simulation
      if (!traveler.passport || traveler.passport.length < 6) {
        reasons.push('⚠️ Invalid passport format detected');
        riskScore = Math.max(riskScore, 50);
      }
      if (!traveler.bookingConfirmed) {
        reasons.push('📋 Booking not yet confirmed');
      }
      if (traveler.name.split(' ').length < 2) {
        reasons.push('⚠️ Full name may be incomplete');
        riskScore += 10;
      }
      if (riskScore < 15) {
        reasons.push('✅ All automated checks passed');
      }

      const riskLevel: 'low' | 'medium' | 'high' = 
        riskScore >= 40 ? 'high' : riskScore >= 20 ? 'medium' : 'low';

      assessments.push({
        travelerId: traveler.id,
        riskScore,
        riskLevel,
        reasons,
      });

      setDemoRiskAssessments([...assessments]);
    }

    return;
  }, [demoGroup.travelers]);

  // Simulate document validation
  const simulateValidation = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const valid: Traveler[] = [];
    const flagged: Traveler[] = [];
    
    demoGroup.travelers.forEach(t => {
      if (t.passport.length < 6 || t.riskScore >= 40) {
        flagged.push(t);
      } else {
        valid.push(t);
      }
    });

    return { valid, flagged };
  }, [demoGroup.travelers]);

  // Simulate WhatsApp message sending
  const simulateMessaging = useCallback(async (travelerId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setDemoGroup(prev => ({
      ...prev,
      travelers: prev.travelers.map(t =>
        t.id === travelerId ? { ...t, messageSent: true } : t
      ),
    }));
  }, []);

  const stepProgress = STEP_ORDER.indexOf(currentStep);
  const totalSteps = STEP_ORDER.length - 1; // Exclude 'complete'

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        startDemo,
        endDemo,
        currentStep,
        setStep,
        nextStep,
        prevStep,
        demoGroup,
        updateDemoGroup,
        demoRiskAssessments,
        simulateRiskScoring,
        simulateValidation,
        simulateMessaging,
        stepProgress,
        totalSteps,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
