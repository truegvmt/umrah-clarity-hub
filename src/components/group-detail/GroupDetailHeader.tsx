import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProgressIndicator } from '@/components/dashboard/ProgressIndicator';
import type { Group } from '@/services/dbService';

interface GroupDetailHeaderProps {
  group: Group;
}

export const GroupDetailHeader = ({ group }: GroupDetailHeaderProps) => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              <span className="hidden sm:inline">{t('dashboard.backToDashboard')}</span>
            </Button>
            
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            <div>
              <h1 className="text-lg font-bold">{group.name}</h1>
              <p className="text-sm text-muted-foreground">
                {group.date} • {group.travelers.length} {t('dashboard.travelers')}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('dashboard.progress')}:</span>
              <ProgressIndicator currentStep={group.currentStep} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
