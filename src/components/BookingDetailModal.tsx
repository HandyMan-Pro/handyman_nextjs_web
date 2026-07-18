'use client';

import { useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { getUserData } from '../lib/auth';
import {
  X, Wrench, User, Calendar, Clock, MapPin, IndianRupee,
  CheckCircle, Circle, Loader2, Play, ShieldCheck,
  Plus, CreditCard, AlertTriangle, ArrowRight
} from 'lucide-react';

interface Booking {
  id: string;
  service_name: string;
  provider_name: string;
  provider_id?: string;
  handyman_name: string;
  handyman_id?: string;
  customer_name: string;
  customer_id?: string;
  status: string;
  status_label: string;
  date: string;
  booking_slot: string;
  amount: number;
  total_amount: number;
  address: string;
  payment_method: string;
  created_at?: string;
  extra_charges?: { name: string; amount: number }[];
  final_total_amount?: number;
  description?: string;
  completion_otp?: string;
  otp_verified?: boolean;
}

interface Props {
  booking: Booking;
  onClose: () => void;
  onRefresh: () => void;
  handymen?: any[];
}

const STATUS_STEPS = [
  { key: 'Pending', label: 'Requested', icon: Circle },
  { key: 'Accepted', label: 'Accepted', icon: CheckCircle },
  { key: 'Ongoing', label: 'In Progress', icon: Play },
  { key: 'Completed', label: 'Completed', icon: ShieldCheck },
];

function getStepIndex(status: string): number {
  const s = status.toLowerCase();
  if (s.includes('pending')) return 0;
  if (s.includes('accept')) return 1;
  if (s.includes('ongoing') || s.includes('progress') || s.includes('way')) return 2;
  if (s.includes('complete')) return 3;
  return -1; // Cancelled/Rejected
}

export default function BookingDetailModal({ booking, onClose, onRefresh, handymen = [] }: Props) {
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedHandymanId, setSelectedHandymanId] = useState('');

  const currentUser = getUserData();
  const isProvider = currentUser?.user_type === 'provider';

  // Extra charges form state
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [extraName, setExtraName] = useState('');
  const [extraAmount, setExtraAmount] = useState<number>(0);

  const currentStepIdx = getStepIndex(booking.status);
  const isCancelledOrRejected = booking.status.toLowerCase().includes('cancel') || booking.status.toLowerCase().includes('reject');

  const handleAction = async (actionType: string) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (actionType === 'accept' || actionType === 'reject') {
        await apiClient.post(`/provider/bookings/${booking.id}/action`, { action: actionType });
        setSuccessMsg(`Booking ${actionType === 'accept' ? 'accepted' : 'declined'} successfully!`);
      } else if (actionType === 'start') {
        await apiClient.post('/booking-update', { booking_id: booking.id, status: 'Ongoing' });
        setSuccessMsg('Service started — status updated to Ongoing.');
      } else if (actionType === 'request-otp') {
        await apiClient.post(`/bookings/${booking.id}/request-completion`);
        setSuccessMsg('Completion OTP sent to customer.');
      }
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddExtraCharges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraName.trim() || extraAmount <= 0) return;

    setActionLoading(true);
    setError('');
    try {
      await apiClient.post(`/bookings/${booking.id}/extra-charges`, [
        { name: extraName.trim(), amount: extraAmount }
      ]);
      setSuccessMsg('Extra charge added successfully.');
      setShowExtraForm(false);
      setExtraName('');
      setExtraAmount(0);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add extra charges.');
    } finally {
      setActionLoading(false);
    }
  };

  const baseAmount = booking.amount || 0;
  const extraCharges = booking.extra_charges || [];
  const extraTotal = extraCharges.reduce((sum, ec) => sum + ec.amount, 0);
  const finalTotal = booking.final_total_amount || booking.total_amount || (baseAmount + extraTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">{booking.service_name}</h2>
              <p className="text-[10px] text-zinc-500 font-mono">ID: {booking.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* ── Status Timeline ── */}
          <div className="bg-zinc-950/50 border border-zinc-800/40 rounded-xl p-5">
            <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-4">Booking Progress</h4>
            {isCancelledOrRejected ? (
              <div className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-400">{booking.status}</p>
                  <p className="text-[10px] text-zinc-500">This booking has been {booking.status.toLowerCase()}.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between relative">
                {/* Track line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-800 z-0" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-primary z-0 transition-all duration-500"
                  style={{ width: `${Math.max(0, currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`, maxWidth: 'calc(100% - 32px)' }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.key} className="flex flex-col items-center z-10 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? 'bg-primary text-zinc-950 ring-4 ring-primary/20 shadow-lg shadow-primary/30'
                          : isCompleted
                            ? 'bg-primary/20 text-primary'
                            : 'bg-zinc-800 text-zinc-600'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[9px] font-bold mt-2 text-center ${
                        isCurrent ? 'text-primary' : isCompleted ? 'text-zinc-300' : 'text-zinc-600'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Customer & Booking Info ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-4 space-y-3">
              <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Customer</h4>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-primary font-bold text-xs">
                  {booking.customer_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-200">{booking.customer_name}</p>
                  <p className="text-[10px] text-zinc-500">Customer</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-4 space-y-3">
              <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Schedule</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{booking.date || 'ASAP'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Slot: {booking.booking_slot || 'Anytime'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Service Location</h4>
                <p className="text-xs text-zinc-300">{booking.address || 'Address not specified'}</p>
              </div>
            </div>
          </div>

          {booking.description && (
            <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-4">
              <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Description</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{booking.description}</p>
            </div>
          )}

          {/* ── Price Breakdown ── */}
          <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Price Breakdown</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Base Price</span>
                <span className="font-bold text-zinc-200">₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>

              {extraCharges.map((ec, idx) => (
                <div key={idx} className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3 h-3 text-amber-500" />
                    {ec.name}
                  </span>
                  <span className="font-semibold text-amber-400">+₹{ec.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}

              <div className="border-t border-zinc-800/60 pt-2 flex items-center justify-between">
                <span className="font-bold text-zinc-200">Total</span>
                <span className="font-bold text-lg text-primary">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* ── Alerts ── */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              {successMsg}
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* ── Extra Charges Form (only when Ongoing) ── */}
          {showExtraForm && booking.status.toLowerCase() === 'ongoing' && (
            <form onSubmit={handleAddExtraCharges} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3 animate-fade-in">
              <h4 className="text-xs font-bold text-amber-400">Add Extra Charge</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={extraName}
                  onChange={(e) => setExtraName(e.target.value)}
                  placeholder="Charge name"
                  className="h-9 px-3 bg-zinc-900/60 border border-zinc-800/50 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  required
                />
                <input
                  type="number"
                  value={extraAmount || ''}
                  onChange={(e) => setExtraAmount(Number(e.target.value))}
                  placeholder="Amount (₹)"
                  min={1}
                  className="h-9 px-3 bg-zinc-900/60 border border-zinc-800/50 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowExtraForm(false)}
                  className="h-8 px-3 bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="h-8 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Add Charge
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Action Footer ── */}
        {!isCancelledOrRejected && (
          <div className="shrink-0 border-t border-zinc-800/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            {/* Assign Handyman Dropdown */}
            {isProvider && !booking.handyman_id && booking.status.toLowerCase() !== 'completed' && handymen && handymen.length > 0 ? (
              <div className="flex items-center gap-2 bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-800/50">
                <select
                  value={selectedHandymanId}
                  onChange={(e) => setSelectedHandymanId(e.target.value)}
                  className="bg-transparent text-xs text-zinc-300 focus:outline-none px-2 py-1 max-w-[150px] font-semibold"
                >
                  <option value="" className="bg-zinc-900 text-zinc-400">Select Handyman</option>
                  {handymen.map((h) => (
                    <option key={h.id} value={h.id} className="bg-zinc-900 text-zinc-350">
                      {h.display_name} ({h.status})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={actionLoading || !selectedHandymanId}
                  onClick={async () => {
                    setActionLoading(true);
                    setError('');
                    setSuccessMsg('');
                    try {
                      const res = await apiClient.put(`/provider/bookings/${booking.id}/assign`, {
                        handyman_id: selectedHandymanId
                      });
                      if (res.data?.status) {
                        setSuccessMsg(res.data.message || 'Handyman assigned successfully!');
                        onRefresh();
                      }
                    } catch (err: any) {
                      setError(err.response?.data?.detail || err.message || 'Assignment failed.');
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  className="h-7 px-3 bg-primary hover:bg-primary/95 text-zinc-950 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Assign
                </button>
              </div>
            ) : <div />}

            <div className="flex items-center gap-3">
              {/* PENDING → Accept / Decline */}
              {booking.status.toLowerCase() === 'pending' && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction('reject')}
                    className="h-10 px-5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700/50 rounded-xl text-xs font-semibold transition-all"
                  >
                    Decline
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction('accept')}
                    className="h-10 px-6 bg-primary hover:bg-primary/90 text-zinc-950 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <CheckCircle className="w-3.5 h-3.5" />
                    Accept Booking
                  </button>
                </>
              )}

              {/* ACCEPTED → Start Service */}
              {booking.status.toLowerCase() === 'accepted' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction('start')}
                  className="h-10 px-6 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/20 transition-all flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Play className="w-3.5 h-3.5" />
                  Start Service
                </button>
              )}

              {/* ONGOING → Extra Charges + Request OTP */}
              {booking.status.toLowerCase() === 'ongoing' && (
                <>
                  <button
                    onClick={() => setShowExtraForm(!showExtraForm)}
                    className="h-10 px-4 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Extra Charges
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction('request-otp')}
                    className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <CreditCard className="w-3.5 h-3.5" />
                    Request Payment / OTP
                  </button>
                </>
              )}

              {/* COMPLETED → Read-only confirmation */}
              {booking.status.toLowerCase() === 'completed' && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Service Completed Successfully
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
