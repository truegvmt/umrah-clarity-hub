import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer id="contact" className="py-12 border-t border-border bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col md:flex-row items-center justify-between gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">U</span>
            </div>
            <span className="font-bold text-lg">UmrahOps</span>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {t('footer.tagline')}
          </p>

          <div className={`flex items-center gap-6 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.contact')}
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
