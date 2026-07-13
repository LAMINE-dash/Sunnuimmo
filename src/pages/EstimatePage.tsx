import { useState } from 'react';
import {
  Brain,
  MapPin,
  Square,
  TrendingUp,
  Info,
  BarChart3,
  ArrowRight,
  Loader2,
  Building2,
  Star,
  FileText,
  Home,
} from 'lucide-react';
import { CITIES, NEIGHBORHOODS_DAKAR, PROPERTY_TYPES, FEATURES_LIST, formatPrice } from '../lib/data';

interface EstimatePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

interface EstimationResult {
  min: number;
  mid: number;
  max: number;
  confidence: number;
  pricePerM2: number;
  trend: string;
}

const BASE_PRICES: Record<string, number> = {
  'Dakar': 800_000,
  'Thiès': 250_000,
  'Saint-Louis': 200_000,
  'Ziguinchor': 180_000,
  'Kaolack': 160_000,
  'Mbour': 300_000,
  'Touba': 150_000,
  'Diourbel': 140_000,
  'Louga': 130_000,
  'Tambacounda': 120_000,
};

const TYPE_MULTIPLIERS: Record<string, number> = {
  villa: 1.8,
  house: 1.2,
  apartment: 1.0,
  office: 1.4,
  commercial: 1.3,
  land: 0.4,
};

const NEIGHBORHOOD_BONUS: Record<string, number> = {
  'Almadies': 2.2,
  'Ngor': 2.0,
  'Plateau': 1.8,
  'Fann': 1.6,
  'Point E': 1.5,
  'Mermoz': 1.4,
  'Sacré-Coeur': 1.3,
  'Liberté': 1.2,
  'Yoff': 1.3,
  'Ouakam': 1.1,
};

const getPropertyIcon = (typeId: string) => {
  switch (typeId) {
    case 'land':
      return <MapPin className="w-5 h-5" />;
    case 'villa':
      return <Star className="w-5 h-5" />;
    case 'office':
      return <FileText className="w-5 h-5" />;
    case 'house':
      return <Home className="w-5 h-5" />;
    default:
      return <Building2 className="w-5 h-5" />;
  }
};

// Suppress unused import warnings – these are intentionally imported per spec
void Square;
void TrendingUp;

export default function EstimatePage({ onNavigate }: EstimatePageProps) {
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [surface, setSurface] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const handleEstimate = () => {
    if (!propertyType || !city || !surface) return;
    setLoading(true);
    setTimeout(() => {
      const base = BASE_PRICES[city] ?? 200_000;
      const typeM = TYPE_MULTIPLIERS[propertyType] ?? 1.0;
      const neighM = neighborhood ? (NEIGHBORHOOD_BONUS[neighborhood] ?? 1.0) : 1.0;
      const featBonus = 1 + selectedFeatures.length * 0.03;
      const pricePerM2 = Math.round(base * typeM * neighM * featBonus);
      const mid = pricePerM2 * Number(surface);
      const min = Math.round(mid * 0.88);
      const max = Math.round(mid * 1.12);
      const confidence = Math.floor(Math.random() * 20) + 72;
      const trendList = [
        'hausse modérée (+5% sur 12 mois)',
        'hausse forte (+12% sur 12 mois)',
        'stable (±2% sur 12 mois)',
      ];
      const trend = trendList[Math.floor(Math.random() * trendList.length)];
      setResult({ min, mid, max, confidence, pricePerM2, trend });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN — Form Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 lg:mb-0">
            {/* Title */}
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-7 h-7 text-amber-500" />
              <h1 className="text-2xl font-bold text-gray-900">Estimation IA</h1>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Obtenez une estimation précise de votre bien en quelques secondes
            </p>

            {/* Property Type Buttons */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de bien
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPropertyType(type.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-colors ${
                      propertyType === type.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getPropertyIcon(type.id)}
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setNeighborhood('');
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Sélectionner une ville</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Neighborhood — only for Dakar */}
            {city === 'Dakar' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quartier
                </label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Tous quartiers</option>
                  {NEIGHBORHOODS_DAKAR.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Surface */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surface (m²)
              </label>
              <input
                type="number"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                placeholder="Ex: 120"
                min="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chambres
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salles de bain
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caractéristiques
              </label>
              <div className="flex flex-wrap gap-2">
                {FEATURES_LIST.map((feature) => (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedFeatures.includes(feature)
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleEstimate}
              disabled={loading || !propertyType || !city || !surface}
              className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-sm transition-colors ${
                loading || !propertyType || !city || !surface
                  ? 'bg-amber-200 text-amber-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
              Estimer maintenant
            </button>
          </div>

          {/* RIGHT COLUMN — Result Panel */}
          <div>
            {loading ? (
              /* Loading State */
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center min-h-64">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Analyse en cours...</p>
              </div>
            ) : result ? (
              /* Result State */
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-amber-400" />
                    <h2 className="text-lg font-bold">Estimation IA</h2>
                  </div>
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {result.confidence}% de confiance
                  </span>
                </div>

                {/* 3-column Price Display */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Min</p>
                    <p className="text-amber-400 font-bold text-sm">
                      {formatPrice(result.min, 'sale')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Estimation</p>
                    <p className="text-white font-extrabold text-lg leading-tight">
                      {formatPrice(result.mid, 'sale')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Max</p>
                    <p className="text-amber-400 font-bold text-sm">
                      {formatPrice(result.max, 'sale')}
                    </p>
                  </div>
                </div>

                {/* Price per m² */}
                <p className="text-center text-gray-400 text-sm mb-4">
                  {result.pricePerM2.toLocaleString('fr-FR')} FCFA/m²
                </p>

                {/* Trend Card */}
                <div className="bg-white/10 rounded-xl p-4 mt-4 flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">
                      Tendance du marché
                    </p>
                    <p className="text-sm text-gray-300">{result.trend}</p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-white/5 rounded-lg p-3 mt-4 flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Cette estimation est fournie à titre indicatif et basée sur les données
                    du marché. Elle peut varier selon l'état réel du bien et les conditions
                    de négociation.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => setResult(null)}
                    className="py-2.5 px-4 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                  >
                    Affiner l'estimation
                  </button>
                  <button
                    onClick={() => onNavigate('post-property')}
                    className="py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
                  >
                    Publier une annonce
                  </button>
                </div>
              </div>
            ) : (
              /* Empty / Initial State */
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center min-h-64">
                <Brain className="w-16 h-16 text-amber-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Renseignez les informations
                </h2>
                <ul className="space-y-3 text-left w-full max-w-xs">
                  {[
                    'Basé sur 50 000+ transactions récentes',
                    'Algorithme mis à jour hebdomadairement',
                    'Précision moyenne de 85%',
                    'Gratuit et sans engagement',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
