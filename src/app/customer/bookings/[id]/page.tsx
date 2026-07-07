'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '../../../../lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowLeft, Phone, MapPin, Mail, Calendar, Clock,
  DollarSign, CheckCircle2, AlertCircle, Loader2, ExternalLink
} from 'lucide-react';

interface HandymanInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  clean_phone: string;
  profile_image?: string;
  user_type: string;
  experience_years?: number;
  designation?: string;
  rating: number;
  address?: string;
}

interface BookingDetails {
  id: string;
  service_name: string;
  provider_name: string;
  customer_name: string;
  status: string;
  date: string;
  time: string;
  amount: number;
  total_amount: number;
  address: string;
  payment_method: string;
  payment_status: string;
  description?: string;
  handyman?: HandymanInfo;
}

export default function CustomerBookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookingDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/user/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (err: any) {
      console.error('Error fetching booking details:', err);
      toast.error(err.response?.data?.detail || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail();
    }
  }, [bookingId, fetchBookingDetail]);

  const handleWhatsAppChat = () => {
    if (!booking?.handyman || !booking.handyman.clean_phone) {
      toast.error('No contact number available for this provider.');
      return;
    }

    const { clean_phone, name } = booking.handyman;
    const message = `Hi ${name}, I am reaching out regarding my booking #${booking.id} for ${booking.service_name}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${clean_phone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    if (!booking?.handyman || !booking.handyman.phone) {
      toast.error('No contact number available for this provider.');
      return;
    }
    window.open(`tel:${booking.handyman.phone}`, '_self');
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmCancel) return;

    try {
      setCancelling(true);
      await apiClient.put(`/bookings/${booking.id}`, { status: 'Cancelled' });
      toast.success('Booking cancelled successfully.');
      fetchBookingDetail();
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      toast.error(err.response?.data?.detail || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-[#5E5CE6] animate-spin mb-3" />
        <p className="text-gray-500 text-sm font-medium">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-gray-800">Booking Not Found</h3>
        <p className="text-gray-500 text-sm mt-1 mb-6">This booking might have been deleted or you may not have access to it.</p>
        <button
          onClick={() => router.back()}
          className="bg-[#5E5CE6] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#5E5CE6]/90 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return 'bg-yellow-50 text-yellow-600 border border-yellow-250';
    if (s === 'accepted') return 'bg-blue-50 text-blue-600 border border-blue-250';
    if (s === 'ongoing') return 'bg-purple-50 text-purple-600 border border-purple-250';
    if (s === 'completed') return 'bg-green-50 text-green-600 border border-green-250';
    return 'bg-gray-100 text-gray-600 border border-gray-200';
  };

  return (
    <div className="max-w-md mx-auto w-full min-h-screen bg-gray-50 pb-24 relative flex flex-col font-sans">
      <Toaster />

      {/* Top Navigation */}
      <header className="bg-[#5E5CE6] text-white p-4 flex items-center gap-3 sticky top-0 z-55 shadow-md">
        <button
          onClick={() => router.back()}
          className="hover:bg-white/10 p-1.5 rounded-full transition-all"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white tracking-wide">
          {booking.status === 'Accepted' ? 'Accepted' : 'Booking Details'}
        </h1>
      </header>

      <main className="p-4 space-y-4 flex-1">
        {/* Card 1: Service details */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Booking ID: #{booking.id.slice(-6).toUpperCase()}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-4">{booking.service_name}</h2>

          <div className="space-y-3 text-sm text-gray-600 border-t border-gray-50 pt-3.5">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">Date</span>
                <p className="text-xs text-gray-500 mt-0.5">{booking.date}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">Time Slot</span>
                <p className="text-xs text-gray-500 mt-0.5">{booking.time || 'Not Scheduled'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">Service Address</span>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{booking.address}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Card 2: About Provider */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-3.5">
            <h3 className="text-sm font-bold text-gray-800">About Provider (As Handyman)</h3>
            <button
              onClick={() => booking.handyman && router.push(`/customer/handyman/${booking.handyman.id}`)}
              className="text-xs font-bold text-[#5E5CE6] hover:underline flex items-center gap-0.5"
            >
              View Detail
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {booking.handyman ? (
            <div className="space-y-4">
              {/* Flex Row: Avatar + Name/Rating Stack + WhatsApp Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {booking.handyman.profile_image ? (
                    <img
                      src={booking.handyman.profile_image}
                      alt={booking.handyman.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100 bg-gray-55"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#5E5CE6]/10 border border-[#5E5CE6]/10 flex items-center justify-center font-bold text-[#5E5CE6] text-lg">
                      {booking.handyman.name.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-800 leading-tight">
                        {booking.handyman.name}
                      </span>
                      {booking.handyman.user_type === 'handyman' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
                      )}
                    </div>
                    {booking.handyman.designation && (
                      <span className="text-xs text-gray-400 leading-normal">{booking.handyman.designation}</span>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-amber-500 font-bold">★</span>
                      <span className="text-xs text-gray-600 font-semibold">{booking.handyman.rating}</span>
                      {booking.handyman.experience_years && (
                        <span className="text-[10px] text-gray-400 ml-1.5 font-medium">
                          ({booking.handyman.experience_years} yrs exp)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Button */}
                <button
                  onClick={handleWhatsAppChat}
                  className="w-10 h-10 bg-emerald-50 hover:bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-100 transition-colors shadow-sm"
                  title="Chat on WhatsApp"
                  aria-label="Chat on WhatsApp"
                >
                  <svg className="w-5.5 h-5.5 text-[#25D366] fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.389 1.97 13.91 .943 11.278.943c-5.44 0-9.866 4.372-9.87 9.802 0 1.63.45 3.224 1.302 4.666L1.714 21l5.933-1.846zm10.107-5.709c-.163-.268-.6-.427-1.251-.752-.652-.326-3.857-1.902-4.453-2.119-.597-.217-1.031-.326-1.466.326-.433.652-1.681 2.119-2.06 2.553-.379.433-.759.488-1.41.163-.652-.326-2.75-1.013-5.239-3.217-1.936-1.719-3.243-3.84-3.623-4.493-.379-.652-.041-1.004.285-1.328.293-.293.652-.76.977-1.14.325-.38.433-.651.651-1.085.217-.434.108-.814-.054-1.14-.162-.326-1.466-3.53-2.008-4.833-.529-1.28-1.066-1.107-1.466-1.127-.38-.02-.814-.02-1.25-.02-.433 0-1.139.163-1.736.814-.597.652-2.279 2.224-2.279 5.422 0 3.197 2.331 6.29 2.656 6.724.326.434 4.588 6.977 11.11 9.775 1.551.666 2.763 1.064 3.71 1.363 1.558.492 2.977.422 4.097.255 1.25-.187 3.857-1.574 4.4-3.094.543-1.52.543-2.822.379-3.094z" />
                  </svg>
                </button>
              </div>

              {/* Action Buttons Call & Chat */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCall}
                  className="bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </button>
                <button
                  onClick={() => router.push(`/customer/chat?handyman_id=${booking.handyman?.id}`)}
                  className="border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  Chat
                </button>
              </div>

              {/* Detail List */}
              <div className="space-y-2.5 pt-3.5 border-t border-gray-50 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{booking.handyman.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{booking.handyman.phone || 'No phone number'}</span>
                </div>
                {booking.handyman.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <span className="leading-relaxed">{booking.handyman.address}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-xs">No handyman assigned yet.</p>
            </div>
          )}
        </section>

        {/* Card 3: Price Detail */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2.5 mb-3">Price Detail</h3>

          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Service Cost</span>
              <span className="font-semibold text-gray-800">${booking.amount.toFixed(2)}</span>
            </div>

            {booking.total_amount > booking.amount && (
              <div className="flex justify-between">
                <span>Tax & Platform fee</span>
                <span className="font-semibold text-gray-850">${(booking.total_amount - booking.amount).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-gray-50 pt-2.5 text-sm font-bold text-gray-800">
              <span>Total Price</span>
              <span className="text-[#5E5CE6]">${booking.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium uppercase">Payment Method</span>
              <p className="font-bold text-gray-700 mt-0.5">{booking.payment_method || 'Cash'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium uppercase">Payment Status</span>
              <p className="font-bold text-gray-700 mt-0.5">{booking.payment_status}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Cancel Booking Footer Button */}
      {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-md mx-auto z-50">
          <button
            onClick={handleCancelBooking}
            disabled={cancelling}
            className="w-full bg-[#5E5CE6] hover:bg-[#5E5CE6]/90 disabled:bg-[#5E5CE6]/60 text-white font-bold p-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
            Cancel Booking
          </button>
        </footer>
      )}
    </div>
  );
}
