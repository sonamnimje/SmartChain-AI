import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

// Mock geocode for a few cities
const cityCoords = {
  'Mumbai': { lat: 19.076, lng: 72.8777 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Delhi': { lat: 28.6139, lng: 77.209 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
};

function fitMapToMarkers(map, markers) {
  if (!map || markers.length === 0) return;
  const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
  map.fitBounds(bounds, { padding: [40, 40] });
}

const WarehouseMap = ({ warehouses, statusMap }) => {
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const ms = warehouses.map(w => {
      let lat = w.latitude, lng = w.longitude;
      if (lat == null || lng == null) {
        const city = w.location && cityCoords[w.location];
        if (city) { lat = city.lat; lng = city.lng; }
      }
      if (lat != null && lng != null) {
        return { ...w, lat, lng };
      }
      return null;
    }).filter(Boolean);
    setMarkers(ms);
  }, [warehouses]);

  useEffect(() => {
    if (map && markers.length > 0) fitMapToMarkers(map, markers);
  }, [map, markers]);

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: 400, width: '100%' }} whenCreated={setMap}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers.map(w => (
        <Marker key={w.id} position={[w.lat, w.lng]}>
          <Popup>
            <strong>{w.name}</strong><br />
            {statusMap[w.id]?.status ? (
              <>
                Status: <b style={{ color: statusMap[w.id].online ? 'green' : 'red' }}>{statusMap[w.id].status}</b><br />
                Stock: {w.items_stored} / {w.stock_capacity}<br />
                Last Sync: {statusMap[w.id].last_sync ? new Date(statusMap[w.id].last_sync).toLocaleString() : 'N/A'}
              </>
            ) : (
              <>No live data</>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default WarehouseMap; 