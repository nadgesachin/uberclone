import React, { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

// ⭐ FIX FOR LEAFLET (markers not showing in Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// -------------------- CUSTOM ICONS --------------------
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/743/743988.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const pickupIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const dropoffIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// -------------------- RECENTER MAP --------------------
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.flyTo([center.lat, center.lng], 15);
    }
  }, [center]);
  return null;
}

// -------------------- MAIN COMPONENT --------------------
export default function LeafletMap({
  center,
  zoom = 14,
  myLocation,
  pickup,
  dropoff,
  drivers = [],
  onRouteReady = () => {},
}) {
  const centerPos = useMemo(() => {
    if (myLocation) return [myLocation.lat, myLocation.lng];
    if (center?.lat && center?.lng) return [center.lat, center.lng];
    return [28.4595, 77.0266]; // fallback
  }, [myLocation, center]);

  // -------------------- ROUTING --------------------
  function Routing({ from, to }) {
    const map = useMap();

    useEffect(() => {
      if (!from || !to) return;

      const routingControl = L.Routing.control({
        waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
        addWaypoints: false,
        draggableWaypoints: false,
        lineOptions: { styles: [{ color: "#007bff", weight: 5 }] },
      })
        .on("routesfound", (e) => {
          const coords = e.routes[0].coordinates.map((c) => ({
            lat: c.lat,
            lng: c.lng,
          }));
          onRouteReady(coords);
        })
        .addTo(map);

      return () => map.removeControl(routingControl);
    }, [from, to]);

    return null;
  }

  return (
    <div className="w-full h-[400px] rounded overflow-hidden">
      <MapContainer
        center={centerPos}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
      >
        <RecenterMap center={myLocation || center} />

        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Line */}
        {pickup && dropoff && <Routing from={pickup} to={dropoff} />}

        {/* USER CURRENT LOCATION */}
        {myLocation && (
          <Marker position={[myLocation.lat, myLocation.lng]} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* PICKUP */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>Pickup</Popup>
          </Marker>
        )}

        {/* DROPOFF */}
        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
            <Popup>Dropoff</Popup>
          </Marker>
        )}

        {/* DRIVERS */}
        {drivers.map((d, i) => {
          const lat = d.lat || d.currentLocation?.lat;
          const lng = d.lng || d.currentLocation?.lng;
          if (!lat || !lng) return null;

          return (
            <Marker key={i} position={[lat, lng]} icon={driverIcon}>
              <Popup>Driver {d.driverId}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
