import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Search, MessageSquare, Building, CheckCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Message, Profile } from '../lib/supabase';

interface MessagesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialPropertyId?: string;
  initialReceiverId?: string;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerRole: string;
  propertyId: string | null;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export default function MessagesPage({ onNavigate, initialPropertyId, initialReceiverId }: MessagesPageProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = diffMs / 3_600_000;
    if (diffH < 24 && now.getDate() === d.getDate()) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffH < 48) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const fetchConversations = useCallback(async () => {
    if (!user) { setLoadingConvs(false); return; }
    setLoadingConvs(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const allMsgs = (data as unknown as Message[]) ?? [];

      const convMap = new Map<string, Conversation>();
      for (const m of allMsgs) {
        const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        const key = partnerId;
        const existing = convMap.get(key);
        if (!existing) {
          convMap.set(key, {
            partnerId,
            partnerName: '',
            partnerRole: 'buyer',
            propertyId: m.property_id,
            lastMessage: m.content,
            lastTime: m.created_at,
            unread: 0,
          });
        }
        if (m.receiver_id === user.id && !m.is_read) {
          existing.unread += 1;
        }
      }

      const partnerIds = [...convMap.keys()];
      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, role')
          .in('user_id', partnerIds);
        (profiles as unknown as { user_id: string; full_name: string; role: string }[] | null)?.forEach((p) => {
          const c = convMap.get(p.user_id);
          if (c) { c.partnerName = p.full_name || 'Utilisateur'; c.partnerRole = p.role; }
        });
      }

      setConversations([...convMap.values()].sort((a, b) =>
        new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
      ));
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!user) return;
    setLoadingMsgs(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages((data as unknown as Message[]) ?? []);

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (activePartnerId) fetchMessages(activePartnerId);
    else setMessages([]);
  }, [activePartnerId, fetchMessages]);

  useEffect(() => {
    if (initialReceiverId) {
      setActivePartnerId(initialReceiverId);
      setActivePropertyId(initialPropertyId ?? null);
    }
  }, [initialReceiverId, initialPropertyId]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        fetchConversations();
        if (activePartnerId) fetchMessages(activePartnerId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activePartnerId, fetchConversations, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePartnerId]);

  const handleSend = async () => {
    if (!user || !activePartnerId || !newMessage.trim()) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: activePartnerId,
          property_id: activePropertyId,
          content,
        })
        .select('*')
        .single();
      if (error) throw error;
      setMessages((prev) => [...prev, data as unknown as Message]);
      fetchConversations();
    } catch {
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConv = (conv: Conversation) => {
    setActivePartnerId(conv.partnerId);
    setActivePropertyId(conv.propertyId);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6 text-lg">Connectez-vous pour accéder à vos messages</p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const filteredConversations = conversations.filter(c =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const activeConv = conversations.find(c => c.partnerId === activePartnerId) ?? null;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${activePartnerId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 flex-1">Messages</h2>
          {totalUnread > 0 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {totalUnread}
            </span>
          )}
        </div>

        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium mb-1">Aucune conversation</p>
              <p className="text-gray-400 text-sm">Vos échanges avec les autres utilisateurs apparaîtront ici.</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.partnerId}
                onClick={() => handleSelectConv(conv)}
                className={`cursor-pointer p-4 flex gap-3 hover:bg-gray-50 transition-colors ${
                  activePartnerId === conv.partnerId
                    ? 'border-l-4 border-amber-500 bg-amber-50'
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    conv.partnerRole === 'agency' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    {conv.partnerRole === 'agency' ? (
                      <Building className="w-6 h-6 text-blue-600" />
                    ) : (
                      <span className="text-amber-700 font-bold text-lg">{conv.partnerName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 text-sm truncate">{conv.partnerName}</span>
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">{formatTime(conv.lastTime)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="flex-shrink-0 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`${activePartnerId === null ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
        {activeConv === null ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Sélectionnez une conversation pour commencer</p>
          </div>
        ) : (
          <>
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <button
                onClick={() => setActivePartnerId(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-1"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeConv.partnerRole === 'agency' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  {activeConv.partnerRole === 'agency' ? (
                    <Building className="w-5 h-5 text-blue-600" />
                  ) : (
                    <span className="text-amber-700 font-bold">{activeConv.partnerName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{activeConv.partnerName}</h3>
                <p className="text-xs text-gray-400">
                  {activeConv.partnerRole === 'agency' ? 'Agence immobilière' : 'Utilisateur'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-gray-400 text-sm">Aucun message. Démarrez la conversation !</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex flex-col gap-1 max-w-xs lg:max-w-md">
                        <div className={`px-4 py-2 ${
                          isMe
                            ? 'bg-amber-500 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white shadow-sm rounded-2xl rounded-tl-sm text-gray-800'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-amber-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4 flex gap-3 items-end">
              <textarea
                rows={2}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..."
                className="flex-1 resize-none rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl p-3 transition-colors flex-shrink-0"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
