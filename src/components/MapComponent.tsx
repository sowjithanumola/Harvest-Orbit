import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

export function MapComponent({ lat, lng }: { lat: number, lng: number }) {
    return (
        <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng]}>
                <Popup>Selected Field</Popup>
            </Marker>
            <MapUpdater center={[lat, lng]} />
        </MapContainer>
    );
}
