import { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemo } from '@/contexts/DemoContext';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const DemoImportStep = () => {
  const { language, isRTL } = useLanguage();
  const { demoGroup } = useDemo();
  const [phase, setPhase] = useState<'upload' | 'parsing' | 'complete'>('upload');
  const [parseProgress, setParseProgress] = useState(0);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    // Auto-animate the import process
    const timer1 = setTimeout(() => setPhase('parsing'), 1000);
    const timer2 = setTimeout(() => setParseProgress(30), 1500);
    const timer3 = setTimeout(() => setParseProgress(70), 2000);
    const timer4 = setTimeout(() => setParseProgress(100), 2500);
    const timer5 = setTimeout(() => {
      setPhase('complete');
      setShowTable(true);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {language === 'ur' ? 'CSV سے مسافرین درآمد کریں' : 'Import Travelers from CSV'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ur'
            ? 'اپنے مسافرین کا ڈیٹا CSV فائل سے اپ لوڈ کریں۔ سسٹم خودکار طور پر توثیق کرے گا۔'
            : 'Upload your traveler data from a CSV file. The system automatically validates and parses.'}
        </p>
      </div>

      {/* Upload simulation */}
      <div className={`
        border-2 border-dashed rounded-lg p-6 text-center transition-all
        ${phase === 'upload' ? 'border-primary/50 bg-primary/5 animate-pulse' : 'border-muted'}
      `}>
        {phase === 'upload' && (
          <div className="space-y-2">
            <Upload className="h-10 w-10 mx-auto text-primary animate-bounce" />
            <p className="font-medium">
              {language === 'ur' ? 'فائل اپ لوڈ ہو رہی ہے...' : 'Uploading file...'}
            </p>
            <p className="text-sm text-muted-foreground">ramadan_vip_group.csv</p>
          </div>
        )}

        {phase === 'parsing' && (
          <div className="space-y-3">
            <FileSpreadsheet className="h-10 w-10 mx-auto text-primary" />
            <p className="font-medium">
              {language === 'ur' ? 'ڈیٹا پارس ہو رہا ہے...' : 'Parsing data...'}
            </p>
            <Progress value={parseProgress} className="max-w-xs mx-auto" />
            <p className="text-sm text-muted-foreground">
              {language === 'ur' ? `${demoGroup.travelers.length} قطاریں پڑھی گئیں` : `${demoGroup.travelers.length} rows detected`}
            </p>
          </div>
        )}

        {phase === 'complete' && (
          <div className="space-y-2">
            <CheckCircle2 className="h-10 w-10 mx-auto text-green-500" />
            <p className="font-medium text-green-600">
              {language === 'ur' ? 'درآمد کامیاب!' : 'Import Successful!'}
            </p>
            <div className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {language === 'ur' 
                  ? `${demoGroup.travelers.length} مسافرین درآمد ہوئے`
                  : `${demoGroup.travelers.length} travelers imported`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Imported data preview */}
      {showTable && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h4 className="font-medium">
              {language === 'ur' ? 'درآمد شدہ ڈیٹا:' : 'Imported Data:'}
            </h4>
            <Badge variant="outline">
              {demoGroup.travelers.length} {language === 'ur' ? 'ریکارڈز' : 'records'}
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ur' ? 'نام' : 'Name'}</TableHead>
                  <TableHead>{language === 'ur' ? 'پاسپورٹ' : 'Passport'}</TableHead>
                  <TableHead className="text-center">{language === 'ur' ? 'حیثیت' : 'Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoGroup.travelers.slice(0, 5).map((t, i) => (
                  <TableRow 
                    key={t.id}
                    className="animate-in fade-in-0"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="font-mono text-sm">{t.passport}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {language === 'ur' ? 'زیر التواء' : 'Pending'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {demoGroup.travelers.length > 5 && (
              <div className="p-2 text-center text-sm text-muted-foreground bg-muted/30">
                +{demoGroup.travelers.length - 5} {language === 'ur' ? 'مزید' : 'more'}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <strong>{language === 'ur' ? '💡 ٹپ:' : '💡 Tip:'}</strong>{' '}
        {language === 'ur'
          ? 'UmrahOps پاسپورٹ فارمیٹ، گمشدہ فیلڈز، اور ڈپلیکیٹس کا خودکار پتہ لگاتا ہے۔'
          : 'UmrahOps auto-detects passport formats, missing fields, and duplicates.'}
      </div>
    </div>
  );
};
