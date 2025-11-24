import React from 'react';

// Lightweight Map view using OpenStreetMap embed iframe.
// Props:
// - center: { lat, lng }
// - zoom: number
// - bboxPadding: degree padding to create a bbox around center (optional)
// This avoids adding heavy map deps during initial work. For production, replace with react-leaflet or Mapbox GL.
const MapView = ({ center = { lat: 12.9716, lng: 77.5946 }, zoom = 13 }) => {
  const lat = center.lat;
  const lng = center.lng;
  // OpenStreetMap embed with a small bbox around center so it centers correctly
  const delta = 0.03;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="w-full h-full rounded-md overflow-hidden">
      <iframe
        title="map"
        src={src}
        className="w-full h-96 border-0"
        style={{ minHeight: 260 }}
      />
      <div className="text-xs text-gray-500 mt-1">Map provided by OpenStreetMap</div>
    </div>
  );
};

export default MapView;
