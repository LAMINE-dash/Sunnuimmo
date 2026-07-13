import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Search, MessageSquare, Building, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Message } from '../lib/supabase';

interface MessagesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

interface Conversation {
  id: string;
  name: string;
  type: 'user' | 'agency';
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  property?: string;
}

const DEMO_CONVERSATIONS: Conversation[] = [
  { id: 'c1', name: 'Aminata Diallo', type: 'user', lastMessage: 'Bonjour, est-ce que la villa est encore disponible ?', time: '10:32', unread: 2, online: true, property: 'Villa Almadies' },
  { id: 'c2', name: 'Agence Immo Dakar', type: 'agency', lastMessage: 'Nous pouvons organiser une visite vendredi.', time: '09:15', unread: 1, online: false, property: 'Appartement F3' },
  { id: 'c3', name: 'Moussa Ndiaye', type: 'user', lastMessage: 'Merci pour les informations.', time: 'Hier', unread: 0, online: false, property: 'Terrain Sébikotane' },
  { id: 'c4', name: 'Fatou Sow', type: 'user', lastMessage: 'Le prix est négociable ?', time: 'Mer', unread: 0, online: true },
];

interface DemoMessage {
  id: string;
  conversationId: string;
  content: string;
  isMe: boolean;
  time: string;
}

const DEMO_MESSAGES: DemoMessage[] = [
  { id: 'm1', conversationId: 'c1', content: 'Bonjour, est-ce que la villa est encore disponible ?', isMe: false, time: '10:30' },
  { id: 'm2', conversationId: 'c1', content: 'Bonjour Aminata ! Oui, la villa est toujours disponible.', isMe: true, time: '10:31' },
  { id: 'm3', conversationId: 'c1', content: 'Super ! Quel est le prix définitif ?', isMe: false, time: '10:32' },
  { id: 'm4', conversationId: 'c2', content: "Bonjour, je suis intéressé par l'appartement F3 à Point E.", isMe: true, time: '09:10' },
  { id: 'm5', conversationId: 'c2', content: 'Nous pouvons organiser une visite vendredi.', isMe: false, time: '09:15' },
  { id: 'm6', conversationId: 'c3', content: 'Bonjour, le terrain est bien viabilisé ?', isMe: true, time: 'Hier' },
  { id: 'm7', conversationId: 'c3', content: 'Merci pour les informations.', isMe: false, time: 'Hier' },
];

export default function MessagesPage({ onNavigate }: MessagesPageProps) {
  const { user } = useAuth();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<DemoMessage[]>(DEMO_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        (async () => {
          const msg = payload.new as Message;
          const newDemoMsg: DemoMessage = {
            id: msg.id,
            conversationId: activeConvId || 'c1',
            content: msg.content,
            isMe: false,
            time: new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, newDemoMsg]);
        })();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConvId]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConvId) return;
    const msg: DemoMessage = {
      id: Date.now().toString(),
      conversationId: activeConvId,
      content: newMessage.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6 text-lg">Connectez-vous pour accéder à vos messages</p>
          <button
            onClick={() => onNavigate('auth', { mode: 'login' })}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const totalUnread = DEMO_CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);

  const filteredConversations = DEMO_CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConv = DEMO_CONVERSATIONS.find(c => c.id === activeConvId) ?? null;
  const activeMessages = messages.filter(m => m.conversationId === activeConvId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* LEFT PANEL */}
      <div className={`${activeConvId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-col`}>
        {/* Header */}
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

        {/* Search */}
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

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`cursor-pointer p-4 flex gap-3 hover:bg-gray-50 transition-colors ${
                activeConvId === conv.id
                  ? 'border-l-4 border-amber-500 bg-amber-50'
                  : 'border-l-4 border-transparent'
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  conv.type === 'agency' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  {conv.type === 'agency' ? (
                    <Building className="w-6 h-6 text-blue-600" />
                  ) : (
                    <span className="text-amber-700 font-bold text-lg">{conv.name.charAt(0)}</span>
                  )}
                </div>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900 text-sm">{conv.name}</span>
                  <span className="ml-auto text-xs text-gray-400 flex-shrink-0">{conv.time}</span>
                </div>
                {conv.property && (
                  <p className="text-xs text-amber-600 mb-0.5">{conv.property}</p>
                )}
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
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={`${activeConvId === null ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
        {activeConv === null ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Sélectionnez une conversation pour commencer</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <button
                onClick={() => setActiveConvId(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-1"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeConv.type === 'agency' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  {activeConv.type === 'agency' ? (
                    <Building className="w-5 h-5 text-blue-600" />
                  ) : (
                    <span className="text-amber-700 font-bold">{activeConv.name.charAt(0)}</span>
                  )}
                </div>
                {activeConv.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{activeConv.name}</h3>
                  {activeConv.property && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hidden sm:inline">
                      {activeConv.property}
                    </span>
                  )}
                </div>
                <p className={`text-xs ${activeConv.online ? 'text-green-500' : 'text-gray-400'}`}>
                  {activeConv.online ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
              {activeMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col gap-1 max-w-xs lg:max-w-md">
                    <div className={`px-4 py-2 ${
                      msg.isMe
                        ? 'bg-amber-500 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white shadow-sm rounded-2xl rounded-tl-sm text-gray-800'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                      {msg.isMe && <CheckCheck className="w-3.5 h-3.5 text-amber-200" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
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
                disabled={!newMessage.trim()}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl p-3 transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
