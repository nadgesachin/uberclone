import React, { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* -------------------------------------------
| Fix Leaflet Marker Icons
------------------------------------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* -------------------------------------
| Custom Icons
------------------------------------- */
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/1946/1946429.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const customerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

/* -------------------------------------
| Auto center map
------------------------------------- */
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.flyTo([center.lat, center.lng], 15);
    }
  }, [center]);
  return null;
}

export default function LeafletMap({
  center,
  zoom = 14,
  pickup,
  dropoff,
  drivers = [],
  onRouteReady = () => { },
}) {
  const centerPos = useMemo(() => [center.lat, center.lng], [center]);

  /* -------------------------------------
  | Routing Machine with ORS API (custom)
  ------------------------------------- */
  function RoutingMachine({ from, to }) {
    const map = useMap();

    useEffect(() => {
      if (!from || !to) return;

      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(from.lat, from.lng),
          L.latLng(to.lat, to.lng),
        ],
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: "#007bff", weight: 5 }],
        },
      }).addTo(map);

      return () => {
        map.removeControl(routingControl);
      };
    }, [from, to]);

    return null;
  }

  /* -------------------------------------
  | Render Map
  ------------------------------------- */
  return (
    <div className="w-full h-full rounded overflow-hidden">
      <MapContainer center={centerPos} zoom={zoom} className="w-full h-full">
        <RecenterMap center={center} />

        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw Route */}
        {pickup && dropoff && <RoutingMachine from={pickup} to={dropoff} />}

        {/* Pickup Marker */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={customerIcon}>
            <Popup>Pickup</Popup>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={customerIcon}>
            <Popup>Dropoff</Popup>
          </Marker>
        )}

        {/* Drivers */}
        {drivers.map((d, index) => {
          const lat = d.lat ?? d.currentLocation?.lat;
          const lng = d.lng ?? d.currentLocation?.lng;

          if (!lat || !lng) return null;

          return (
            <Marker
              key={index}
              position={[lat, lng]}
              icon={driverIcon}
            >
              <Popup>Driver {d.driverId || index}</Popup>
            </Marker>
          );
        })}

      </MapContainer>

      <div className="text-center text-xs mt-1 text-gray-500">
        Map powered by OpenStreetMap
      </div>
    </div>
  );
}
