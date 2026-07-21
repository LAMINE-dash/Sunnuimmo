import { useState, useEffect } from 'react';
import {
  MapPin, Bed, Bath, Square, Eye, Shield, Star, Phone, MessageSquare,
  Calendar, Share2, Heart, ChevronLeft, ChevronRight, Check, Brain,
  Home, Building, FileText, ArrowLeft, User, X, Loader2,
} from 'lucide-react';
import { formatPrice, TYPE_LABELS, estimatePriceFromComparables } from '../lib/data';
import { supabase, Property } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PropertyPageProps {
  propertyId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function PropertyPage({ propertyId, onNavigate }: PropertyPageProps) {
  const { user, profile } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitSuccess, setShowVisitSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('09:00');
  const [visitMessage, setVisitMessage] = useState('');
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [aiEstimate, setAiEstimate] = useState<ReturnType<typeof estimatePriceFromComparables> | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .maybeSingle();
        if (error) throw error;
        if (!mounted) return;
        const prop = data as unknown as Property | null;
        setProperty(prop);

        // Incrémente les vues (best-effort)
        if (prop) {
          supabase
            .from('properties')
            .update({ views: (prop.views ?? 0) + 1 })
            .eq('id', prop.id)
            .then(() => {});
        }

        // Comparables pour l'estimation
        if (prop) {
          let samples: Property[] = [];
          const filters = ['city', 'type', 'listing_type'] as const;
          for (let i = 0; i <= filters.length && samples.length < 3; i++) {
            let q = supabase
              .from('properties')
              .select('*')
              .eq('status', 'active')
              .neq('id', prop.id);
            for (let j = 0; j <= i; j++) {
              const key = filters[j];
              const val = (prop as any)[key];
              if (val !== null && val !== undefined) q = q.eq(key, val);
            }
            const { data: d } = await q.limit(20);
            if (d) samples = samples.concat(d as unknown as Property[]);
          }
          // dédoublonne
          const seen = new Set<string>();
          samples = samples.filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
          if (!mounted) return;
          setAiEstimate(estimatePriceFromComparables(prop, samples));
        } else {
          setAiEstimate(null);
        }
      } catch {
        if (mounted) setProperty(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [propertyId]);

  useEffect(() => {
    if (!user || !property) return;
    let mounted = true;
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', property.id)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted) setIsFavorite(!!data);
      });
    return () => { mounted = false; };
  }, [user, property]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-gray-500">Chargement du bien...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-semibold text-gray-700">Bien non trouvé</p>
        <button
          onClick={() => onNavigate('listings')}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux annonces
        </button>
      </div>
    );
  }

  const images = property.images ?? [];
  const totalImages = images.length;

  const prevImage = () =>
    setCurrentImageIndex((i) => (i - 1 + totalImages) % totalImages);
  const nextImage = () =>
    setCurrentImageIndex((i) => (i + 1) % totalImages);

  const toggleFavorite = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);
        setIsFavorite(false);
        setToast('Retiré des favoris');
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, property_id: property.id });
        setIsFavorite(true);
        setToast('Ajouté aux favoris');
      }
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast('Erreur, réessayez');
      setTimeout(() => setToast(null), 2500);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, url });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setToast('Lien copié');
        setTimeout(() => setToast(null), 2500);
      } catch { /* ignore */ }
    }
  };

  const handleContact = () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (user.id === property.user_id) {
      setToast('Vous ne pouvez pas vous envoyer un message');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    onNavigate('messages', { propertyId: property.id, receiverId: property.user_id });
  };

  const handleSubmitVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowVisitModal(false);
      onNavigate('login');
      return;
    }
    setSubmittingVisit(true);
    try {
      const { error } = await supabase.from('visits').insert({
        user_id: user.id,
        property_id: property.id,
        visitor_name: profile?.full_name || user.email || 'Visiteur',
        visitor_phone: profile?.phone || 'Non renseigné',
        visitor_email: user.email,
        preferred_date: visitDate,
        preferred_time: visitTime,
        message: visitMessage || null,
        status: 'pending',
      });
      if (error) throw error;
      await supabase.from('notifications').insert({
        user_id: property.user_id,
        type: 'visit_request',
        title: 'Nouvelle demande de visite',
        message: `Demande de visite pour ${property.title} le ${visitDate} à ${visitTime}`,
        link: property.id,
      });
      setShowVisitModal(false);
      setShowVisitSuccess(true);
      setVisitDate('');
      setVisitMessage('');
    } catch {
      setToast('Erreur lors de la demande, réessayez');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmittingVisit(false);
    }
  };

  const pricePerSqm =
    property.listing_type === 'sale' && property.surface
      ? property.price / property.surface
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Visit success toast */}
      {visitSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Demande de visite envoyée avec succès !</span>
          <button onClick={() => setShowVisitSuccess(false)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Visit request modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !submittingVisit && setShowVisitModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Demander une visite</h2>
              <button
                onClick={() => setShowVisitModal(false)}
                disabled={submittingVisit}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitVisit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date souhaitée
                </label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure souhaitée
                </label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 8).map((h) => (
                    <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                      {h}h00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optionnel)
                </label>
                <textarea
                  value={visitMessage}
                  onChange={(e) => setVisitMessage(e.target.value)}
                  rows={3}
                  placeholder="Précisez vos disponibilités ou toute question..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingVisit}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submittingVisit ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</>
                ) : (
                  <><Calendar className="w-5 h-5" /> Confirmer la demande</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <button
          onClick={() => onNavigate('listings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour aux annonces</span>
        </button>

        <div className="lg:grid lg:grid-cols-3 gap-8">
          {/* ── Main content (left 2/3) ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. Image gallery */}
            <div className="rounded-2xl overflow-hidden bg-gray-900 shadow-lg">
              <div className="relative aspect-video">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={`Photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                  {currentImageIndex + 1} / {totalImages}
                </div>
              </div>
              {/* Thumbnail strip */}
              {totalImages > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex
                          ? 'border-amber-400'
                          : 'border-transparent opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img src={src} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Title area */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
                  {TYPE_LABELS[property.type] ?? property.type}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    property.listing_type === 'sale'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {property.listing_type === 'sale' ? 'Vente' : 'Location'}
                </span>
                {property.is_verified && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full">
                    <Shield className="w-3.5 h-3.5" />
                    Vérifié
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm">
                  {property.address}
                  {property.neighborhood ? `, ${property.neighborhood}` : ''}
                  {property.city ? `, ${property.city}` : ''}
                </span>
              </div>
            </div>

            {/* 3. Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2">
                <Square className="w-6 h-6 text-amber-500" />
                <span className="text-xl font-bold text-gray-900">
                  {property.surface != null ? property.surface : 'N/A'}
                </span>
                <span className="text-xs text-gray-500">m² surface</span>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2">
                <Bed className="w-6 h-6 text-amber-500" />
                <span className="text-xl font-bold text-gray-900">
                  {property.bedrooms != null ? property.bedrooms : 'N/A'}
                </span>
                <span className="text-xs text-gray-500">chambres</span>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2">
                <Bath className="w-6 h-6 text-amber-500" />
                <span className="text-xl font-bold text-gray-900">
                  {property.bathrooms != null ? property.bathrooms : 'N/A'}
                </span>
                <span className="text-xs text-gray-500">salles de bain</span>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2">
                <Home className="w-6 h-6 text-amber-500" />
                <span className="text-xl font-bold text-gray-900">
                  {property.rooms != null ? property.rooms : 'N/A'}
                </span>
                <span className="text-xs text-gray-500">pièces total</span>
              </div>
            </div>

            {/* 4. Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* 5. Features / Équipements */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Équipements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                      <span className="text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. AI Estimate panel */}
            {aiEstimate && (
              <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Brain className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Estimation IA</h2>
                    <p className="text-gray-400 text-xs">
                      Basée sur {aiEstimate.samples} bien{aiEstimate.samples > 1 ? 's' : ''} comparable{aiEstimate.samples > 1 ? 's' : ''} · {formatPrice(Math.round(aiEstimate.avgPricePerSqm), 'sale')}/m²
                    </p>
                  </div>
                  <span className="ml-auto flex-shrink-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-full border border-emerald-500/30">
                    {aiEstimate.confidence}% confiance
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Minimum</p>
                    <p className="text-sm font-bold text-gray-200">
                      {formatPrice(Math.round(aiEstimate.min), property.listing_type)}
                    </p>
                  </div>
                  <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-amber-400 mb-1">Estimation</p>
                    <p className="text-sm font-bold text-amber-300">
                      {formatPrice(Math.round(aiEstimate.base), property.listing_type)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Maximum</p>
                    <p className="text-sm font-bold text-gray-200">
                      {formatPrice(Math.round(aiEstimate.max), property.listing_type)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Calculée sur le prix/m² moyen des biens similaires (même type, même ville, même transaction). À confirmer par une visite et un diagnostic professionnel.
                </p>
              </div>
            )}

            {/* 7. Map placeholder */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div
                className="relative flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"
                style={{ height: 300 }}
              >
                <MapPin className="w-10 h-10 text-amber-500 mb-2" />
                <p className="text-gray-700 font-semibold text-sm text-center px-4">
                  {property.address}
                  {property.neighborhood ? `, ${property.neighborhood}` : ''}
                  {property.city ? `, ${property.city}` : ''}
                </p>
                <p className="text-gray-500 text-xs mt-1">Carte interactive disponible</p>
              </div>
            </div>

            {/* 10. Verification badges panel */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Garanties de confiance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Identité vérifiée</p>
                    <p className="text-gray-500 text-xs">Identité du vendeur confirmée</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Titre foncier</p>
                    <p className="text-gray-500 text-xs">Document vérifié par notaire</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <Building className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Agence certifiée</p>
                    <p className="text-gray-500 text-xs">Agence agréée TerangaImmo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Photos authentiques</p>
                    <p className="text-gray-500 text-xs">Photos vérifiées et récentes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 11. Financing CTA card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Simulez votre financement
                </h2>
                <p className="text-gray-600 text-sm">
                  Calculez vos mensualités avec nos banques partenaires (CBAO, BHS, CBI) et obtenez une pré-approbation rapide.
                </p>
              </div>
              <button
                onClick={() => onNavigate('estimate')}
                className="flex-shrink-0 px-5 py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
              >
                Simuler mon prêt
              </button>
            </div>
          </div>

          {/* ── Sidebar (right 1/3) ── */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* 8. Price & CTA card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                {/* Actions row */}
                <div className="flex items-center justify-end gap-2 mb-4">
                  <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={`p-2 rounded-lg border transition-colors disabled:opacity-60 ${
                      isFavorite
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                    }`}
                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    {favoriteLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
                    title="Partager"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <p className="text-3xl font-extrabold text-gray-900">
                    {formatPrice(property.price, property.listing_type)}
                  </p>
                  {pricePerSqm != null && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatPrice(Math.round(pricePerSqm), 'sale')} / m²
                    </p>
                  )}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col gap-3 mt-5">
                  <button
                    onClick={() => setShowVisitModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
                  >
                    <Calendar className="w-5 h-5" />
                    Demander une visite
                  </button>
                  <button
                    onClick={handleContact}
                    className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-amber-400 hover:text-amber-600 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Envoyer un message
                  </button>
                  <a
                    href="tel:+221331234567"
                    className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-emerald-400 hover:text-emerald-600 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Appeler l'agent
                  </a>
                </div>

                {/* Agent info box */}
                <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">Agent TerangaImmo</p>
                    <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      <Shield className="w-3 h-3" />
                      Agence Certifiée
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick stats card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {property.views} vues
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    Bien premium
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
