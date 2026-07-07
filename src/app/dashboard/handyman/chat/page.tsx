'use client';

import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { apiClient } from '../../../../lib/apiClient';
import { getToken, getUserData } from '../../../../lib/auth';
import { 
  MessageSquare, Send, AlertCircle, RefreshCw, User, Search, Play, HelpCircle
} from 'lucide-react';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://handyman-backend-cnxa.onrender.com/api';

export default function HandymanChatPage() {
  const [mounted, setMounted] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch active sessions list
  const { data: sessions, error: sessionsError, isLoading: sessionsLoading, mutate: mutateSessions } = useSWR(
    mounted ? '/handyman/chat/sessions' : null,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 8000 }
  );

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Fetch message history when active session changes
  useEffect(() => {
    if (activeSession) {
      setMessages([]);
      apiClient.get(`/handyman/chat/${activeSession.booking_id}/history`)
        .then(res => {
          if (Array.isArray(res.data)) {
            setMessages(res.data);
          }
        })
        .catch(err => console.error("Error loading chat history:", err));

      // Close previous WebSocket connection if exists
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Establish WebSocket connection
      const token = getToken() || '';
      let url = BASE_URL;
      let wsProto = 'ws://';
      let hostAndPath = 'localhost:8000';

      if (url.startsWith('http')) {
        wsProto = url.startsWith('https') ? 'wss://' : 'ws://';
        hostAndPath = url.replace(/^https?:\/\//, '');
        if (hostAndPath.endsWith('/api')) {
          hostAndPath = hostAndPath.slice(0, -4);
        }
      } else if (typeof window !== 'undefined') {
        wsProto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        hostAndPath = window.location.host;
      }

      const wsUrl = `${wsProto}${hostAndPath}/api/handyman/ws/chat/${activeSession.booking_id}?token=${token}`;
      
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const newMsg = JSON.parse(event.data);
          if (newMsg && newMsg.booking_id === activeSession.booking_id) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMsg.id || (m.timestamp === newMsg.timestamp && m.sender_id === newMsg.sender_id && m.text === newMsg.text))) {
                return prev;
              }
              return [...prev, newMsg];
            });
            mutateSessions(); // Refresh list to update latest messages
          }
        } catch (e) {
          console.error("Error parsing websocket message:", e);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      return () => {
        if (socket) socket.close();
      };
    }
  }, [activeSession]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSession || !wsRef.current) return;

    const payload = {
      text: inputText.trim(),
      message: inputText.trim()
    };

    try {
      wsRef.current.send(JSON.stringify(payload));
      setInputText('');
    } catch (err) {
      console.error("Failed to send message via WebSocket:", err);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentUser = getUserData();
  const currentUserId = currentUser?.id || '';

  const filteredSessions = sessions?.filter((s: any) => 
    s.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.service_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="w-full h-[calc(100vh-120px)] min-h-[500px] bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none antialiased p-6 lg:p-8">
      
      {/* Container holding split pane */}
      <div className="w-full flex-1 flex bg-zinc-900/40 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Left Pane - Chat Sessions List */}
        <aside className="w-full md:w-80 flex flex-col border-r border-zinc-900 bg-zinc-950/70">
          {/* Pane Header */}
          <div className="p-4 border-b border-zinc-900 space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight">Active Chats</h3>
            
            {/* Search sessions */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/40 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessionsLoading && (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-900/60 border border-zinc-800/50 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {sessionsError && (
              <div className="p-4 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-xs text-zinc-400">Failed to load active sessions.</p>
              </div>
            )}

            {!sessionsLoading && !sessionsError && filteredSessions.length === 0 && (
              <div className="p-8 text-center text-zinc-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs font-semibold uppercase tracking-wider">No active chats</p>
              </div>
            )}

            {filteredSessions.map((session: any) => {
              const isActive = activeSession?.booking_id === session.booking_id;
              const hasAvatar = !!session.customer?.avatar;
              
              return (
                <button
                  key={session.booking_id}
                  onClick={() => setActiveSession(session)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-600/10 border border-indigo-500/20 text-white' 
                      : 'hover:bg-zinc-900/40 border border-transparent text-zinc-300'
                  }`}
                >
                  <div className="relative shrink-0">
                    {hasAvatar ? (
                      <img 
                        src={session.customer.avatar} 
                        alt={session.customer.name} 
                        className="w-10 h-10 rounded-full object-cover border border-zinc-800/80" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-300 text-xs">
                        {session.customer?.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-xs font-bold truncate text-white">{session.customer?.name || 'Customer'}</h4>
                    </div>
                    <p className="text-[10px] text-indigo-400 font-semibold truncate uppercase tracking-wider mb-1">
                      {session.service_name}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate leading-snug">
                      {session.latest_message?.text || 'No messages'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Pane - Chat Dialog Panel */}
        <main className="flex-1 flex flex-col bg-zinc-950/40">
          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900/60 flex items-center justify-center border border-zinc-800">
                <MessageSquare className="w-6 h-6 text-zinc-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Start real-time conversation</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-sm">Select a customer chat session from the list on the left to begin messaging.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Active session header */}
              <div className="p-4 border-b border-zinc-900 bg-zinc-950/30 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  {activeSession.customer?.avatar ? (
                    <img 
                      src={activeSession.customer.avatar} 
                      alt={activeSession.customer.name} 
                      className="w-10 h-10 rounded-full object-cover border border-zinc-800/80" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                      {activeSession.customer?.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{activeSession.customer?.name}</h4>
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/15 inline-block mt-0.5">
                      {activeSession.service_name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">WebSocket Connected</span>
                </div>
              </div>

              {/* Chat bubbles list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg: any) => {
                  const isMe = String(msg.sender_id) === String(currentUserId);
                  return (
                    <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-zinc-900 text-zinc-100 rounded-bl-none border border-zinc-850'
                      }`}>
                        <p>{msg.text || msg.message}</p>
                        <span className={`block text-[9px] mt-1 text-right font-medium uppercase tracking-wider ${
                          isMe ? 'text-indigo-200' : 'text-zinc-500'
                        }`}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-900 bg-zinc-950/20 flex gap-2 shrink-0">
                <input 
                  type="text" 
                  placeholder="Type your message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`px-5 rounded-xl flex items-center justify-center transition-all ${
                    inputText.trim() 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 cursor-pointer shadow-md' 
                      : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-850'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </main>

      </div>
    </div>
  );
}
