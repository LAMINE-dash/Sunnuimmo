import { Check, Star, Zap, Crown, Building2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../lib/data';
import { useAuth } from '../contexts/AuthContext';

interface PricingPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function PricingPage({ onNavigate }: PricingPageProps) {
  const { profile } = useAuth();

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Building2 className="w-8 h-8 text-gray-500" />;
      case 'starter':
        return <Zap className="w-8 h-8 text-blue-500" />;
      case 'pro':
        return <Star className="w-8 h-8 text-amber-500" />;
      case 'enterprise':
        return <Crown className="w-8 h-8 text-purple-500" />;
      default:
        return <Building2 className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Des offres adaptées à tous vos besoins immobiliers
          </p>
        </div>
      </div>

      {/* Plan Cards Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-sm p-6 flex flex-col ${
                plan.popular
                  ? 'ring-2 ring-amber-500 transform scale-105 shadow-lg'
                  : 'border border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    Populaire
                  </span>
                </div>
              )}

              {/* Plan Icon */}
              <div className="mb-4">
                {getPlanIcon(plan.id)}
              </div>

              {/* Plan Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 mb-4">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                {plan.price === 0 ? (
                  <span className="text-3xl font-extrabold text-gray-900">
                    Gratuit
                  </span>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-amber-500">
                      {plan.price.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-base text-gray-500 mb-1">
                      {' '}FCFA/{plan.period}
                    </span>
                  </div>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-2 mb-4 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Limits List */}
              {plan.limits && plan.limits.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {plan.limits.map((limit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0">—</span>
                      <span className="text-sm text-gray-400">{limit}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Button */}
              <div className="mt-auto pt-4">
                {profile?.subscription_plan === plan.id ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-lg bg-gray-100 text-gray-400 font-semibold text-sm cursor-not-allowed"
                  >
                    Plan actuel
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    onClick={() => onNavigate('auth', { mode: 'register' })}
                    className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors"
                  >
                    Commencer gratuitement
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('payment', { planId: plan.id })}
                    className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors"
                  >
                    Choisir {plan.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
          Questions fréquentes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              question: 'Puis-je changer de plan à tout moment ?',
              answer:
                'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.',
            },
            {
              question: "Comment fonctionne l'essai gratuit ?",
              answer:
                "Le plan gratuit est permanent, sans carte bancaire requise. Vous accédez aux fonctionnalités de base sans limite de durée.",
            },
            {
              question: 'Quels moyens de paiement acceptez-vous ?',
              answer:
                'Nous acceptons Orange Money, Wave, Free Money et les cartes bancaires Visa/Mastercard.',
            },
            {
              question: "Y a-t-il un engagement ?",
              answer:
                "Non, tous nos plans sont sans engagement. Vous pouvez annuler ou modifier à tout moment.",
            },
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="text-base font-semibold text-gray-900 mb-2">
                {faq.question}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Besoin d'un plan sur mesure ?
          </h2>
          <p className="text-amber-100 text-lg mb-8">
            Contactez notre équipe commerciale pour les grandes structures.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-white text-amber-600 font-semibold px-8 py-3 rounded-lg hover:bg-amber-50 transition-colors shadow-md"
          >
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
}
