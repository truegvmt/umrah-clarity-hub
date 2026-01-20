import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatusBarProps {
  percentage: number;
  label: string;
  completed: number;
  total: number;
}

export const StatusBar = ({ percentage, label, completed, total }: StatusBarProps) => {
  const { isRTL } = useLanguage();
  
  const getBarColor = (pct: number) => {
    if (pct === 100) return 'bg-green-500';
    if (pct >= 75) return 'bg-green-400';
    if (pct >= 50) return 'bg-yellow-500';
    if (pct >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <div className="w-16 sm:w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getBarColor(percentage)}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-10 text-right">{percentage}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side={isRTL ? 'left' : 'right'}>
        <p>{label}: {completed}/{total}</p>
      </TooltipContent>
    </Tooltip>
  );
};
