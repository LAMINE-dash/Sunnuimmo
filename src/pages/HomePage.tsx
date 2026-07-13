import { useState } from 'react';
import {
  Search, MapPin, Star, Shield, Brain, Zap, Users, ArrowRight,
} from 'lucide-react';
import { MOCK_PROPERTIES, PROPERTY_TYPES } from '../lib/data';
import PropertyCard from '../components/PropertyCard';

export default function HomePage({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const [tab, setTab] = useState<'sale' | 'rent'>('sale');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = () => {
    const params: Record<string, string> = { listing_type: tab };
    if (city.trim()) params.city = city.trim();
    if (propertyType) params.type = propertyType;
    onNavigate('listings', params);
  };

  const premiumProperties = MOCK_PROPERTIES.filter((p) => p.is_premium).slice(0, 3);

  const stats = [
    { value: '12 500+', label: 'annonces' },
    { value: '850', label: 'agences' },
    { value: '98%', label: 'satisfaits' },
    { value: '45 Mrd', label: 'FCFA' },
  ];

  const features = [
    {
      icon: <Brain className="w-7 h-7 text-amber-500" />,
      title: 'Estimation IA',
      desc: 'Estimez votre bien en 30 secondes avec notre IA',
    },
    {
      icon: <Shield className="w-7 h-7 text-amber-500" />,
      title: 'Transactions sécurisées',
      desc: 'Vérification identité et titres fonciers',
    },
    {
      icon: <Users className="w-7 h-7 text-amber-500" />,
      title: 'Réseau pros',
      desc: '850+ agences et promoteurs partenaires',
    },
    {
      icon: <Zap className="w-7 h-7 text-amber-500" />,
      title: 'Mise en ligne rapide',
      desc: 'Publiez votre annonce en moins de 5 minutes',
    },
  ];

  const testimonials = [
    {
      name: 'Aminata Diallo',
      location: 'Dakar',
      quote: "Excellent service, j'ai vendu ma villa en 3 semaines !",
      stars: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    },
    {
      name: 'Moussa Ndiaye',
      location: 'Thiès',
      quote: "L'estimation IA était très précise, je recommande !",
      stars: 5,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    },
    {
      name: 'Fatou Sow',
      location: 'Saint-Louis',
      quote: "Plateforme intuitive, j'ai trouvé mon appartement idéal.",
      stars: 4,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.pexels.com/photos/2090644/pexels-photo-2090644.jpeg)' }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
            Trouvez votre bien{' '}
            <span className="text-amber-400">idéal</span>{' '}
            au Sénégal
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            La première plateforme immobilière intelligente du Sénégal. Achetez, louez ou vendez en toute confiance.
          </p>

          {/* Search box */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl mx-auto">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setTab('sale')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === 'sale'
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Acheter
              </button>
              <button
                onClick={() => setTab('rent')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === 'rent'
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Louer
              </button>
            </div>

            {/* Inputs */}
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-px bg-gray-100">
              {/* City input */}
              <div className="flex items-center gap-2 bg-white px-4 py-3 flex-1">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Ville (ex: Dakar, Thiès…)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                />
              </div>

              {/* Property type select */}
              <div className="bg-white px-4 py-3 flex-1 border-t sm:border-t-0 sm:border-l border-gray-100">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                >
                  <option value="">Type de bien</option>
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 transition-colors sm:rounded-none rounded-b-2xl sm:rounded-br-none"
              >
                <Search className="w-5 h-5" />
                <span>Rechercher</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-amber-500">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Pourquoi choisir TerangaImmo ?</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Une plateforme conçue pour faciliter chaque étape de votre projet immobilier au Sénégal.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all text-center group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 mb-4 group-hover:bg-amber-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM LISTINGS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Annonces premium</h2>
              <p className="text-gray-500 mt-2">Les meilleures propriétés sélectionnées pour vous.</p>
            </div>
            <button
              onClick={() => onNavigate('listings')}
              className="hidden sm:flex items-center gap-1 text-amber-600 font-semibold hover:text-amber-700 transition-colors text-sm"
            >
              Voir toutes les annonces <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumProperties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onView={() => onNavigate('property', { id: p.id })}
              />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => onNavigate('listings')}
              className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors text-sm"
            >
              Voir toutes les annonces <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── AI ESTIMATION CTA ── */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-6">
            <Brain className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Estimez votre bien en 30 secondes
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Notre intelligence artificielle analyse les prix du marché sénégalais en temps réel pour vous donner une estimation précise et fiable de votre propriété.
          </p>
          <button
            onClick={() => onNavigate('estimate')}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-amber-500/30"
          >
            Estimer maintenant <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Ce que disent nos clients</h2>
            <p className="text-gray-500 mt-3">Des milliers de Sénégalais nous font déjà confiance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all flex flex-col gap-4"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                {/* Avatar + info */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                  <img
                    src={`${t.avatar}?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop`}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-amber-500 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Prêt à trouver votre bien <span className="underline decoration-white/50">idéal</span> ?
          </h2>
          <p className="text-amber-100 text-lg mb-10 max-w-xl mx-auto">
            Rejoignez des milliers de Sénégalais qui font confiance à TerangaImmo pour leurs projets immobiliers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('listings')}
              className="inline-flex items-center justify-center gap-2 bg-white text-amber-600 font-bold px-8 py-4 rounded-xl hover:bg-amber-50 transition-colors text-base shadow-lg"
            >
              Parcourir les annonces <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('post-property')}
              className="inline-flex items-center justify-center gap-2 bg-amber-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-amber-700 transition-colors text-base shadow-lg border border-amber-400/30"
            >
              Publier une annonce <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
