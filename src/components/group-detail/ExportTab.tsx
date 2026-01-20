import { useState } from 'react';
import { FileDown, FileText, Eye, Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Group } from '@/services/dbService';
import { exportService, type ExportOptions } from '@/services/exportService';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ExportTabProps {
  group: Group;
}

export const ExportTab = ({ group }: ExportTabProps) => {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const [options, setOptions] = useState<ExportOptions>({
    includeTravelers: true,
    includeHotels: true,
    includePaperwork: true,
    includeMessaging: true,
    includeAuditLog: false,
    language: language,
  });
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const content = await exportService.getPreviewContent(group, { ...options, language });
      setPreview(content);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const success = await exportService.downloadReport(group, { ...options, language });
      if (success) {
        toast.success(t('group.exportSuccess'));
        
        // Log the export
        if (user) {
          auditService.logExport(user.id, user.email || '', group.id, 'txt');
        }
      } else {
        toast.error(t('group.exportFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    setPreview(''); // Clear preview when options change
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Options panel */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FileText className="h-5 w-5" />
            {t('group.exportOptions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Checkbox 
                id="includeTravelers" 
                checked={options.includeTravelers}
                onCheckedChange={() => toggleOption('includeTravelers')}
              />
              <Label htmlFor="includeTravelers">{t('group.includeTravelers')}</Label>
            </div>

            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Checkbox 
                id="includeHotels" 
                checked={options.includeHotels}
                onCheckedChange={() => toggleOption('includeHotels')}
              />
              <Label htmlFor="includeHotels">{t('group.includeHotels')}</Label>
            </div>

            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Checkbox 
                id="includePaperwork" 
                checked={options.includePaperwork}
                onCheckedChange={() => toggleOption('includePaperwork')}
              />
              <Label htmlFor="includePaperwork">{t('group.includePaperwork')}</Label>
            </div>

            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Checkbox 
                id="includeMessaging" 
                checked={options.includeMessaging}
                onCheckedChange={() => toggleOption('includeMessaging')}
              />
              <Label htmlFor="includeMessaging">{t('group.includeMessaging')}</Label>
            </div>

            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Checkbox 
                id="includeAuditLog" 
                checked={options.includeAuditLog}
                onCheckedChange={() => toggleOption('includeAuditLog')}
              />
              <Label htmlFor="includeAuditLog">{t('group.includeAuditLog')}</Label>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <Button 
              variant="outline" 
              className="w-full gap-2" 
              onClick={handlePreview}
              disabled={previewLoading}
            >
              {previewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {t('group.previewReport')}
            </Button>

            <Button 
              className="w-full gap-2" 
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {t('group.downloadReport')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview panel */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FileDown className="h-5 w-5" />
            {t('group.reportPreview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {preview ? (
            <ScrollArea className="h-96 rounded-md border bg-muted/30 p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap">{preview}</pre>
            </ScrollArea>
          ) : (
            <div className="h-96 rounded-md border bg-muted/30 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                {t('group.clickPreview')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
