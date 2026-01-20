import { useState } from 'react';
import { MessageCircle, Send, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Traveler } from '@/services/dbService';
import type { RiskAssessment } from '@/services/aiService';
import { messageService, MESSAGE_TEMPLATES, type MessageStatus } from '@/services/messageService';

interface MessagingTabProps {
  travelers: Traveler[];
  riskAssessments: RiskAssessment[];
  groupDate: string;
  onUpdateTraveler: (travelerId: string, updates: Partial<Traveler>) => Promise<void>;
}

export const MessagingTab = ({ travelers, riskAssessments, groupDate, onUpdateTraveler }: MessagingTabProps) => {
  const { t, isRTL, language } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome');
  const [messageStatuses, setMessageStatuses] = useState<Record<string, MessageStatus>>({});

  const getRiskLevel = (travelerId: string): 'low' | 'medium' | 'high' => {
    const risk = riskAssessments.find(r => r.travelerId === travelerId);
    return risk?.riskLevel || 'low';
  };

  const getStatusIcon = (status: MessageStatus | undefined) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handlePrepareMessage = (traveler: Traveler) => {
    const template = messageService.getTemplate(selectedTemplate);
    if (!template) return;

    // Prepare message with variables
    const message = messageService.prepareMessage(
      template,
      { date: groupDate, hotel: 'Al Marwa Rayhaan', checkin: groupDate, checkout: groupDate },
      language
    );

    // Mock phone number (would come from traveler data)
    const phone = '+92300' + Math.random().toString().slice(2, 9);

    // Open WhatsApp
    messageService.openWhatsApp(phone, message);

    // Update status to pending
    setMessageStatuses(prev => ({ ...prev, [traveler.id]: 'pending' }));
    messageService.updateMessageStatus(traveler.id, phone, selectedTemplate, 'pending');
  };

  const handleMarkSent = async (traveler: Traveler) => {
    setMessageStatuses(prev => ({ ...prev, [traveler.id]: 'sent' }));
    await onUpdateTraveler(traveler.id, { messageSent: true });
    
    const phone = '+92300' + Math.random().toString().slice(2, 9);
    messageService.updateMessageStatus(traveler.id, phone, selectedTemplate, 'sent');
  };

  const handleMarkFailed = (travelerId: string) => {
    setMessageStatuses(prev => ({ ...prev, [travelerId]: 'failed' }));
    
    const phone = '+92300' + Math.random().toString().slice(2, 9);
    messageService.updateMessageStatus(travelerId, phone, selectedTemplate, 'failed');
  };

  // Sort by risk priority
  const sortedTravelers = [...travelers].sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    return riskOrder[getRiskLevel(a.id)] - riskOrder[getRiskLevel(b.id)];
  });

  const stats = {
    sent: travelers.filter(t => t.messageSent).length,
    pending: Object.values(messageStatuses).filter(s => s === 'pending').length,
    notSent: travelers.filter(t => !t.messageSent && messageStatuses[t.id] !== 'pending').length,
  };

  return (
    <div className="space-y-6">
      {/* Template selector */}
      <div className={`flex items-center gap-4 p-4 bg-muted/50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
        <MessageCircle className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <label className="text-sm font-medium">{t('group.selectTemplate')}</label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESSAGE_TEMPLATES.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {language === 'ur' ? template.nameUr : template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{t('group.messagesSummary')}</p>
          <p className="text-lg font-bold">
            {stats.sent}/{travelers.length} {t('group.sent')}
          </p>
        </div>
      </div>

      {/* Messages table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('group.name')}</TableHead>
              <TableHead>{t('group.template')}</TableHead>
              <TableHead className="text-center">{t('group.status')}</TableHead>
              <TableHead className="text-center">{t('group.priority')}</TableHead>
              <TableHead className="text-right">{t('group.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTravelers.map(traveler => {
              const status = traveler.messageSent ? 'sent' : messageStatuses[traveler.id];
              const riskLevel = getRiskLevel(traveler.id);
              
              return (
                <TableRow key={traveler.id}>
                  <TableCell>
                    <span className="font-medium">{traveler.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {language === 'ur' 
                        ? MESSAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.nameUr 
                        : MESSAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-sm">
                        {status === 'sent' ? t('group.sent') : 
                         status === 'pending' ? t('group.pending') : 
                         status === 'failed' ? t('group.failed') : 
                         t('group.notSent')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'secondary' : 'outline'}
                    >
                      {riskLevel === 'high' ? t('group.highPriority') : 
                       riskLevel === 'medium' ? t('group.mediumPriority') : 
                       t('group.lowPriority')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center justify-end gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {!traveler.messageSent && status !== 'sent' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePrepareMessage(traveler)}
                            className="gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {t('group.openWhatsApp')}
                          </Button>
                          {status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleMarkSent(traveler)}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                {t('group.markSent')}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleMarkFailed(traveler.id)}
                              >
                                {t('group.markFailed')}
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      {traveler.messageSent && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {t('group.delivered')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
