import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '../lib/supabase';
import { formatPrice, TYPE_LABELS } from '../lib/data';

// Fix broken default icons in Vite/webpack builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const makePinIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      background:${color};color:white;padding:4px 9px;border-radius:20px;
      font-size:11px;font-weight:700;white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,.25);border:2px solid white;
      cursor:pointer;line-height:1.4;
    ">${''}</div>`,
    iconAnchor: [0, 0],
  });

function PriceMarker({ property, color, onClick }: { property: Property; color: string; onClick: () => void }) {
  const icon = L.divIcon({
    className: '',
    html: `<div style="
      background:${color};color:white;padding:4px 10px;border-radius:20px;
      font-size:11px;font-weight:700;white-space:nowrap;
      box-shadow:0 2px 10px rgba(0,0,0,.3);border:2.5px solid white;
      cursor:pointer;line-height:1.5;
    ">${formatPrice(property.price, property.listing_type)}</div>`,
    iconAnchor: [0, 0],
  });

  return (
    <Marker
      position={[property.latitude!, property.longitude!]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Popup className="ti-popup" closeButton maxWidth={220}>
        <div className="w-52">
          {property.images[0] && (
            <img src={property.images[0]} alt={property.title}
              className="w-full h-28 object-cover" />
          )}
          <div className="p-3">
            <p className="font-bold text-gray-900 text-sm leading-snug">{property.title}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              📍 {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {TYPE_LABELS[property.type]}
              </span>
              <span className="text-sm font-bold" style={{ color }}>
                {formatPrice(property.price, property.listing_type)}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center]);
  return null;
}

interface MapViewProps {
  properties: Property[];
  onPropertyClick: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

export default function MapView({ properties, onPropertyClick, center = [14.6937, -17.4441], zoom = 12 }: MapViewProps) {
  const withCoords = properties.filter(p => p.latitude != null && p.longitude != null);

  const pinColor = (p: Property) => {
    if (p.listing_type === 'rent') return '#10b981';
    return p.is_premium ? '#f59e0b' : '#3b82f6';
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
          maxZoom={19}
        />
        <RecenterMap center={center} />
        {withCoords.map(p => (
          <PriceMarker
            key={p.id}
            property={p}
            color={pinColor(p)}
            onClick={() => onPropertyClick(p.id)}
          />
        ))}
      </MapContainer>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-gray-100 text-xs flex gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 border border-white shadow-sm" />
          <span className="text-gray-600">Vente premium</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm" />
          <span className="text-gray-600">Vente</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm" />
          <span className="text-gray-600">Location</span>
        </span>
      </div>

      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md overflow-hidden flex flex-col">
        <button onClick={() => {}} className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-lg font-bold leading-none">+</button>
        <div className="border-t border-gray-100" />
        <button onClick={() => {}} className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-lg font-bold leading-none">−</button>
      </div>

      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md px-3 py-2">
        <p className="text-xs font-semibold text-gray-700">{withCoords.length} bien{withCoords.length > 1 ? 's' : ''} sur la carte</p>
      </div>
    </div>
  );
}
