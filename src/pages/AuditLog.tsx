import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLogs, AuditFilters } from '@/hooks/useAuditLogs';
import { auditService, AuditEntry } from '@/services/auditService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowLeft,
  Search,
  Download,
  Calendar as CalendarIcon,
  RefreshCw,
  FileText,
  Trash2,
  Edit,
  Eye,
  LogOut,
  Upload,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 20;

const AuditLog = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filters state
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  const filters: AuditFilters = useMemo(
    () => ({
      search: search || undefined,
      actionType: actionType !== 'all' ? actionType : undefined,
      dateFrom,
      dateTo,
    }),
    [search, actionType, dateFrom, dateTo]
  );

  const { logs, loading, actionTypes, refetch } = useAuditLogs(
    user?.id || '',
    filters
  );

  // Pagination
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return logs.slice(start, start + ITEMS_PER_PAGE);
  }, [logs, currentPage]);

  // Log page view on mount
  useState(() => {
    if (user) {
      auditService.logPageView(user.id, user.email || '', 'Audit Log');
    }
  });

  const handleBack = () => {
    if (user) {
      auditService.logNavigation(user.id, user.email || '', '/audit', '/dashboard');
    }
    navigate('/dashboard');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'PAGE_VIEW':
        return <Eye className="h-4 w-4" />;
      case 'NAVIGATION':
        return <ArrowLeft className="h-4 w-4" />;
      case 'GROUP_OPEN':
        return <FileText className="h-4 w-4" />;
      case 'LOGOUT':
        return <LogOut className="h-4 w-4" />;
      case 'EXPORT':
        return <Download className="h-4 w-4" />;
      case 'UPDATE':
      case 'UPDATE_TRAVELER':
      case 'BATCH_UPDATE':
        return <Edit className="h-4 w-4" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4" />;
      case 'IMPORT':
        return <Upload className="h-4 w-4" />;
      case 'MESSAGE_SENT':
        return <Send className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-destructive bg-destructive/10';
    if (action.includes('CREATE') || action.includes('IMPORT')) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    if (action.includes('UPDATE') || action.includes('BATCH')) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    if (action.includes('EXPORT')) return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
    return 'text-muted-foreground bg-muted';
  };

  const exportLogs = (format: 'csv' | 'json') => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'Details'];
        const rows = logs.map((log) => [
          log.timestamp,
          log.userEmail || log.userId,
          log.action,
          log.resource,
          log.resourceId || '',
          JSON.stringify(log.details || {}),
        ]);
        content = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
        filename = `audit-log-${format}-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(logs, null, 2);
        filename = `audit-log-${format}-${Date.now()}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log the export action
      if (user) {
        auditService.log(user.id, user.email || '', 'EXPORT', 'audit_logs', undefined, { format, count: logs.length });
      }

      toast({
        title: t('audit.exportSuccess'),
        description: `${logs.length} ${t('audit.logsExported')}`,
      });
    } catch (error) {
      toast({
        title: t('audit.exportFailed'),
        variant: 'destructive',
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d, yyyy HH:mm:ss');
  };

  const clearFilters = () => {
    setSearch('');
    setActionType('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setCurrentPage(1);
  };

  return (
    <div className={cn('min-h-screen bg-background', isRTL && 'rtl')}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className={cn('h-5 w-5', isRTL && 'rotate-180')} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t('audit.title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('audit.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportLogs('csv')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportLogs('json')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t('dashboard.refresh')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('audit.search')}
              </label>
              <div className="relative">
                <Search className={cn(
                  'absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
                  isRTL ? 'right-3' : 'left-3'
                )} />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={t('audit.searchPlaceholder')}
                  className={cn('bg-background', isRTL ? 'pr-10' : 'pl-10')}
                />
              </div>
            </div>

            {/* Action Type Filter */}
            <div className="w-full md:w-48">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('audit.actionType')}
              </label>
              <Select
                value={actionType}
                onValueChange={(v) => {
                  setActionType(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">{t('audit.allActions')}</SelectItem>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="w-full md:w-48">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('audit.dateFrom')}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start bg-background text-left font-normal',
                      !dateFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'MMM d, yyyy') : t('audit.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(d) => {
                      setDateFrom(d);
                      setCurrentPage(1);
                    }}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="w-full md:w-48">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('audit.dateTo')}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start bg-background text-left font-normal',
                      !dateTo && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'MMM d, yyyy') : t('audit.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(d) => {
                      setDateTo(d);
                      setCurrentPage(1);
                    }}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="shrink-0"
            >
              {t('audit.clearFilters')}
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <main className="container mx-auto px-4 py-6">
        <div className="rounded-lg border bg-card">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <FileText className="mb-4 h-12 w-12" />
              <p>{t('audit.noLogs')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-48">{t('audit.timestamp')}</TableHead>
                      <TableHead>{t('audit.agent')}</TableHead>
                      <TableHead>{t('audit.action')}</TableHead>
                      <TableHead>{t('audit.target')}</TableHead>
                      <TableHead className="max-w-xs">{t('audit.notes')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {log.userEmail || log.userId.slice(0, 8)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                              getActionColor(log.action)
                            )}
                          >
                            {getActionIcon(log.action)}
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {log.resource}
                            </span>
                            {log.resourceId && (
                              <span className="text-xs text-muted-foreground">
                                ID: {log.resourceId}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <span className="block truncate text-sm text-muted-foreground" title={JSON.stringify(log.details)}>
                              {JSON.stringify(log.details)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t('audit.showing')} {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(currentPage * ITEMS_PER_PAGE, logs.length)} {t('audit.of')}{' '}
                      {logs.length} {t('audit.entries')}
                    </p>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className={cn(
                              currentPage === 1 && 'pointer-events-none opacity-50'
                            )}
                          />
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className={cn(
                              currentPage === totalPages && 'pointer-events-none opacity-50'
                            )}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuditLog;
