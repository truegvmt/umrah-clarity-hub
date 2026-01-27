import { useState, useEffect } from 'react';
import { Building2, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemo, DEMO_HOTELS } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const DemoHotelsStep = () => {
  const { language, isRTL } = useLanguage();
  const { demoGroup } = useDemo();
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Animate hotel assignments one by one
    const assignHotels = () => {
      const newAssignments: Record<string, string> = {};
      demoGroup.travelers.forEach((t, i) => {
        // Distribute travelers across hotels
        const hotelIndex = i % DEMO_HOTELS.length;
        newAssignments[t.id] = DEMO_HOTELS[hotelIndex].id;
      });
      
      // Animate each assignment
      demoGroup.travelers.forEach((t, i) => {
        setTimeout(() => {
          setAssignments(prev => ({ ...prev, [t.id]: newAssignments[t.id] }));
          setAnimationStep(i + 1);
        }, i * 400);
      });
    };

    const timer = setTimeout(assignHotels, 500);
    return () => clearTimeout(timer);
  }, [demoGroup.travelers]);

  const getHotelAssignmentCount = (hotelId: string) => {
    return Object.values(assignments).filter(h => h === hotelId).length;
  };

  const allAssigned = Object.keys(assignments).length === demoGroup.travelers.length;

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {language === 'ur' ? 'ہوٹل تفویض' : 'Hotel Assignment'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ur'
            ? 'دستیابی کی بنیاد پر خودکار ہوٹل تفویض۔ اوور بکنگ الرٹس شامل ہیں۔'
            : 'Automatic hotel assignment based on availability. Includes overbooking alerts.'}
        </p>
      </div>

      {/* Hotels overview */}
      <div className="grid gap-3">
        {DEMO_HOTELS.map(hotel => {
          const assignedCount = getHotelAssignmentCount(hotel.id);
          const newTotal = hotel.assigned + assignedCount;
          const isOverbooked = newTotal > hotel.capacity;
          const utilizationPercent = (newTotal / hotel.capacity) * 100;

          return (
            <Card 
              key={hotel.id}
              className={`transition-all ${isOverbooked ? 'border-amber-500/50 bg-amber-500/5' : ''}`}
            >
              <CardContent className="p-4">
                <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <h4 className="font-medium">{hotel.name}</h4>
                    <p className="text-sm text-muted-foreground">{hotel.city}</p>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {isOverbooked ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {language === 'ur' ? 'اوور بکڈ' : 'Overbooked'}
                    </Badge>
                    ) : assignedCount > 0 ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        +{assignedCount}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-muted-foreground">
                      {language === 'ur' ? 'گنجائش:' : 'Capacity:'}
                    </span>
                    <span className={isOverbooked ? 'text-amber-600 font-medium' : ''}>
                      {newTotal} / {hotel.capacity}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(utilizationPercent, 100)} 
                    className={`h-2 ${isOverbooked ? '[&>div]:bg-amber-500' : ''}`}
                  />
                </div>

                {/* Show assigned travelers */}
                {assignedCount > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {demoGroup.travelers
                      .filter(t => assignments[t.id] === hotel.id)
                      .map(t => (
                        <Badge 
                          key={t.id} 
                          variant="outline" 
                          className="text-xs animate-in fade-in-0 zoom-in-95"
                        >
                          {t.name.split(' ')[0]}
                        </Badge>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assignment progress */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {language === 'ur' ? 'تفویض کی پیش رفت' : 'Assignment Progress'}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {animationStep} / {demoGroup.travelers.length}
          </span>
        </div>
        <Progress value={(animationStep / demoGroup.travelers.length) * 100} />
        
        {allAssigned && (
          <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            {language === 'ur' ? 'تمام مسافرین تفویض ہو گئے!' : 'All travelers assigned!'}
          </p>
        )}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
        <strong className="text-amber-600">{language === 'ur' ? '⚠️ الرٹ:' : '⚠️ Alert:'}</strong>{' '}
        {language === 'ur'
          ? 'Al Safwa Hotel اوور بکنگ کے قریب ہے۔ متبادل پر غور کریں۔'
          : 'Al Safwa Hotel is approaching overbooking. Consider alternatives.'}
      </div>
    </div>
  );
};
