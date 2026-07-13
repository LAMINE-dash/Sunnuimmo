import { MapPin, Bed, Bath, Square, Eye, Star, Shield, TrendingUp } from 'lucide-react';
import { Property } from '../lib/supabase';
import { formatPrice, TYPE_LABELS } from '../lib/data';

interface PropertyCardProps {
  property: Property;
  onView: (id: string) => void;
  layout?: 'grid' | 'list';
}

export default function PropertyCard({ property, onView, layout = 'grid' }: PropertyCardProps) {
  const Meta = () => (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <Square className="w-3.5 h-3.5 text-gray-400" />{property.surface} m²
      </span>
      {property.bedrooms && (
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Bed className="w-3.5 h-3.5 text-gray-400" />{property.bedrooms} ch.
        </span>
      )}
      {property.bathrooms && (
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Bath className="w-3.5 h-3.5 text-gray-400" />{property.bathrooms} sdb.
        </span>
      )}
      <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
        <Eye className="w-3.5 h-3.5" />{property.views}
      </span>
    </div>
  );

  if (layout === 'list') {
    return (
      <div onClick={() => onView(property.id)}
        className="bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer flex overflow-hidden group">
        <div className="relative w-52 shrink-0 overflow-hidden">
          <img src={property.images[0]} alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {property.is_premium && (
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" /> Premium
            </span>
          )}
        </div>
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {TYPE_LABELS[property.type]}
              </span>
              <h3 className="font-semibold text-gray-900 mt-2 text-base">{property.title}</h3>
              <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
                {formatPrice(property.price, property.listing_type)}
              </p>
              {property.listing_type === 'sale' && property.surface > 0 && (
                <p className="text-xs text-gray-400">{Math.round(property.price/property.surface).toLocaleString('fr-FR')} /m²</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3 line-clamp-2">{property.description}</p>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <Meta />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onView(property.id)}
      className="bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
      <div className="relative h-52 overflow-hidden">
        <img src={property.images[0]} alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {property.is_premium && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" /> Premium
          </span>
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full ${
          property.listing_type === 'sale' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {property.listing_type === 'sale' ? 'Vente' : 'Location'}
        </span>
        {property.is_verified && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-emerald-500/80 backdrop-blur-sm text-white text-xs rounded-full">
            <Shield className="w-3 h-3" /> Vérifié
          </span>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          {TYPE_LABELS[property.type]}
        </span>
        <h3 className="font-semibold text-gray-900 mt-2 text-sm line-clamp-1">{property.title}</h3>
        <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <MapPin className="w-3 h-3 text-amber-500" />
          {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
        </p>
        <div className="mt-3 py-3 border-y border-gray-50">
          <Meta />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-base font-bold text-gray-900">{formatPrice(property.price, property.listing_type)}</p>
            {property.listing_type === 'sale' && property.surface > 0 && (
              <p className="text-xs text-gray-400">{Math.round(property.price/property.surface).toLocaleString('fr-FR')} FCFA/m²</p>
            )}
          </div>
          {property.is_premium && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <TrendingUp className="w-3.5 h-3.5" /> Vedette
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
