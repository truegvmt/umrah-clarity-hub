import { ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

export type SortOption = 'date-asc' | 'date-desc' | 'completion' | 'risk' | 'travelers';
export type FilterOption = 'all' | 'complete' | 'in-progress' | 'at-risk';

interface FiltersProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export const Filters = ({ sortBy, onSortChange, filterBy, onFilterChange }: FiltersProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Sort */}
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('dashboard.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">{t('dashboard.sortDateDesc')}</SelectItem>
            <SelectItem value="date-asc">{t('dashboard.sortDateAsc')}</SelectItem>
            <SelectItem value="completion">{t('dashboard.sortCompletion')}</SelectItem>
            <SelectItem value="risk">{t('dashboard.sortRisk')}</SelectItem>
            <SelectItem value="travelers">{t('dashboard.sortTravelers')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter */}
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterBy} onValueChange={(v) => onFilterChange(v as FilterOption)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t('dashboard.filterBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('dashboard.filterAll')}</SelectItem>
            <SelectItem value="complete">{t('dashboard.filterComplete')}</SelectItem>
            <SelectItem value="in-progress">{t('dashboard.filterInProgress')}</SelectItem>
            <SelectItem value="at-risk">{t('dashboard.filterAtRisk')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
