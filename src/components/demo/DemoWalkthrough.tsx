import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface DemoStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  targetSelector?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'highlight' | 'scroll';
  delay?: number;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'welcome',
    titleKey: 'demo.welcome',
    descriptionKey: 'demo.welcomeDesc',
    position: 'center',
    delay: 0,
  },
  {
    id: 'hero',
    titleKey: 'demo.heroSection',
    descriptionKey: 'demo.heroSectionDesc',
    targetSelector: '.hero-cta',
    position: 'bottom',
    action: 'highlight',
  },
  {
    id: 'features',
    titleKey: 'demo.features',
    descriptionKey: 'demo.featuresDesc',
    targetSelector: '#features',
    position: 'top',
    action: 'scroll',
  },
  {
    id: 'validation',
    titleKey: 'demo.validation',
    descriptionKey: 'demo.validationDesc',
    position: 'center',
  },
  {
    id: 'whatsapp',
    titleKey: 'demo.whatsapp',
    descriptionKey: 'demo.whatsappDesc',
    position: 'center',
  },
  {
    id: 'blueprint',
    titleKey: 'demo.blueprint',
    descriptionKey: 'demo.blueprintDesc',
    targetSelector: '#blueprint',
    position: 'top',
    action: 'scroll',
  },
  {
    id: 'pipelines',
    titleKey: 'demo.pipelines',
    descriptionKey: 'demo.pipelinesDesc',
    position: 'center',
  },
  {
    id: 'getStarted',
    titleKey: 'demo.getStarted',
    descriptionKey: 'demo.getStartedDesc',
    position: 'center',
  },
];

interface DemoWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoWalkthrough = ({ isOpen, onClose }: DemoWalkthroughProps) => {
  const { t, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = DEMO_STEPS[currentStep];
  const progress = ((currentStep + 1) / DEMO_STEPS.length) * 100;

  const scrollToElement = useCallback((selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const highlightElement = useCallback((selector: string) => {
    // Remove previous highlights
    document.querySelectorAll('.demo-highlight').forEach(el => {
      el.classList.remove('demo-highlight');
    });

    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('demo-highlight');
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);

    // Execute step action
    if (step.action === 'scroll' && step.targetSelector) {
      scrollToElement(step.targetSelector);
    } else if (step.action === 'highlight' && step.targetSelector) {
      highlightElement(step.targetSelector);
    }

    return () => clearTimeout(timer);
  }, [currentStep, isOpen, step, scrollToElement, highlightElement]);

  // Cleanup highlights on close
  useEffect(() => {
    if (!isOpen) {
      document.querySelectorAll('.demo-highlight').forEach(el => {
        el.classList.remove('demo-highlight');
      });
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Demo card */}
      <div 
        className={`
          fixed z-50 w-full max-w-md px-4
          ${step.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
          ${step.position === 'top' ? 'top-20 left-1/2 -translate-x-1/2' : ''}
          ${step.position === 'bottom' ? 'bottom-20 left-1/2 -translate-x-1/2' : ''}
        `}
      >
        <Card className={`
          shadow-2xl border-primary/20 
          ${isAnimating ? 'animate-in fade-in-0 zoom-in-95' : ''}
        `}>
          <CardContent className="pt-6">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'}`}
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Progress */}
            <div className="mb-4">
              <div className={`flex items-center justify-between text-xs text-muted-foreground mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('demo.step')} {currentStep + 1} / {DEMO_STEPS.length}</span>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {t('demo.demo')}
                </Badge>
              </div>
              <Progress value={progress} className="h-1" />
            </div>

            {/* Content */}
            <div className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {t(step.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(step.descriptionKey)}
              </p>
            </div>

            {/* Navigation */}
            <div className={`flex items-center justify-between mt-6 pt-4 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={isRTL ? 'flex-row-reverse' : ''}
              >
                <ChevronLeft className={`h-4 w-4 ${isRTL ? 'ml-1 rotate-180' : 'mr-1'}`} />
                {t('demo.previous')}
              </Button>

              <Button
                size="sm"
                onClick={handleNext}
                className={isRTL ? 'flex-row-reverse' : ''}
              >
                {currentStep === DEMO_STEPS.length - 1 ? t('demo.finish') : t('demo.next')}
                {currentStep < DEMO_STEPS.length - 1 && (
                  <ChevronRight className={`h-4 w-4 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Highlight styles */}
      <style>{`
        .demo-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.3);
          border-radius: 8px;
          animation: pulse-highlight 2s infinite;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.3);
          }
          50% {
            box-shadow: 0 0 0 6px hsl(var(--primary)), 0 0 30px hsl(var(--primary) / 0.5);
          }
        }
      `}</style>
    </>
  );
};

// Demo Button component for landing page
export const DemoButton = ({ onClick }: { onClick: () => void }) => {
  const { t, isRTL } = useLanguage();
  
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      className={`group min-w-[160px] border-primary/30 hover:border-primary hover:bg-primary/5 ${isRTL ? 'flex-row-reverse' : ''}`}
    >
      <Play className={`h-4 w-4 transition-transform group-hover:scale-110 ${isRTL ? 'ml-2' : 'mr-2'}`} />
      {t('demo.watchDemo')}
    </Button>
  );
};
