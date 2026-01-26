import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertTriangle, Check, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Traveler } from '@/services/dbService';

interface CSVUploadProps {
  onImport: (travelers: Omit<Traveler, 'id'>[]) => Promise<void>;
}

interface ParsedRow {
  data: Record<string, string>;
  errors: string[];
  isValid: boolean;
}

interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
  totalValid: number;
  totalInvalid: number;
}

const REQUIRED_FIELDS = ['name', 'passport'];

export const CSVUpload = ({ onImport }: CSVUploadProps) => {
  const { t, isRTL } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const parseCSV = (content: string): ParseResult => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return { headers: [], rows: [], totalValid: 0, totalInvalid: 0 };
    }

    // Parse headers (first line)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    // Parse data rows
    const rows: ParsedRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const data: Record<string, string> = {};
      const errors: string[] = [];

      headers.forEach((header, index) => {
        data[header] = values[index]?.trim() || '';
      });

      // Validate required fields
      REQUIRED_FIELDS.forEach(field => {
        if (!data[field] || data[field].length === 0) {
          errors.push(t('csv.missingField').replace('{field}', field));
        }
      });

      // Validate passport format (basic check)
      if (data.passport && !/^[A-Z0-9]{6,12}$/i.test(data.passport.replace(/\s/g, ''))) {
        errors.push(t('csv.invalidPassport'));
      }

      rows.push({
        data,
        errors,
        isValid: errors.length === 0,
      });
    }

    return {
      headers,
      rows,
      totalValid: rows.filter(r => r.isValid).length,
      totalInvalid: rows.filter(r => !r.isValid).length,
    };
  };

  // Handle CSV line parsing (handles quoted values)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.replace(/^"|"$/g, ''));
    
    return result;
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCSV(content);
      setParseResult(result);
      setShowPreview(true);
    };
    reader.readAsText(file);
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleImport = async () => {
    if (!parseResult) return;

    setImporting(true);
    try {
      const validRows = parseResult.rows.filter(r => r.isValid);
      const travelers: Omit<Traveler, 'id'>[] = validRows.map(row => ({
        name: row.data.name,
        passport: row.data.passport.toUpperCase(),
        riskScore: parseInt(row.data.riskscore || '0', 10) || Math.floor(Math.random() * 30), // Default random risk
        bookingConfirmed: row.data.bookingconfirmed?.toLowerCase() === 'true' || row.data.bookingconfirmed === '1',
        paperworkComplete: row.data.paperworkcomplete?.toLowerCase() === 'true' || row.data.paperworkcomplete === '1',
        messageSent: row.data.messagesent?.toLowerCase() === 'true' || row.data.messagesent === '1',
      }));

      await onImport(travelers);
      setShowPreview(false);
      setParseResult(null);
      setFileName(null);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'name,passport,hotel,bookingConfirmed,paperworkComplete,messageSent\nJohn Doe,AB1234567,Makkah Tower,true,false,false\nJane Smith,CD7654321,Madinah Grand,false,false,false';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travelers_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Upload className="h-5 w-5 text-primary" />
            {t('csv.title')}
          </CardTitle>
          <CardDescription>{t('csv.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              {t('csv.dropHere')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('csv.orClick')}
            </p>
          </div>

          {/* Download template */}
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
            <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('csv.downloadTemplate')}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FileText className="h-5 w-5" />
              {t('csv.preview')} - {fileName}
            </DialogTitle>
            <DialogDescription>
              {t('csv.previewDescription')}
            </DialogDescription>
          </DialogHeader>

          {parseResult && (
            <>
              {/* Summary */}
              <div className={`flex gap-4 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Badge variant="default" className="gap-1">
                  <Check className="h-3 w-3" />
                  {parseResult.totalValid} {t('csv.valid')}
                </Badge>
                {parseResult.totalInvalid > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {parseResult.totalInvalid} {t('csv.invalid')}
                  </Badge>
                )}
              </div>

              {/* Table preview */}
              <ScrollArea className="flex-1 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>{t('csv.status')}</TableHead>
                      {parseResult.headers.map(h => (
                        <TableHead key={h} className="capitalize">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parseResult.rows.map((row, idx) => (
                      <TableRow 
                        key={idx} 
                        className={row.isValid ? '' : 'bg-destructive/5'}
                      >
                        <TableCell className="font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <X className="h-4 w-4 text-destructive" />
                              <span className="text-xs text-destructive truncate max-w-[150px]" title={row.errors.join(', ')}>
                                {row.errors[0]}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        {parseResult.headers.map(h => (
                          <TableCell key={h} className="font-mono text-sm text-foreground">
                            {row.data[h] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {parseResult.totalInvalid > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t('csv.invalidRowsWarning').replace('{count}', String(parseResult.totalInvalid))}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <DialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              {t('csv.cancel')}
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={importing || !parseResult?.totalValid}
            >
              {importing ? t('csv.importing') : t('csv.import').replace('{count}', String(parseResult?.totalValid || 0))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
