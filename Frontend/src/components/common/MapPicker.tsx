import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

// Fix Leaflet Textures
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
}


export const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange }) => {
    // Default to Bolivia/La Paz if 0
    const centerLat = lat || -16.500;
    const centerLng = lng || -68.150;

    const [position, setPosition] = useState({ lat: centerLat, lng: centerLng });

    useEffect(() => {
        if (lat && lng) {
            setPosition({ lat, lng });
        }
    }, [lat, lng]);

    const handleLocate = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                onChange(pos.coords.latitude, pos.coords.longitude);
            }, (err) => {
                console.error(err);
                alert("No pudimos obtener tu ubicación.");
            });
        } else {
            alert("Geolocalización no soportada por este navegador.");
        }
    }

    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative z-0">
            <MapContainer center={[centerLat, centerLng]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[position.lat, position.lng]} />
                <MapEvents onChange={onChange} />
                {/* Custom Controls handled outside or via standard Leaflet controls */}
            </MapContainer>

            <button
                type="button"
                onClick={handleLocate}
                className="absolute bottom-4 right-4 z-[400] bg-white p-3 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 text-slate-700 transition-transform active:scale-95"
            >
                <Navigation size={20} />
            </button>

            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 shadow-sm border border-slate-100 pointer-events-none">
                Toca en el mapa para ajustar
            </div>
        </div>
    );
};

// Helper component to handle map clicks
function MapEvents({ onChange }: { onChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}
