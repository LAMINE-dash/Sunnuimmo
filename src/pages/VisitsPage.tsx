import { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Loader2, ArrowLeft, Clock, User, Phone, Mail, MessageSquare,
  XCircle, MapPin, CheckCircle, X,
} from 'lucide-react';
import { supabase, Property } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_PROPERTIES, TYPE_LABELS } from '../lib/data';

interface VisitsPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type VisitStatus = 'pending' | 'confirmed' | 'refused' | 'cancelled' | 'completed';

interface Visit {
  id: string;
  user_id: string;
  property_id: string;
  visitor_name: string;
  visitor_phone: string | null;
  visitor_email: string | null;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: VisitStatus;
  created_at: string;
  properties: Property;
}

type Tab = 'pending' | 'confirmed' | 'past';

const STATUS_STYLES: Record<VisitStatus, { badge: string; label: string }> = {
  pending: { badge: 'bg-amber-100 text-amber-700', label: 'En attente' },
  confirmed: { badge: 'bg-emerald-100 text-emerald-700', label: 'Confirmée' },
  refused: { badge: 'bg-red-100 text-red-700', label: 'Refusée' },
  cancelled: { badge: 'bg-gray-100 text-gray-600', label: 'Annulée' },
  completed: { badge: 'bg-blue-100 text-blue-700', label: 'Terminée' },
};

