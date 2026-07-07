'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import {
  CalendarCheck, Wrench, User, Calendar, MapPin, IndianRupee,
  Briefcase, CheckCircle, XCircle, Search, Clock, Loader2,
  Tag, Shield, AlertTriangle, RefreshCw, X, Eye, Grid, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Check, MessageSquare
} from 'lucide-react';
import { getUserData, UserData } from '../../../lib/auth';
import BookingChatWidget from '../../../components/BookingChatWidget';
import BookingDetailModal from '../../../components/BookingDetailModal';
import { useNotificationStore } from '../../../store/useNotificationStore';

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
}

interface Partner {
  id: string;
  display_name: string;
  user_type: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerRequests, setProviderRequests] = useState<Booking[]>([]);
  const [providerUpcoming, setProviderUpcoming] = useState<Booking[]>([]);
  const [providerTab, setProviderTab] = useState<'requests' | 'upcoming'>('requests');
  const [providerStatusFilter, setProviderStatusFilter] = useState('All');
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Record<string, boolean>>({});
  const [actioningIds, setActioningIds] = useState<Record<string, boolean>>({});
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
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [providerHandymen, setProviderHandymen] = useState<any[]>([]);

  // Super Admin specific states
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [adminTotalCount, setAdminTotalCount] = useState<number>(0);
  const [adminPage, setAdminPage] = useState<number>(1);

  const notifications = useNotificationStore(state => state.notifications);

  useEffect(() => {
    const user = getUserData();
    setCurrentUser(user);
  }, []);

  // Reset page when search or status filters change for admin
  useEffect(() => {
    if (currentUser?.user_type === 'admin' || currentUser?.user_type === 'demo_admin') {
      setAdminPage(1);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchBookingsAndPartners();
  }, [currentUser, notifications, adminPage, statusFilter, searchQuery]);

  const mapAdminBookingToBooking = (b: any): Booking => {
    return {
      id: b.id,
      service_name: b.service?.name || 'N/A',
      provider_name: b.provider?.name || 'N/A',
      provider_id: b.provider?.id || '',
      handyman_name: b.handyman?.name || '',
      handyman_id: b.handyman?.id || '',
      customer_name: b.user?.name || 'N/A',
      customer_id: b.user?.id || '',
      status: b.status,
      status_label: b.status,
      date: b.date || '',
      booking_slot: b.time || '',
      amount: b.total_amount || 0,
      total_amount: b.total_amount || 0,
      address: b.address || 'N/A',
      payment_method: b.payment_method || 'N/A',
      created_at: b.created_at || ''
    };
  };

  const fetchBookingsAndPartners = async () => {
    setLoading(true);
    try {
      if (currentUser?.user_type === 'provider') {
        const [reqsRes, upcomingRes, handymenRes] = await Promise.all([
          apiClient.get('/provider/bookings/requests'),
          apiClient.get('/provider/bookings/upcoming'),
          apiClient.get('/provider/handymen/list').catch(() => ({ data: { data: [] } }))
        ]);
        setProviderRequests(reqsRes.data?.data || []);
        setProviderUpcoming(upcomingRes.data?.data || []);
        setProviderHandymen(handymenRes.data?.data || []);
      } else if (currentUser?.user_type === 'admin' || currentUser?.user_type === 'demo_admin') {
        const params: any = {
          page: adminPage,
          limit: 10,
        };
        if (searchQuery) params.search = searchQuery;
        if (statusFilter !== 'All') params.status = statusFilter;

        const bookingsRes = await apiClient.get('/admin/bookings', { params });
        setAdminBookings(bookingsRes.data?.bookings || []);
        setAdminTotalCount(bookingsRes.data?.total_count || 0);
      } else {
        const [bookingsRes, partnersRes] = await Promise.all([
          apiClient.get('/booking-list'),
          apiClient.get('/providers')
        ]);
        setBookings(bookingsRes.data?.data || []);
        setPartners(partnersRes.data || []);
      }
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

  const handleAdminStatusOverride = async (bookingId: string, nextStatus: string) => {
    setUpdatingStatusIds((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await apiClient.put(`/admin/bookings/${bookingId}/status`, {
        status: nextStatus
      });
      showSuccess(`Booking status successfully overridden to ${nextStatus}!`);
      fetchBookingsAndPartners();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to override status');
    } finally {
      setUpdatingStatusIds((prev) => ({ ...prev, [bookingId]: false }));
    }
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

  const handleProviderAction = async (bookingId: string, action: 'accept' | 'reject') => {
    setActioningIds((prev) => ({ ...prev, [bookingId]: true }));
    const originalRequests = [...providerRequests];
    const originalUpcoming = [...providerUpcoming];

    // Optimistic UI updates
    if (action === 'accept') {
      const match = providerRequests.find((r) => r.id === bookingId);
      if (match) {
        setProviderRequests((prev) => prev.filter((r) => r.id !== bookingId));
        setProviderUpcoming((prev) => [
          { ...match, status: 'Accepted', status_label: 'Accepted' },
          ...prev,
        ]);
      }
    } else {
      setProviderRequests((prev) => prev.filter((r) => r.id !== bookingId));
    }

    try {
      await apiClient.post(`/provider/bookings/${bookingId}/action`, { action });
      showSuccess(`Booking successfully ${action === 'accept' ? 'accepted' : 'declined'}!`);
      const [reqsRes, upcomingRes] = await Promise.all([
        apiClient.get('/provider/bookings/requests'),
        apiClient.get('/provider/bookings/upcoming')
      ]);
      setProviderRequests(reqsRes.data?.data || []);
      setProviderUpcoming(upcomingRes.data?.data || []);
    } catch (err: any) {
      setProviderRequests(originalRequests);
      setProviderUpcoming(originalUpcoming);
      setError(err.response?.data?.detail || err.message || `Failed to ${action} booking`);
    } finally {
      setActioningIds((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleProviderStatusChange = async (bookingId: string, nextStatus: string) => {
    setUpdatingStatusIds((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await apiClient.put(`/provider/bookings/${bookingId}/status`, {
        status: nextStatus
      });
      showSuccess(`Booking status successfully updated to ${nextStatus}!`);
      await fetchBookingsAndPartners();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update booking status');
    } finally {
      setUpdatingStatusIds((prev) => ({ ...prev, [bookingId]: false }));
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
      if (currentUser?.user_type === 'provider') {
        await apiClient.put(`/provider/bookings/${selectedBooking.id}/assign`, {
          handyman_id: assigneeId
        });
        showSuccess(`Booking successfully assigned to team member.`);
      } else {
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
      }
      setIsAssignModalOpen(false);
      fetchBookingsAndPartners();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to assign handyman.');
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
    if (currentUser?.user_type === 'provider') {
      return providerHandymen.map(h => ({
        id: h.id,
        display_name: `${h.display_name} (${h.status})`,
        user_type: 'handyman'
      }));
    }
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

  const providerAllBookings = [...providerRequests, ...providerUpcoming];

  const filteredProviderBookings = providerAllBookings.filter(b => {
    const matchesSearch =
      b.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.handyman_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      providerStatusFilter === 'All' ||
      b.status.toLowerCase() === providerStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
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
          <p className="text-zinc-500 text-sm mt-0.5">
            {currentUser?.user_type === 'provider'
              ? 'Manage incoming booking requests and your scheduled upcoming services.'
              : 'Oversee customer requests, assign staff, and update completion status.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser?.user_type === 'provider' ? (
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1">
              <button
                onClick={() => setProviderTab('requests')}
                className={`flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold transition-all relative ${
                  providerTab === 'requests' ? 'bg-primary text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Requests
                {providerRequests.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-bold bg-amber-500 text-black rounded-full">
                    {providerRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setProviderTab('upcoming')}
                className={`flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold transition-all relative ${
                  providerTab === 'upcoming' ? 'bg-primary text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Upcoming
                {providerUpcoming.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-705 rounded-full">
                    {providerUpcoming.length}
                  </span>
                )}
              </button>
            </div>
          ) : (
            /* View Mode Toggle for Admin */
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
          )}

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

      {currentUser?.user_type === 'provider' ? (
        /* PROVIDER SPECIFIC SCREEN */
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col xl:flex-row gap-4 border-b border-zinc-800/60 pb-6 items-stretch xl:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings by customer or service name..."
                className="w-full h-11 pl-10 pr-4 bg-zinc-900/40 border border-zinc-850 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
            </div>
            
            {/* Filter Tab Bar */}
            <div className="flex bg-zinc-950/60 border border-zinc-850 p-1 rounded-xl gap-1 overflow-x-auto w-full xl:w-auto scrollbar-none">
              {['All', 'Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled'].map((status) => {
                const count = status === 'All'
                  ? providerAllBookings.length
                  : providerAllBookings.filter(b => b.status.toLowerCase() === status.toLowerCase()).length;
                return (
                  <button
                    key={status}
                    onClick={() => setProviderStatusFilter(status)}
                    className={`flex items-center gap-1.5 h-8.5 px-4 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      providerStatusFilter === status
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    {status}
                    {count > 0 && (
                      <span className={`inline-flex items-center justify-center min-w-[18px] h-4.5 px-1.5 text-[9px] font-bold rounded-full transition-colors ${
                        providerStatusFilter === status ? 'bg-white/20 text-white' : 'bg-zinc-805 text-zinc-400 border border-zinc-700/30'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="w-full overflow-hidden rounded-2xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md p-6 space-y-4">
              <div className="h-6 w-1/4 bg-zinc-800/50 rounded-md animate-pulse" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-zinc-800/30 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md shadow-xl">
              <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-zinc-950/40 border-b border-zinc-800/80">
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[25%]">Customer & Date</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[25%]">Service Name</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[20%]">Assigned Handyman</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[10%]">Amount</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[10%]">Status</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] text-right w-[10%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {filteredProviderBookings.map((b) => {
                    const statusLower = b.status.toLowerCase();
                    return (
                      <tr key={b.id} className="hover:bg-zinc-800/25 transition-colors group">
                        {/* Customer & Date */}
                        <td className="px-6 py-4.5 vertical-align-middle">
                          <div className="font-bold text-zinc-105 group-hover:text-white transition-colors">{b.customer_name}</div>
                          <div className="text-zinc-500 text-xs mt-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                            <span>{b.date || 'ASAP'}</span>
                            <span className="text-zinc-700">•</span>
                            <Clock className="w-3.5 h-3.5 text-zinc-600" />
                            <span>{b.booking_slot || 'Anytime'}</span>
                          </div>
                        </td>

                        {/* Service Name */}
                        <td className="px-6 py-4.5 vertical-align-middle">
                          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-primary animate-pulse" />
                            {b.service_name}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-1">ID: #{b.id}</div>
                        </td>

                        {/* Assigned Handyman */}
                        <td className="px-6 py-4.5 vertical-align-middle">
                          {b.handyman_name ? (
                            <div className="flex flex-col gap-1.5 items-start">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-zinc-300">{b.handyman_name}</span>
                                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold tracking-wider font-mono">
                                  HANDYMAN
                                </span>
                              </div>
                              <button
                                onClick={() => openAssignModal(b, 'handyman')}
                                className="text-[10px] text-primary/80 hover:text-primary hover:underline font-semibold transition-colors"
                              >
                                Reassign Staff
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openAssignModal(b, 'handyman')}
                              className="text-xs text-primary hover:text-primary/90 hover:underline font-semibold flex items-center gap-1 transition-all"
                            >
                              + Assign Handyman
                            </button>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4.5 vertical-align-middle">
                          <span className="font-bold text-zinc-200 text-sm">
                            ₹{(b.total_amount || b.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4.5 vertical-align-middle">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(b.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                            {b.status_label || b.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 vertical-align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Chat Widget Button */}
                            <button
                              onClick={() => setActiveChatBooking(b)}
                              className="p-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 hover:text-white text-zinc-400 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center shrink-0"
                              title="Chat with Customer"
                            >
                              <MessageSquare className="w-4 h-4 text-primary" />
                            </button>

                            {/* Detail View Button */}
                            <button
                              onClick={() => setDetailBooking(b)}
                              className="p-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 hover:text-white text-zinc-400 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center shrink-0"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-sky-400" />
                            </button>

                            {/* Main Action Button based on status */}
                            {statusLower === 'pending' ? (
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  disabled={updatingStatusIds[b.id]}
                                  onClick={() => handleProviderStatusChange(b.id, 'Cancelled')}
                                  className="h-8.5 px-3 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                >
                                  Decline
                                </button>
                                <button
                                  disabled={updatingStatusIds[b.id]}
                                  onClick={() => handleProviderStatusChange(b.id, 'Accepted')}
                                  className="h-8.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-emerald-950/20 flex items-center gap-1.5"
                                >
                                  {updatingStatusIds[b.id] && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                  Accept
                                </button>
                              </div>
                            ) : statusLower === 'accepted' ? (
                              <button
                                disabled={updatingStatusIds[b.id]}
                                onClick={() => handleProviderStatusChange(b.id, 'Ongoing')}
                                className="h-8.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-blue-950/20 flex items-center gap-1.5 shrink-0"
                              >
                                {updatingStatusIds[b.id] && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Start Service
                              </button>
                            ) : statusLower === 'ongoing' ? (
                              <button
                                disabled={updatingStatusIds[b.id]}
                                onClick={() => handleProviderStatusChange(b.id, 'Completed')}
                                className="h-8.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-emerald-950/20 flex items-center gap-1.5 shrink-0"
                              >
                                {updatingStatusIds[b.id] && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Complete Service
                              </button>
                            ) : statusLower === 'completed' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0">
                                <Check className="w-3.5 h-3.5" />
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/20 border border-red-500/10 px-2.5 py-1 rounded-lg shrink-0">
                                <XCircle className="w-3.5 h-3.5" />
                                Cancelled
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProviderBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-zinc-500">
                        <CalendarCheck className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm font-medium">No bookings found matching filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : currentUser?.user_type === 'admin' || currentUser?.user_type === 'demo_admin' ? (
        /* SUPER ADMIN SPECIFIC MASTER BOOKINGS SCREEN */
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col xl:flex-row gap-4 border-b border-zinc-800/60 pb-6 items-stretch xl:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings by customer, service or handyman..."
                className="w-full h-11 pl-10 pr-4 bg-zinc-900/40 border border-zinc-850 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
            </div>
            
            {/* Filter Tab Bar */}
            <div className="flex bg-zinc-950/60 border border-zinc-850 p-1 rounded-xl gap-1 overflow-x-auto w-full xl:w-auto scrollbar-none">
              {['All', 'Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled'].map((status) => {
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`flex items-center gap-1.5 h-8.5 px-4 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      statusFilter === status
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="w-full overflow-hidden rounded-2xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md p-6 space-y-4">
              <div className="h-6 w-1/4 bg-zinc-800/50 rounded-md animate-pulse" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-zinc-800/30 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md shadow-xl">
              <table className="w-full text-left border-collapse text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-zinc-950/40 border-b border-zinc-800/80">
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[15%]">Booking ID</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[25%]">Customer & Date</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[20%]">Service Name</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[20%]">Provider & Shop</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[10%]">Amount</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] w-[15%]">Status Override</th>
                    <th className="px-6 py-4.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px] text-right w-[10%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {adminBookings.map((b) => {
                    const mappedBooking = mapAdminBookingToBooking(b);
                    return (
                      <tr key={b.id} className="hover:bg-zinc-800/25 transition-colors group">
                        {/* Booking ID */}
                        <td className="px-6 py-4.5 vertical-align-middle font-mono text-xs text-zinc-500">
                          #{b.id.substring(Math.max(0, b.id.length - 8))}
                        </td>

                        {/* Customer & Date */}
                        <td className="px-6 py-4.5 vertical-align-middle">
                          <div className="flex items-center gap-2">
                            {b.user?.avatar ? (
                              <img src={b.user.avatar} className="w-7 h-7 rounded-full object-cover border border-zinc-800" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-primary font-bold text-[10px]">
                                {b.user?.name?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-zinc-105 group-hover:text-white transition-colors">{b.user?.name}</div>
                              <div className="text-zinc-500 text-[10px] mt-0.5">{b.user?.email}</div>
                              <div className="text-zinc-600 text-[9px] mt-0.5 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-zinc-650" />
                                <span>{b.date} at {b.time}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Service Name */}
                        <td className="px-6 py-4.5 vertical-align-middle">
                          <div className="flex items-center gap-2">
                            {b.service?.image ? (
                              <img src={b.service.image} className="w-8 h-8 rounded-lg object-cover border border-zinc-800" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Wrench className="w-4 h-4 text-zinc-600" />
                              </div>
                            )}
                            <span className="font-bold text-zinc-200">{b.service?.name}</span>
                          </div>
                        </td>

                        {/* Provider & Shop */}
                        <td className="px-6 py-4.5 vertical-align-middle">
                          <div className="font-semibold text-zinc-200">{b.provider?.name || 'Direct'}</div>
                          {b.shop && (
                            <div className="text-[10px] text-primary/80 mt-0.5">Shop: {b.shop.name}</div>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4.5 vertical-align-middle font-bold text-zinc-100">
                          ₹{b.total_amount}
                        </td>

                        {/* Status Override */}
                        <td className="px-6 py-4.5 vertical-align-middle">
                          <div className="relative inline-block">
                            <select
                              value={b.status}
                              disabled={updatingStatusIds[b.id]}
                              onChange={(e) => handleAdminStatusOverride(b.id, e.target.value)}
                              className={`h-8 px-2 bg-zinc-950/60 border rounded-lg text-xs font-semibold focus:outline-none transition-colors cursor-pointer ${getStatusStyle(b.status)}`}
                            >
                              {['Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled'].map((st) => (
                                <option key={st} value={st} className="bg-zinc-900 text-zinc-350">{st}</option>
                              ))}
                            </select>
                            {updatingStatusIds[b.id] && (
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 vertical-align-middle text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Chat Button */}
                            <button
                              onClick={() => setActiveChatBooking(mappedBooking)}
                              className="p-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 hover:text-white text-zinc-400 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center shrink-0"
                              title="Chat with Customer"
                            >
                              <MessageSquare className="w-4 h-4 text-primary" />
                            </button>

                            {/* Detail View Button */}
                            <button
                              onClick={() => setDetailBooking(mappedBooking)}
                              className="p-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 hover:text-white text-zinc-400 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center shrink-0"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-sky-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {adminBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-20 text-zinc-500">
                        <CalendarCheck className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm font-medium">No bookings found matching filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {adminTotalCount > 10 && (
                <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-800/80 flex items-center justify-between gap-4 text-xs text-zinc-400">
                  <div>
                    Showing <strong className="text-zinc-200">{(adminPage - 1) * 10 + 1}</strong> to{' '}
                    <strong className="text-zinc-200">{Math.min(adminPage * 10, adminTotalCount)}</strong> of{' '}
                    <strong className="text-zinc-200">{adminTotalCount}</strong> entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={adminPage === 1}
                      onClick={() => setAdminPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:text-white rounded-lg transition-all disabled:opacity-40 disabled:hover:text-zinc-400 flex items-center gap-1 font-semibold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>
                    <button
                      disabled={adminPage * 10 >= adminTotalCount}
                      onClick={() => setAdminPage((p) => p + 1)}
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:text-white rounded-lg transition-all disabled:opacity-40 disabled:hover:text-zinc-400 flex items-center gap-1 font-semibold"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* CALENDAR / LIST VIEW FOR ADMIN / OTHERS */
        viewMode === 'calendar' ? (
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
                            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded text-[9px] font-semibold transition-colors"
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
          /* LIST VIEW MODE */
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
                      <button
                        onClick={() => setActiveChatBooking(b)}
                        className="h-8 px-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/50 hover:text-white text-zinc-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        Chat
                      </button>
                      <button
                        onClick={() => setDetailBooking(b)}
                        className="h-8 px-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/50 hover:text-white text-zinc-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        Details
                      </button>
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
        )
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
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-750 text-zinc-355 font-semibold rounded-xl text-xs transition-all"
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

      {/* Drawer for Booking Chat */}
      {activeChatBooking && currentUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setActiveChatBooking(null)}
          />
          <div className="relative z-10 w-full max-w-md h-full bg-zinc-950 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-zinc-800">
            <BookingChatWidget
              bookingId={activeChatBooking.id}
              currentUserId={currentUser.id}
              receiverId={activeChatBooking.customer_id || ''}
              receiverName={activeChatBooking.customer_name}
              receiverRole="Customer"
              onClose={() => setActiveChatBooking(null)}
            />
          </div>
        </div>
      )}
      {/* Booking Detail Modal */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          handymen={providerHandymen}
          onClose={() => setDetailBooking(null)}
          onRefresh={() => {
            fetchBookingsAndPartners();
            // Re-fetch the detail booking after changes
            setDetailBooking(null);
          }}
        />
      )}
    </div>
  );
}
