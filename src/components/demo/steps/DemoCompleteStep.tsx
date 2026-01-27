import { PartyPopper, ArrowRight, CheckCircle, Shield, Zap, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemo } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const DemoCompleteStep = () => {
  const { language, isRTL } = useLanguage();
  const { demoRiskAssessments } = useDemo();

  const highlights = [
    {
      icon: CheckCircle,
      en: 'Imported 8 travelers from CSV',
      ur: 'CSV سے 8 مسافرین درآمد کیے',
    },
    {
      icon: Shield,
      en: `AI flagged ${demoRiskAssessments.filter(a => a.riskLevel === 'high').length} high-risk travelers`,
      ur: `AI نے ${demoRiskAssessments.filter(a => a.riskLevel === 'high').length} ہائی رسک مسافرین کی نشاندہی کی`,
    },
    {
      icon: Zap,
      en: 'Assigned hotels with conflict detection',
      ur: 'تنازعات کی نشاندہی کے ساتھ ہوٹل تفویض کیے',
    },
    {
      icon: Globe,
      en: 'Sent WhatsApp messages to all travelers',
      ur: 'تمام مسافرین کو واٹس ایپ پیغامات بھیجے',
    },
  ];

  const features = [
    { en: 'Offline-first architecture', ur: 'آف لائن فرسٹ فن تعمیر' },
    { en: 'Your data never leaves your device', ur: 'آپ کا ڈیٹا آپ کے آلے سے باہر نہیں جاتا' },
    { en: 'Works in any language', ur: 'کسی بھی زبان میں کام کرتا ہے' },
    { en: 'No monthly fees', ur: 'کوئی ماہانہ فیس نہیں' },
  ];

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
          <PartyPopper className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'ur' ? 'ڈیمو مکمل!' : 'Demo Complete!'}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'ur'
            ? 'آپ نے ابھی دیکھا کہ UmrahOps کیسے عمرہ گروپ مینجمنٹ کو آسان بناتا ہے۔'
            : "You've just seen how UmrahOps simplifies Umrah group management."}
        </p>
      </div>

      {/* Demo summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            {language === 'ur' ? 'ڈیمو میں مکمل کیا گیا:' : 'What we covered:'}
          </h3>
          <div className="space-y-2">
            {highlights.map((item, i) => (
              <div 
                key={i}
                className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <item.icon className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{language === 'ur' ? item.ur : item.en}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Why UmrahOps */}
      <div>
        <h3 className="font-semibold mb-3">
          {language === 'ur' ? 'UmrahOps کیوں؟' : 'Why UmrahOps?'}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {features.map((feature, i) => (
            <Badge 
              key={i} 
              variant="outline" 
              className="justify-start py-2 px-3"
            >
              {language === 'ur' ? feature.ur : feature.en}
            </Badge>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 text-center">
          <h3 className="font-semibold mb-2">
            {language === 'ur' ? 'اپنا سفر شروع کریں' : 'Start Your Journey'}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {language === 'ur'
              ? 'مفت اکاؤنٹ بنائیں اور آج ہی اپنے گروپس کا انتظام شروع کریں۔'
              : 'Create a free account and start managing your groups today.'}
          </p>
          <div className={`flex items-center justify-center gap-2 text-primary font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>{language === 'ur' ? 'شروع کریں' : 'Get Started'}</span>
            <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        {language === 'ur'
          ? '"شروع کریں" پر کلک کریں یا کسی بھی وقت ڈیمو دوبارہ دیکھیں'
          : 'Click "Get Started" to begin or replay the demo anytime'}
      </p>
    </div>
  );
};
