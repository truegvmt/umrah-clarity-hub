import { useEffect, useState, useMemo } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGroups } from '@/hooks/useGroups';
import { auditService } from '@/services/auditService';
import { calculateBookingStatus, calculatePaperworkStatus, calculateMessagingStatus, calculateAverageRisk } from '@/services/dbService';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { GroupsTable } from '@/components/dashboard/GroupsTable';
import { GroupCard } from '@/components/dashboard/GroupCard';
import { Filters, SortOption, FilterOption } from '@/components/dashboard/Filters';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    const saved = localStorage.getItem('umrahops-view-mode');
    return (saved as 'table' | 'cards') || 'table';
  });
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const { groups, loading, error, refresh } = useGroups({
    agentId: user?.id || 'agent-1', // Fallback for demo
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Log page view on mount
  useEffect(() => {
    if (user) {
      auditService.logPageView(user.id, user.email || 'unknown', 'Dashboard');
    }
  }, [user]);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('umrahops-view-mode', viewMode);
  }, [viewMode]);

  // Filter and sort groups
  const filteredAndSortedGroups = useMemo(() => {
    let result = [...groups];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.id.toLowerCase().includes(query)
      );
    }

    // Status filter
    switch (filterBy) {
      case 'complete':
        result = result.filter((g) => g.currentStep === 6);
        break;
      case 'in-progress':
        result = result.filter((g) => g.currentStep > 1 && g.currentStep < 6);
        break;
      case 'at-risk':
        result = result.filter((g) => calculateAverageRisk(g.travelers) > 30);
        break;
    }

    // Sort
    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'date-desc':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'completion':
        result.sort((a, b) => b.currentStep - a.currentStep);
        break;
      case 'risk':
        result.sort((a, b) => calculateAverageRisk(b.travelers) - calculateAverageRisk(a.travelers));
        break;
      case 'travelers':
        result.sort((a, b) => b.travelers.length - a.travelers.length);
        break;
    }

    return result;
  }, [groups, searchQuery, filterBy, sortBy]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalGroups = groups.length;
    const totalTravelers = groups.reduce((sum, g) => sum + g.travelers.length, 0);
    const avgBooking = groups.length
      ? Math.round(groups.reduce((sum, g) => sum + calculateBookingStatus(g.travelers), 0) / groups.length)
      : 0;
    const avgPaperwork = groups.length
      ? Math.round(groups.reduce((sum, g) => sum + calculatePaperworkStatus(g.travelers), 0) / groups.length)
      : 0;
    const avgMessaging = groups.length
      ? Math.round(groups.reduce((sum, g) => sum + calculateMessagingStatus(g.travelers), 0) / groups.length)
      : 0;

    return { totalGroups, totalTravelers, avgBooking, avgPaperwork, avgMessaging };
  }, [groups]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className={`mb-6 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{t('dashboard.totalGroups')}</p>
            <p className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>{stats.totalGroups}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{t('dashboard.totalTravelers')}</p>
            <p className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>{stats.totalTravelers}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{t('dashboard.avgBooking')}</p>
            <p className={`text-2xl font-bold text-green-600 dark:text-green-400 ${isRTL ? 'text-right' : ''}`}>{stats.avgBooking}%</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{t('dashboard.avgPaperwork')}</p>
            <p className={`text-2xl font-bold text-yellow-600 dark:text-yellow-400 ${isRTL ? 'text-right' : ''}`}>{stats.avgPaperwork}%</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 col-span-2 sm:col-span-1">
            <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{t('dashboard.avgMessaging')}</p>
            <p className={`text-2xl font-bold text-blue-600 dark:text-blue-400 ${isRTL ? 'text-right' : ''}`}>{stats.avgMessaging}%</p>
          </div>
        </div>

        {/* Filters & Refresh */}
        <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Filters
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterBy={filterBy}
            onFilterChange={setFilterBy}
          />
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('dashboard.refresh')}
          </Button>
        </div>

        {/* Content */}
        {loading && groups.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>{error}</p>
            <Button variant="outline" onClick={refresh} className="mt-4">
              {t('dashboard.retry')}
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <GroupsTable groups={filteredAndSortedGroups} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
            {filteredAndSortedGroups.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p>{t('dashboard.noGroups')}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
