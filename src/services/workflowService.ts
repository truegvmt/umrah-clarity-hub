// Workflow Service - Step Engine for pilgrim progress tracking
// Steps: 1-Import, 2-Verify, 3-Assign Hotels, 4-Paperwork, 5-Messaging, 6-Export

export interface WorkflowStep {
  id: number;
  name: string;
  nameUr: string;
  description: string;
  descriptionUr: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, name: 'Import', nameUr: 'درآمد', description: 'CSV data imported', descriptionUr: 'CSV ڈیٹا درآمد کیا گیا' },
  { id: 2, name: 'Verify', nameUr: 'توثیق', description: 'Data validated', descriptionUr: 'ڈیٹا کی توثیق ہوئی' },
  { id: 3, name: 'Hotels', nameUr: 'ہوٹل', description: 'Hotels assigned', descriptionUr: 'ہوٹل تفویض کیے گئے' },
  { id: 4, name: 'Paperwork', nameUr: 'کاغذات', description: 'Documents prepared', descriptionUr: 'دستاویزات تیار ہیں' },
  { id: 5, name: 'Messaging', nameUr: 'پیغامات', description: 'Pilgrims notified', descriptionUr: 'زائرین کو مطلع کیا گیا' },
  { id: 6, name: 'Export', nameUr: 'ایکسپورٹ', description: 'Ready for departure', descriptionUr: 'روانگی کے لیے تیار' },
];

export const workflowService = {
  getStepInfo: (stepId: number): WorkflowStep | undefined => {
    return WORKFLOW_STEPS.find(s => s.id === stepId);
  },

  getStepName: (stepId: number, language: 'en' | 'ur' = 'en'): string => {
    const step = WORKFLOW_STEPS.find(s => s.id === stepId);
    if (!step) return 'Unknown';
    return language === 'ur' ? step.nameUr : step.name;
  },

  getProgressPercentage: (currentStep: number): number => {
    return Math.round((currentStep / WORKFLOW_STEPS.length) * 100);
  },

  canAdvanceStep: (currentStep: number, bookingPct: number, paperworkPct: number, messagingPct: number): boolean => {
    // Business rules for step advancement
    switch (currentStep) {
      case 1: return true; // Can always move from import
      case 2: return bookingPct >= 80; // 80% bookings needed
      case 3: return bookingPct === 100; // All bookings confirmed
      case 4: return paperworkPct >= 90; // 90% paperwork done
      case 5: return messagingPct >= 80; // 80% messages sent
      default: return false;
    }
  },

  getAllSteps: (): WorkflowStep[] => WORKFLOW_STEPS,
};
