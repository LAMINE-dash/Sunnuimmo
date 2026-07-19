import { useState, useEffect, useCallback } from 'react';
import {
  Heart, Loader2, ArrowLeft, Trash2, Search,
} from 'lucide-react';
import { supabase, Property } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PropertyCard from '../components/PropertyCard';

interface FavoritesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

interface FavoriteWithProperty {
  property_id: string;
  created_at: string;
  properties: Property;
}

export default function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id, created_at, properties!inner(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites((data as unknown as FavoriteWithProperty[]) ?? []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (propertyId: string) => {
    if (!user) return;
    setRemovingId(propertyId);
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
      if (error) throw error;
      setFavorites((prev) => prev.filter((f) => f.property_id !== propertyId));
    } catch {
      // Silently fail; keep the favorite in the list
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6 text-lg">Connectez-vous pour voir vos favoris</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center">
                <Heart className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {favorites.length} bien{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Chargement de vos favoris...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-5">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun favori</h2>
            <p className="text-gray-500 max-w-md mb-6">
              Parcourez les annonces et cliquez sur le cœur pour les sauvegarder
            </p>
            <button
              onClick={() => onNavigate('listings')}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              Parcourir les annonces
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <div key={fav.property_id} className="relative group">
                  <PropertyCard
                    property={fav.properties}
                    onView={(id) => onNavigate('property', { id })}
                  />
                  <button
                    onClick={() => handleRemove(fav.property_id)}
                    disabled={removingId === fav.property_id}
                    title="Retirer des favoris"
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                  >
                    {removingId === fav.property_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
