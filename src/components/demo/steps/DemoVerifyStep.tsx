import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemo } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

export const DemoVerifyStep = () => {
  const { language, isRTL } = useLanguage();
  const { demoGroup, demoRiskAssessments, simulateRiskScoring } = useDemo();
  const [isScanning, setIsScanning] = useState(true);
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    const runScan = async () => {
      await simulateRiskScoring();
      setIsScanning(false);
      setScanComplete(true);
    };
    runScan();
  }, [simulateRiskScoring]);

  const scanProgress = (demoRiskAssessments.length / demoGroup.travelers.length) * 100;

  const highRisk = demoRiskAssessments.filter(a => a.riskLevel === 'high');
  const mediumRisk = demoRiskAssessments.filter(a => a.riskLevel === 'medium');
  const lowRisk = demoRiskAssessments.filter(a => a.riskLevel === 'low');

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return '';
    }
  };

  const getRiskBadgeVariant = (level: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (level) {
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {language === 'ur' ? 'AI رسک اسکورنگ' : 'AI Risk Scoring'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ur'
            ? 'ہمارا AI انجن ہر مسافر کا تجزیہ کرتا ہے تاکہ ممکنہ مسائل کی نشاندہی کی جا سکے۔'
            : 'Our AI engine analyzes each traveler to identify potential issues before they become problems.'}
        </p>
      </div>

      {/* Scanning animation */}
      {isScanning && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="font-medium">
                {language === 'ur' ? 'AI تجزیہ جاری ہے...' : 'AI Analysis in progress...'}
              </span>
            </div>
            <Progress value={scanProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {language === 'ur' 
                ? `${demoRiskAssessments.length} / ${demoGroup.travelers.length} مسافرین کا تجزیہ ہوا`
                : `Analyzed ${demoRiskAssessments.length} of ${demoGroup.travelers.length} travelers`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results summary */}
      {scanComplete && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 space-y-4">
          {/* Risk distribution */}
          <div className={`grid grid-cols-3 gap-3 ${isRTL ? 'text-right' : ''}`}>
            <Card className={`border ${getRiskColor('high')}`}>
              <CardContent className="p-3 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-red-500" />
                <div className="text-2xl font-bold text-red-500">{highRisk.length}</div>
                <div className="text-xs text-muted-foreground">
                  {language === 'ur' ? 'ہائی رسک' : 'High Risk'}
                </div>
              </CardContent>
            </Card>
            <Card className={`border ${getRiskColor('medium')}`}>
              <CardContent className="p-3 text-center">
                <ShieldAlert className="h-6 w-6 mx-auto mb-1 text-amber-500" />
                <div className="text-2xl font-bold text-amber-500">{mediumRisk.length}</div>
                <div className="text-xs text-muted-foreground">
                  {language === 'ur' ? 'میڈیم رسک' : 'Medium Risk'}
                </div>
              </CardContent>
            </Card>
            <Card className={`border ${getRiskColor('low')}`}>
              <CardContent className="p-3 text-center">
                <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <div className="text-2xl font-bold text-green-500">{lowRisk.length}</div>
                <div className="text-xs text-muted-foreground">
                  {language === 'ur' ? 'لو رسک' : 'Low Risk'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flagged travelers detail */}
          {highRisk.length > 0 && (
            <Card className="border-red-500/30">
              <CardContent className="p-4">
                <h4 className={`font-medium mb-3 flex items-center gap-2 text-red-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <AlertTriangle className="h-4 w-4" />
                  {language === 'ur' ? 'فوری توجہ درکار' : 'Requires Immediate Attention'}
                </h4>
                <div className="space-y-3">
                  {highRisk.map(assessment => {
                    const traveler = demoGroup.travelers.find(t => t.id === assessment.travelerId);
                    return (
                      <div 
                        key={assessment.travelerId}
                        className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                      >
                        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-medium">{traveler?.name}</span>
                          <Badge variant={getRiskBadgeVariant(assessment.riskLevel)}>
                            {language === 'ur' ? 'سکور:' : 'Score:'} {assessment.riskScore}
                          </Badge>
                        </div>
                        <ul className={`text-sm space-y-1 ${isRTL ? 'text-right' : ''}`}>
                          {assessment.reasons.map((reason, i) => (
                            <li key={i} className="text-muted-foreground">{reason}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <strong>{language === 'ur' ? '🤖 AI انسائٹ:' : '🤖 AI Insight:'}</strong>{' '}
        {language === 'ur'
          ? 'سسٹم نے پاسپورٹ فارمیٹ کی خلاف ورزیوں اور نامکمل دستاویزات کا پتہ لگایا۔'
          : 'System detected passport format violations and incomplete documentation patterns.'}
      </div>
    </div>
  );
};
