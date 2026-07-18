'use client';

import { useEffect, useState, useRef } from 'react';
import {
  MessageSquare, Users, Send, Search, CheckCheck, Clock, Shield,
  Phone, User, ArrowLeft, MoreVertical, Sparkles, CheckCircle, AlertCircle, Wrench
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: 'client' | 'handyman';
  bookingRef?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  phone?: string;
  messages: ChatMessage[];
}

export default function UnifiedInboxPage() {
  const [activeTab, setActiveTab] = useState<'client' | 'handyman'>('client');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'Samir Sen',
      avatar: 'S',
      role: 'client',
      bookingRef: 'BK-8902',
      lastMessage: 'Sure, I will be available at home. Please send the plumber.',
      time: '10:42 AM',
      unread: 2,
      online: true,
      phone: '+91 98300 12345',
      messages: [
        { id: '1a', sender: 'other', text: 'Hello, is my plumbing booking confirmed for today?', time: '10:35 AM' },
        { id: '1b', sender: 'me', text: 'Yes Samir! Handyman Amit Das has been assigned and is on his way.', time: '10:38 AM' },
        { id: '1c', sender: 'other', text: 'Sure, I will be available at home. Please send the plumber.', time: '10:42 AM' }
      ]
    },
    {
      id: '2',
      name: 'Rahul Roy',
      avatar: 'R',
      role: 'client',
      bookingRef: 'BK-5412',
      lastMessage: 'Is there any discount if I pay via UPI directly?',
      time: 'Yesterday',
      unread: 0,
      online: false,
      phone: '+91 98300 67890',
      messages: [
        { id: '2a', sender: 'other', text: 'Hi! I booked an AC installation.', time: 'Yesterday' },
        { id: '2b', sender: 'me', text: 'Hi Rahul. The technician will arrive tomorrow at 11 AM.', time: 'Yesterday' },
        { id: '2c', sender: 'other', text: 'Is there any discount if I pay via UPI directly?', time: 'Yesterday' }
      ]
    },
    {
      id: '3',
      name: 'Amit Das (Plumber)',
      avatar: 'A',
      role: 'handyman',
      bookingRef: 'BK-8902',
      lastMessage: 'Job complete. Collecting payment of ₹450 now.',
      time: '11:15 AM',
      unread: 1,
      online: true,
      phone: '+91 98300 44444',
      messages: [
        { id: '3a', sender: 'me', text: 'Amit, please make sure you take a photo of the completed pipe layout.', time: '10:50 AM' },
        { id: '3b', sender: 'other', text: 'Done. Layout is leak-free and customer is happy.', time: '11:10 AM' },
        { id: '3c', sender: 'other', text: 'Job complete. Collecting payment of ₹450 now.', time: '11:15 AM' }
      ]
    },
    {
      id: '4',
      name: 'Rohan Sharma (Electrician)',
      avatar: 'R',
      role: 'handyman',
      bookingRef: 'BK-1002',
      lastMessage: 'Reached location. Starting wiring check now.',
      time: '09:30 AM',
      unread: 0,
      online: true,
      phone: '+91 98300 55555',
      messages: [
        { id: '4a', sender: 'me', text: 'Verify switchboard load limit before installing meter.', time: '09:15 AM' },
        { id: '4b', sender: 'other', text: 'Reached location. Starting wiring check now.', time: '09:30 AM' }
      ]
    }
  ]);

  const [selectedConvId, setSelectedConvId] = useState<string>('1');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedConvId]);

  const currentConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  // Send new message
  const handleSendMessage = (e?: React.FormEvent, textToUse?: string) => {
    if (e) e.preventDefault();
    const text = textToUse || inputText;
    if (!text.trim()) return;

    // Add message to current conversation thread
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'me',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedConvId) {
        return {
          ...c,
          lastMessage: text.trim(),
          time: 'Just Now',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    if (!textToUse) setInputText('');

    // Simulate smart auto-responder after 1.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses: Record<string, string[]> = {
        client: [
          "Got it, thank you for confirming!",
          "Great service. I will rate 5 stars once done.",
          "Perfect. Let me know when they are close.",
        ],
        handyman: [
          "Acknowledged. I am on it.",
          "Update: customer confirmed they are ready.",
          "Perfect, wrapping up shortly.",
        ]
      };

      const typeKey = currentConv.role;
      const array = responses[typeKey];
      const randomResponse = array[Math.floor(Math.random() * array.length)];

      const autoMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'other',
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations(prev => prev.map(c => {
        if (c.id === selectedConvId) {
          return {
            ...c,
            lastMessage: randomResponse,
            time: 'Just Now',
            unread: 0,
            messages: [...c.messages, autoMsg]
          };
        }
        return c;
      }));
    }, 1500);
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConvId(id);
    setIsMobileDetailOpen(true);
    // Mark as read
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, unread: 0 };
      }
      return c;
    }));
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c =>
    c.role === activeTab &&
    ((c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
     (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Unified Inbox</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Dual-channel chat connecting customer requests and handyman alerts in one interface.
        </p>
      </div>

      {/* Main Inbox Container */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-3xl overflow-hidden shadow-2xl h-[560px] flex relative">
        
        {/* Left Side: Threads List */}
        <div className={`w-full md:w-80 border-r border-zinc-850 flex flex-col h-full bg-zinc-900/40 shrink-0 ${
          isMobileDetailOpen ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Tabs */}
          <div className="p-3 border-b border-zinc-850 flex gap-2">
            <button
              onClick={() => { setActiveTab('client'); setSearchQuery(''); }}
              className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'client'
                  ? 'bg-primary text-zinc-950 shadow-md shadow-primary/10'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/40'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Clients
            </button>
            <button
              onClick={() => { setActiveTab('handyman'); setSearchQuery(''); }}
              className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'handyman'
                  ? 'bg-primary text-zinc-950 shadow-md shadow-primary/10'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/40'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Handymen
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-zinc-850">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-550" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-9 pl-9 pr-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-850/40">
            {filteredConversations.map((c) => {
              const isSelected = selectedConvId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-zinc-800/10 ${
                    isSelected ? 'bg-zinc-800/35 border-l-2 border-primary' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shadow-inner">
                      {c.avatar}
                    </div>
                    {c.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-zinc-200 truncate">{c.name}</h4>
                      <span className="text-[9px] text-zinc-500 font-medium">{c.time}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">{c.lastMessage}</p>
                    {c.bookingRef && (
                      <span className="inline-flex text-[8px] font-bold text-zinc-550 uppercase tracking-wider bg-zinc-950 px-1.5 py-0.5 rounded">
                        {c.bookingRef}
                      </span>
                    )}
                  </div>
                  {c.unread > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-zinc-950 text-[9px] font-bold flex items-center justify-center shadow-lg shadow-primary/20">
                      {c.unread}
                    </span>
                  )}
                </div>
              );
            })}
            {filteredConversations.length === 0 && (
              <div className="text-center py-20 text-zinc-600 text-xs font-medium">
                No active message threads.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Conversation Thread Details */}
        <div className={`flex-1 flex flex-col h-full bg-zinc-950/20 ${
          isMobileDetailOpen ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Detail header */}
          <div className="h-14 px-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileDetailOpen(false)}
                className="md:hidden p-1.5 rounded-lg bg-zinc-855 text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/25 flex items-center justify-center font-bold text-primary text-xs shadow-inner">
                {currentConv.avatar}
              </div>
              <div>
                <h3 className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                  {currentConv.name}
                  {currentConv.online && (
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  )}
                </h3>
                <p className="text-[10px] text-zinc-500 font-medium">
                  {currentConv.role === 'client' ? 'Client / Customer' : 'Handyman Crew'} • {currentConv.phone || 'No Contact'}
                </p>
              </div>
            </div>
            <button className="p-2 text-zinc-400 hover:text-white rounded-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-900/10">
            {currentConv.messages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-2xl p-3 shadow-md ${
                    isMe
                      ? 'bg-primary text-zinc-950 rounded-tr-none'
                      : 'bg-zinc-855 text-zinc-200 rounded-tl-none border border-zinc-800'
                  }`}>
                    <p className="text-xs leading-relaxed font-medium break-words">{m.text}</p>
                    <div className={`flex items-center gap-1 mt-1 justify-end ${
                      isMe ? 'text-primary-foreground/75' : 'text-zinc-500'
                    }`}>
                      <span className="text-[9px] font-medium">{m.time}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-855 text-zinc-400 rounded-2xl rounded-tl-none border border-zinc-800 p-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies templates */}
          <div className="px-4 py-2 bg-zinc-950/20 border-t border-zinc-850 flex gap-2 overflow-x-auto max-w-full">
            {currentConv.role === 'client' ? (
              <>
                <button
                  onClick={() => handleSendMessage(undefined, "Booking confirmed! The handyman will arrive shortly.")}
                  className="flex-shrink-0 px-3 py-1 bg-zinc-855 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 rounded-lg transition-all"
                >
                  Confirm Booking
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, "Our technician is currently on the way.")}
                  className="flex-shrink-0 px-3 py-1 bg-zinc-855 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 rounded-lg transition-all"
                >
                  Technician Dispatched
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSendMessage(undefined, "Verify payment received before finishing the job.")}
                  className="flex-shrink-0 px-3 py-1 bg-zinc-855 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 rounded-lg transition-all"
                >
                  Verify Payment
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, "Proceed to the next assigned client location.")}
                  className="flex-shrink-0 px-3 py-1 bg-zinc-855 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 rounded-lg transition-all"
                >
                  Next Assignment
                </button>
              </>
            )}
          </div>

          {/* Message input panel */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-850 bg-zinc-900/40 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message here..."
              className="flex-1 h-10 px-4 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-primary hover:bg-primary/95 text-zinc-950 rounded-xl flex items-center justify-center transition-all shadow-md shadow-primary/10 active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