function buildDemoVisits(): Visit[] {
  const base = {
    user_id: 'demo',
    visitor_phone: '+221 77 123 45 67',
    visitor_email: 'visiteur@example.com',
    message: 'Bonjour, je suis très intéressé par ce bien. Serait-il possible de visiter ce créneau ?',
  };
  return [
    {
      ...base,
      id: 'demo-1',
      property_id: MOCK_PROPERTIES[0].id,
      visitor_name: 'Aminata Diallo',
      preferred_date: '2025-02-15',
      preferred_time: '10:00',
      status: 'pending',
      created_at: '2025-01-20T09:00:00Z',
      properties: MOCK_PROPERTIES[0],
    },
    {
      ...base,
      id: 'demo-2',
      property_id: MOCK_PROPERTIES[1].id,
      visitor_name: 'Moussa Ndiaye',
      preferred_date: '2025-02-18',
      preferred_time: '14:00',
      status: 'confirmed',
      created_at: '2025-01-18T11:00:00Z',
      properties: MOCK_PROPERTIES[1],
    },
    {
      ...base,
      id: 'demo-3',
      property_id: MOCK_PROPERTIES[2].id,
      visitor_name: 'Fatou Sow',
      preferred_date: '2025-01-10',
      preferred_time: '11:00',
      status: 'completed',
      created_at: '2025-01-05T08:00:00Z',
      properties: MOCK_PROPERTIES[2],
    },
  ];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatTime(t: string): string {
  if (/^\d{2}:\d{2}$/.test(t)) {
    return `${t.split(':')[0]}h${t.split(':')[1]}`;
  }
  return t;
}

export default function VisitsPage({ onNavigate }: VisitsPageProps) {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    const fetchVisits = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('visits')
          .select('*, properties!inner(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setVisits(buildDemoVisits());
          setUsingDemo(true);
        } else {
          setVisits(data as unknown as Visit[]);
          setUsingDemo(false);
        }
      } catch {
        setVisits(buildDemoVisits());
        setUsingDemo(true);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [user]);

  const filteredVisits = useMemo(() => {
    if (activeTab === 'pending') {
      return visits.filter((v) => v.status === 'pending');
    }
    if (activeTab === 'confirmed') {
      return visits.filter((v) => v.status === 'confirmed');
    }
    // past = refused, cancelled, completed
    return visits.filter((v) => v.status === 'completed' || v.status === 'refused' || v.status === 'cancelled');
  }, [visits, activeTab]);

  const tabCounts = useMemo(() => ({
    pending: visits.filter((v) => v.status === 'pending').length,
    confirmed: visits.filter((v) => v.status === 'confirmed').length,
    past: visits.filter((v) => v.status === 'completed' || v.status === 'refused' || v.status === 'cancelled').length,
  }), [visits]);

  const handleCancel = async (visitId: string) => {
    if (usingDemo) {
      setVisits((prev) => prev.map((v) => (v.id === visitId ? { ...v, status: 'cancelled' } : v)));
      return;
    }
    setCancellingId(visitId);
    try {
      const { error } = await supabase
        .from('visits')
        .update({ status: 'cancelled' })
        .eq('id', visitId);
      if (error) throw error;
      setVisits((prev) => prev.map((v) => (v.id === visitId ? { ...v, status: 'cancelled' } : v)));
    } catch {
      // Silently fail
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6 text-lg">Connectez-vous pour gérer vos visites</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'pending', label: 'Demandes', count: tabCounts.pending },
    { key: 'confirmed', label: 'Confirmées', count: tabCounts.confirmed },
    { key: 'past', label: 'Passées', count: tabCounts.past },
  ];

  const emptyMessages: Record<Tab, string> = {
    pending: 'Aucune demande de visite en attente',
    confirmed: 'Aucune visite confirmée',
    past: 'Aucune visite passée',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes visites</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {visits.length} visite{visits.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === key ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Chargement de vos visites...</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
              <Calendar className="w-10 h-10 text-emerald-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{emptyMessages[activeTab]}</h2>
            <p className="text-gray-500 max-w-md mb-6">
              Parcourez les annonces disponibles et demandez une visite
            </p>
            <button
              onClick={() => onNavigate('listings')}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Parcourir les annonces
            </button>
          </div>
        ) : (
          <>
            {usingDemo && (
              <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-amber-50 text-amber-700 border border-amber-200">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                Mode démonstration — affichage d'exemples de visites
              </div>
            )}
            <div className="space-y-4">
              {filteredVisits.map((visit) => {
                const statusStyle = STATUS_STYLES[visit.status];
                const canCancel = visit.status === 'pending' || visit.status === 'confirmed';
                return (
                  <div
                    key={visit.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Property thumbnail */}
                      <div
                        className="relative sm:w-44 h-40 sm:h-auto shrink-0 cursor-pointer overflow-hidden"
                        onClick={() => onNavigate('property', { id: visit.properties.id })}
                      >
                        <img
                          src={visit.properties.images?.[0] || 'https://via.placeholder.com/200x160?text=Photo'}
                          alt={visit.properties.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
                          {TYPE_LABELS[visit.properties.type] || visit.properties.type}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <h3
                              className="font-semibold text-gray-900 hover:text-amber-600 cursor-pointer transition-colors truncate"
                              onClick={() => onNavigate('property', { id: visit.properties.id })}
                            >
                              {visit.properties.title}
                            </h3>
                            <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              {visit.properties.neighborhood ? `${visit.properties.neighborhood}, ` : ''}
                              {visit.properties.city}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusStyle.badge}`}>
                            {visit.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                            {visit.status === 'refused' && <X className="w-3 h-3" />}
                            {visit.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                            {statusStyle.label}
                          </span>
                        </div>

                        {/* Date & time */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 pb-4 border-b border-gray-50">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 font-medium capitalize">
                              {formatDate(visit.preferred_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{formatTime(visit.preferred_time)}</span>
                          </div>
                        </div>

                        {/* Visitor info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{visit.visitor_name}</span>
                          </div>
                          {visit.visitor_phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{visit.visitor_phone}</span>
                            </div>
                          )}
                          {visit.visitor_email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{visit.visitor_email}</span>
                            </div>
                          )}
                        </div>

                        {/* Message preview */}
                        {visit.message && (
                          <div className="flex items-start gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 line-clamp-2">{visit.message}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {canCancel && (
                          <div className="mt-4 pt-4 border-t border-gray-50">
                            <button
                              onClick={() => handleCancel(visit.id)}
                              disabled={cancellingId === visit.id}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingId === visit.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Annuler la visite
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
