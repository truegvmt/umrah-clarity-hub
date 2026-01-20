import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Group, calculateBookingStatus, calculatePaperworkStatus, calculateMessagingStatus } from '@/services/dbService';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { StatusBar } from './StatusBar';
import { ProgressIndicator } from './ProgressIndicator';

interface GroupsTableProps {
  groups: Group[];
}

export const GroupsTable = ({ groups }: GroupsTableProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const handleOpenGroup = async (group: Group) => {
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

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t('dashboard.noGroups')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className={isRTL ? 'text-right' : ''}>{t('dashboard.groupName')}</TableHead>
            <TableHead className={isRTL ? 'text-right' : ''}>{t('dashboard.date')}</TableHead>
            <TableHead className="text-center">{t('dashboard.travelers')}</TableHead>
            <TableHead>{t('dashboard.booking')}</TableHead>
            <TableHead>{t('dashboard.paperwork')}</TableHead>
            <TableHead>{t('dashboard.messaging')}</TableHead>
            <TableHead>{t('dashboard.progress')}</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => {
            const bookingPct = calculateBookingStatus(group.travelers);
            const paperworkPct = calculatePaperworkStatus(group.travelers);
            const messagingPct = calculateMessagingStatus(group.travelers);
            const bookingConfirmed = group.travelers.filter(t => t.bookingConfirmed).length;
            const paperworkComplete = group.travelers.filter(t => t.paperworkComplete).length;
            const messageSent = group.travelers.filter(t => t.messageSent).length;

            return (
              <TableRow key={group.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  <div>
                    <p className={isRTL ? 'text-right' : ''}>{group.name}</p>
                    <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{group.id}</p>
                  </div>
                </TableCell>
                <TableCell className={isRTL ? 'text-right' : ''}>{formatDate(group.date)}</TableCell>
                <TableCell className="text-center font-medium">{group.travelers.length}</TableCell>
                <TableCell>
                  <StatusBar
                    percentage={bookingPct}
                    label={t('dashboard.bookingsConfirmed')}
                    completed={bookingConfirmed}
                    total={group.travelers.length}
                  />
                </TableCell>
                <TableCell>
                  <StatusBar
                    percentage={paperworkPct}
                    label={t('dashboard.paperworkComplete')}
                    completed={paperworkComplete}
                    total={group.travelers.length}
                  />
                </TableCell>
                <TableCell>
                  <StatusBar
                    percentage={messagingPct}
                    label={t('dashboard.messagesSent')}
                    completed={messageSent}
                    total={group.travelers.length}
                  />
                </TableCell>
                <TableCell>
                  <ProgressIndicator currentStep={group.currentStep} />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenGroup(group)}
                    className="gap-1"
                  >
                    <span className="hidden sm:inline">{t('dashboard.open')}</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
