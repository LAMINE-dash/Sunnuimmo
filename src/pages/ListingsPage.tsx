import { useState, useEffect, lazy, Suspense } from 'react';
import { Search, MapPin, SlidersHorizontal, Grid3x3, List, X, ChevronDown, Filter, Map, Loader2 } from 'lucide-react';
import { supabase, Property } from '../lib/supabase';
import { CITIES, PROPERTY_TYPES } from '../lib/data';
import PropertyCard from '../components/PropertyCard';

const MapView = lazy(() => import('../components/MapView'));

interface ListingsPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialFilters?: Record<string, string>;
}

export default function ListingsPage({ onNavigate, initialFilters }: ListingsPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'list' | 'map'>(
    (initialFilters?.layout as 'grid' | 'list' | 'map') ?? 'grid'
  );
  const initialActiveType = initialFilters?.listing_type ?? initialFilters?.type ?? initialFilters?.activeType ?? 'all';
  const [activeType, setActiveType] = useState(initialActiveType);
  const [cityFilter, setCityFilter] = useState(initialFilters?.city ?? '');
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice ?? '');
  const [minSurface, setMinSurface] = useState(initialFilters?.minSurface ?? '');
  const [bedrooms, setBedrooms] = useState(initialFilters?.bedrooms ?? '');
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy ?? 'recent');

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active');

        if (searchQuery.trim()) {
          query = query.or(
            `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,neighborhood.ilike.%${searchQuery}%`
          );
        }
        if (activeType === 'sale' || activeType === 'rent') {
          query = query.eq('listing_type', activeType);
        } else if (activeType !== 'all') {
          query = query.eq('type', activeType);
        }
        if (cityFilter) query = query.eq('city', cityFilter);
        if (minPrice) query = query.gte('price', Number(minPrice));
        if (maxPrice) query = query.lte('price', Number(maxPrice));
        if (minSurface) query = query.gte('surface', Number(minSurface));
        if (bedrooms) {
          const n = Number(bedrooms.replace('+', ''));
          if (bedrooms.includes('+')) {
            query = query.gte('bedrooms', n);
          } else {
            query = query.eq('bedrooms', n);
          }
        }

        const sortMap: Record<string, string> = {
          recent: 'created_at',
          price_asc: 'price',
          price_desc: 'price',
          surface_desc: 'surface',
        };
        const ascending = sortBy !== 'price_desc' && sortBy !== 'surface_desc';
        query = query.order(sortMap[sortBy] ?? 'created_at', { ascending });

        const { data, error } = await query.limit(60);
        if (error) throw error;
        setProperties((data as unknown as Property[]) ?? []);
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [searchQuery, activeType, cityFilter, minPrice, maxPrice, minSurface, bedrooms, sortBy]);

  function resetFilters() {
    setSearchQuery('');
    setActiveType('all');
    setCityFilter('');
    setMinPrice('');
    setMaxPrice('');
    setMinSurface('');
    setBedrooms('');
    setSortBy('recent');
  }

  const quickTypes = [
    { value: 'all', label: 'Tout' },
    { value: 'sale', label: 'Vente' },
    { value: 'rent', label: 'Location' },
    ...PROPERTY_TYPES,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top search bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un bien, une ville, un quartier..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showFilters
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
            </button>

            {/* Layout toggles */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setLayout('grid')}
                title="Grille"
                className={`p-2 transition-colors ${
                  layout === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                title="Liste"
                className={`p-2 border-l border-gray-300 transition-colors ${
                  layout === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('map')}
                title="Carte"
                className={`p-2 border-l border-gray-300 transition-colors ${
                  layout === 'map' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick filter pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {quickTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setActiveType(type.value)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeType === type.value
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* City */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ville</label>
                  <div className="relative">
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="w-full appearance-none pl-3 pr-7 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Toutes</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Min price */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prix min (FCFA)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Max price */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prix max (FCFA)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Sans limite"
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Min surface */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Surface min (m²)</label>
                  <input
                    type="number"
                    value={minSurface}
                    onChange={(e) => setMinSurface(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Chambres</label>
                  <div className="relative">
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full appearance-none pl-3 pr-7 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Toutes</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Sort by */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Trier par</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full appearance-none pl-3 pr-7 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="recent">Plus récent</option>
                      <option value="price_asc">Prix croissant</option>
                      <option value="price_desc">Prix décroissant</option>
                      <option value="surface_desc">Surface décroissante</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          {loading ? (
            <span className="text-gray-400">Chargement...</span>
          ) : (
            <>
              <span className="font-semibold text-gray-900">{properties.length}</span>{' '}
              {properties.length === 1 ? 'bien trouvé' : 'biens trouvés'}
            </>
          )}
        </p>

        {/* Map layout */}
        {layout === 'map' && (
          <Suspense
            fallback={
              <div
                className="flex items-center justify-center bg-gray-100 rounded-xl text-gray-500 text-sm"
                style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}
              >
                Chargement de la carte...
              </div>
            }
          >
            <div style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
              <MapView
                properties={properties}
                onPropertyClick={(id) => onNavigate('property', { id })}
              />
            </div>
          </Suspense>
        )}

        {/* Grid / List layout */}
        {layout !== 'map' && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                <p className="text-sm text-gray-500">Chargement des annonces...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <X className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">Aucun bien trouvé</p>
                <p className="text-gray-400 text-sm mb-6">
                  Essayez d'élargir vos critères de recherche, ou soyez le premier à publier une annonce.
                </p>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Réinitialiser les filtres
                </button>
              </div>
            ) : layout === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onView={() => onNavigate('property', { id: property.id })}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onView={() => onNavigate('property', { id: property.id })}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
