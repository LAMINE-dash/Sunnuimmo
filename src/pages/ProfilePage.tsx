import { useState } from 'react';
import {
  User, Lock, CreditCard, Mail, Phone, MapPin, Camera, Shield, CheckCircle,
  Loader2, AlertCircle, Star, ArrowLeft, Calendar, Eye, Heart, Building,
} from 'lucide-react';
import { supabase, UserRole } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CITIES, SUBSCRIPTION_PLANS } from '../lib/data';

interface ProfilePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type Tab = 'profile' | 'security' | 'subscription';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'buyer', label: 'Acheteur' },
  { value: 'seller', label: 'Vendeur' },
  { value: 'agency', label: 'Agence' },
  { value: 'promoter', label: 'Promoteur' },
  { value: 'notary', label: 'Notaire' },
  { value: 'bank', label: 'Banque' },
];

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Acheteur', tenant: 'Locataire', seller: 'Vendeur', agency: 'Agence',
  promoter: 'Promoteur', notary: 'Notaire', bank: 'Banque', admin: 'Administrateur',
};

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-amber-100 text-amber-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit', starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise',
};

const PLAN_ANNONCE_LIMITS: Record<string, number> = {
  free: 3, starter: 10, pro: 9999, enterprise: 9999,
};

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [role, setRole] = useState<UserRole>(profile?.role || 'buyer');
  const [city, setCity] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileToast, setProfileToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [securityToast, setSecurityToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6 text-lg">Connectez-vous pour gérer votre profil</p>
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

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : (user.email?.[0] || 'U').toUpperCase();

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const plan = profile?.subscription_plan || 'free';
  const planDetails = SUBSCRIPTION_PLANS.find((p) => p.id === plan);
  const annonceLimit = PLAN_ANNONCE_LIMITS[plan] ?? 3;
  const annoncesUsed = 2; // demo value

  const showToast = (
    setter: (t: { type: 'success' | 'error'; msg: string } | null) => void,
    type: 'success' | 'error',
    msg: string,
  ) => {
    setter({ type, msg });
    setTimeout(() => setter(null), 4000);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileToast(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
          avatar_url: avatarUrl || null,
          role,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      showToast(setProfileToast, 'success', 'Profil mis à jour avec succès ✓');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      showToast(setProfileToast, 'error', msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setSecurityToast(null);
    if (newPassword.length < 6) {
      showToast(setSecurityToast, 'error', 'Le nouveau mot de passe doit faire au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(setSecurityToast, 'error', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (!currentPassword) {
      showToast(setSecurityToast, 'error', 'Veuillez saisir votre mot de passe actuel');
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast(setSecurityToast, 'success', 'Mot de passe modifié avec succès ✓');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
      showToast(setSecurityToast, 'error', msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'security', label: 'Sécurité', icon: Lock },
    { key: 'subscription', label: 'Abonnement', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {profile?.full_name || 'Utilisateur'}
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-4 h-4" />
                {profile?.email || user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <Shield className="w-3 h-3" />
                  {ROLE_LABELS[profile?.role || 'buyer'] || 'Acheteur'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[plan]}`}>
                  <Star className="w-3 h-3" />
                  {PLAN_LABELS[plan] || 'Gratuit'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <Calendar className="w-3 h-3" />
                  Membre depuis {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 border-b border-gray-200 mt-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Informations personnelles</h2>
            <p className="text-sm text-gray-500 mb-6">Mettez à jour vos informations de profil</p>

            {profileToast && (
              <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                profileToast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {profileToast.type === 'success'
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {profileToast.msg}
              </div>
            )}

            <div className="space-y-5">
              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar (URL)</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://exemple.com/avatar.jpg"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom complet"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 123 45 67"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rôle</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white appearance-none"
                  >
                    <option value="">Sélectionnez une ville</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Save button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {savingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Sécurité du compte</h2>
            <p className="text-sm text-gray-500 mb-6">Modifiez votre mot de passe régulièrement</p>

            {securityToast && (
              <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                securityToast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {securityToast.type === 'success'
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {securityToast.msg}
              </div>
            )}

            <div className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs text-amber-600 mt-1">Au moins 6 caractères requis</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              <div className="pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {savingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {savingPassword ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION TAB */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Current plan card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`px-6 py-5 ${plan === 'free' ? 'bg-gray-50' : plan === 'pro' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-blue-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${plan === 'pro' ? 'text-amber-100' : 'text-gray-500'}`}>Plan actuel</p>
                    <h2 className={`text-2xl font-bold mt-1 ${plan === 'pro' ? 'text-white' : 'text-gray-900'}`}>
                      {PLAN_LABELS[plan] || 'Gratuit'}
                    </h2>
                  </div>
                  <Star className={`w-10 h-10 ${plan === 'pro' ? 'text-white' : 'text-amber-400'}`} />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Fonctionnalités incluses</h3>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {(planDetails?.features || []).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Usage stats */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Utilisation du plan</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4 text-amber-500" />
                      Annonces actives
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {annoncesUsed} / {annonceLimit >= 9999 ? '∞' : annonceLimit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${annonceLimit >= 9999 ? 10 : Math.min((annoncesUsed / annonceLimit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Eye className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">847</p>
                    <p className="text-xs text-gray-500">Vues totales</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Heart className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">23</p>
                    <p className="text-xs text-gray-500">Favoris</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Calendar className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">5</p>
                    <p className="text-xs text-gray-500">Visites</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade CTA */}
            {plan !== 'pro' && plan !== 'enterprise' && (
              <div className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">Passez au plan Pro</h3>
                    <p className="mt-1 text-sm text-amber-100">
                      Annonces illimitées, statistiques avancées et support dédié
                    </p>
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
      </div>
    </div>
  );
}
