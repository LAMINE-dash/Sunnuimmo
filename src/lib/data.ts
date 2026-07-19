import { Property } from './supabase';

export const CITIES = [
  'Dakar','Thiès','Saint-Louis','Ziguinchor','Kaolack',
  'Mbour','Touba','Diourbel','Louga','Tambacounda',
];

export const NEIGHBORHOODS_DAKAR = [
  'Plateau','Almadies','Ngor','Yoff','Ouakam','Fann',
  'Point E','Mermoz','Sacré-Coeur','Liberté',
  'Parcelles Assainies','Guédiawaye','Pikine','Rufisque','Sébikotane',
];

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Terrain' },
  { value: 'commercial', label: 'Commerce' },
  { value: 'office', label: 'Bureau' },
];

export const FEATURES_LIST = [
  'Piscine','Garage','Jardin','Terrasse','Ascenseur','Climatisation',
  'Groupe électrogène','Gardien','Vue mer','Eau chaude','Fibre optique',
  'Cuisine équipée','Parquet','Digicode','Interphone',
];

export const formatPrice = (price: number, listingType: 'sale' | 'rent'): string => {
  const s = listingType === 'rent' ? '/mois' : '';
  if (price >= 1_000_000_000) return `${(price/1_000_000_000).toFixed(2).replace(/\.?0+$/,'')} Mrd FCFA${s}`;
  if (price >= 1_000_000) return `${(price/1_000_000).toFixed(0)} M FCFA${s}`;
  return `${price.toLocaleString('fr-FR')} FCFA${s}`;
};

export const TYPE_LABELS: Record<string,string> = {
  apartment:'Appartement', house:'Maison', villa:'Villa',
  land:'Terrain', commercial:'Commerce', office:'Bureau',
};

/**
 * Calcule une estimation basée sur le prix/m² des biens comparables.
 * `samples` doit contenir les biens comparables (hors target).
 * Retourne null si pas assez de comparables ou surface invalide.
 */
export function estimatePriceFromComparables(
  target: Pick<Property, 'type' | 'listing_type' | 'surface'>,
  samples: Property[]
): { base: number; min: number; max: number; confidence: number; samples: number; avgPricePerSqm: number } | null {
  if (!target.surface || target.surface <= 0) return null;
  if (samples.length === 0) return null;

  const pricesPerSqm = samples
    .filter((p) => p.surface && p.surface > 0)
    .map((p) => p.price / (p.surface as number));

  if (pricesPerSqm.length === 0) return null;

  const avg = pricesPerSqm.reduce((a, b) => a + b, 0) / pricesPerSqm.length;
  const variance =
    pricesPerSqm.reduce((acc, v) => acc + (v - avg) ** 2, 0) / pricesPerSqm.length;
  const stdDev = Math.sqrt(variance);

  const base = avg * target.surface;

  const spread = Math.min(stdDev * target.surface, base * 0.15);
  const min = Math.max(0, base - spread);
  const max = base + spread;

  const dispersionRatio = avg > 0 ? stdDev / avg : 1;
  const samplesScore = Math.min(pricesPerSqm.length / 8, 1);
  const dispersionScore = Math.max(0, 1 - dispersionRatio);
  const confidence = Math.round(
    Math.max(45, Math.min(95, 50 + samplesScore * 30 + dispersionScore * 20))
  );

  return { base, min, max, confidence, samples: pricesPerSqm.length, avgPricePerSqm: avg };
}

export const SUBSCRIPTION_PLANS = [
  {
    id:'free', name:'Gratuit', price:0, period:'mois',
    description:'Pour commencer à explorer',
    features:['3 annonces actives','5 photos par annonce','Messagerie limitée','Accès aux annonces','Support email'],
    limits:["Pas d'annonces premium","Pas de statistiques","Pas de vérification prioritaire"],
    popular:false,
  },
  {
    id:'starter', name:'Starter', price:15_000, period:'mois',
    description:'Pour les particuliers actifs',
    features:['10 annonces actives','15 photos par annonce','Messagerie illimitée','1 annonce mise en avant','Statistiques de base','Badge vérifié','Support prioritaire'],
    limits:["Pas d'accès API","Pas d'espace agence"],
    popular:false,
  },
  {
    id:'pro', name:'Pro', price:45_000, period:'mois',
    description:'Pour les agences et promoteurs',
    features:['Annonces illimitées','30 photos par annonce','Annonces premium illimitées','Espace agence dédié','Statistiques avancées','Assistant IA inclus','Estimation automatique','Badge agence vérifié','Support dédié'],
    limits:[],
    popular:true,
  },
  {
    id:'enterprise', name:'Enterprise', price:150_000, period:'mois',
    description:'Pour les grandes structures',
    features:['Tout le plan Pro','Accès API complet','Multi-utilisateurs','Tableau de bord analytique','Intégration notaire/banque','Détection fraude IA','Manager de compte dédié','SLA 99.9%'],
    limits:[],
    popular:false,
  },
];
