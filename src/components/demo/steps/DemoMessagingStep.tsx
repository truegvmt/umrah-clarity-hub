import { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemo } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MESSAGE_TEMPLATES } from '@/services/messageService';

type MessageStatus = 'pending' | 'sending' | 'sent' | 'failed';

interface TravelerMessage {
  travelerId: string;
  status: MessageStatus;
  template: string;
}

export const DemoMessagingStep = () => {
  const { language, isRTL } = useLanguage();
  const { demoGroup, demoRiskAssessments } = useDemo();
  const [messages, setMessages] = useState<TravelerMessage[]>([]);
  const [selectedTemplate] = useState(MESSAGE_TEMPLATES[0].id);

  useEffect(() => {
    // Initialize message states
    const initialMessages = demoGroup.travelers.map(t => ({
      travelerId: t.id,
      status: 'pending' as MessageStatus,
      template: selectedTemplate,
    }));
    setMessages(initialMessages);

    // Auto-start sending animation after delay
    const timer = setTimeout(() => {
      simulateBatchSend();
    }, 1500);

    return () => clearTimeout(timer);
  }, [demoGroup.travelers, selectedTemplate]);

  const simulateBatchSend = () => {
    demoGroup.travelers.forEach((t, i) => {
      // Mark as sending
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.travelerId === t.id ? { ...m, status: 'sending' } : m
        ));
      }, i * 400);

      // Mark as sent (or failed for high-risk)
      setTimeout(() => {
        const assessment = demoRiskAssessments.find(a => a.travelerId === t.id);
        const shouldFail = assessment?.riskLevel === 'high' && Math.random() > 0.5;
        
        setMessages(prev => prev.map(m => 
          m.travelerId === t.id 
            ? { ...m, status: shouldFail ? 'failed' : 'sent' } 
            : m
        ));
      }, i * 400 + 600);
    });
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sent': return <CheckCheck className="h-4 w-4 text-green-500" />;
      case 'sending': return <Send className="h-4 w-4 text-primary animate-pulse" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: MessageStatus) => {
    switch (status) {
      case 'sent': return <Badge variant="secondary" className="bg-green-500/10 text-green-600">Sent</Badge>;
      case 'sending': return <Badge variant="secondary">Sending...</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const sentCount = messages.filter(m => m.status === 'sent').length;
  const failedCount = messages.filter(m => m.status === 'failed').length;
  const pendingCount = messages.filter(m => m.status === 'pending' || m.status === 'sending').length;

  const currentTemplate = MESSAGE_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          {language === 'ur' ? 'واٹس ایپ میسجنگ' : 'WhatsApp Messaging'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ur'
            ? 'پہلے سے بنے ہوئے ٹیمپلیٹس کے ساتھ بیچ میسجز بھیجیں۔ ڈیلیوری کی حیثیت ٹریک ہوتی ہے۔'
            : 'Send batch messages with pre-built templates. Delivery status is tracked automatically.'}
        </p>
      </div>

      {/* Template preview */}
      <Card className="bg-green-500/5 border-green-500/30">
        <CardContent className="p-4">
          <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {language === 'ur' ? currentTemplate?.nameUr : currentTemplate?.name}
            </span>
          </div>
          <div className="bg-background rounded-lg p-3 text-sm border">
            <p className={isRTL ? 'text-right' : ''}>
              {language === 'ur' ? currentTemplate?.contentUr : currentTemplate?.content}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600">
          <CheckCheck className="h-3 w-3" />
          {sentCount} {language === 'ur' ? 'بھیجے گئے' : 'Sent'}
        </Badge>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Send className="h-3 w-3 animate-pulse" />
            {pendingCount} {language === 'ur' ? 'بھیجے جا رہے ہیں' : 'Sending'}
          </Badge>
        )}
        {failedCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {failedCount} {language === 'ur' ? 'ناکام' : 'Failed'}
          </Badge>
        )}
      </div>

      {/* Message list */}
      <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
        {messages.map((msg) => {
          const traveler = demoGroup.travelers.find(t => t.id === msg.travelerId);
          const assessment = demoRiskAssessments.find(a => a.travelerId === msg.travelerId);
          
          return (
            <div 
              key={msg.travelerId}
              className={`
                p-3 flex items-center justify-between
                ${msg.status === 'sending' ? 'bg-primary/5' : ''}
                ${msg.status === 'failed' ? 'bg-red-500/5' : ''}
                ${isRTL ? 'flex-row-reverse' : ''}
              `}
            >
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {getStatusIcon(msg.status)}
                <div>
                  <div className="font-medium text-sm">{traveler?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {assessment?.riskLevel === 'high' && (
                      <span className="text-amber-600">
                        {language === 'ur' ? 'ترجیحی' : 'Priority'} • 
                      </span>
                    )}
                    {language === 'ur' ? 'واٹس ایپ' : 'WhatsApp'}
                  </div>
                </div>
              </div>
              {getStatusBadge(msg.status)}
            </div>
          );
        })}
      </div>

      {/* Retry failed messages */}
      {failedCount > 0 && (
        <Button variant="outline" className="w-full gap-2">
          <Send className="h-4 w-4" />
          {language === 'ur' 
            ? `${failedCount} ناکام پیغامات دوبارہ بھیجیں`
            : `Retry ${failedCount} failed messages`}
        </Button>
      )}

      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm">
        <strong className="text-green-600">{language === 'ur' ? '✅ ٹپ:' : '✅ Tip:'}</strong>{' '}
        {language === 'ur'
          ? 'ہائی رسک مسافرین کو ترجیحی پیغامات خودکار بھیجے جاتے ہیں۔'
          : 'High-risk travelers automatically receive priority messaging.'}
      </div>
    </div>
  );
};
