import { useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemo, type DemoStep } from '@/contexts/DemoContext';
import { DemoWelcomeStep } from './steps/DemoWelcomeStep';
import { DemoImportStep } from './steps/DemoImportStep';
import { DemoVerifyStep } from './steps/DemoVerifyStep';
import { DemoHotelsStep } from './steps/DemoHotelsStep';
import { DemoPaperworkStep } from './steps/DemoPaperworkStep';
import { DemoMessagingStep } from './steps/DemoMessagingStep';
import { DemoExportStep } from './steps/DemoExportStep';
import { DemoCompleteStep } from './steps/DemoCompleteStep';

const STEP_COMPONENTS: Record<DemoStep, React.FC> = {
  welcome: DemoWelcomeStep,
  import: DemoImportStep,
  verify: DemoVerifyStep,
  hotels: DemoHotelsStep,
  paperwork: DemoPaperworkStep,
  messaging: DemoMessagingStep,
  export: DemoExportStep,
  complete: DemoCompleteStep,
};

const STEP_TITLES: Record<DemoStep, { en: string; ur: string }> = {
  welcome: { en: 'Welcome', ur: 'خوش آمدید' },
  import: { en: 'Step 1: Import Travelers', ur: 'مرحلہ 1: مسافرین درآمد کریں' },
  verify: { en: 'Step 2: AI Risk Verification', ur: 'مرحلہ 2: AI رسک توثیق' },
  hotels: { en: 'Step 3: Hotel Assignment', ur: 'مرحلہ 3: ہوٹل تفویض' },
  paperwork: { en: 'Step 4: Paperwork Tracking', ur: 'مرحلہ 4: کاغذات کی ٹریکنگ' },
  messaging: { en: 'Step 5: WhatsApp Messaging', ur: 'مرحلہ 5: واٹس ایپ میسجنگ' },
  export: { en: 'Step 6: Export Reports', ur: 'مرحلہ 6: رپورٹس ایکسپورٹ' },
  complete: { en: 'Demo Complete!', ur: 'ڈیمو مکمل!' },
};

export const DemoOverlay = () => {
  const { language, isRTL } = useLanguage();
  const { 
    isDemoMode, 
    endDemo, 
    currentStep, 
    nextStep, 
    prevStep,
    stepProgress,
    totalSteps,
    startDemo,
  } = useDemo();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDemoMode) return;
      if (e.key === 'Escape') endDemo();
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDemoMode, endDemo, nextStep, prevStep]);

  if (!isDemoMode) return null;

  const StepComponent = STEP_COMPONENTS[currentStep];
  const stepTitle = STEP_TITLES[currentStep][language];
  const progress = currentStep === 'complete' ? 100 : (stepProgress / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
        onClick={endDemo}
      />

      {/* Main demo card */}
      <Card className={`
        relative z-10 w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden
        shadow-2xl border-primary/20 animate-in fade-in-0 zoom-in-95
      `}>
        <CardHeader className="border-b bg-muted/30">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Badge variant="default" className="gap-1.5">
                <Play className="h-3 w-3" />
                {language === 'ur' ? 'انٹرایکٹو ڈیمو' : 'Interactive Demo'}
              </Badge>
              <CardTitle className="text-lg">{stepTitle}</CardTitle>
            </div>
            
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button variant="ghost" size="sm" onClick={startDemo} title="Restart Demo">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={endDemo}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className={`flex items-center justify-between text-xs text-muted-foreground mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>
                {language === 'ur' ? `مرحلہ ${stepProgress + 1} / ${totalSteps + 1}` : `Step ${stepProgress + 1} of ${totalSteps + 1}`}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          <StepComponent />
        </CardContent>

        {/* Navigation footer */}
        <div className={`
          border-t p-4 bg-muted/20
          flex items-center justify-between
          ${isRTL ? 'flex-row-reverse' : ''}
        `}>
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 'welcome'}
            className={isRTL ? 'flex-row-reverse' : ''}
          >
            <ChevronLeft className={`h-4 w-4 ${isRTL ? 'ml-1 rotate-180' : 'mr-1'}`} />
            {language === 'ur' ? 'پچھلا' : 'Previous'}
          </Button>

          <div className="flex gap-1">
            {Object.keys(STEP_TITLES).map((step, i) => (
              <div
                key={step}
                className={`
                  w-2 h-2 rounded-full transition-colors
                  ${i <= stepProgress ? 'bg-primary' : 'bg-muted-foreground/30'}
                `}
              />
            ))}
          </div>

          <Button
            onClick={currentStep === 'complete' ? endDemo : nextStep}
            className={isRTL ? 'flex-row-reverse' : ''}
          >
            {currentStep === 'complete' 
              ? (language === 'ur' ? 'شروع کریں' : 'Get Started')
              : (language === 'ur' ? 'اگلا' : 'Next')
            }
            {currentStep !== 'complete' && (
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
