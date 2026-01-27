import { useState, useEffect } from 'react';
import { FileCheck, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemo } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PaperworkStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

interface TravelerPaperwork {
  travelerId: string;
  passport: PaperworkStatus;
  visa: PaperworkStatus;
  medical: PaperworkStatus;
}

export const DemoPaperworkStep = () => {
  const { language, isRTL } = useLanguage();
  const { demoGroup, demoRiskAssessments } = useDemo();
  const [paperwork, setPaperwork] = useState<TravelerPaperwork[]>([]);

  useEffect(() => {
    // Initialize paperwork status based on risk
    const initialPaperwork = demoGroup.travelers.map((traveler) => {
      return {
        travelerId: traveler.id,
        passport: 'pending' as PaperworkStatus,
        visa: 'pending' as PaperworkStatus,
        medical: 'pending' as PaperworkStatus,
      };
    });
    setPaperwork(initialPaperwork);

    // Animate status updates
    const updateStatus = (index: number) => {
      setPaperwork(prev => prev.map((p, i) => {
        if (i !== index) return p;
        
        const assessment = demoRiskAssessments.find(a => a.travelerId === p.travelerId);
        const isHighRisk = assessment?.riskLevel === 'high';
        
        return {
          ...p,
          passport: isHighRisk ? 'rejected' : 'approved',
          visa: isHighRisk ? 'in_review' : 'approved',
          medical: 'approved',
        };
      }));
    };

    // Stagger animations
    demoGroup.travelers.forEach((_, i) => {
      setTimeout(() => updateStatus(i), 500 + i * 300);
    });
  }, [demoGroup.travelers, demoRiskAssessments]);

  const getStatusIcon = (status: PaperworkStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'in_review': return <Clock className="h-4 w-4 text-amber-500 animate-pulse" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Group by status for Kanban view
  const kanbanColumns = [
    { 
      id: 'pending', 
      title: { en: 'Pending', ur: 'زیر التواء' },
      travelers: paperwork.filter(p => p.passport === 'pending' || p.visa === 'pending'),
    },
    { 
      id: 'in_review', 
      title: { en: 'In Review', ur: 'جائزے میں' },
      travelers: paperwork.filter(p => 
        (p.passport === 'in_review' || p.visa === 'in_review') &&
        p.passport !== 'pending' && p.visa !== 'pending'
      ),
    },
    { 
      id: 'complete', 
      title: { en: 'Complete', ur: 'مکمل' },
      travelers: paperwork.filter(p => 
        (p.passport === 'approved' || p.passport === 'rejected') &&
        (p.visa === 'approved' || p.visa === 'rejected' || p.visa === 'in_review')
      ),
    },
  ];

  const approvedCount = paperwork.filter(p => p.passport === 'approved' && p.visa === 'approved').length;
  const rejectedCount = paperwork.filter(p => p.passport === 'rejected').length;

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          {language === 'ur' ? 'کاغذات کی ٹریکنگ' : 'Paperwork Tracking'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ur'
            ? 'پاسپورٹ، ویزا اور میڈیکل دستاویزات کی حیثیت کو کنبان بورڈ میں ٹریک کریں۔'
            : 'Track passport, visa, and medical documentation status in a Kanban board.'}
        </p>
      </div>

      {/* Summary stats */}
      <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          {approvedCount} {language === 'ur' ? 'مکمل' : 'Complete'}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3 text-amber-500" />
          {paperwork.length - approvedCount - rejectedCount} {language === 'ur' ? 'پروسیسنگ' : 'Processing'}
        </Badge>
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          {rejectedCount} {language === 'ur' ? 'مسائل' : 'Issues'}
        </Badge>
      </div>

      {/* Kanban-style view */}
      <div className={`grid grid-cols-3 gap-3 ${isRTL ? 'direction-rtl' : ''}`}>
        {kanbanColumns.map(column => (
          <Card key={column.id} className="bg-muted/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {column.title[language as 'en' | 'ur']}
                <Badge variant="outline" className="text-xs">
                  {column.travelers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2 min-h-[120px]">
              {column.travelers.slice(0, 3).map(p => {
                const traveler = demoGroup.travelers.find(t => t.id === p.travelerId);
                return (
                  <div 
                    key={p.travelerId}
                    className="p-2 bg-background rounded border text-xs animate-in fade-in-0"
                  >
                    <div className="font-medium truncate">{traveler?.name}</div>
                    <div className={`flex items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {getStatusIcon(p.passport)}
                      <span className="text-muted-foreground">
                        {language === 'ur' ? 'پاسپورٹ' : 'Passport'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {column.travelers.length > 3 && (
                <div className="text-xs text-center text-muted-foreground">
                  +{column.travelers.length - 3} {language === 'ur' ? 'مزید' : 'more'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow visualization */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className={`flex items-center justify-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Badge variant="outline">{language === 'ur' ? 'جمع' : 'Submit'}</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">{language === 'ur' ? 'AI جائزہ' : 'AI Review'}</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">{language === 'ur' ? 'منظوری' : 'Approval'}</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant="default">{language === 'ur' ? 'مکمل' : 'Complete'}</Badge>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <strong>{language === 'ur' ? '📋 نوٹ:' : '📋 Note:'}</strong>{' '}
        {language === 'ur'
          ? 'مسترد شدہ دستاویزات کو دوبارہ جمع کرایا جا سکتا ہے۔ سسٹم تبدیلیوں کا خودکار ٹریک رکھتا ہے۔'
          : 'Rejected documents can be resubmitted. The system automatically tracks all changes.'}
      </div>
    </div>
  );
};
