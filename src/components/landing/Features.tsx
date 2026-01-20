import { CheckCircle, MessageCircle, Shield, Wifi } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const features = [
  { key: 'validation', icon: CheckCircle },
  { key: 'whatsapp', icon: MessageCircle },
  { key: 'audit', icon: Shield },
  { key: 'offline', icon: Wifi },
];

export const Features = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className={`max-w-3xl mx-auto text-center mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            {t('features.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.key} 
                className="bg-card border-2 border-border hover:shadow-sm hover:border-primary/30 transition-all duration-200 hover-lift"
              >
                <CardHeader className={`${isRTL ? 'text-right' : ''}`}>
                  <div className={`w-10 h-10 bg-primary/10 flex items-center justify-center mb-3 ${isRTL ? 'mr-auto ml-0' : ''}`}>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {t(`feature.${feature.key}.title`)}
                  </CardTitle>
                </CardHeader>
                <CardContent className={`${isRTL ? 'text-right' : ''}`}>
                  <CardDescription className="text-sm leading-relaxed">
                    {t(`feature.${feature.key}.desc`)}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
