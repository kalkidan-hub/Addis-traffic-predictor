import { CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from "react-leaflet";

const MAP_CENTER = [9.03, 38.74];

function MapClickHandler({ onSelectLocation }) {
  useMapEvents({
    click: (event) => {
      onSelectLocation({
        position: [event.latlng.lat, event.latlng.lng],
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });
  return null;
}

function statusColor(index) {
  if (index < 0.3) return "#42d9d0";
  if (index < 0.7) return "#f6b84b";
  return "#ff6b73";
}

export default function MapView({ segments, predictions, selectedId, onSelect, onSelectLocation, selectedLocation }) {
  return (
    <div className="map-shell">
      <MapContainer center={MAP_CENTER} zoom={13} scrollWheelZoom className="h-full w-full">
        <MapClickHandler onSelectLocation={onSelectLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {segments.map((segment) => {
          const prediction = predictions[segment.id];
          const color = statusColor(prediction?.congestion_index ?? 0.15);
          const selected = segment.id === selectedId;
          return (
            <CircleMarker
              key={segment.id}
              center={segment.position}
              radius={selected ? 12 : 9}
              pathOptions={{
                color: selected ? "#ffffff" : color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: selected ? 3 : 2,
              }}
              eventHandlers={{ click: () => onSelect(segment.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]}>{segment.name}</Tooltip>
            </CircleMarker>
          );
        })}
        {selectedLocation && (
          <CircleMarker
            center={selectedLocation.position}
            radius={13}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#42d9d0",
              fillOpacity: 0.95,
              weight: 3,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} permanent>
              Selected location
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
      <div className="map-legend">
        <span><i className="legend-dot smooth" /> Smooth</span>
        <span><i className="legend-dot moderate" /> Moderate</span>
        <span><i className="legend-dot heavy" /> Heavy</span>
      </div>
      <div className="map-label">ADDIS ABABA / LIVE MODEL VIEW</div>
    </div>
  );
}
