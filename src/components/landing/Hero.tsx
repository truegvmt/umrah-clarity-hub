import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { DemoWalkthrough, DemoButton } from '@/components/demo/DemoWalkthrough';
import heroPattern from '@/assets/hero-pattern.jpg';

export const Hero = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthDialogOpen(true);
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-30 dark:opacity-10"
          style={{
            backgroundImage: `url(${heroPattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-4xl mx-auto text-center ${isRTL ? 'text-right' : ''}`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-tight mb-6">
              {t('hero.tagline')}
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              {t('hero.subtitle')}
            </p>

            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Button size="lg" className="group min-w-[200px] hero-cta" onClick={handleGetStarted}>
                {t('hero.cta')}
                <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 mr-2 group-hover:-translate-x-1' : 'ml-2'}`} />
              </Button>
              <DemoButton onClick={() => setDemoOpen(true)} />
            </div>

            <div className={`flex items-center justify-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Shield className="h-4 w-4 text-primary" />
              <span>{t('hero.ctaNote')}</span>
            </div>
          </div>
        </div>

        {/* Bottom decorative border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        onSuccess={() => navigate('/dashboard')}
      />

      <DemoWalkthrough 
        isOpen={demoOpen} 
        onClose={() => setDemoOpen(false)} 
      />
    </>
  );
};
