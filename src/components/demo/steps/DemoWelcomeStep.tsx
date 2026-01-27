import { Users, Shield, Zap, FileCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemo } from '@/contexts/DemoContext';

export const DemoWelcomeStep = () => {
  const { language, isRTL } = useLanguage();
  const { demoGroup } = useDemo();

  const features = [
    {
      icon: Users,
      en: 'Manage 8 travelers in a VIP group',
      ur: '8 مسافرین کو VIP گروپ میں منظم کریں',
    },
    {
      icon: Shield,
      en: 'Watch AI flag high-risk travelers',
      ur: 'AI کو ہائی رسک مسافرین کی نشاندہی کرتے دیکھیں',
    },
    {
      icon: Zap,
      en: 'See instant document validation',
      ur: 'فوری دستاویز کی توثیق دیکھیں',
    },
    {
      icon: FileCheck,
      en: 'Generate ready-to-use reports',
      ur: 'استعمال کے لیے تیار رپورٹس بنائیں',
    },
  ];

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">
          {language === 'ur' ? 'UmrahOps میں خوش آمدید!' : 'Welcome to UmrahOps!'}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {language === 'ur' 
            ? 'آئیے آپ کو دکھاتے ہیں کہ ہم عمرہ گروپ مینجمنٹ کو کیسے آسان بناتے ہیں۔ ہم ایک حقیقی منظر نامے میں چلیں گے۔'
            : "Let's walk you through how we simplify Umrah group management. We'll go through a real scenario."}
        </p>
      </div>

      {/* Demo scenario preview */}
      <div className="bg-muted/50 rounded-lg p-4 border">
        <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">
            {language === 'ur' ? 'ڈیمو منظرنامہ' : 'Demo Scenario'}
          </span>
        </div>
        <div className={`grid grid-cols-2 gap-4 text-sm ${isRTL ? 'text-right' : ''}`}>
          <div>
            <span className="text-muted-foreground">{language === 'ur' ? 'گروپ:' : 'Group:'}</span>
            <span className="font-medium ml-2">{demoGroup.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{language === 'ur' ? 'مسافرین:' : 'Travelers:'}</span>
            <span className="font-medium ml-2">{demoGroup.travelers.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{language === 'ur' ? 'تاریخ:' : 'Date:'}</span>
            <span className="font-medium ml-2">{demoGroup.date}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{language === 'ur' ? 'حیثیت:' : 'Status:'}</span>
            <span className="font-medium ml-2 text-amber-600">
              {language === 'ur' ? 'پروسیسنگ کے لیے تیار' : 'Ready to process'}
            </span>
          </div>
        </div>
      </div>

      {/* What you'll see */}
      <div>
        <h3 className="font-semibold mb-3">
          {language === 'ur' ? 'آپ کیا دیکھیں گے:' : "What you'll experience:"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feature, i) => (
            <div 
              key={i}
              className={`
                flex items-center gap-3 p-3 rounded-lg bg-card border
                ${isRTL ? 'flex-row-reverse' : ''}
              `}
            >
              <div className="p-2 rounded-md bg-primary/10">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">{language === 'ur' ? feature.ur : feature.en}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {language === 'ur' 
          ? 'آگے بڑھنے کے لیے "اگلا" پر کلک کریں یا کی بورڈ تیر کا استعمال کریں'
          : 'Click "Next" to continue or use keyboard arrows'}
      </p>
    </div>
  );
};
