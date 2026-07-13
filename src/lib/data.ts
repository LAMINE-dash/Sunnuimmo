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

export const MOCK_PROPERTIES: Property[] = [
  {
    id:'1', user_id:'u1',
    title:'Villa moderne avec piscine — Almadies',
    description:'Magnifique villa moderne avec piscine et vue mer aux Almadies. Finitions haut de gamme, jardin paysager, garage double. Idéal famille ou investissement.',
    type:'villa', listing_type:'sale', price:450_000_000,
    surface:350, rooms:7, bedrooms:4, bathrooms:3,
    address:'Route des Almadies, Villa 12', city:'Dakar', neighborhood:'Almadies',
    latitude:14.7478, longitude:-17.5138,
    images:[
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
      'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg',
    ],
    features:['Piscine','Garage','Jardin','Terrasse','Climatisation','Groupe électrogène','Gardien'],
    status:'active', is_premium:true, is_verified:true, views:342, created_at:'2024-01-15T10:00:00Z',
  },
  {
    id:'2', user_id:'u2',
    title:'Appartement F3 lumineux — Point E',
    description:'Bel appartement F3 lumineux au 3ème étage avec balcon, dans une résidence sécurisée au cœur de Point E.',
    type:'apartment', listing_type:'sale', price:95_000_000,
    surface:110, rooms:3, bedrooms:2, bathrooms:2,
    address:'Rue Carnot, Immeuble Le Soleil', city:'Dakar', neighborhood:'Point E',
    latitude:14.6928, longitude:-17.4467,
    images:[
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1648771/pexels-photo-1648771.jpeg',
    ],
    features:['Balcon','Ascenseur','Gardien','Parking','Climatisation'],
    status:'active', is_premium:true, is_verified:true, views:218, created_at:'2024-01-20T10:00:00Z',
  },
  {
    id:'3', user_id:'u3',
    title:'Maison 4 chambres — Sacré-Coeur',
    description:'Belle maison de 4 chambres avec cour intérieure dans le quartier calme de Sacré-Coeur. Proche écoles et commerces.',
    type:'house', listing_type:'rent', price:750_000,
    surface:220, rooms:6, bedrooms:4, bathrooms:2,
    address:'Villa 45, Sacré-Coeur 3', city:'Dakar', neighborhood:'Sacré-Coeur',
    latitude:14.7147, longitude:-17.4590,
    images:[
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
      'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
    ],
    features:['Cour intérieure','Cuisine équipée','Climatisation','Groupe électrogène','Parking'],
    status:'active', is_premium:false, is_verified:true, views:156, created_at:'2024-02-01T10:00:00Z',
  },
  {
    id:'4', user_id:'u4',
    title:'Terrain viabilisé — Sébikotane',
    description:'Grand terrain résidentiel viabilisé avec titre foncier, idéal construction villa. Accès autoroute, cadre verdoyant.',
    type:'land', listing_type:'sale', price:18_000_000,
    surface:600, rooms:null, bedrooms:null, bathrooms:null,
    address:'Lotissement Horizon Vert', city:'Sébikotane', neighborhood:null,
    latitude:14.7270, longitude:-17.1440,
    images:['https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg'],
    features:['Titre foncier','Viabilisé','Clôturé','Eau & Électricité'],
    status:'active', is_premium:false, is_verified:true, views:89, created_at:'2024-02-10T10:00:00Z',
  },
  {
    id:'5', user_id:'u5',
    title:'Studio meublé — Mermoz',
    description:'Studio moderne entièrement meublé et équipé à Mermoz. Idéal étudiant ou jeune professionnel.',
    type:'apartment', listing_type:'rent', price:250_000,
    surface:35, rooms:1, bedrooms:1, bathrooms:1,
    address:'Rue 10, Mermoz', city:'Dakar', neighborhood:'Mermoz',
    latitude:14.7205, longitude:-17.4748,
    images:['https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg'],
    features:['Meublé','Wifi','Climatisation','Eau chaude'],
    status:'active', is_premium:false, is_verified:false, views:67, created_at:'2024-02-15T10:00:00Z',
  },
  {
    id:'6', user_id:'u6',
    title:'Bureau standing — Plateau',
    description:'Espace de bureaux moderne immeuble classe A au Plateau, salle de réunion et réception.',
    type:'office', listing_type:'rent', price:1_800_000,
    surface:180, rooms:6, bedrooms:null, bathrooms:2,
    address:'Avenue Léopold Sédar Senghor', city:'Dakar', neighborhood:'Plateau',
    latitude:14.6882, longitude:-17.4396,
    images:[
      'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg',
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    ],
    features:['Climatisation centrale','Ascenseur','Salle de réunion','Réception','Parking','Fibre optique'],
    status:'active', is_premium:true, is_verified:true, views:204, created_at:'2024-02-18T10:00:00Z',
  },
  {
    id:'7', user_id:'u7',
    title:'Villa panoramique — Ngor',
    description:'Splendide villa avec vue océan sur la presqu\'île du Cap-Vert. Piscine à débordement, architecture contemporaine.',
    type:'villa', listing_type:'sale', price:750_000_000,
    surface:500, rooms:9, bedrooms:5, bathrooms:4,
    address:'Route de Ngor, Villa Les Palmiers', city:'Dakar', neighborhood:'Ngor',
    latitude:14.7550, longitude:-17.5270,
    images:[
      'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg',
      'https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg',
    ],
    features:['Piscine','Garage','Jardin','Vue mer','Climatisation','Groupe électrogène','Gardien','Terrasse'],
    status:'active', is_premium:true, is_verified:true, views:512, created_at:'2024-01-05T10:00:00Z',
  },
  {
    id:'8', user_id:'u8',
    title:'Appartement neuf F4 — Liberté 6',
    description:'Appartement neuf résidence haut standing avec piscine commune, salle de sport et parking souterrain.',
    type:'apartment', listing_type:'sale', price:120_000_000,
    surface:140, rooms:4, bedrooms:3, bathrooms:2,
    address:'Résidence Les Jardins, Liberté 6', city:'Dakar', neighborhood:'Liberté',
    latitude:14.7050, longitude:-17.4650,
    images:['https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg'],
    features:['Piscine','Ascenseur','Parking','Salle de sport','Climatisation','Gardien'],
    status:'active', is_premium:true, is_verified:true, views:289, created_at:'2024-01-28T10:00:00Z',
  },
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
