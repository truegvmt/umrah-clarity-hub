import { useState } from 'react';
import { Building2, AlertCircle, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Traveler } from '@/services/dbService';

interface HotelsTabProps {
  travelers: Traveler[];
  onUpdateTraveler: (travelerId: string, updates: Partial<Traveler>) => Promise<void>;
}

// Mock hotels for demonstration
const MOCK_HOTELS = [
  { id: 'h1', name: 'Al Marwa Rayhaan', nameUr: 'المروہ ریحان', rooms: 50, booked: 35 },
  { id: 'h2', name: 'Makkah Towers', nameUr: 'مکہ ٹاورز', rooms: 40, booked: 38 },
  { id: 'h3', name: 'Dar Al Tawhid', nameUr: 'دار التوحید', rooms: 60, booked: 45 },
  { id: 'h4', name: 'Swissotel Makkah', nameUr: 'سوئس ہوٹل مکہ', rooms: 80, booked: 60 },
];

// Track hotel assignments in memory (would be in DB in production)
const hotelAssignments: Record<string, string> = {};

export const HotelsTab = ({ travelers }: HotelsTabProps) => {
  const { t, isRTL, language } = useLanguage();
  const [assignments, setAssignments] = useState<Record<string, string>>(hotelAssignments);

  const getHotelCapacity = (hotelId: string): { available: number; total: number } => {
    const hotel = MOCK_HOTELS.find(h => h.id === hotelId);
    if (!hotel) return { available: 0, total: 0 };
    
    // Count current assignments
    const assigned = Object.values(assignments).filter(h => h === hotelId).length;
    return {
      available: hotel.rooms - hotel.booked - assigned,
      total: hotel.rooms,
    };
  };

  const handleAssign = (travelerId: string, hotelId: string) => {
    const newAssignments = { ...assignments, [travelerId]: hotelId };
    setAssignments(newAssignments);
    Object.assign(hotelAssignments, newAssignments);
  };

  const getHotelName = (hotelId: string): string => {
    const hotel = MOCK_HOTELS.find(h => h.id === hotelId);
    if (!hotel) return '';
    return language === 'ur' ? hotel.nameUr : hotel.name;
  };

  const hasConflict = (hotelId: string): boolean => {
    const capacity = getHotelCapacity(hotelId);
    return capacity.available < 0;
  };

  return (
    <div className="space-y-6">
      {/* Hotel capacity overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_HOTELS.map(hotel => {
          const capacity = getHotelCapacity(hotel.id);
          const isOverbooked = capacity.available < 0;
          
          return (
            <div 
              key={hotel.id} 
              className={`p-4 rounded-lg border ${isOverbooked ? 'border-destructive bg-destructive/5' : 'border-border'}`}
            >
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">
                  {language === 'ur' ? hotel.nameUr : hotel.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isOverbooked ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  {capacity.available} {t('group.available')}
                </span>
                {isOverbooked && <AlertCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignments table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('group.name')}</TableHead>
              <TableHead>{t('group.passport')}</TableHead>
              <TableHead>{t('group.hotelAssignment')}</TableHead>
              <TableHead className="text-center">{t('group.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {travelers.map(traveler => {
              const assignedHotel = assignments[traveler.id];
              const hotel = MOCK_HOTELS.find(h => h.id === assignedHotel);
              const conflict = assignedHotel ? hasConflict(assignedHotel) : false;
              
              return (
                <TableRow key={traveler.id}>
                  <TableCell className="font-medium">{traveler.name}</TableCell>
                  <TableCell><code className="text-sm">{traveler.passport}</code></TableCell>
                  <TableCell>
                    <Select
                      value={assignedHotel || ''}
                      onValueChange={value => handleAssign(traveler.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t('group.selectHotel')} />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_HOTELS.map(h => {
                          const cap = getHotelCapacity(h.id);
                          return (
                            <SelectItem 
                              key={h.id} 
                              value={h.id}
                              disabled={cap.available <= 0 && assignments[traveler.id] !== h.id}
                            >
                              <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {language === 'ur' ? h.nameUr : h.name}
                                <span className="text-muted-foreground text-xs">
                                  ({cap.available} {t('group.left')})
                                </span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    {assignedHotel ? (
                      conflict ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {t('group.overbooking')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                          <Check className="h-3 w-3" />
                          {t('group.assigned')}
                        </Badge>
                      )
                    ) : (
                      <Badge variant="secondary">{t('group.pending')}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
