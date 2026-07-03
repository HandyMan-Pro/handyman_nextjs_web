'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import {
  Wrench, User, Mail, Lock, Phone, MapPin, Eye, EyeOff,
  Briefcase, Award, FileText, ChevronRight, ChevronLeft,
  CheckCircle, Loader2, Shield, ArrowRight, Sparkles
} from 'lucide-react';

const PROVIDER_TYPES = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician',
  'Cleaning', 'Pest Control', 'Appliance Repair', 'Gardening', 'Other'
];

const ID_PROOF_TYPES = ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Driving License', 'Passport'];

const SKILL_OPTIONS = [
  'Wiring & Electrical', 'Plumbing & Pipes', 'Carpentry & Woodwork',
  'Wall Painting', 'AC Install/Repair', 'Deep Cleaning', 'Pest Treatment',
  'Appliance Service', 'Tile & Flooring', 'Roof Repair', 'CCTV Installation',
  'Furniture Assembly', 'Waterproofing', 'Garden Maintenance'
];

export default function ProviderRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Step 1: Personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Step 2: Professional
  const [providerType, setProviderType] = useState('');
  const [designation, setDesignation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  // Step 3: Verification & Address
  const [idProofType, setIdProofType] = useState('');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [address, setAddress] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const toggleSkill = (s: string) => {
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim()) return 'First and last name required.';
    if (!email.trim()) return 'Email is required.';
    if (!phone.trim() || phone.length < 10) return 'Valid phone number required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPw) return 'Passwords do not match.';
    return '';
  };

  const validateStep2 = () => {
    if (!providerType) return 'Please select your service category.';
    if (skills.length === 0) return 'Select at least one skill.';
    return '';
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setError('');
    if (!idProofType || !idProofNumber.trim()) {
      setError('ID proof details are required for verification.');
      return;
    }
    if (!address.trim()) {
      setError('Service address is required.');
      return;
    }

    setLoading(true);
    try {
      const username = email.split('@')[0] + Math.floor(Math.random() * 999);
      await apiClient.post('/register', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        contact_number: phone,
        user_type: 'provider',
        provider_type: providerType,
        designation,
        experience_years: experience ? parseInt(experience) : 0,
        skills,
        bio,
        id_proof_type: idProofType,
        id_proof_number: idProofNumber,
        address,
        referral_code: referralCode || undefined,
        service_radius_km: 10,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { num: 1, label: 'Personal Info', icon: User },
    { num: 2, label: 'Professional', icon: Briefcase },
    { num: 3, label: 'Verification', icon: Shield },
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
        </div>
        <div className="relative z-10 text-center max-w-md px-6 animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Registration Successful!</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Your provider account has been created. Our team will verify your documents within 24-48 hours.
            You&apos;ll receive an email once approved.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-indigo-600/20"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden py-10 px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 mb-4 shadow-lg shadow-indigo-500/25">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Become a <span className="text-indigo-400">Service Partner</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Join our network of verified professionals</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                step === s.num
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : step > s.num
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}>
                {step > s.num ? <CheckCircle className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.num}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-[2px] mx-1 rounded-full ${step > s.num ? 'bg-emerald-500/40' : 'bg-zinc-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">

          {/* Error */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-5 animate-fade-in">
              <p className="text-rose-400 text-xs font-semibold">{error}</p>
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-indigo-400" /> Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">First Name *</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rajesh"
                    className="w-full h-11 px-3.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Last Name *</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Kumar"
                    className="w-full h-11 px-3.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rajesh@example.com"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars"
                      className="w-full h-11 pl-10 pr-10 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter"
                      className="w-full h-11 pl-10 pr-4 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-indigo-400" /> Professional Details
              </h2>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Service Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROVIDER_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setProviderType(t)}
                      className={`h-9 px-3 rounded-lg text-xs font-bold border transition-all ${
                        providerType === t
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400'
                          : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Designation</label>
                  <input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Senior Electrician"
                    className="w-full h-11 px-3.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Experience (Years)</label>
                  <input type="number" min="0" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 5"
                    className="w-full h-11 px-3.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Skills *  <span className="text-zinc-600 normal-case">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)}
                      className={`h-8 px-3 rounded-lg text-[11px] font-bold border transition-all ${
                        skills.includes(s)
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-800/30 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                      }`}>
                      {skills.includes(s) && <span className="mr-1">✓</span>}{s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Bio / About Yourself</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Briefly describe your expertise, specializations, and work experience..."
                  className="w-full p-3.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none" />
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-indigo-400" /> Identity Verification
              </h2>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">ID Proof Type *</label>
                <select value={idProofType} onChange={e => setIdProofType(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                  <option value="" className="bg-zinc-900">Select ID proof type</option>
                  {ID_PROOF_TYPES.map(t => <option key={t} value={t} className="bg-zinc-900">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">ID Proof Number *</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input value={idProofNumber} onChange={e => setIdProofNumber(e.target.value)} placeholder="Enter your ID number"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Service Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Your main service area address"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Referral Code <span className="text-zinc-600 normal-case">(optional)</span></label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder="Enter referral code if you have one"
                    className="w-full h-11 pl-10 pr-4 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-4 space-y-2 mt-2">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Registration Summary
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-zinc-500">Name</span><span className="text-zinc-300 font-medium">{firstName} {lastName}</span>
                  <span className="text-zinc-500">Email</span><span className="text-zinc-300 font-medium truncate">{email}</span>
                  <span className="text-zinc-500">Phone</span><span className="text-zinc-300 font-medium">{phone}</span>
                  <span className="text-zinc-500">Category</span><span className="text-indigo-400 font-bold">{providerType}</span>
                  <span className="text-zinc-500">Skills</span><span className="text-emerald-400 font-medium">{skills.length} selected</span>
                  <span className="text-zinc-500">Experience</span><span className="text-zinc-300 font-medium">{experience || '0'} years</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-800/60">
            {step > 1 && (
              <button type="button" onClick={prevStep}
                className="h-11 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <div className="flex-1" />
            {step < 3 ? (
              <button type="button" onClick={nextStep}
                className="h-11 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="h-11 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>

        {/* Login link */}
        <p className="text-center text-zinc-500 text-xs mt-6">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
