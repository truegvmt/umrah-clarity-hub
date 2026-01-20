// Message Service - WhatsApp integration and template management
// Generates wa.me links and tracks message status



export type MessageStatus = 'pending' | 'sent' | 'failed';

export interface MessageTemplate {
  id: string;
  name: string;
  nameUr: string;
  content: string;
  contentUr: string;
}

export interface MessageRecord {
  travelerId: string;
  phone: string;
  templateId: string;
  status: MessageStatus;
  sentAt?: string;
}

// Pre-defined message templates
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Message',
    nameUr: 'خوش آمدید پیغام',
    content: 'Assalamu Alaikum! Welcome to your Umrah journey with us. Your booking has been confirmed. We will send you more details soon.',
    contentUr: 'السلام علیکم! ہمارے ساتھ اپنے عمرہ کے سفر میں خوش آمدید۔ آپ کی بکنگ کی تصدیق ہو گئی ہے۔ ہم جلد ہی آپ کو مزید تفصیلات بھیجیں گے۔',
  },
  {
    id: 'paperwork',
    name: 'Paperwork Reminder',
    nameUr: 'کاغذات کی یاد دہانی',
    content: 'Dear pilgrim, please submit your passport copy and visa documents at your earliest. Contact us if you need assistance.',
    contentUr: 'محترم زائر، براہ کرم جلد از جلد اپنے پاسپورٹ کی کاپی اور ویزا دستاویزات جمع کروائیں۔ مدد کے لیے ہم سے رابطہ کریں۔',
  },
  {
    id: 'departure',
    name: 'Departure Details',
    nameUr: 'روانگی کی تفصیلات',
    content: 'Your departure is confirmed for {date}. Please arrive at the airport 4 hours before flight. May Allah accept your Umrah.',
    contentUr: 'آپ کی روانگی {date} کے لیے طے ہے۔ براہ کرم پرواز سے 4 گھنٹے پہلے ہوائی اڈے پہنچیں۔ اللہ آپ کا عمرہ قبول فرمائے۔',
  },
  {
    id: 'hotel',
    name: 'Hotel Information',
    nameUr: 'ہوٹل کی معلومات',
    content: 'Your hotel accommodation has been arranged. Hotel: {hotel}, Check-in: {checkin}, Check-out: {checkout}. Safe travels!',
    contentUr: 'آپ کے ہوٹل کا انتظام ہو گیا ہے۔ ہوٹل: {hotel}، چیک ان: {checkin}، چیک آؤٹ: {checkout}۔ محفوظ سفر!',
  },
];

// Storage key for message records
const MESSAGE_STORAGE_KEY = 'umrahops_messages';

const getStoredMessages = (): MessageRecord[] => {
  const stored = localStorage.getItem(MESSAGE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveMessages = (messages: MessageRecord[]) => {
  localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages));
};

export const messageService = {
  getTemplates: (): MessageTemplate[] => MESSAGE_TEMPLATES,

  getTemplate: (templateId: string): MessageTemplate | undefined => {
    return MESSAGE_TEMPLATES.find(t => t.id === templateId);
  },

  generateWhatsAppLink: (phone: string, message: string): string => {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  },

  prepareMessage: (
    template: MessageTemplate,
    variables: Record<string, string> = {},
    language: 'en' | 'ur' = 'en'
  ): string => {
    let content = language === 'ur' ? template.contentUr : template.content;
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    
    return content;
  },

  openWhatsApp: (phone: string, message: string): void => {
    const link = messageService.generateWhatsAppLink(phone, message);
    window.open(link, '_blank');
  },

  getMessageRecord: (travelerId: string): MessageRecord | undefined => {
    const messages = getStoredMessages();
    return messages.find(m => m.travelerId === travelerId);
  },

  updateMessageStatus: (
    travelerId: string,
    phone: string,
    templateId: string,
    status: MessageStatus
  ): MessageRecord => {
    const messages = getStoredMessages();
    const existingIndex = messages.findIndex(m => m.travelerId === travelerId);
    
    const record: MessageRecord = {
      travelerId,
      phone,
      templateId,
      status,
      sentAt: status === 'sent' ? new Date().toISOString() : undefined,
    };

    if (existingIndex >= 0) {
      messages[existingIndex] = record;
    } else {
      messages.push(record);
    }

    saveMessages(messages);
    return record;
  },

  getStatusIcon: (status: MessageStatus): string => {
    switch (status) {
      case 'sent': return '✅';
      case 'pending': return '⚠️';
      case 'failed': return '❌';
      default: return '⏳';
    }
  },

  getStatusColor: (status: MessageStatus): string => {
    switch (status) {
      case 'sent': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  },
};
