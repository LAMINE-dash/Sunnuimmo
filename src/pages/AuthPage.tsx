import { useState } from 'react';
import { Building2, Eye, EyeOff, User, Phone, Mail, Lock, Shield, CheckCircle, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../lib/supabase';

interface AuthPageProps {
  mode: 'login' | 'register';
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const roles: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}[] = [
  {
    id: 'buyer',
    icon: <Home className="w-6 h-6" />,
    title: 'Acheteur',
    description: 'Je cherche à acquérir un bien',
  },
  {
    id: 'tenant',
    icon: <Building2 className="w-6 h-6" />,
    title: 'Locataire',
    description: 'Je cherche à louer un bien',
  },
  {
    id: 'seller',
    icon: <User className="w-6 h-6" />,
    title: 'Vendeur/Bailleur',
    description: 'Je mets un bien en vente ou en location',
  },
  {
    id: 'agency',
    icon: <Building2 className="w-6 h-6" />,
    title: 'Agence immobilière',
    description: 'Je représente une agence',
  },
  {
    id: 'notary',
    icon: <Shield className="w-6 h-6" />,
    title: 'Notaire',
    description: 'Je suis un professionnel du droit',
  },
  {
    id: 'bank',
    icon: <Shield className="w-6 h-6" />,
    title: 'Banque/Financement',
    description: 'Je propose des solutions de financement',
  },
];

export default function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error.message);
    else onNavigate('dashboard');
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password, {
      full_name: fullName,
      phone: phone || null,
      role: selectedRole as UserRole,
    });
    setLoading(false);
    if (error) setError(error.message);
    else onNavigate('dashboard');
  }

  function handleStep1Continue() {
    if (!fullName.trim() || !email.trim()) {
      setError('Le nom complet et l\'e-mail sont requis.');
      return;
    }
    setError(null);
    setRegisterStep(2);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 max-w-lg bg-gradient-to-br from-amber-500 to-orange-600 p-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-white" />
          <span className="text-2xl font-bold text-white tracking-tight">TerangaImmo</span>
        </div>

        {/* Tagline + Benefits */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white leading-snug">
            La meilleure plateforme immobilière du Sénégal
          </h2>

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-200 mt-0.5 flex-shrink-0" />
              <span className="text-white">12 500+ biens disponibles à travers le Sénégal</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-200 mt-0.5 flex-shrink-0" />
              <span className="text-white">Transactions 100% sécurisées et vérifiées</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber-200 mt-0.5 flex-shrink-0" />
              <span className="text-white">Estimation IA gratuite en 30 secondes</span>
            </li>
          </ul>
        </div>

        {/* Bottom text */}
        <p className="text-amber-100 text-sm">Rejoignez 25 000+ utilisateurs satisfaits</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Back link */}
          <button
            onClick={() => onNavigate('home')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1 transition-colors"
          >
            ← Retour à l'accueil
          </button>

          {mode === 'login' ? (
            <>
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h1>
              <p className="text-gray-500 text-sm mb-6">
                Pas encore de compte ?{' '}
                <button
                  onClick={() => onNavigate('auth', { mode: 'register' })}
                  className="text-amber-600 font-medium hover:underline"
                >
                  S'inscrire
                </button>
              </p>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="vous@exemple.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-amber-600 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h1>
              <p className="text-gray-500 text-sm mb-6">
                Déjà un compte ?{' '}
                <button
                  onClick={() => onNavigate('auth', { mode: 'login' })}
                  className="text-amber-600 font-medium hover:underline"
                >
                  Se connecter
                </button>
              </p>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {registerStep === 1 ? (
                <>
                  {/* Step heading + progress */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm font-medium text-gray-700">Vos informations</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Full name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ibrahima Diallo"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse e-mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vous@exemple.com"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone{' '}
                        <span className="text-gray-400 font-normal">(optionnel)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+221 77 000 00 00"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Continue */}
                    <button
                      type="button"
                      onClick={handleStep1Continue}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      Continuer →
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleRegister}>
                  {/* Step heading + progress */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm font-medium text-gray-700">Votre profil</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-800 mb-4">
                    Quel est votre profil ?
                  </p>

                  {/* Role grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`flex flex-col items-start gap-1.5 p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedRole === role.id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <span
                          className={
                            selectedRole === role.id ? 'text-amber-600' : 'text-gray-500'
                          }
                        >
                          {role.icon}
                        </span>
                        <span className="text-xs font-semibold text-gray-800">{role.title}</span>
                        <span className="text-xs text-gray-500 leading-snug">
                          {role.description}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors mb-3"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Création...
                      </>
                    ) : (
                      'Créer mon compte'
                    )}
                  </button>

                  {/* Back */}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setRegisterStep(1);
                    }}
                    className="w-full py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    ← Retour
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
