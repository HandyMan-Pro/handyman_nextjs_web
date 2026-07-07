'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, Shield, CreditCard, AlertTriangle, 
  CheckCircle2, Loader2, Moon, Sun, Globe, Check 
} from 'lucide-react';
import { useTheme } from '../../../ThemeProvider';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { apiClient } from '../../../../lib/apiClient';

// ─── VALIDATION SCHEMAS ──────────────────────────────────────────────────────
const personalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

const bankSchema = z.object({
  bank_name: z.string().min(2, 'Bank name must be at least 2 characters'),
  account_number: z.string().min(5, 'Account number must be at least 5 characters'),
  routing_code: z.string().min(2, 'Routing/IFSC code must be at least 2 characters'),
});

const securitySchema = z.object({
  current_password: z.string().min(4, 'Current password must be at least 4 characters'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type PersonalFormValues = z.infer<typeof personalSchema>;
type BankFormValues = z.infer<typeof bankSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;

export default function HandymanProfilePage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'personal' | 'bank' | 'security'>('personal');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Notification states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    reset: resetPersonal,
    formState: { errors: personalErrors },
  } = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
  });

  const {
    register: registerBank,
    handleSubmit: handleSubmitBank,
    reset: resetBank,
    formState: { errors: bankErrors },
  } = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
  });

  const {
    register: registerSecurity,
    handleSubmit: handleSubmitSecurity,
    reset: resetSecurity,
    formState: { errors: securityErrors },
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
  });

  // Fetch Profile on Mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiClient.get('/handyman/profile/');
        setProfileData(res.data);
        
        // Reset forms with loaded values
        resetPersonal({
          name: res.data.name || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
        
        resetBank({
          bank_name: res.data.bank_details?.bank_name || '',
          account_number: res.data.bank_details?.account_number || '',
          routing_code: res.data.bank_details?.routing_code || '',
        });
        
        setLoading(false);
      } catch (err: any) {
        setErrorMsg('Failed to load profile details. Please try again.');
        setLoading(false);
      }
    }
    fetchProfile();
  }, [resetPersonal, resetBank]);

  // Form Submissions
  const onSavePersonal = async (data: PersonalFormValues) => {
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await apiClient.put('/handyman/profile/personal', data);
      setSuccessMsg('Personal details updated successfully!');
      
      // Update local profileData view
      setProfileData((prev: any) => ({
        ...prev,
        name: data.name,
        phone: data.phone,
        address: data.address
      }));
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update personal details.');
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveBank = async (data: BankFormValues) => {
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await apiClient.put('/handyman/profile/bank-details', data);
      setSuccessMsg('Payout bank details updated successfully!');
      
      setProfileData((prev: any) => ({
        ...prev,
        bank_details: data
      }));
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update bank details.');
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveSecurity = async (data: SecurityFormValues) => {
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await apiClient.put('/handyman/profile/password', {
        current_password: data.current_password,
        new_password: data.new_password
      });
      setSuccessMsg('Password updated successfully!');
      resetSecurity();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update password. Verify your current password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    if (lang === 'Arabic') {
      setLanguage('ar');
      document.body.dir = 'rtl';
    } else if (lang === 'English') {
      setLanguage('en');
      document.body.dir = 'ltr';
    } else {
      // Map French/Other to en for context, but keep local settings dir
      setLanguage('en');
      document.body.dir = 'ltr';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-2" />
        <p className="text-sm text-zinc-400">Fetching your profile configuration...</p>
      </div>
    );
  }

  // Fallback initial generator
  const initials = profileData?.name
    ? profileData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HP';

  return (
    <div className="w-full h-full p-6 lg:p-8 flex flex-col lg:flex-row gap-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      
      {/* ─── LEFT PANE: USER PROFILE SUMMARY & APP SETTINGS ────────────────── */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
          {profileData?.avatar ? (
            <img 
              src={profileData.avatar} 
              alt={profileData.name} 
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/20 mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-inner">
              {initials}
            </div>
          )}
          <h2 className="text-xl font-bold tracking-tight">{profileData?.name}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{profileData?.email}</p>
          <span className="mt-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Handyman Partner
          </span>
        </div>

        {/* Global Settings & Toggles Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
            Preferences & Settings
          </h3>

          {/* Theme Selector Toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Optimize screen luminosity</p>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                theme === 'dark' ? 'bg-indigo-600' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Language Selection Dropdown */}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm font-medium">App Language / RTL</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">Toggle multi-language support</p>
              </div>
            </div>
            <select
              value={language === 'ar' ? 'Arabic' : 'English'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="English">English (LTR)</option>
              <option value="Arabic">العربية (Arabic - RTL)</option>
              <option value="French">Français (French - LTR)</option>
            </select>
          </div>

        </div>

      </div>

      {/* ─── RIGHT PANE: FORM EDIT TABS ───────────────────────────────────── */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        
        {/* Notification Toasts */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
          
          {/* Tab Navigation Header */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <button
              onClick={() => { setActiveTab('personal'); setSuccessMsg(null); setErrorMsg(null); }}
              className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'personal'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <User className="w-4 h-4" />
              Personal Info
            </button>
            <button
              onClick={() => { setActiveTab('bank'); setSuccessMsg(null); setErrorMsg(null); }}
              className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'bank'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Bank Details
            </button>
            <button
              onClick={() => { setActiveTab('security'); setSuccessMsg(null); setErrorMsg(null); }}
              className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'security'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security
            </button>
          </div>

          {/* Form Content Pane */}
          <div className="p-6 lg:p-8 flex-1">

            {/* 1. PERSONAL INFO TAB */}
            {activeTab === 'personal' && (
              <form onSubmit={handleSubmitPersonal(onSavePersonal)} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...registerPersonal('name')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. John Doe"
                    />
                    {personalErrors.name && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{personalErrors.name.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData?.email}
                      disabled
                      className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl py-3 px-4 text-sm text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      {...registerPersonal('phone')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. +1 555-0199"
                    />
                    {personalErrors.phone && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{personalErrors.phone.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      Physical Address
                    </label>
                    <textarea
                      rows={3}
                      {...registerPersonal('address')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Street name, City, Zip Code"
                    />
                    {personalErrors.address && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{personalErrors.address.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* 2. BANK DETAILS TAB */}
            {activeTab === 'bank' && (
              <form onSubmit={handleSubmitBank(onSaveBank)} className="flex flex-col gap-6">
                
                {/* Warning Banner */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">Payout Account Warning</p>
                    <p className="mt-1 font-sans text-zinc-600 dark:text-zinc-300">
                      Ensure these details are accurate to avoid payout delays. Payout transfers are settled automatically using the registered Routing and Account values.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      {...registerBank('bank_name')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. Chase Bank, Chase N.A."
                    />
                    {bankErrors.bank_name && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{bankErrors.bank_name.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      Account Number
                    </label>
                    <input
                      type="text"
                      {...registerBank('account_number')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. 123456789012"
                    />
                    {bankErrors.account_number && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{bankErrors.account_number.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      Routing Number / IFSC
                    </label>
                    <input
                      type="text"
                      {...registerBank('routing_code')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="e.g. CHASUS33"
                    />
                    {bankErrors.routing_code && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{bankErrors.routing_code.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* 3. SECURITY TAB */}
            {activeTab === 'security' && (
              <form onSubmit={handleSubmitSecurity(onSaveSecurity)} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      Current Password
                    </label>
                    <input
                      type="password"
                      {...registerSecurity('current_password')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Enter current password"
                    />
                    {securityErrors.current_password && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{securityErrors.current_password.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...registerSecurity('new_password')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Minimum 6 characters"
                    />
                    {securityErrors.new_password && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{securityErrors.new_password.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...registerSecurity('confirm_password')}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Repeat new password"
                    />
                    {securityErrors.confirm_password && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{securityErrors.confirm_password.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
