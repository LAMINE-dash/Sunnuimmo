import { useState, useRef } from 'react';
import { ArrowLeft, Upload, X, MapPin, Square, Bed, Bath, Plus, Loader2, CheckCircle, Image, Info, ChevronRight, ChevronLeft, Home, Building2, Star, FileText, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CITIES, NEIGHBORHOODS_DAKAR, PROPERTY_TYPES, FEATURES_LIST, formatPrice } from '../lib/data';

interface PostPropertyPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const PROPERTY_TYPE_ICONS: Record<string, React.ReactNode> = {
  apartment: <Building2 className="w-6 h-6" />,
  house: <Home className="w-6 h-6" />,
  villa: <Star className="w-6 h-6" />,
  land: <MapPin className="w-6 h-6" />,
  commercial: <Building2 className="w-6 h-6" />,
  office: <FileText className="w-6 h-6" />,
};

const STEP_LABELS = ['Type & Prix', 'Détails', 'Photos', 'Récapitulatif'];

export default function PostPropertyPage({ onNavigate }: PostPropertyPageProps) {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [propertyType, setPropertyType] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  // Step 2
  const [surface, setSurface] = useState('');
  const [rooms, setRooms] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Step 3
  const [images, setImages] = useState<{ file: File; url: string; storagePath: string }[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-700 text-lg mb-6 text-center">
          Vous devez être connecté pour publier une annonce
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Annonce publiée avec succès !</h2>
        <p className="text-gray-500 text-center mb-8">
          Votre annonce est en cours de validation. Vous serez notifié sous 24h.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Voir mes annonces
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return;
    const newFiles = Array.from(files).slice(0, 10 - images.length);
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      setUploadingIndex(images.length + i);

      const { error } = await supabase.storage.from('property-images').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(path);
        setImages(prev => [...prev, { file, url: data.publicUrl, storagePath: path }]);
      }
      setUploadingIndex(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('properties').insert({
      user_id: user.id,
      title,
      description,
      type: propertyType,
      listing_type: listingType,
      price: Number(price),
      surface: Number(surface),
      rooms: rooms ? Number(rooms) : null,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      bathrooms: bathrooms ? Number(bathrooms) : null,
      address,
      city,
      neighborhood: neighborhood || null,
      images: images.map(i => i.url),
      features: selectedFeatures,
      status: 'pending',
      is_premium: false,
      is_verified: false,
      views: 0,
    });
    setLoading(false);
    if (!error) setSuccess(true);
  };

  const validateStep1 = () => {
    return propertyType !== '' && title.trim() !== '' && price !== '';
  };

  // Progress Bar
  const ProgressBar = () => (
    <div className="flex items-center justify-center mb-10">
      {STEP_LABELS.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < step;
        const isActive = stepNum === step;
        return (
          <div key={stepNum} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                  ${isCompleted ? 'bg-amber-500 text-white' : ''}
                  ${isActive ? 'bg-white border-2 border-amber-500 text-amber-600 ring-4 ring-amber-100' : ''}
                  ${!isCompleted && !isActive ? 'bg-gray-100 text-gray-400' : ''}
                `}
              >
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum}
              </div>
              <span
                className={`mt-2 text-xs font-medium whitespace-nowrap
                  ${isActive ? 'text-amber-600' : isCompleted ? 'text-amber-500' : 'text-gray-400'}
                `}
              >
                {label}
              </span>
            </div>
            {index < STEP_LABELS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-1 mb-5 transition-colors
                  ${stepNum < step ? 'bg-amber-500' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // Step 1
  const Step1 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Type de bien & Prix</h2>

      {/* Listing type toggle */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Type de transaction</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setListingType('sale')}
            className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all
              ${listingType === 'sale' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-gray-300'}
            `}
          >
            <Home className={`w-8 h-8 ${listingType === 'sale' ? 'text-amber-500' : 'text-gray-400'}`} />
            <span className={`font-semibold text-base ${listingType === 'sale' ? 'text-amber-700' : 'text-gray-700'}`}>Vente</span>
            <span className="text-xs text-gray-400 text-center">Mise en vente définitive</span>
          </button>
          <button
            type="button"
            onClick={() => setListingType('rent')}
            className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all
              ${listingType === 'rent' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-gray-300'}
            `}
          >
            <MapPin className={`w-8 h-8 ${listingType === 'rent' ? 'text-amber-500' : 'text-gray-400'}`} />
            <span className={`font-semibold text-base ${listingType === 'rent' ? 'text-amber-700' : 'text-gray-700'}`}>Location</span>
            <span className="text-xs text-gray-400 text-center">Mise en location mensuelle</span>
          </button>
        </div>
      </div>

      {/* Property type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Type de bien</label>
        <div className="grid grid-cols-3 gap-3">
          {PROPERTY_TYPES.map((pt: { value: string; label: string }) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => setPropertyType(pt.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                ${propertyType === pt.value ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <span className={propertyType === pt.value ? 'text-amber-500' : 'text-gray-400'}>
                {PROPERTY_TYPE_ICONS[pt.value] ?? <Building2 className="w-6 h-6" />}
              </span>
              <span className={`text-sm font-medium ${propertyType === pt.value ? 'text-amber-700' : 'text-gray-600'}`}>
                {pt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Titre de l'annonce
        </label>
        <input
          type="text"
          value={title}
          maxLength={100}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ex: Appartement moderne au centre-ville de Dakar"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Prix</label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent">
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0"
            min="0"
            className="flex-1 px-4 py-3 text-gray-800 focus:outline-none"
          />
          <span className="px-4 py-3 bg-gray-100 text-gray-500 font-medium text-sm border-l border-gray-300">
            FCFA
          </span>
        </div>
        {Number(price) > 0 && (
          <p className="text-sm text-amber-600 font-medium mt-1">
            {formatPrice(Number(price), listingType)}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!validateStep1()}
          onClick={() => setStep(2)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Continuer <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Step 2
  const Step2 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations détaillées</h2>

      {/* 4-column metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Surface (m²)
          </label>
          <input
            type="number"
            value={surface}
            onChange={e => setSurface(e.target.value)}
            min="0"
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pièces</label>
          <input
            type="number"
            value={rooms}
            onChange={e => setRooms(e.target.value)}
            min="0"
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Chambres</label>
          <input
            type="number"
            value={bedrooms}
            onChange={e => setBedrooms(e.target.value)}
            min="0"
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Salles de bain</label>
          <input
            type="number"
            value={bathrooms}
            onChange={e => setBathrooms(e.target.value)}
            min="0"
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* City */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
        <select
          value={city}
          onChange={e => { setCity(e.target.value); setNeighborhood(''); }}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        >
          <option value="">Sélectionner une ville</option>
          {CITIES.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Neighborhood (only for Dakar) */}
      {city === 'Dakar' && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Quartier</label>
          <select
            value={neighborhood}
            onChange={e => setNeighborhood(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          >
            <option value="">Sélectionner un quartier</option>
            {NEIGHBORHOODS_DAKAR.map((n: string) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      {/* Address */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Ex: 12 Rue Carnot, Plateau"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="Décrivez votre bien en détail..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/2000</p>
      </div>

      {/* Features */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Équipements & caractéristiques</label>
        <div className="flex flex-wrap gap-2">
          {FEATURES_LIST.map((feature: string) => (
            <button
              key={feature}
              type="button"
              onClick={() => toggleFeature(feature)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border
                ${selectedFeatures.includes(feature)
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'}
              `}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Retour
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Continuer <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Step 3
  const Step3 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos de votre bien</h2>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-16 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors mb-6"
        >
          <Upload className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium mb-1">Cliquez ou glissez vos photos ici</p>
          <p className="text-sm text-gray-400">PNG, JPG jusqu'à 10 Mo</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img
                src={img.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-amber-500 bg-opacity-90 text-white text-xs font-medium text-center py-1">
                  Photo principale
                </div>
              )}
            </div>
          ))}

          {/* Add more / uploading card */}
          {images.length < 10 && (
            <div
              onClick={() => uploadingIndex === null && fileInputRef.current?.click()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              onDragOver={e => e.preventDefault()}
              className={`aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors ${uploadingIndex !== null ? 'opacity-60 cursor-wait' : ''}`}
            >
              {uploadingIndex !== null ? (
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              ) : (
                <>
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Ajouter</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Retour
        </button>
        <button
          type="button"
          onClick={() => setStep(4)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Continuer <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const propertyTypeLabel = PROPERTY_TYPES.find((pt: { value: string; label: string }) => pt.value === propertyType)?.label ?? propertyType;

  // Step 4
  const Step4 = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Récapitulatif de votre annonce</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Preview + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="h-52 bg-gray-100 overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[0].url}
                  alt="Photo principale"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{title || '—'}</h3>
              <p className="text-gray-500 text-sm mb-2">
                {[neighborhood, city].filter(Boolean).join(', ') || '—'}
              </p>
              <p className="text-amber-600 font-bold text-xl">
                {Number(price) > 0 ? formatPrice(Number(price), listingType) : '—'}
              </p>
            </div>
          </div>

          {/* Summary table */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-4">Détails de l'annonce</h4>
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Type de bien</dt>
                <dd className="font-medium text-gray-800">{propertyTypeLabel || '—'}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Type de transaction</dt>
                <dd className="font-medium text-gray-800">{listingType === 'sale' ? 'Vente' : 'Location'}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Surface</dt>
                <dd className="font-medium text-gray-800">{surface ? `${surface} m²` : '—'}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Pièces</dt>
                <dd className="font-medium text-gray-800">{rooms || '—'}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Chambres</dt>
                <dd className="font-medium text-gray-800">{bedrooms || '—'}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Salles de bain</dt>
                <dd className="font-medium text-gray-800">{bathrooms || '—'}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Adresse</dt>
                <dd className="font-medium text-gray-800 text-right max-w-xs">{address || '—'}</dd>
              </div>
              {selectedFeatures.length > 0 && (
                <div className="text-sm">
                  <dt className="text-gray-500 mb-2">Équipements</dt>
                  <dd className="flex flex-wrap gap-1">
                    {selectedFeatures.map(f => (
                      <span key={f} className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {f}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Info box */}
          <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              En publiant cette annonce, vous acceptez nos Conditions Générales d'Utilisation.
            </p>
          </div>
        </div>

        {/* Right: Summary card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-6">
            <h4 className="font-bold text-gray-800 mb-4">Récapitulatif</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-500">Transaction</span>
                <span className="font-medium text-gray-800">{listingType === 'sale' ? 'Vente' : 'Location'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-800">{propertyTypeLabel || '—'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Prix</span>
                <span className="font-medium text-amber-600">{Number(price) > 0 ? formatPrice(Number(price), listingType) : '—'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Ville</span>
                <span className="font-medium text-gray-800">{city || '—'}</span>
              </li>
              {neighborhood && (
                <li className="flex justify-between">
                  <span className="text-gray-500">Quartier</span>
                  <span className="font-medium text-gray-800">{neighborhood}</span>
                </li>
              )}
              <li className="flex justify-between">
                <span className="text-gray-500">Surface</span>
                <span className="font-medium text-gray-800">{surface ? `${surface} m²` : '—'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Photos</span>
                <span className="font-medium text-gray-800">{images.length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Statut</span>
                <span className="font-medium text-yellow-600">En attente</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Modifier
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Publication…
            </>
          ) : (
            <>
              Publier l'annonce <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Publier une annonce</h1>
          <p className="text-gray-500 mt-1">Remplissez les informations pour mettre en ligne votre bien immobilier.</p>
        </div>

        <ProgressBar />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
        </div>
      </div>
    </div>
  );
}
