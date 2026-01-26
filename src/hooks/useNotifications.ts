// Hook for managing real-time toast notifications
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export type NotificationType = 
  | 'traveler_updated'
  | 'booking_confirmed'
  | 'paperwork_complete'
  | 'message_sent'
  | 'group_status_changed'
  | 'csv_imported'
  | 'export_complete'
  | 'error';

interface NotificationOptions {
  travelerName?: string;
  groupName?: string;
  count?: number;
  details?: string;
}

export const useNotifications = () => {
  const { t } = useLanguage();

  const notify = useCallback((type: NotificationType, options: NotificationOptions = {}) => {
    const { travelerName, groupName, count, details } = options;

    switch (type) {
      case 'traveler_updated':
        toast({
          title: t('toast.travelerUpdated'),
          description: travelerName 
            ? t('toast.travelerUpdatedDesc').replace('{name}', travelerName)
            : t('toast.travelerUpdatedDescGeneric'),
        });
        break;
      
      case 'booking_confirmed':
        toast({
          title: t('toast.bookingConfirmed'),
          description: count && count > 1
            ? t('toast.bookingsConfirmedDesc').replace('{count}', String(count))
            : t('toast.bookingConfirmedDesc'),
        });
        break;
      
      case 'paperwork_complete':
        toast({
          title: t('toast.paperworkComplete'),
          description: travelerName
            ? t('toast.paperworkCompleteDesc').replace('{name}', travelerName)
            : t('toast.paperworkCompleteDescGeneric'),
        });
        break;
      
      case 'message_sent':
        toast({
          title: t('toast.messageSent'),
          description: travelerName
            ? t('toast.messageSentDesc').replace('{name}', travelerName)
            : t('toast.messageSentDescGeneric'),
        });
        break;
      
      case 'group_status_changed':
        toast({
          title: t('toast.groupStatusChanged'),
          description: groupName
            ? t('toast.groupStatusChangedDesc').replace('{name}', groupName)
            : t('toast.groupStatusChangedDescGeneric'),
        });
        break;
      
      case 'csv_imported':
        toast({
          title: t('toast.csvImported'),
          description: count
            ? t('toast.csvImportedDesc').replace('{count}', String(count))
            : t('toast.csvImportedDescGeneric'),
        });
        break;
      
      case 'export_complete':
        toast({
          title: t('toast.exportComplete'),
          description: details || t('toast.exportCompleteDesc'),
        });
        break;
      
      case 'error':
        toast({
          title: t('toast.error'),
          description: details || t('toast.errorDesc'),
          variant: 'destructive',
        });
        break;
    }
  }, [t]);

  return { notify };
};
