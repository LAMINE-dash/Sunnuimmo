import { useState } from 'react';
import {
  Building2, Users, TrendingUp, Eye, MessageSquare, Star, Plus, Settings,
  BarChart3, Calendar, Shield, Phone, Mail, Globe, MapPin, ChevronRight,
  ArrowUp, ArrowDown, FileText, CheckCircle, Clock, Crown, Home
} from 'lucide-react';
import { MOCK_PROPERTIES, formatPrice } from '../lib/data';
import { useAuth } from '../contexts/AuthContext';

interface AgencyPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  listings: number;
  sales: number;
  online: boolean;
  initials: string;
}

const DEMO_TEAM: TeamMember[] = [
  { id: 't1', name: 'Oumar Diallo', email: 'oumar@immodakar.sn', role: 'Agent senior', listings: 12, sales: 8, online: true, initials: 'OD' },
  { id: 't2', name: 'Khadija Mbaye', email: 'khadija@immodakar.sn', role: 'Agent', listings: 7, sales: 4, online: true, initials: 'KM' },
  { id: 't3', name: 'Ibrahima Fall', email: 'ibrahima@immodakar.sn', role: 'Agent', listings: 5, sales: 3, online: false, initials: 'IF' },
  { id: 't4', name: 'Rokhaya Seck', email: 'rokhaya@immodakar.sn', role: 'Commercial', listings: 9, sales: 6, online: false, initials: 'RS' },
];

interface MonthData {
  month: string;
  views: number;
  leads: number;
  sales: number;
}

const MONTHLY_DATA: MonthData[] = [
  { month: 'Juil', views: 1240, leads: 38, sales: 5 },
  { month: 'Août', views: 980, leads: 29, sales: 3 },
  { month: 'Sep', views: 1580, leads: 52, sales: 7 },
  { month: 'Oct', views: 2100, leads: 68, sales: 9 },
  { month: 'Nov', views: 1760, leads: 55, sales: 8 },
  { month: 'Déc', views: 2340, leads: 74, sales: 12 },
  { month: 'Jan', views: 2890, leads: 89, sales: 14 },
];

