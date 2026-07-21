import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, ArrowLeft, Lock, CheckCircle, Loader2, Shield, Star, Crown, Zap, Building2, AlertCircle, Check, XCircle, ExternalLink } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../lib/data';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PaymentPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  planId?: string;
  txRef?: string;
}

type VerifyState = 'idle' | 'verifying' | 'success' | 'failed';

export default function PaymentPage({ onNavigate, planId, txRef }: PaymentPageProps) {
  const { profile, refreshProfile } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(planId || 'starter');
  const [paymentMethod, setPaymentMethod] = useState<'orange' | 'wave' | 'card'>('orange');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');

  const paidPlans = SUBSCRIPTION_PLANS.filter(p => p.id !== 'free');
  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];
  const tva = Math.round(selectedPlan.price * 0.18);
  const total = selectedPlan.price + tva;

  // Auto-verify when returning from Flutterwave redirect
  useEffect(() => {
    if (!txRef) { setVerifyState('idle'); return; }
    let mounted = true;
    setVerifyState('verifying');
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.data.session?.access_token}`,
            },
            body: JSON.stringify({ tx_ref: txRef }),
          }
        );
        const result = await resp.json();
        if (!mounted) return;
        if (result.verified && result.saved) {
          await refreshProfile();
          setVerifyState('success');
        } else {
          setVerifyState('failed');
        }
      } catch {
        if (mounted) setVerifyState('failed');
      }
    })();
    return () => { mounted = false; };
  }, [txRef, refreshProfile]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({
            plan: selectedPlanId,
            amount: total,
            email: profile.email,
            name: profile.full_name,
            phone: phone || undefined,
            user_id: profile.user_id,
          }),
        }
      );
      const result = await resp.json();
      if (!resp.ok || !result.link) {
        throw new Error(result.error || 'Échec de l\'initialisation du paiement');
      }
      // Redirect to Flutterwave hosted checkout
      window.location.href = result.link;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le paiement a échoué. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (id: string) => {
    if (id === 'starter') return <Zap className="w-6 h-6 text-blue-500" />;
    if (id === 'pro') return <Star className="w-6 h-6 text-amber-500" />;
    if (id === 'enterprise') return <Crown className="w-6 h-6 text-purple-500" />;
    return <Building2 className="w-6 h-6 text-gray-500" />;
  };

  // --- Verification success screen ---
  if (verifyState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4 max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Paiement réussi !</h1>
          <p className="text-gray-600 mb-2">
            Votre abonnement est maintenant actif.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Un reçu a été envoyé à votre adresse email.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Accéder au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // --- Verification failed screen ---
  if (verifyState === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4 max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <XCircle className="w-20 h-20 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Paiement non confirmé</h1>
          <p className="text-gray-600 mb-8">
            Nous n'avons pas pu confirmer votre paiement. Si vous avez été débité, contactez le support.
          </p>
          <button
            onClick={() => onNavigate('pricing')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // --- Verifying screen (returning from Flutterwave) ---
  if (verifyState === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4 max-w-md mx-auto">
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Vérification du paiement...</h1>
          <p className="text-gray-500">Nous confirmons votre transaction. Veuillez patienter.</p>
        </div>
      </div>
    );
  }

  // --- Main payment form ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => onNavigate('pricing')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Souscrire à un plan</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 lg:grid lg:grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Plan Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choisissez votre plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {paidPlans.map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center ${
                    selectedPlanId === plan.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {getPlanIcon(plan.id)}
                  <span className="font-semibold text-gray-900 text-sm">{plan.name}</span>
                  <span className="text-xs text-gray-500">
                    {plan.price.toLocaleString('fr-FR')} FCFA/mois
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Payment Method Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mode de paiement</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('orange')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'orange'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-7 h-7 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Orange Money</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('wave')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'wave'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-7 h-7 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Wave</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-7 h-7 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Carte bancaire</span>
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              Vous serez redirigé vers Flutterwave, notre prestataire de paiement sécurisé, pour finaliser la transaction.
            </p>
          </div>

          {/* 3. Contact Info + Submit */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vos informations</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              {(paymentMethod === 'orange' || paymentMethod === 'wave') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro {paymentMethod === 'orange' ? 'Orange Money' : 'Wave'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Vous recevrez une demande de paiement sur votre téléphone après redirection.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  Vous serez redirigé vers la page sécurisée Flutterwave pour saisir les informations de votre carte (Visa/Mastercard).
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Redirection en cours...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Payer {total.toLocaleString('fr-FR')} FCFA</span>
                  </>
                )}
              </button>
              {error && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Section — Summary */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-8 bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Récapitulatif</h2>

            {/* Plan info */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getPlanIcon(selectedPlan.id)}</div>
              <div>
                <p className="font-semibold text-gray-900">{selectedPlan.name}</p>
                <p className="text-sm text-gray-500">{selectedPlan.description}</p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Abonnement {selectedPlan.name}</span>
                <span>{selectedPlan.price.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>TVA (18%)</span>
                <span>{tva.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-2">
              {selectedPlan.features.slice(0, 5).map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            {/* Guarantee footer */}
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
              <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Satisfait ou remboursé 30 jours</span>
            </div>

            {/* Security info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Paiement sécurisé via Flutterwave. Wave, Orange Money et cartes bancaires acceptées.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
