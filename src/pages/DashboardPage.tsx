import { useState } from 'react';
import {
  LayoutDashboard, Home, Plus, MessageSquare, Bell, Settings, LogOut,
  Eye, Heart, Calendar, Star, FileText,
  ChevronRight, Building, Shield, CheckCircle, Lock, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_PROPERTIES, formatPrice } from '../lib/data';

interface DashboardPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-amber-100 text-amber-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

const MOCK_VISITS = [
  { property: 'Villa Almadies', date: '15 Jan 2025', time: '10h00', visitor: 'Aminata D.' },
  { property: 'Appartement F3', date: '16 Jan 2025', time: '14h00', visitor: 'Moussa N.' },
  { property: 'Maison Sacré-Coeur', date: '18 Jan 2025', time: '11h00', visitor: 'Fatou S.' },
];

const MOCK_NOTIFICATIONS = [
  {
    icon: Bell,
    text: 'Nouvelle demande de visite pour votre Villa Almadies',
    time: 'il y a 2h',
    unread: true,
  },
  {
    icon: MessageSquare,
    text: 'Message de Mamadou Diop',
    time: 'il y a 4h',
    unread: true,
  },
  {
    icon: Eye,
    text: 'Votre annonce a été vue 50 fois aujourd\'hui',
    time: 'il y a 6h',
    unread: false,
  },
  {
    icon: CheckCircle,
    text: 'Votre paiement Pro a été confirmé',
    time: 'il y a 1j',
    unread: false,
  },
];

function VisitsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bien</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visiteur</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {MOCK_VISITS.map((visit, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{visit.property}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{visit.date}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{visit.time}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{visit.visitor}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors">
                    Confirmer
                  </button>
                  <button className="px-3 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                    Refuser
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, profile, signOut } = useAuth();
  const [section, setSection] = useState('overview');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Vous devez être connecté</p>
          <button
            onClick={() => onNavigate('auth', { mode: 'login' })}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const plan = profile?.subscription_plan || 'free';
  const planColorClass = PLAN_COLORS[plan] || PLAN_COLORS.free;

  const navItems = [
    { icon: LayoutDashboard, label: "Vue d'ensemble", key: 'overview' },
    { icon: Home, label: 'Mes annonces', key: 'listings' },
    { icon: MessageSquare, label: 'Messages', key: 'messages' },
    { icon: Calendar, label: 'Visites', key: 'visits' },
    { icon: Settings, label: 'Paramètres', key: 'settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden lg:flex fixed top-0 left-0 h-full z-10">
        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {profile?.full_name || user.email}
              </p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${planColorClass}`}>
                {plan}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, key }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                section === key
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom Buttons */}
        <div className="p-3 border-t border-gray-100 space-y-2">
          <button
            onClick={() => onNavigate('pricing')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            <Star className="w-4 h-4" />
            Passer au Pro
          </button>
          <button
            onClick={() => onNavigate('agency')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Building className="w-4 h-4" />
            Espace Agence
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">

        {/* OVERVIEW SECTION */}
        {section === 'overview' && (
          <div className="space-y-8">
            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bonjour, {profile?.full_name?.split(' ')[0] || 'Utilisateur'} 👋
              </h1>
              <p className="text-gray-500 mt-1">Voici un résumé de votre activité</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">Vues totales</span>
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">847</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">Favoris reçus</span>
                  <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-rose-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">Messages</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">Visites planifiées</span>
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Annonces récentes</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {MOCK_PROPERTIES.slice(0, 2).map((property) => (
                  <div key={property.id} className="flex items-center gap-4 px-6 py-4">
                    <img
                      src={property.images?.[0] || 'https://via.placeholder.com/56x56?text=Photo'}
                      alt={property.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{property.title}</p>
                      <p className="text-sm text-amber-600 font-semibold mt-0.5">{formatPrice(property.price)}</p>
                    </div>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      <Eye className="w-3 h-3" />
                      {property.views ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {MOCK_NOTIFICATIONS.map((notif, index) => {
                  const Icon = notif.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 px-6 py-4">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{notif.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                      </div>
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Visits */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Visites à venir</h2>
              </div>
              <VisitsTable />
            </div>

            {/* Upgrade CTA */}
            {(!plan || plan === 'free') && (
              <div className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">Passez au plan Pro</h3>
                    <ul className="mt-2 space-y-1 text-sm text-amber-100">
                      <li>✓ Annonces illimitées</li>
                      <li>✓ Statistiques avancées</li>
                      <li>✓ Support prioritaire</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => onNavigate('pricing')}
                    className="flex-shrink-0 px-6 py-2.5 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    Mettre à niveau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LISTINGS SECTION */}
        {section === 'listings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
              <button
                onClick={() => onNavigate('post-property')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Nouvelle annonce
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {MOCK_PROPERTIES.slice(0, 3).map((property) => (
                  <div key={property.id} className="flex items-center gap-4 px-6 py-4">
                    <img
                      src={property.images?.[0] || 'https://via.placeholder.com/40x40?text=Photo'}
                      alt={property.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{property.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{property.city}</p>
                    </div>
                    <p className="text-sm font-semibold text-amber-600 hidden sm:block">{formatPrice(property.price)}</p>
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Actif
                    </span>
                    <span className="hidden md:flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="w-3.5 h-3.5" />
                      {property.views ?? 0}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                        Modifier
                      </button>
                      <button
                        onClick={() => onNavigate('property', { id: String(property.id) })}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES SECTION */}
        {section === 'messages' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Messagerie</h1>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-amber-500" />
              </div>
              <p className="text-gray-600 mb-6">
                Retrouvez tous vos messages avec acheteurs et locataires.
              </p>
              <button
                onClick={() => onNavigate('messages')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Ouvrir la messagerie
              </button>
            </div>
          </div>
        )}

        {/* VISITS SECTION */}
        {section === 'visits' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Demandes de visites</h1>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <VisitsTable />
            </div>
          </div>
        )}

        {/* SETTINGS SECTION */}
        {section === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Paramètres du compte</h1>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
              {[
                {
                  icon: User,
                  title: 'Informations personnelles',
                  description: 'Nom, email, téléphone',
                  action: undefined,
                },
                {
                  icon: Lock,
                  title: 'Sécurité',
                  description: 'Mot de passe, authentification',
                  action: undefined,
                },
                {
                  icon: Bell,
                  title: 'Notifications',
                  description: 'Emails et alertes',
                  action: undefined,
                },
                {
                  icon: Shield,
                  title: 'Vérification',
                  description: 'Vérifier votre identité',
                  action: undefined,
                },
                {
                  icon: FileText,
                  title: 'Abonnement',
                  description: 'Gérer votre plan',
                  action: () => onNavigate('pricing'),
                },
              ].map(({ icon: Icon, title, description, action }) => (
                <button
                  key={title}
                  onClick={action}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
