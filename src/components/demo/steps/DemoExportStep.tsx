import { useState, useEffect } from 'react';
import { FileDown, FileText, Table, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemo } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const DemoExportStep = () => {
  const { language, isRTL } = useLanguage();
  const { demoGroup, demoRiskAssessments } = useDemo();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [options, setOptions] = useState({
    travelers: true,
    hotels: true,
    paperwork: true,
    messaging: true,
    audit: false,
  });

  useEffect(() => {
    // Auto-generate report preview
    const timer = setTimeout(() => {
      setGenerating(true);
      setTimeout(() => {
        setGenerating(false);
        setGenerated(true);
      }, 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const highRiskCount = demoRiskAssessments.filter(a => a.riskLevel === 'high').length;

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileDown className="h-5 w-5 text-primary" />
          {language === 'ur' ? 'رپورٹ ایکسپورٹ' : 'Export Reports'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ur'
            ? 'اپنی مرضی کے مطابق PDF رپورٹس بنائیں۔ تمام ڈیٹا آپ کے آلے پر محفوظ رہتا ہے۔'
            : 'Generate customizable PDF reports. All data stays on your device—nothing is uploaded.'}
        </p>
      </div>

      {/* Export options */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="font-medium text-sm mb-3">
            {language === 'ur' ? 'رپورٹ میں شامل کریں:' : 'Include in report:'}
          </h4>
          
          <div className="space-y-2">
            {Object.entries(options).map(([key, checked]) => {
              const labels: Record<string, { en: string; ur: string }> = {
                travelers: { en: 'Travelers List', ur: 'مسافرین کی فہرست' },
                hotels: { en: 'Hotel Assignments', ur: 'ہوٹل تفویض' },
                paperwork: { en: 'Paperwork Status', ur: 'کاغذات کی حیثیت' },
                messaging: { en: 'Messaging Summary', ur: 'میسجنگ کا خلاصہ' },
                audit: { en: 'Audit Trail', ur: 'آڈٹ ٹریل' },
              };
              
              return (
                <div 
                  key={key}
                  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Checkbox 
                    id={key}
                    checked={checked}
                    onCheckedChange={(val) => setOptions(prev => ({ ...prev, [key]: !!val }))}
                  />
                  <Label htmlFor={key} className="text-sm cursor-pointer">
                    {labels[key][language as 'en' | 'ur']}
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report preview */}
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FileText className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">
              {demoGroup.name.replace(/\s+/g, '_')}_report.pdf
            </span>
          </div>
          {generated && (
            <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600">
              <CheckCircle className="h-3 w-3" />
              {language === 'ur' ? 'تیار' : 'Ready'}
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          {generating && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
              <span className="text-sm">
                {language === 'ur' ? 'رپورٹ بن رہی ہے...' : 'Generating report...'}
              </span>
            </div>
          )}

          {generated && (
            <div className="space-y-4 animate-in fade-in-0">
              {/* Mock PDF preview */}
              <div className="border rounded-lg p-4 bg-background">
                <h5 className="font-bold text-lg mb-1">{demoGroup.name}</h5>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ur' ? 'سفر کی تاریخ:' : 'Travel Date:'} {demoGroup.date}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="text-muted-foreground">
                      {language === 'ur' ? 'کل مسافرین' : 'Total Travelers'}
                    </div>
                    <div className="text-2xl font-bold">{demoGroup.travelers.length}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="text-muted-foreground">
                      {language === 'ur' ? 'ہائی رسک' : 'High Risk'}
                    </div>
                    <div className="text-2xl font-bold text-red-500">{highRiskCount}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Table className="h-3 w-3" />
                    {language === 'ur' 
                      ? '+ مسافرین کی تفصیلی فہرست، ہوٹل، کاغذات...'
                      : '+ Detailed traveler list, hotels, paperwork...'}
                  </div>
                </div>
              </div>

              {/* Download button */}
              <Button className="w-full gap-2" size="lg">
                <FileDown className="h-4 w-4" />
                {language === 'ur' ? 'PDF ڈاؤن لوڈ کریں' : 'Download PDF'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <strong>{language === 'ur' ? '🔒 رازداری:' : '🔒 Privacy:'}</strong>{' '}
        {language === 'ur'
          ? 'PDF براہ راست آپ کے براؤزر میں بنتی ہے۔ کوئی ڈیٹا سرور کو نہیں بھیجا جاتا۔'
          : 'PDFs are generated directly in your browser. No data is sent to any server.'}
      </div>
    </div>
  );
};
