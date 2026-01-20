import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Traveler } from '@/services/dbService';
import type { RiskAssessment } from '@/services/aiService';
import { aiService } from '@/services/aiService';
import { useState } from 'react';

interface PaperworkTabProps {
  travelers: Traveler[];
  riskAssessments: RiskAssessment[];
  onUpdateTraveler: (travelerId: string, updates: Partial<Traveler>) => Promise<void>;
  onBatchUpdate: (updates: { id: string; changes: Partial<Traveler> }[]) => Promise<void>;
}

type PaperworkStatus = 'incomplete' | 'in_progress' | 'complete';

export const PaperworkTab = ({ 
  travelers, 
  riskAssessments, 
  onUpdateTraveler,
  onBatchUpdate 
}: PaperworkTabProps) => {
  const { t, isRTL, language } = useLanguage();
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const getRiskAssessment = (travelerId: string): RiskAssessment | undefined => {
    return riskAssessments.find(r => r.travelerId === travelerId);
  };

  const getPaperworkStatus = (traveler: Traveler): PaperworkStatus => {
    if (traveler.paperworkComplete) return 'complete';
    if (traveler.bookingConfirmed) return 'in_progress';
    return 'incomplete';
  };

  const getStatusIcon = (status: PaperworkStatus) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'incomplete': return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusLabel = (status: PaperworkStatus): string => {
    switch (status) {
      case 'complete': return t('group.complete');
      case 'in_progress': return t('group.inProgress');
      case 'incomplete': return t('group.incomplete');
    }
  };

  const filteredTravelers = travelers.filter(t => {
    if (filterRisk === 'all') return true;
    const risk = getRiskAssessment(t.id);
    return risk?.riskLevel === filterRisk;
  });

  const stats = {
    complete: travelers.filter(t => t.paperworkComplete).length,
    inProgress: travelers.filter(t => !t.paperworkComplete && t.bookingConfirmed).length,
    incomplete: travelers.filter(t => !t.paperworkComplete && !t.bookingConfirmed).length,
  };

  const completionPercentage = Math.round((stats.complete / travelers.length) * 100) || 0;

  const handleMarkAllComplete = async () => {
    const updates = filteredTravelers
      .filter(t => !t.paperworkComplete)
      .map(t => ({ id: t.id, changes: { paperworkComplete: true } }));
    await onBatchUpdate(updates);
  };

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <p className="text-sm text-muted-foreground">{t('group.overallProgress')}</p>
                <p className="text-2xl font-bold">{completionPercentage}%</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-80" />
            </div>
            <Progress value={completionPercentage} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardContent className="pt-4">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">{t('group.complete')}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.complete}</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
          <CardContent className="pt-4">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">{t('group.inProgress')}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardContent className="pt-4">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-medium">{t('group.incomplete')}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.incomplete}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and actions */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Select value={filterRisk} onValueChange={(v) => setFilterRisk(v as typeof filterRisk)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('group.filterByRisk')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('dashboard.filterAll')}</SelectItem>
            <SelectItem value="high">{t('group.highRisk')}</SelectItem>
            <SelectItem value="medium">{t('group.mediumRisk')}</SelectItem>
            <SelectItem value="low">{t('group.lowRisk')}</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="sm"
          onClick={handleMarkAllComplete}
          disabled={filteredTravelers.every(t => t.paperworkComplete)}
        >
          {t('group.markAllComplete')}
        </Button>
      </div>

      {/* Kanban-style cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTravelers.map(traveler => {
          const risk = getRiskAssessment(traveler.id);
          const status = getPaperworkStatus(traveler);
          
          return (
            <Card 
              key={traveler.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                status === 'complete' ? 'border-green-200 dark:border-green-900' :
                status === 'in_progress' ? 'border-yellow-200 dark:border-yellow-900' :
                'border-red-200 dark:border-red-900'
              }`}
              onClick={() => onUpdateTraveler(traveler.id, { paperworkComplete: !traveler.paperworkComplete })}
            >
              <CardContent className="pt-4">
                <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <h3 className="font-medium">{traveler.name}</h3>
                    <p className="text-sm text-muted-foreground">{traveler.passport}</p>
                  </div>
                  {getStatusIcon(status)}
                </div>

                <div className={`flex items-center justify-between mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="outline" className="text-xs">
                    {getStatusLabel(status)}
                  </Badge>

                  {risk && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge 
                            variant={risk.riskLevel === 'high' ? 'destructive' : risk.riskLevel === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {aiService.getRiskLevelLabel(risk.riskLevel, language)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <ul className="text-xs list-disc list-inside">
                            {risk.reasons.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
