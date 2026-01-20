import { 
  Settings, 
  Lock, 
  FileSpreadsheet, 
  Brain, 
  Workflow, 
  MessageSquare, 
  FileText, 
  ClipboardList, 
  RefreshCw, 
  Code,
  Database
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';

const pipelines = [
  { key: 'env', icon: Settings },
  { key: 'auth', icon: Lock },
  { key: 'csv', icon: FileSpreadsheet },
  { key: 'ai', icon: Brain },
  { key: 'workflow', icon: Workflow },
  { key: 'whatsapp', icon: MessageSquare },
  { key: 'pdf', icon: FileText },
  { key: 'audit', icon: ClipboardList },
  { key: 'sync', icon: RefreshCw },
  { key: 'dev', icon: Code },
  { key: 'storage', icon: Database },
];

export const Blueprint = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section id="blueprint" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className={`max-w-3xl mx-auto text-center mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            {t('blueprint.title')}
          </h2>
          <p className="text-muted-foreground font-mono text-sm sm:text-base">
            {t('blueprint.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {pipelines.map((pipeline, index) => {
              const Icon = pipeline.icon;
              return (
                <AccordionItem 
                  key={pipeline.key} 
                  value={pipeline.key}
                  className="bg-card border border-border px-4 data-[state=open]:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className={`hover:no-underline py-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-medium text-sm sm:text-base">
                        {t(`pipeline.${pipeline.key}`)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className={`pb-4 ${isRTL ? 'text-right' : ''}`}>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(`pipeline.${pipeline.key}.desc`)}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
