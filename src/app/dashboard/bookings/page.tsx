'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  CalendarCheck, Wrench, User, Calendar, MapPin, IndianRupee,
  Briefcase, CheckCircle, XCircle, Search, Clock, Loader2,
  Tag, Shield, AlertTriangle, RefreshCw, X, Eye, Grid, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';

interface Booking {
  id: string;
  service_name: string;
  provider_name: string;
  provider_id?: string;
  handyman_name: string;
  handyman_id?: string;
  customer_name: string;
  status: string;
  status_label: string;
  date: string;
  booking_slot: string;
  amount: number;
  total_amount: number;
  address: string;
  payment_method: string;
  created_at?: string;
}

interface Partner {
  id: string;
  display_name: string;
  user_type: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View Mode: 'list' | 'calendar'
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(null);

  // Assign Handyman State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeType, setAssigneeType] = useState<'provider' | 'handyman'>('handyman');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchBookingsAndPartners();
  }, []);

  const fetchBookingsAndPartners = async () => {
    setLoading(true);
    try {
      const [bookingsRes, partnersRes] = await Promise.all([
        apiClient.get('/booking-list'),
        apiClient.get('/providers')
      ]);
      setBookings(bookingsRes.data?.data || []);
      setPartners(partnersRes.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await apiClient.post('/booking-update', {
        booking_id: bookingId,
        status: status
      });
      showSuccess(`Booking status updated to ${status}!`);
      fetchBookingsAndPartners();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const openAssignModal = (booking: Booking, type: 'provider' | 'handyman') => {
    setSelectedBooking(booking);
    setAssigneeType(type);
    setAssigneeId(type === 'handyman' ? booking.handyman_id || '' : booking.provider_id || '');
    setIsAssignModalOpen(true);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setAssigning(true);
    try {
      const selectedPartner = partners.find(p => p.id === assigneeId);
      const payload: any = {
        booking_id: selectedBooking.id,
        status: selectedBooking.status
      };

      if (assigneeType === 'handyman') {
        payload.handyman_id = assigneeId;
        payload.handyman_name = selectedPartner ? selectedPartner.display_name : '';
      } else {
        payload.provider_id = assigneeId;
        payload.provider_name = selectedPartner ? selectedPartner.display_name : '';
      }

      await apiClient.post('/booking-update', payload);
      showSuccess(`Assigned ${assigneeType} successfully.`);
      setIsAssignModalOpen(false);
      fetchBookingsAndPartners();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to assign partner');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('pending')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (s.includes('accept')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (s.includes('ongoing') || s.includes('way') || s.includes('progress')) return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    if (s.includes('complete')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  const getFilteredPartners = () => {
    return partners.filter(p => p.user_type === assigneeType);
  };

  // Helper to normalize and check if booking is on same day
  const isSameDay = (bDateStr: string, cellDate: Date) => {
    if (!bDateStr) return false;
    try {
      const d = new Date(bDateStr.replace(' ', 'T'));
      return d.getFullYear() === cellDate.getFullYear() &&
             d.getMonth() === cellDate.getMonth() &&
             d.getDate() === cellDate.getDate();
    } catch {
      return false;
    }
  };

  // Filter lists based on search, status, and calendar selection
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.provider_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.handyman_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCalendarDay = selectedCalendarDay
      ? isSameDay(b.date, selectedCalendarDay)
      : true;

    return matchesSearch && matchesStatus && matchesCalendarDay;
  });

  // Calendar Helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Padding for previous month's ending days
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false
      });
    }

    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Padding for next month's starting days to fill grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedCalendarDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedCalendarDay(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Oversee customer requests, assign staff, and update completion status.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 p-0.75 rounded-xl">
            <button
              onClick={() => { setViewMode('list'); setSelectedCalendarDay(null); }}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar View
            </button>
          </div>

          <button
            onClick={fetchBookingsAndPartners}
            className="flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CALENDAR VIEW MODE */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Box */}
          <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-bold text-zinc-200">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-lg bg-zinc-855 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-lg bg-zinc-855 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, idx) => {
                const dayBookings = bookings.filter(b => isSameDay(b.date, cell.date));
                const isSelected = selectedCalendarDay &&
                                   selectedCalendarDay.getDate() === cell.date.getDate() &&
                                   selectedCalendarDay.getMonth() === cell.date.getMonth();
                
                const isToday = new Date().toDateString() === cell.date.toDateString();

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCalendarDay(isSelected ? null : cell.date)}
                    className={`min-h-[70px] p-2 border rounded-xl flex flex-col justify-between items-start transition-all relative overflow-hidden ${
                      cell.isCurrentMonth
                        ? 'bg-zinc-950/40 border-zinc-800/40 hover:bg-zinc-800/10'
                        : 'bg-zinc-900/10 border-zinc-900/10 text-zinc-700'
                    } ${
                      isSelected
                        ? 'ring-1 ring-primary border-primary/50 bg-primary/5'
                        : ''
                    } ${
                      isToday
                        ? 'border-amber-500/30 shadow-[inset_0_0_8px_rgba(245,158,11,0.03)]'
                        : ''
                    }`}
                  >
                    <span className={`text-xs font-bold ${
                      isToday ? 'text-amber-500' : cell.isCurrentMonth ? 'text-zinc-300' : 'text-zinc-600'
                    }`}>
                      {cell.date.getDate()}
                    </span>

                    {/* Bookings Count indicator */}
                    {dayBookings.length > 0 && (
                      <div className="w-full space-y-0.75 text-left mt-2">
                        <span className="inline-block px-1.5 py-0.25 bg-primary/10 text-primary border border-primary/20 rounded-[5px] text-[9px] font-bold">
                          {dayBookings.length} job{dayBookings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bookings Details Panel for Selected Day */}
          <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[400px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <h3 className="text-sm font-bold text-zinc-200">
                  {selectedCalendarDay
                    ? `Bookings for ${selectedCalendarDay.toLocaleDateString(undefined, { dateStyle: 'medium' })}`
                    : 'All Upcoming Schedule'}
                </h3>
                {selectedCalendarDay && (
                  <button
                    onClick={() => setSelectedCalendarDay(null)}
                    className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-300"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Dynamic list under calendar day */}
              <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
                {filteredBookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="bg-zinc-950/60 border border-zinc-850 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-zinc-200 truncate">{b.service_name}</h4>
                      <span className={`inline-block px-2 py-0.25 rounded-full text-[9px] font-semibold border ${getStatusStyle(b.status)}`}>
                        {b.status_label}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-zinc-500">Client: {b.customer_name} • Slot: {b.booking_slot || 'ASAP'}</p>
                    
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-zinc-400 font-bold">₹{b.total_amount || b.amount}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openAssignModal(b, 'handyman')}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-semibold transition-colors"
                        >
                          {b.handyman_name ? 'Re-assign' : '+ Assign'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredBookings.length === 0 && (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    No bookings scheduled for this date range.
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-[10px] text-zinc-500 pt-3 border-t border-zinc-800/40">
              * Click on calendar days to filter this panel list.
            </div>
          </div>
        </div>
      ) : (
        // ─── LIST VIEW MODE ──────────────────────────────────────────────────
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 border-b border-zinc-800/60 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer, service, provider or handyman..."
                className="w-full h-10 pl-9 pr-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {['All', 'Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`h-10 px-4 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-zinc-900 border-zinc-800/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Grid List */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-44 bg-zinc-900/50 border border-zinc-800/30 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredBookings.map((b) => (
                <div key={b.id} className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/50 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-zinc-100 flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-primary" />
                          {b.service_name}
                        </h3>
                        <p className="text-zinc-500 text-xs mt-0.5">Booking ID: {b.id}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusStyle(b.status)}`}>
                        {b.status_label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="truncate">Client: <strong className="text-zinc-200">{b.customer_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Price: <strong className="text-zinc-200">₹{b.total_amount || b.amount}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{b.date || 'ASAP'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Slot: {b.booking_slot || 'Anytime'}</span>
                      </div>
                      <div className="flex items-start gap-2 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                        <span className="break-words whitespace-normal">Address: {b.address || 'Not specified'}</span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800/40 my-3 pt-3 grid grid-cols-2 gap-4 text-[11px]">
                      <div>
                        <span className="text-zinc-500 block uppercase tracking-wider font-semibold">Service Provider</span>
                        {b.provider_name ? (
                          <button
                            onClick={() => openAssignModal(b, 'provider')}
                            className="text-zinc-200 hover:text-primary font-bold mt-0.5 block truncate"
                          >
                            {b.provider_name}
                          </button>
                        ) : (
                          <button
                            onClick={() => openAssignModal(b, 'provider')}
                            className="text-primary hover:underline font-semibold mt-0.5 block"
                          >
                            + Assign Provider
                          </button>
                        )}
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase tracking-wider font-semibold">Field Handyman</span>
                        {b.handyman_name ? (
                          <button
                            onClick={() => openAssignModal(b, 'handyman')}
                            className="text-zinc-200 hover:text-primary font-bold mt-0.5 block truncate"
                          >
                            {b.handyman_name}
                          </button>
                        ) : (
                          <button
                            onClick={() => openAssignModal(b, 'handyman')}
                            className="text-primary hover:underline font-semibold mt-0.5 block"
                          >
                            + Assign Handyman
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Update Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/40 justify-end">
                    {b.status.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(b.id, 'Accepted')}
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Accept Booking
                      </button>
                    )}
                    {(b.status.toLowerCase() === 'pending' || b.status.toLowerCase() === 'accepted') && (
                      <button
                        onClick={() => handleStatusUpdate(b.id, 'Ongoing')}
                        className="h-8 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Set Ongoing
                      </button>
                    )}
                    {b.status.toLowerCase() === 'ongoing' && (
                      <button
                        onClick={() => handleStatusUpdate(b.id, 'Completed')}
                        className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Mark Completed
                      </button>
                    )}
                    {b.status.toLowerCase() !== 'completed' && b.status.toLowerCase() !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusUpdate(b.id, 'Cancelled')}
                        className="h-8 px-3 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-500/10 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredBookings.length === 0 && (
                <div className="col-span-2 text-center py-16 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl">
                  <CalendarCheck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No bookings match the selected filters.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Assignment Modal */}
      {isAssignModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Assign {assigneeType === 'handyman' ? 'Handyman' : 'Provider'}
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-4">
              <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/20 text-xs space-y-1">
                <p className="text-zinc-500 font-semibold uppercase tracking-wider">For Booking</p>
                <p className="font-bold text-zinc-200">{selectedBooking.service_name}</p>
                <p className="text-zinc-400">Client: {selectedBooking.customer_name}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">Select Partner</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  required
                  className="w-full h-11 px-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="">-- Choose Partner --</option>
                  {getFilteredPartners().map(p => (
                    <option key={p.id} value={p.id}>{p.display_name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-750 text-zinc-350 font-semibold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
