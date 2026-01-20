import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Group, calculateBookingStatus, calculatePaperworkStatus, calculateMessagingStatus, calculateAverageRisk } from '@/services/dbService';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { StatusBar } from './StatusBar';
import { ProgressIndicator } from './ProgressIndicator';

interface GroupCardProps {
  group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const handleOpenGroup = async () => {
    if (user) {
      await auditService.logGroupOpen(user.id, user.email || 'unknown', group.id, group.name);
    }
    navigate(`/group/${group.id}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ur-PK' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const bookingPct = calculateBookingStatus(group.travelers);
  const paperworkPct = calculatePaperworkStatus(group.travelers);
  const messagingPct = calculateMessagingStatus(group.travelers);
  const avgRisk = calculateAverageRisk(group.travelers);

  const getRiskColor = (risk: number) => {
    if (risk <= 20) return 'text-green-600 dark:text-green-400';
    if (risk <= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-lg truncate ${isRTL ? 'text-right' : ''}`}>
              {group.name}
            </CardTitle>
            <p className={`text-xs text-muted-foreground mt-1 ${isRTL ? 'text-right' : ''}`}>
              {group.id}
            </p>
          </div>
          <div className={`text-xs font-medium ${getRiskColor(avgRisk)} bg-muted px-2 py-1 rounded`}>
            {t('dashboard.risk')}: {avgRisk}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meta Info */}
        <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="h-4 w-4" />
            <span>{formatDate(group.date)}</span>
          </div>
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Users className="h-4 w-4" />
            <span>{group.travelers.length} {t('dashboard.travelers')}</span>
          </div>
        </div>

        {/* Status Bars */}
        <div className="space-y-2">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs text-muted-foreground">{t('dashboard.booking')}</span>
            <StatusBar
              percentage={bookingPct}
              label={t('dashboard.bookingsConfirmed')}
              completed={group.travelers.filter(t => t.bookingConfirmed).length}
              total={group.travelers.length}
            />
          </div>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs text-muted-foreground">{t('dashboard.paperwork')}</span>
            <StatusBar
              percentage={paperworkPct}
              label={t('dashboard.paperworkComplete')}
              completed={group.travelers.filter(t => t.paperworkComplete).length}
              total={group.travelers.length}
            />
          </div>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs text-muted-foreground">{t('dashboard.messaging')}</span>
            <StatusBar
              percentage={messagingPct}
              label={t('dashboard.messagesSent')}
              completed={group.travelers.filter(t => t.messageSent).length}
              total={group.travelers.length}
            />
          </div>
        </div>

        {/* Progress */}
        <div className={`flex items-center justify-between pt-2 border-t border-border ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-muted-foreground">{t('dashboard.progress')}</span>
          <ProgressIndicator currentStep={group.currentStep} />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleOpenGroup} className="w-full gap-2">
          {t('dashboard.openGroup')}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
