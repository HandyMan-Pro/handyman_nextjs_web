'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, MessageSquare, Shield, X, AlertCircle, Loader2 } from 'lucide-react';
import Pusher from 'pusher-js';
import { apiClient } from '../lib/apiClient';
import { getToken } from '../lib/auth';

interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  isOptimistic?: boolean; // temporary flag for UI
}

interface BookingChatWidgetProps {
  bookingId: string;
  currentUserId: string;
  receiverId: string;
  receiverName: string;
  receiverRole?: string;
  onClose?: () => void;
}

export default function BookingChatWidget({
  bookingId,
  currentUserId,
  receiverId,
  receiverName,
  receiverRole = 'Handyman',
  onClose
}: BookingChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100);
  };

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<ChatMessage[]>(`/chat/${bookingId}`);
        setMessages(res.data || []);
        scrollToBottom('auto');
        
        // Mark messages as read once they are loaded
        markAsRead();
      } catch (err: any) {
        console.error('Failed to load chat history:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to fetch chat log');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [bookingId]);

  // Mark all incoming messages in this chat as read
  const markAsRead = async () => {
    try {
      await apiClient.put(`/chat/${bookingId}/read`);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  // Pusher Real-Time listener
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '2d5b62b109b0b46be69e';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';
    const token = getToken();

    if (!token) return;

    // Enable logging in dev mode
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: `${apiClient.defaults.baseURL}/chat/pusher/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const channelName = `booking-${bookingId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-chat-message', (data: ChatMessage) => {
      if (data.sender_id !== currentUserId) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
        scrollToBottom();
        
        // Mark as read immediately when a new message is received in focus
        markAsRead();
      }
    });

    // Handle connection or subscription errors
    pusher.connection.bind('error', (err: any) => {
      console.error('Pusher connection error:', err);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [bookingId, currentUserId]);

  // Read receipts on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (messages.some(m => !m.is_read && m.receiver_id === currentUserId)) {
        markAsRead();
        setMessages(prev =>
          prev.map(m => (m.receiver_id === currentUserId ? { ...m, is_read: true } : m))
        );
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [messages, currentUserId]);

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    setInputText('');
    setIsSending(true);

    const tempId = `optimistic-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      booking_id: bookingId,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // Optimistically update UI
    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const res = await apiClient.post<ChatMessage>('/chat/send', {
        booking_id: bookingId,
        receiver_id: receiverId,
        message: text
      });

      // Replace optimistic message with saved one
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? res.data : m))
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      // Remove optimistic message and show alert or message in thread
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setError('Message failed to send. Please try again.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shadow-inner">
            {receiverName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              {receiverName}
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            </h3>
            <p className="text-[10px] text-zinc-500 font-medium capitalize">{receiverRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[9px] font-semibold text-zinc-550 uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
            <Shield className="w-2.5 h-2.5 text-primary" /> Secure Chat
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message List Panel */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-zinc-950/20"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Syncing Secure Chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="w-8 h-8 text-zinc-700 mb-2" />
            <p className="text-xs font-bold text-zinc-400">No messages yet</p>
            <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px]">
              Ask questions, discuss details or share evidence images about this booking here.
            </p>
          </div>
        ) : (
          messages.map(m => {
            const isMe = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl p-3 shadow-md border ${
                    isMe
                      ? 'bg-primary text-zinc-950 border-primary/20 rounded-tr-none'
                      : 'bg-zinc-855 text-zinc-200 border-zinc-800 rounded-tl-none'
                  } ${m.isOptimistic ? 'opacity-70' : ''}`}
                >
                  <p className="text-xs leading-relaxed font-medium break-words">{m.message}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 justify-end text-[9px] font-medium ${
                      isMe ? 'text-white/70' : 'text-zinc-500'
                    }`}
                  >
                    <span>{formatTime(m.created_at)}</span>
                    {isMe && (
                      <span className="text-[10px]">
                        {m.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Error Bar */}
      {error && (
        <div className="bg-red-500/10 border-t border-red-500/20 px-4 py-2 flex items-center gap-2 text-red-400 text-[10px]">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Message Input Panel */}
      <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type message here..."
          disabled={loading}
          className="flex-1 h-10 px-4 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending || loading}
          className="w-10 h-10 bg-primary hover:bg-primary/95 text-zinc-950 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shadow-md shadow-primary/10 active:scale-95 flex-shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
