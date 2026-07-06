'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'bn' | 'ar';

const translations: Record<Language, Record<string, string>> = {
  en: {
    'Dashboard': 'Dashboard',
    'Services': 'Services',
    'Providers': 'Providers',
    'Handymen': 'Handymen',
    'Customers': 'Customers',
    'Bookings': 'Bookings',
    'Finance': 'Finance',
    'Coupons': 'Coupons',
    'Notifications': 'Notifications',
    'Settings': 'Settings',
    'My Services': 'My Services',
    'Unified Inbox': 'Unified Inbox',
    'Reviews': 'Reviews',
    'Verification': 'Verification',
    'Find Provider': 'Find Provider',
    'Find Nearby Provider': 'Find Nearby Provider',
    'My Booking': 'My Booking',
    'Booking History': 'Booking History',
    'notification': 'Notifications',
    "User's profile page": 'Profile',
    'Blogs': 'Blogs',
    'Search': 'Search',
    'Logout': 'Logout',
    'Search bookings or services...': 'Search bookings or services...',
    'Create Post': 'Create Post',
    'Search Blogs': 'Search Blogs',
    'Manage Blogs': 'Manage Blogs',
    'Read More': 'Read More',
    'Edit Post': 'Edit Post',
    'Delete Post': 'Delete Post',
    'Cancel': 'Cancel',
    'Save': 'Save',
    'Publish': 'Publish',
    'Title': 'Title',
    'Content': 'Content',
    'Cover Image URL': 'Cover Image URL',
    'Tags (comma separated)': 'Tags (comma separated)'
  },
  bn: {
    'Dashboard': 'ড্যাশবোর্ড',
    'Services': 'সেবাসমূহ',
    'Providers': 'সেবাদাতাগণ',
    'Handymen': 'হ্যান্ডিম্যান',
    'Customers': 'গ্রাহকগণ',
    'Bookings': 'বুকিংসমূহ',
    'Finance': 'অর্থায়ন',
    'Coupons': 'কুপনসমূহ',
    'Notifications': 'বিজ্ঞপ্তি',
    'Settings': 'সেটিংস',
    'My Services': 'আমার সেবাসমূহ',
    'Unified Inbox': 'ইনবক্স',
    'Reviews': 'রিভিউসমূহ',
    'Verification': 'যাচাইকরণ',
    'Find Provider': 'সেবাদাতা খুঁজুন',
    'Find Nearby Provider': 'নিকটস্থ সেবাদাতা',
    'My Booking': 'আমার বুকিং',
    'Booking History': 'বুকিং ইতিহাস',
    'notification': 'বিজ্ঞপ্তি সমূহ',
    "User's profile page": 'প্রোফাইল',
    'Blogs': 'ব্লগসমূহ',
    'Search': 'অনুসন্ধান',
    'Logout': 'লগআউট',
    'Search bookings or services...': 'বুকিং বা সেবা অনুসন্ধান করুন...',
    'Create Post': 'পোস্ট তৈরি করুন',
    'Search Blogs': 'ব্লগ খুঁজুন',
    'Manage Blogs': 'ব্লগ পরিচালনা',
    'Read More': 'আরও পড়ুন',
    'Edit Post': 'সম্পাদনা করুন',
    'Delete Post': 'মুছে ফেলুন',
    'Cancel': 'বাতিল',
    'Save': 'সংরক্ষণ',
    'Publish': 'প্রকাশ করুন',
    'Title': 'শিরোনাম',
    'Content': 'মূল বক্তব্য',
    'Cover Image URL': 'কভার ইমেজ ইউআরএল',
    'Tags (comma separated)': 'ট্যাগ (কমা দিয়ে আলাদা করা)'
  },
  ar: {
    'Dashboard': 'لوحة القيادة',
    'Services': 'الخدمات',
    'Providers': 'مزودو الخدمة',
    'Handymen': 'العمال',
    'Customers': 'العملاء',
    'Bookings': 'الحجوزات',
    'Finance': 'المالية',
    'Coupons': 'الكوبونات',
    'Notifications': 'الإشعارات',
    'Settings': 'الإعدادات',
    'My Services': 'خدماتي',
    'Unified Inbox': 'صندوق الوارد',
    'Reviews': 'التقييمات',
    'Verification': 'التحقق من الهوية',
    'Find Provider': 'ابحث عن مزود',
    'Find Nearby Provider': 'مزودون بالقرب مني',
    'My Booking': 'حجوزاتي',
    'Booking History': 'سجل الحجوزات',
    'notification': 'الإشعارات المتاحة',
    "User's profile page": 'الملف الشخصي',
    'Blogs': 'المدونات',
    'Search': 'بحث',
    'Logout': 'تسجيل الخروج',
    'Search bookings or services...': 'البحث عن الحجوزات أو الخدمات...',
    'Create Post': 'إنشاء مقال',
    'Search Blogs': 'البحث في المدونات',
    'Manage Blogs': 'إدارة المدونات',
    'Read More': 'قراءة المزيد',
    'Edit Post': 'تعديل المقال',
    'Delete Post': 'حذف المقال',
    'Cancel': 'إلغاء',
    'Save': 'حفظ',
    'Publish': 'نشر',
    'Title': 'العنوان',
    'Content': 'المحتوى',
    'Cover Image URL': 'رابط صورة الغلاف',
    'Tags (comma separated)': 'الوسوم (مفصولة بفاصلة)'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'bn' || saved === 'ar')) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, mounted]);

  const t = (key: string): string => {
    const section = translations[language];
    if (section && key in section) {
      return section[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
