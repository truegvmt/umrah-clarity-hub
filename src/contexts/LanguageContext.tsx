import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Hero
    'hero.tagline': 'Empower Your Umrah Journeys: From Chaos to Clarity, One Pilgrim at a Time.',
    'hero.subtitle': 'Local-first PWA for agents—upload, validate, manage, and export pilgrim data securely offline.',
    'hero.cta': 'Get Started Free',
    'hero.ctaNote': 'No Data Leaves Your Device',
    'hero.signUp': 'Sign Up',
    'hero.logIn': 'Log In',
    
    // Navigation
    'nav.features': 'Features',
    'nav.blueprint': 'Blueprint',
    'nav.contact': 'Contact',
    
    // Blueprint Section
    'blueprint.title': 'Maximal Background Integration Blueprint',
    'blueprint.subtitle': 'Swap .env once, connect DB, and UmrahOps is ready—full pipelines from auth to exports.',
    
    // Pipeline titles
    'pipeline.env': 'Environment & Config Pipeline',
    'pipeline.env.desc': 'Centralized .env file loads all credentials for Supabase, OpenAI, and logging services. Single source of truth for seamless configuration.',
    
    'pipeline.auth': 'Authentication Pipeline',
    'pipeline.auth.desc': 'Supabase Auth integration with secure token management. .env provides VITE_SUPABASE_URL and ANON_KEY for instant setup.',
    
    'pipeline.csv': 'CSV Import & Cleaning Pipeline',
    'pipeline.csv.desc': 'Upload CSVs, normalize data into local SQLite, auto-detect duplicates and missing fields. DB layer handles all validation.',
    
    'pipeline.ai': 'AI/Predictive Pipeline',
    'pipeline.ai.desc': 'GPT-4o-mini powered risk scoring for travelers. OPENAI_API_KEY from .env enables intelligent conflict detection.',
    
    'pipeline.workflow': 'Workflow/Step Engine Pipeline',
    'pipeline.workflow.desc': 'State machine for pilgrim progress tracking. Local DB triggers UI updates and background syncs.',
    
    'pipeline.whatsapp': 'WhatsApp Messaging Pipeline',
    'pipeline.whatsapp.desc': 'One-click messaging with DB-tracked delivery status. Template management and batch sending capabilities.',
    
    'pipeline.pdf': 'PDF Export Pipeline',
    'pipeline.pdf.desc': 'Client-side PDF generation for paperwork. No server required—all exports happen locally.',
    
    'pipeline.audit': 'Audit & Logging Pipeline',
    'pipeline.audit.desc': 'Immutable audit logs in local SQLite with optional push to LOG_SERVER_URL for compliance.',
    
    'pipeline.sync': 'UI Refresh/Background Sync Pipeline',
    'pipeline.sync.desc': 'Real-time UI updates from DB changes. Service worker enables offline-first functionality.',
    
    'pipeline.dev': 'Developer-Friendly Notes Pipeline',
    'pipeline.dev.desc': 'Comprehensive documentation and migration scripts. Environment-based configuration for dev/staging/prod.',
    
    'pipeline.storage': 'Local Storage Pipeline',
    'pipeline.storage.desc': 'SQLite-powered local database with Prisma ORM. All sensitive data stays on-device for privacy.',
    
    // Features
    'features.title': 'Core Capabilities',
    'features.subtitle': 'Powered by centralized .env for seamless setup',
    
    'feature.validation.title': 'Smart Validation',
    'feature.validation.desc': 'Auto-detect overbookings and conflicts via DB validation. Catch errors before they become problems.',
    
    'feature.whatsapp.title': 'WhatsApp Integration',
    'feature.whatsapp.desc': 'One-click messaging with DB-tracked status. Keep pilgrims informed throughout their journey.',
    
    'feature.audit.title': 'Immutable Audits',
    'feature.audit.desc': 'Complete audit trails in local DB with optional remote push. Full compliance, zero data loss.',
    
    'feature.offline.title': 'Offline-First',
    'feature.offline.desc': 'All operations work without internet. .env-configured services sync when connectivity returns.',
    
    // Footer
    'footer.privacy': 'Privacy',
    'footer.contact': 'Contact',
    'footer.copyright': '© 2026 UmrahOps. All rights reserved.',
    'footer.tagline': 'Your data stays local. Your pilgrims stay organized.',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.account': 'My Account',
    'auth.signOut': 'Sign Out',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of all your assigned groups',
    'dashboard.searchPlaceholder': 'Search groups...',
    'dashboard.groupName': 'Group Name',
    'dashboard.date': 'Date',
    'dashboard.travelers': 'Travelers',
    'dashboard.booking': 'Booking',
    'dashboard.paperwork': 'Paperwork',
    'dashboard.messaging': 'Messaging',
    'dashboard.progress': 'Progress',
    'dashboard.open': 'Open',
    'dashboard.openGroup': 'Open Group',
    'dashboard.noGroups': 'No groups found',
    'dashboard.bookingsConfirmed': 'Bookings confirmed',
    'dashboard.paperworkComplete': 'Paperwork complete',
    'dashboard.messagesSent': 'Messages sent',
    'dashboard.risk': 'Risk',
    'dashboard.totalGroups': 'Total Groups',
    'dashboard.totalTravelers': 'Total Travelers',
    'dashboard.avgBooking': 'Avg Booking',
    'dashboard.avgPaperwork': 'Avg Paperwork',
    'dashboard.avgMessaging': 'Avg Messaging',
    'dashboard.refresh': 'Refresh',
    'dashboard.retry': 'Retry',
    'dashboard.sortBy': 'Sort by',
    'dashboard.sortDateDesc': 'Date (newest)',
    'dashboard.sortDateAsc': 'Date (oldest)',
    'dashboard.sortCompletion': 'Completion',
    'dashboard.sortRisk': 'Risk level',
    'dashboard.sortTravelers': 'Travelers count',
    'dashboard.filterBy': 'Filter',
    'dashboard.filterAll': 'All groups',
    'dashboard.filterComplete': 'Complete',
    'dashboard.filterInProgress': 'In progress',
    'dashboard.filterAtRisk': 'At risk',
    'dashboard.backToDashboard': 'Back to Dashboard',
    'dashboard.groupDetail': 'Group Detail',
    'dashboard.groupDetailPlaceholder': 'Full group management interface coming soon...',
    // Group Detail
    'group.tabTravelers': 'Travelers',
    'group.tabHotels': 'Hotels',
    'group.tabPaperwork': 'Paperwork',
    'group.tabMessaging': 'Messaging',
    'group.tabExport': 'Export',
    'group.name': 'Name',
    'group.passport': 'Passport',
    'group.actions': 'Actions',
    'group.selected': 'selected',
    'group.confirmBookings': 'Confirm Bookings',
    'group.riskReasons': 'Risk Reasons',
    'group.available': 'available',
    'group.hotelAssignment': 'Hotel Assignment',
    'group.selectHotel': 'Select Hotel',
    'group.left': 'left',
    'group.overbooking': 'Overbooking',
    'group.assigned': 'Assigned',
    'group.pending': 'Pending',
    'group.status': 'Status',
    'group.overallProgress': 'Overall Progress',
    'group.complete': 'Complete',
    'group.inProgress': 'In Progress',
    'group.incomplete': 'Incomplete',
    'group.filterByRisk': 'Filter by Risk',
    'group.highRisk': 'High Risk',
    'group.mediumRisk': 'Medium Risk',
    'group.lowRisk': 'Low Risk',
    'group.markAllComplete': 'Mark All Complete',
    'group.selectTemplate': 'Select Template',
    'group.messagesSummary': 'Messages Sent',
    'group.sent': 'Sent',
    'group.template': 'Template',
    'group.priority': 'Priority',
    'group.highPriority': 'High',
    'group.mediumPriority': 'Medium',
    'group.lowPriority': 'Low',
    'group.openWhatsApp': 'WhatsApp',
    'group.markSent': 'Mark Sent',
    'group.markFailed': 'Failed',
    'group.delivered': 'Delivered',
    'group.notSent': 'Not Sent',
    'group.failed': 'Failed',
    'group.exportOptions': 'Export Options',
    'group.includeTravelers': 'Include Travelers List',
    'group.includeHotels': 'Include Hotel Assignments',
    'group.includePaperwork': 'Include Paperwork Status',
    'group.includeMessaging': 'Include Messaging Summary',
    'group.includeAuditLog': 'Include Audit Log',
    'group.previewReport': 'Preview Report',
    'group.downloadReport': 'Download Report',
    'group.reportPreview': 'Report Preview',
    'group.clickPreview': 'Click "Preview Report" to see the report',
    'group.exportSuccess': 'Report downloaded successfully',
    'group.exportFailed': 'Failed to generate report',
  },
  ur: {
    // Hero
    'hero.tagline': 'اپنے عمرہ کے سفر کو بااختیار بنائیں: افراتفری سے وضاحت تک، ایک زائر ایک وقت میں۔',
    'hero.subtitle': 'ایجنٹس کے لیے لوکل فرسٹ PWA—اپ لوڈ کریں، توثیق کریں، زائرین کا ڈیٹا آف لائن محفوظ طریقے سے منظم کریں اور ایکسپورٹ کریں۔',
    'hero.cta': 'مفت شروع کریں',
    'hero.ctaNote': 'کوئی ڈیٹا آپ کے آلے سے باہر نہیں جاتا',
    'hero.signUp': 'سائن اپ',
    'hero.logIn': 'لاگ ان',
    
    // Navigation
    'nav.features': 'خصوصیات',
    'nav.blueprint': 'بلیو پرنٹ',
    'nav.contact': 'رابطہ',
    
    // Blueprint Section
    'blueprint.title': 'زیادہ سے زیادہ بیک گراؤنڈ انٹیگریشن بلیو پرنٹ',
    'blueprint.subtitle': 'ایک بار .env بدلیں، DB کنیکٹ کریں، اور UmrahOps تیار ہے—auth سے exports تک مکمل پائپ لائنز۔',
    
    // Pipeline titles
    'pipeline.env': 'ماحول اور کنفیگ پائپ لائن',
    'pipeline.env.desc': 'مرکزی .env فائل Supabase، OpenAI، اور لاگنگ سروسز کے لیے تمام اسناد لوڈ کرتی ہے۔ بے ہموار کنفیگریشن کے لیے واحد ذریعہ۔',
    
    'pipeline.auth': 'توثیق پائپ لائن',
    'pipeline.auth.desc': 'محفوظ ٹوکن مینجمنٹ کے ساتھ Supabase Auth انٹیگریشن۔ .env فوری سیٹ اپ کے لیے VITE_SUPABASE_URL اور ANON_KEY فراہم کرتا ہے۔',
    
    'pipeline.csv': 'CSV درآمد اور صفائی پائپ لائن',
    'pipeline.csv.desc': 'CSVs اپ لوڈ کریں، ڈیٹا کو مقامی SQLite میں نارملائز کریں، ڈپلیکیٹس اور گمشدہ فیلڈز کا خودکار پتہ لگائیں۔ DB لیئر تمام توثیق کو سنبھالتی ہے۔',
    
    'pipeline.ai': 'AI/پیش گوئی پائپ لائن',
    'pipeline.ai.desc': 'مسافروں کے لیے GPT-4o-mini سے چلنے والی رسک سکورنگ۔ .env سے OPENAI_API_KEY ذہین تنازعات کا پتہ لگانے کو فعال کرتی ہے۔',
    
    'pipeline.workflow': 'ورک فلو/سٹیپ انجن پائپ لائن',
    'pipeline.workflow.desc': 'زائرین کی پیش رفت کی ٹریکنگ کے لیے اسٹیٹ مشین۔ مقامی DB UI اپ ڈیٹس اور بیک گراؤنڈ سنکس کو ٹرگر کرتی ہے۔',
    
    'pipeline.whatsapp': 'واٹس ایپ میسجنگ پائپ لائن',
    'pipeline.whatsapp.desc': 'DB-ٹریکڈ ڈیلیوری اسٹیٹس کے ساتھ ایک کلک میسجنگ۔ ٹیمپلیٹ مینجمنٹ اور بیچ بھیجنے کی صلاحیتیں۔',
    
    'pipeline.pdf': 'PDF ایکسپورٹ پائپ لائن',
    'pipeline.pdf.desc': 'کاغذی کارروائی کے لیے کلائنٹ سائیڈ PDF جنریشن۔ کوئی سرور درکار نہیں—تمام ایکسپورٹس مقامی طور پر ہوتے ہیں۔',
    
    'pipeline.audit': 'آڈٹ اور لاگنگ پائپ لائن',
    'pipeline.audit.desc': 'تعمیل کے لیے LOG_SERVER_URL پر اختیاری پش کے ساتھ مقامی SQLite میں ناقابل تغیر آڈٹ لاگز۔',
    
    'pipeline.sync': 'UI ریفریش/بیک گراؤنڈ سنک پائپ لائن',
    'pipeline.sync.desc': 'DB تبدیلیوں سے ریئل ٹائم UI اپ ڈیٹس۔ سروس ورکر آف لائن فرسٹ فنکشنالٹی کو فعال کرتا ہے۔',
    
    'pipeline.dev': 'ڈیولپر دوستانہ نوٹس پائپ لائن',
    'pipeline.dev.desc': 'جامع دستاویزات اور مائیگریشن اسکرپٹس۔ dev/staging/prod کے لیے ماحول پر مبنی کنفیگریشن۔',
    
    'pipeline.storage': 'لوکل اسٹوریج پائپ لائن',
    'pipeline.storage.desc': 'Prisma ORM کے ساتھ SQLite سے چلنے والا مقامی ڈیٹا بیس۔ رازداری کے لیے تمام حساس ڈیٹا آلے پر رہتا ہے۔',
    
    // Features
    'features.title': 'بنیادی صلاحیتیں',
    'features.subtitle': 'بے ہموار سیٹ اپ کے لیے مرکزی .env سے تقویت یافتہ',
    
    'feature.validation.title': 'سمارٹ توثیق',
    'feature.validation.desc': 'DB توثیق کے ذریعے اوور بکنگز اور تنازعات کا خودکار پتہ لگائیں۔ غلطیوں کو مسائل بننے سے پہلے پکڑیں۔',
    
    'feature.whatsapp.title': 'واٹس ایپ انٹیگریشن',
    'feature.whatsapp.desc': 'DB-ٹریکڈ اسٹیٹس کے ساتھ ایک کلک میسجنگ۔ زائرین کو ان کے سفر میں باخبر رکھیں۔',
    
    'feature.audit.title': 'ناقابل تغیر آڈٹس',
    'feature.audit.desc': 'اختیاری ریموٹ پش کے ساتھ مقامی DB میں مکمل آڈٹ ٹریلز۔ مکمل تعمیل، صفر ڈیٹا نقصان۔',
    
    'feature.offline.title': 'آف لائن فرسٹ',
    'feature.offline.desc': 'تمام آپریشنز بغیر انٹرنیٹ کے کام کرتے ہیں۔ .env-کنفیگرڈ سروسز کنیکٹیویٹی واپس آنے پر سنک ہوتی ہیں۔',
    
    // Footer
    'footer.privacy': 'رازداری',
    'footer.contact': 'رابطہ',
    'footer.copyright': '© 2026 UmrahOps۔ جملہ حقوق محفوظ ہیں۔',
    'footer.tagline': 'آپ کا ڈیٹا مقامی رہتا ہے۔ آپ کے زائرین منظم رہتے ہیں۔',
    
    // Auth
    'auth.email': 'ای میل',
    'auth.password': 'پاس ورڈ',
    'auth.account': 'میرا اکاؤنٹ',
    'auth.signOut': 'سائن آؤٹ',
    
    // Dashboard
    'dashboard.title': 'ڈیش بورڈ',
    'dashboard.subtitle': 'آپ کے تمام تفویض کردہ گروپس کا جائزہ',
    'dashboard.searchPlaceholder': 'گروپس تلاش کریں...',
    'dashboard.groupName': 'گروپ کا نام',
    'dashboard.date': 'تاریخ',
    'dashboard.travelers': 'مسافر',
    'dashboard.booking': 'بکنگ',
    'dashboard.paperwork': 'کاغذات',
    'dashboard.messaging': 'پیغامات',
    'dashboard.progress': 'پیش رفت',
    'dashboard.open': 'کھولیں',
    'dashboard.openGroup': 'گروپ کھولیں',
    'dashboard.noGroups': 'کوئی گروپ نہیں ملا',
    'dashboard.bookingsConfirmed': 'بکنگز کی تصدیق',
    'dashboard.paperworkComplete': 'کاغذات مکمل',
    'dashboard.messagesSent': 'پیغامات بھیجے گئے',
    'dashboard.risk': 'خطرہ',
    'dashboard.totalGroups': 'کل گروپس',
    'dashboard.totalTravelers': 'کل مسافر',
    'dashboard.avgBooking': 'اوسط بکنگ',
    'dashboard.avgPaperwork': 'اوسط کاغذات',
    'dashboard.avgMessaging': 'اوسط پیغامات',
    'dashboard.refresh': 'ریفریش',
    'dashboard.retry': 'دوبارہ کوشش',
    'dashboard.sortBy': 'ترتیب',
    'dashboard.sortDateDesc': 'تاریخ (جدید)',
    'dashboard.sortDateAsc': 'تاریخ (پرانی)',
    'dashboard.sortCompletion': 'تکمیل',
    'dashboard.sortRisk': 'خطرے کی سطح',
    'dashboard.sortTravelers': 'مسافرین کی تعداد',
    'dashboard.filterBy': 'فلٹر',
    'dashboard.filterAll': 'تمام گروپس',
    'dashboard.filterComplete': 'مکمل',
    'dashboard.filterInProgress': 'جاری',
    'dashboard.filterAtRisk': 'خطرے میں',
    'dashboard.backToDashboard': 'ڈیش بورڈ پر واپس',
    'dashboard.groupDetail': 'گروپ کی تفصیل',
    'dashboard.groupDetailPlaceholder': 'مکمل گروپ مینجمنٹ انٹرفیس جلد آ رہا ہے...',
    // Group Detail
    'group.tabTravelers': 'مسافرین',
    'group.tabHotels': 'ہوٹل',
    'group.tabPaperwork': 'کاغذات',
    'group.tabMessaging': 'پیغامات',
    'group.tabExport': 'ایکسپورٹ',
    'group.name': 'نام',
    'group.passport': 'پاسپورٹ',
    'group.actions': 'اقدامات',
    'group.selected': 'منتخب',
    'group.confirmBookings': 'بکنگز کی تصدیق',
    'group.riskReasons': 'خطرے کی وجوہات',
    'group.available': 'دستیاب',
    'group.hotelAssignment': 'ہوٹل کی تفویض',
    'group.selectHotel': 'ہوٹل منتخب کریں',
    'group.left': 'باقی',
    'group.overbooking': 'اوور بکنگ',
    'group.assigned': 'تفویض',
    'group.pending': 'زیر التوا',
    'group.status': 'حیثیت',
    'group.overallProgress': 'مجموعی پیش رفت',
    'group.complete': 'مکمل',
    'group.inProgress': 'جاری',
    'group.incomplete': 'نامکمل',
    'group.filterByRisk': 'خطرے کے لحاظ سے',
    'group.highRisk': 'زیادہ خطرہ',
    'group.mediumRisk': 'درمیانہ خطرہ',
    'group.lowRisk': 'کم خطرہ',
    'group.markAllComplete': 'سب مکمل کریں',
    'group.selectTemplate': 'ٹیمپلیٹ منتخب کریں',
    'group.messagesSummary': 'پیغامات بھیجے گئے',
    'group.sent': 'بھیجا گیا',
    'group.template': 'ٹیمپلیٹ',
    'group.priority': 'ترجیح',
    'group.highPriority': 'اعلی',
    'group.mediumPriority': 'درمیانی',
    'group.lowPriority': 'کم',
    'group.openWhatsApp': 'واٹس ایپ',
    'group.markSent': 'بھیجا گیا',
    'group.markFailed': 'ناکام',
    'group.delivered': 'پہنچ گیا',
    'group.notSent': 'نہیں بھیجا',
    'group.failed': 'ناکام',
    'group.exportOptions': 'ایکسپورٹ کے اختیارات',
    'group.includeTravelers': 'مسافرین کی فہرست شامل کریں',
    'group.includeHotels': 'ہوٹل کی تفویض شامل کریں',
    'group.includePaperwork': 'کاغذات کی حیثیت شامل کریں',
    'group.includeMessaging': 'پیغامات کا خلاصہ شامل کریں',
    'group.includeAuditLog': 'آڈٹ لاگ شامل کریں',
    'group.previewReport': 'رپورٹ کا پیش نظارہ',
    'group.downloadReport': 'رپورٹ ڈاؤن لوڈ کریں',
    'group.reportPreview': 'رپورٹ کا پیش نظارہ',
    'group.clickPreview': 'رپورٹ دیکھنے کے لیے "پیش نظارہ" پر کلک کریں',
    'group.exportSuccess': 'رپورٹ کامیابی سے ڈاؤن لوڈ ہو گئی',
    'group.exportFailed': 'رپورٹ بنانے میں ناکامی',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('umrahops-language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('umrahops-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ur';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    if (isRTL) {
      document.body.style.fontFamily = "'Noto Nastaliq Urdu', serif";
    } else {
      document.body.style.fontFamily = '';
    }
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
