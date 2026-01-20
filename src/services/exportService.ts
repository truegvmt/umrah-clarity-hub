// Export Service - PDF generation for group reports
// Uses jsPDF for client-side PDF creation

import type { Group } from './dbService';
import { WORKFLOW_STEPS } from './workflowService';

export interface ExportOptions {
  includeTravelers: boolean;
  includeHotels: boolean;
  includePaperwork: boolean;
  includeMessaging: boolean;
  includeAuditLog: boolean;
  language: 'en' | 'ur';
}

export interface ExportResult {
  success: boolean;
  filename: string;
  blob?: Blob;
  error?: string;
}

// Simple text-based report generator (jsPDF would be added as dependency for full PDF)
export const exportService = {
  generateReport: async (
    group: Group,
    options: ExportOptions
  ): Promise<ExportResult> => {
    try {
      const lines: string[] = [];
      const isUrdu = options.language === 'ur';

      // Header
      lines.push('═'.repeat(60));
      lines.push(isUrdu ? 'عمرہ آپس - گروپ رپورٹ' : 'UmrahOps - Group Report');
      lines.push('═'.repeat(60));
      lines.push('');

      // Group Info
      lines.push(isUrdu ? `گروپ کا نام: ${group.name}` : `Group Name: ${group.name}`);
      lines.push(isUrdu ? `گروپ ID: ${group.id}` : `Group ID: ${group.id}`);
      lines.push(isUrdu ? `تاریخ: ${group.date}` : `Date: ${group.date}`);
      lines.push(isUrdu ? `کل مسافر: ${group.travelers.length}` : `Total Travelers: ${group.travelers.length}`);
      lines.push('');

      // Progress
      const currentStep = WORKFLOW_STEPS.find(s => s.id === group.currentStep);
      lines.push('─'.repeat(40));
      lines.push(isUrdu ? 'پیش رفت کی حیثیت' : 'Progress Status');
      lines.push('─'.repeat(40));
      lines.push(
        isUrdu
          ? `موجودہ مرحلہ: ${group.currentStep}/6 - ${currentStep?.nameUr || ''}`
          : `Current Step: ${group.currentStep}/6 - ${currentStep?.name || ''}`
      );
      lines.push('');

      // Travelers
      if (options.includeTravelers) {
        lines.push('─'.repeat(40));
        lines.push(isUrdu ? 'مسافرین کی فہرست' : 'Travelers List');
        lines.push('─'.repeat(40));
        
        group.travelers.forEach((t, i) => {
          lines.push(`${i + 1}. ${t.name}`);
          lines.push(`   ${isUrdu ? 'پاسپورٹ' : 'Passport'}: ${t.passport}`);
          lines.push(`   ${isUrdu ? 'بکنگ' : 'Booking'}: ${t.bookingConfirmed ? '✓' : '✗'}`);
          lines.push(`   ${isUrdu ? 'کاغذات' : 'Paperwork'}: ${t.paperworkComplete ? '✓' : '✗'}`);
          lines.push(`   ${isUrdu ? 'پیغام' : 'Message'}: ${t.messageSent ? '✓' : '✗'}`);
          lines.push(`   ${isUrdu ? 'خطرے کا سکور' : 'Risk Score'}: ${t.riskScore}`);
          lines.push('');
        });
      }

      // Summary Statistics
      lines.push('─'.repeat(40));
      lines.push(isUrdu ? 'خلاصہ اعدادوشمار' : 'Summary Statistics');
      lines.push('─'.repeat(40));
      
      const bookingCount = group.travelers.filter(t => t.bookingConfirmed).length;
      const paperworkCount = group.travelers.filter(t => t.paperworkComplete).length;
      const messagingCount = group.travelers.filter(t => t.messageSent).length;
      const total = group.travelers.length;

      lines.push(
        isUrdu
          ? `بکنگز کی تصدیق: ${bookingCount}/${total} (${Math.round((bookingCount / total) * 100)}%)`
          : `Bookings Confirmed: ${bookingCount}/${total} (${Math.round((bookingCount / total) * 100)}%)`
      );
      lines.push(
        isUrdu
          ? `کاغذات مکمل: ${paperworkCount}/${total} (${Math.round((paperworkCount / total) * 100)}%)`
          : `Paperwork Complete: ${paperworkCount}/${total} (${Math.round((paperworkCount / total) * 100)}%)`
      );
      lines.push(
        isUrdu
          ? `پیغامات بھیجے گئے: ${messagingCount}/${total} (${Math.round((messagingCount / total) * 100)}%)`
          : `Messages Sent: ${messagingCount}/${total} (${Math.round((messagingCount / total) * 100)}%)`
      );
      lines.push('');

      // Footer
      lines.push('═'.repeat(60));
      lines.push(
        isUrdu
          ? `رپورٹ بنانے کی تاریخ: ${new Date().toLocaleString('ur-PK')}`
          : `Report Generated: ${new Date().toLocaleString()}`
      );
      lines.push('═'.repeat(60));

      const content = lines.join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const filename = `umrahops-${group.id}-report-${Date.now()}.txt`;

      return {
        success: true,
        filename,
        blob,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  },

  downloadReport: async (group: Group, options: ExportOptions): Promise<boolean> => {
    const result = await exportService.generateReport(group, options);
    
    if (!result.success || !result.blob) {
      console.error('Export failed:', result.error);
      return false;
    }

    // Create download link
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  },

  getPreviewContent: async (group: Group, options: ExportOptions): Promise<string> => {
    const result = await exportService.generateReport(group, options);
    if (!result.success || !result.blob) {
      return 'Preview generation failed';
    }
    return await result.blob.text();
  },
};
