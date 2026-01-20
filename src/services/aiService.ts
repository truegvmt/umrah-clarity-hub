// AI Service - Risk scoring for travelers
// Uses OPENAI_API_KEY from .env for batch risk assessment

import type { Traveler } from './dbService';

export interface RiskAssessment {
  travelerId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

// Mock AI risk scoring (in production, calls OpenAI API)
export const aiService = {
  assessTravelerRisk: async (traveler: Traveler): Promise<RiskAssessment> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const reasons: string[] = [];
    let baseScore = 0;

    // Check for missing/incomplete data
    if (!traveler.passport || traveler.passport.length < 6) {
      reasons.push('Invalid or missing passport number');
      baseScore += 25;
    }

    if (!traveler.bookingConfirmed) {
      reasons.push('Booking not confirmed');
      baseScore += 20;
    }

    if (!traveler.paperworkComplete) {
      reasons.push('Paperwork incomplete');
      baseScore += 20;
    }

    if (!traveler.messageSent) {
      reasons.push('Traveler not notified');
      baseScore += 10;
    }

    // Use existing risk score if available
    const finalScore = traveler.riskScore > 0 ? traveler.riskScore : baseScore;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (finalScore >= 40) riskLevel = 'high';
    else if (finalScore >= 20) riskLevel = 'medium';

    if (reasons.length === 0) {
      reasons.push('All checks passed');
    }

    return {
      travelerId: traveler.id,
      riskScore: finalScore,
      riskLevel,
      reasons,
    };
  },

  batchAssessRisk: async (travelers: Traveler[]): Promise<RiskAssessment[]> => {
    // Process in parallel for efficiency
    const assessments = await Promise.all(
      travelers.map(t => aiService.assessTravelerRisk(t))
    );
    return assessments;
  },

  getRiskLevelColor: (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'muted';
    }
  },

  getRiskLevelLabel: (level: 'low' | 'medium' | 'high', language: 'en' | 'ur' = 'en'): string => {
    const labels = {
      en: { high: 'High', medium: 'Medium', low: 'Low' },
      ur: { high: 'ہائی', medium: 'میڈیم', low: 'لو' },
    };
    return labels[language][level];
  },
};