export default function AgencyPage({ onNavigate }: AgencyPageProps) {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [inviteEmail, setInviteEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEMO_TEAM);
  const [agencyName, setAgencyName] = useState('Immo Dakar Pro');
  const [agencyEmail, setAgencyEmail] = useState('contact@immodakar.sn');
  const [agencyPhone, setAgencyPhone] = useState('+221 33 820 00 00');
  const [agencyAddress, setAgencyAddress] = useState('Avenue Léopold Sédar Senghor, Dakar');
  const [agencyWebsite, setAgencyWebsite] = useState('www.immodakar.sn');
  const [agencyDescription, setAgencyDescription] = useState('Agence immobilière de référence à Dakar depuis 2010.');
  const [savedToast, setSavedToast] = useState(false);

  const maxViews = Math.max(...MONTHLY_DATA.map((d) => d.views));

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'listings', label: 'Annonces' },
    { id: 'team', label: 'Équipe' },
    { id: 'analytics', label: 'Analytique' },
    { id: 'settings', label: 'Paramètres agence' },
  ];

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: `t${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'Agent',
      listings: 0,
      sales: 0,
      online: false,
      initials: inviteEmail.slice(0, 2).toUpperCase(),
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setInviteEmail('');
  };

  const handleRoleChange = (id: string, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveSettings = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const avatarColors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO HEADER */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Logo */}
              <div className="flex-shrink-0 w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              {/* Info */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-white">{agencyName}</h1>
                  <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs font-semibold px-2 py-1 rounded-full border border-amber-500/30">
                    <Shield className="w-3 h-3" />
                    Vérifié
                  </span>
                  <span className="flex items-center gap-1 bg-purple-500/20 text-purple-400 text-xs font-semibold px-2 py-1 rounded-full border border-purple-500/30">
                    <Crown className="w-3 h-3" />
                    Pro
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Agence Certifiée • Dakar, Sénégal • Membre depuis 2020
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-amber-400" />
                    {agencyPhone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-400" />
                    {agencyEmail}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-400" />
                    {agencyWebsite}
                  </span>
                </div>
              </div>
            </div>
            {/* CTA */}
            <div className="flex-shrink-0">
              <button
                onClick={() => onNavigate('post-property')}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nouvelle annonce
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Vues */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Vues ce mois</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">2 890</span>
                <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                  <ArrowUp className="w-3 h-3" />
                  +24%
                </span>
              </div>
            </div>
          </div>
          {/* Leads */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Leads reçus</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">89</span>
                <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                  <ArrowUp className="w-3 h-3" />
                  +18%
                </span>
              </div>
            </div>
          </div>
          {/* Annonces */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Annonces actives</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">24</span>
                <span className="text-xs text-gray-400 font-medium">—</span>
              </div>
            </div>
          </div>
          {/* Ventes */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ventes conclues</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">14</span>
                <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                  <ArrowUp className="w-3 h-3" />
                  +12%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-7xl mx-auto p-6 lg:p-8">

        {/* ===== TAB: VUE D'ENSEMBLE ===== */}
        {activeTab === 'overview' && (
          <div className="lg:grid lg:grid-cols-3 gap-8">
            {/* Left: Annonces récentes */}
            <div className="lg:col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Annonces récentes</h2>
                <button
                  onClick={() => setActiveTab('listings')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                >
                  Voir tout
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {MOCK_PROPERTIES.slice(0, 4).map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-4 p-4">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=80'}
                      alt={p.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{p.title}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {p.neighborhood ? `${p.neighborhood}, ` : ''}{p.city}
                      </p>
                      <p className="text-sm font-bold text-amber-600 mt-0.5">{formatPrice(p.price, p.listing_type)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {120 + idx * 47}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {idx * 3 + 2}
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigate('post-property')}
                        className="text-xs text-gray-600 border border-gray-200 hover:border-gray-300 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Team + Bar chart */}
            <div className="lg:col-span-1 space-y-8">
              {/* Team performance */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance équipe</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                  {DEMO_TEAM.map((member, idx) => (
                    <div key={member.id} className="flex items-center gap-3 p-3.5">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            idx % 2 === 0 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                        >
                          {member.initials}
                        </div>
                        {member.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {member.sales} ventes
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar chart */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-4">Activité (7 derniers mois)</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                  {MONTHLY_DATA.map((d) => {
                    const pct = Math.round((d.views / maxViews) * 100);
                    return (
                      <div key={d.month} className="flex items-center gap-3">
                        <span className="w-10 text-xs text-gray-500 font-medium flex-shrink-0">{d.month}</span>
                        <div className="flex-1 bg-gray-100 rounded-r-full h-6 overflow-hidden">
                          <div
                            className="bg-amber-500 h-6 rounded-r-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 text-xs text-gray-600 font-medium text-right flex-shrink-0">
                          {d.views.toLocaleString('fr-FR')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: ANNONCES ===== */}
        {activeTab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Mes annonces</h2>
              <button
                onClick={() => onNavigate('post-property')}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter une annonce
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {MOCK_PROPERTIES.slice(0, 4).map((p, idx) => (
                <div key={p.id} className="flex items-center gap-4 p-4">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=80'}
                    alt={p.title}
                    className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                    <p className="text-sm text-gray-500">{p.city}</p>
                    <p className="text-sm font-bold text-amber-600 mt-0.5">{formatPrice(p.price, p.listing_type)}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-center gap-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.listing_type === 'sale'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {p.listing_type === 'sale' ? 'Vente' : 'Location'}
                    </span>
                  </div>
                  <div className="hidden md:flex items-center gap-1 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    {120 + idx * 47}
                  </div>
                  <span className="hidden sm:inline-flex text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    Actif
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onNavigate('post-property')}
                      className="text-sm text-gray-600 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onNavigate('property', { id: p.id })}
                      className="text-sm text-amber-600 border border-amber-200 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Voir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TAB: ÉQUIPE ===== */}
        {activeTab === 'team' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900">Gestion de l'équipe</h2>

            {/* Invite form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Inviter un membre</h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Adresse email du membre..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                  />
                </div>
                <button
                  onClick={handleInvite}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Inviter
                </button>
              </div>
            </div>

            {/* Members table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3.5 px-4 font-semibold text-gray-600">Membre</th>
                      <th className="text-left py-3.5 px-4 font-semibold text-gray-600">Email</th>
                      <th className="text-center py-3.5 px-4 font-semibold text-gray-600">Annonces</th>
                      <th className="text-center py-3.5 px-4 font-semibold text-gray-600">Ventes</th>
                      <th className="text-left py-3.5 px-4 font-semibold text-gray-600">Rôle</th>
                      <th className="text-center py-3.5 px-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teamMembers.map((member, idx) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  avatarColors[idx % avatarColors.length]
                                }`}
                              >
                                {member.initials}
                              </div>
                              {member.online && (
                                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white rounded-full" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">{member.email}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-gray-700">{member.listings}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-gray-700">{member.sales}</td>
                        <td className="py-3.5 px-4">
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-white transition-colors"
                          >
                            <option value="Agent">Agent</option>
                            <option value="Agent senior">Agent senior</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Manager">Manager</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
                          >
                            ✕ Retirer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: ANALYTIQUE ===== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900">Tableau analytique</h2>

            {/* KPI cards 2x2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total vues */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    <ArrowUp className="w-3 h-3" />
                    +24%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">12 890</p>
                <p className="text-xs text-gray-500 mt-0.5">Total vues</p>
                <p className="text-xs text-gray-400 mt-1">vs mois dernier</p>
              </div>
              {/* Total leads */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    <ArrowUp className="w-3 h-3" />
                    +18%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">405</p>
                <p className="text-xs text-gray-500 mt-0.5">Total leads</p>
                <p className="text-xs text-gray-400 mt-1">vs mois dernier</p>
              </div>
              {/* Ventes totales */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    <ArrowUp className="w-3 h-3" />
                    +12%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">58</p>
                <p className="text-xs text-gray-500 mt-0.5">Ventes totales</p>
                <p className="text-xs text-gray-400 mt-1">vs mois dernier</p>
              </div>
              {/* Taux conversion */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                    Stable
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">4.5%</p>
                <p className="text-xs text-gray-500 mt-0.5">Taux conversion</p>
                <p className="text-xs text-gray-400 mt-1">leads → ventes</p>
              </div>
            </div>

            {/* Performance mensuelle bar chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-6">Performance mensuelle</h3>
              <div className="space-y-4">
                {MONTHLY_DATA.map((d) => {
                  const pct = Math.round((d.views / maxViews) * 100);
                  return (
                    <div key={d.month} className="flex items-center gap-4">
                      <span className="w-10 text-sm text-gray-500 font-medium flex-shrink-0">{d.month}</span>
                      <div className="flex-1 bg-gray-100 rounded-r-full h-7 overflow-hidden">
                        <div
                          className="bg-amber-500 h-7 rounded-r-full transition-all duration-500 flex items-center"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-sm text-gray-600 font-semibold text-right flex-shrink-0">
                        {d.views.toLocaleString('fr-FR')}
                      </span>
                      <span className="hidden sm:block w-20 text-xs text-gray-400 flex-shrink-0">
                        {d.leads} leads · {d.sales} ventes
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top annonces table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Top annonces</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Annonce</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Vues</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Leads</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_PROPERTIES.slice(0, 4).map((p, idx) => {
                      const demoLeads = [4, 7, 3, 9][idx];
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=80'}
                                alt={p.title}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{p.title}</p>
                                <p className="text-xs text-gray-500">{p.city}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-gray-700">
                            {120 + idx * 47}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-gray-700">
                            {demoLeads}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                              Actif
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: PARAMÈTRES AGENCE ===== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Paramètres de l'agence</h2>
              {savedToast && (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-xl">
                  <CheckCircle className="w-4 h-4" />
                  Sauvegardé !
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              {/* Agency name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom de l'agence
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={agencyEmail}
                  onChange={(e) => setAgencyEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={agencyPhone}
                  onChange={(e) => setAgencyPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                />
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse
                </label>
                <input
                  type="text"
                  value={agencyAddress}
                  onChange={(e) => setAgencyAddress(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                />
              </div>
              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Site web
                </label>
                <input
                  type="text"
                  value={agencyWebsite}
                  onChange={(e) => setAgencyWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description de l'agence
                </label>
                <textarea
                  rows={3}
                  value={agencyDescription}
                  onChange={(e) => setAgencyDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors resize-none"
                />
              </div>
              {/* Save button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Sauvegarder les modifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
