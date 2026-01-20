import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { WORKFLOW_STEPS } from '@/services/workflowService';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressIndicatorProps {
  currentStep: number;
}

export const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  const { language, isRTL } = useLanguage();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 cursor-help">
          <div className={`flex gap-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {WORKFLOW_STEPS.map((step) => (
              <div
                key={step.id}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-colors ${
                  step.id <= currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground ml-1">
            {currentStep}/{WORKFLOW_STEPS.length}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side={isRTL ? 'left' : 'right'} className="max-w-xs">
        <div className="space-y-1">
          {WORKFLOW_STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 text-xs ${
                step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                step.id <= currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
              <span>{step.id}. {language === 'ur' ? step.nameUr : step.name}</span>
              {step.id === currentStep && <span className="text-primary">← {language === 'ur' ? 'موجودہ' : 'Current'}</span>}
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
