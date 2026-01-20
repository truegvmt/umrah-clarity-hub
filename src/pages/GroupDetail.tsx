import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGroup } from '@/hooks/useGroup';
import { GroupDetailHeader } from '@/components/group-detail/GroupDetailHeader';
import { TravelersTab } from '@/components/group-detail/TravelersTab';
import { HotelsTab } from '@/components/group-detail/HotelsTab';
import { PaperworkTab } from '@/components/group-detail/PaperworkTab';
import { MessagingTab } from '@/components/group-detail/MessagingTab';
import { ExportTab } from '@/components/group-detail/ExportTab';

const GroupDetail = () => {
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const { group, loading, error, riskAssessments, updateTraveler, batchUpdateTravelers } = useGroup(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">{error || 'Group not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GroupDetailHeader group={group} />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="travelers" className="space-y-6">
          <TabsList className={`grid w-full grid-cols-5 ${isRTL ? 'direction-rtl' : ''}`}>
            <TabsTrigger value="travelers">{t('group.tabTravelers')}</TabsTrigger>
            <TabsTrigger value="hotels">{t('group.tabHotels')}</TabsTrigger>
            <TabsTrigger value="paperwork">{t('group.tabPaperwork')}</TabsTrigger>
            <TabsTrigger value="messaging">{t('group.tabMessaging')}</TabsTrigger>
            <TabsTrigger value="export">{t('group.tabExport')}</TabsTrigger>
          </TabsList>

          <TabsContent value="travelers">
            <TravelersTab 
              travelers={group.travelers}
              riskAssessments={riskAssessments}
              onUpdateTraveler={updateTraveler}
              onBatchUpdate={batchUpdateTravelers}
            />
          </TabsContent>

          <TabsContent value="hotels">
            <HotelsTab 
              travelers={group.travelers}
              onUpdateTraveler={updateTraveler}
            />
          </TabsContent>

          <TabsContent value="paperwork">
            <PaperworkTab 
              travelers={group.travelers}
              riskAssessments={riskAssessments}
              onUpdateTraveler={updateTraveler}
              onBatchUpdate={batchUpdateTravelers}
            />
          </TabsContent>

          <TabsContent value="messaging">
            <MessagingTab 
              travelers={group.travelers}
              riskAssessments={riskAssessments}
              groupDate={group.date}
              onUpdateTraveler={updateTraveler}
            />
          </TabsContent>

          <TabsContent value="export">
            <ExportTab group={group} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetail;
