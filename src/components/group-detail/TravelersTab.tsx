import { useState } from 'react';
import { Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/hooks/useNotifications';
import { CSVUpload } from '@/components/group-detail/CSVUpload';
import type { Traveler } from '@/services/dbService';
import type { RiskAssessment } from '@/services/aiService';
import { aiService } from '@/services/aiService';

interface TravelersTabProps {
  travelers: Traveler[];
  riskAssessments: RiskAssessment[];
  onUpdateTraveler: (travelerId: string, updates: Partial<Traveler>) => Promise<void>;
  onBatchUpdate: (updates: { id: string; changes: Partial<Traveler> }[]) => Promise<void>;
  onImportTravelers?: (travelers: Omit<Traveler, 'id'>[]) => Promise<void>;
}

export const TravelersTab = ({ 
  travelers, 
  riskAssessments, 
  onUpdateTraveler,
  onBatchUpdate,
  onImportTravelers
}: TravelersTabProps) => {
  const { t, isRTL, language } = useLanguage();
  const { notify } = useNotifications();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Traveler>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const getRiskAssessment = (travelerId: string): RiskAssessment | undefined => {
    return riskAssessments.find(r => r.travelerId === travelerId);
  };

  const startEdit = (traveler: Traveler) => {
    setEditingId(traveler.id);
    setEditForm({
      name: traveler.name,
      passport: traveler.passport,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (travelerId: string) => {
    const traveler = travelers.find(t => t.id === travelerId);
    await onUpdateTraveler(travelerId, editForm);
    notify('traveler_updated', { travelerName: traveler?.name || editForm.name });
    setEditingId(null);
    setEditForm({});
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === travelers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(travelers.map(t => t.id)));
    }
  };

  const handleBulkBookingConfirm = async () => {
    const updates = Array.from(selectedIds).map(id => ({
      id,
      changes: { bookingConfirmed: true },
    }));
    await onBatchUpdate(updates);
    notify('booking_confirmed', { count: selectedIds.size });
    setSelectedIds(new Set());
  };

  const handleCheckboxChange = async (
    travelerId: string, 
    field: 'bookingConfirmed' | 'paperworkComplete' | 'messageSent', 
    checked: boolean
  ) => {
    const traveler = travelers.find(t => t.id === travelerId);
    await onUpdateTraveler(travelerId, { [field]: checked });
    
    if (checked) {
      if (field === 'bookingConfirmed') {
        notify('booking_confirmed', { travelerName: traveler?.name });
      } else if (field === 'paperworkComplete') {
        notify('paperwork_complete', { travelerName: traveler?.name });
      } else if (field === 'messageSent') {
        notify('message_sent', { travelerName: traveler?.name });
      }
    }
  };

  const handleCSVImport = async (newTravelers: Omit<Traveler, 'id'>[]) => {
    if (onImportTravelers) {
      await onImportTravelers(newTravelers);
      notify('csv_imported', { count: newTravelers.length });
    }
  };

  return (
    <div className="space-y-6">
      {/* CSV Upload Section */}
      {onImportTravelers && (
        <CSVUpload onImport={handleCSVImport} />
      )}

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className={`flex items-center gap-2 p-3 bg-muted rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-medium">
            {selectedIds.size} {t('group.selected')}
          </span>
          <Button size="sm" variant="outline" onClick={handleBulkBookingConfirm}>
            {t('group.confirmBookings')}
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === travelers.length && travelers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>{t('group.name')}</TableHead>
              <TableHead>{t('group.passport')}</TableHead>
              <TableHead className="text-center">{t('dashboard.booking')}</TableHead>
              <TableHead className="text-center">{t('dashboard.paperwork')}</TableHead>
              <TableHead className="text-center">{t('dashboard.messaging')}</TableHead>
              <TableHead className="text-center">{t('dashboard.risk')}</TableHead>
              <TableHead className="w-20">{t('group.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {travelers.map(traveler => {
              const risk = getRiskAssessment(traveler.id);
              const isEditing = editingId === traveler.id;
              
              return (
                <TableRow key={traveler.id} className={!traveler.bookingConfirmed || !traveler.paperworkComplete ? 'bg-destructive/5' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(traveler.id)}
                      onCheckedChange={() => toggleSelect(traveler.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editForm.name || ''}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="h-8"
                      />
                    ) : (
                      <span className="font-medium">{traveler.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editForm.passport || ''}
                        onChange={e => setEditForm({ ...editForm, passport: e.target.value })}
                        className="h-8"
                      />
                    ) : (
                      <code className="text-sm">{traveler.passport}</code>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={traveler.bookingConfirmed}
                      onCheckedChange={checked => 
                        handleCheckboxChange(traveler.id, 'bookingConfirmed', !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={traveler.paperworkComplete}
                      onCheckedChange={checked => 
                        handleCheckboxChange(traveler.id, 'paperworkComplete', !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={traveler.messageSent}
                      onCheckedChange={checked => 
                        handleCheckboxChange(traveler.id, 'messageSent', !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {risk && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge 
                              variant={risk.riskLevel === 'high' ? 'destructive' : risk.riskLevel === 'medium' ? 'secondary' : 'outline'}
                              className="cursor-help"
                            >
                              {risk.riskLevel === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {aiService.getRiskLevelLabel(risk.riskLevel, language)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium">{t('group.riskReasons')}:</p>
                              <ul className="text-sm list-disc list-inside">
                                {risk.reasons.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(traveler.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(traveler)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
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
