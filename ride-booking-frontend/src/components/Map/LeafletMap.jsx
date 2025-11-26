// src/components/Map/LeafletMap.jsx
import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./leaflet-map.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Icons
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const selectedDriverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [35, 51],
  iconAnchor: [17, 51],
  popupAnchor: [1, -44],
  className: "glowing-driver",
});

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], 15, { animate: true });
  }, [center]);
  return null;
}

// Draw route between two points
function RouteLine({ from, to, onRouteCalculated }) {
  const map = useMap();
  const routeRef = useRef(null);

  useEffect(() => {
    if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) {
      if (routeRef.current) {
        map.removeControl(routeRef.current);
        routeRef.current = null;
      }
      onRouteCalculated?.([]);
      return;
    }

    if (routeRef.current) {
      map.removeControl(routeRef.current);
      routeRef.current = null;
    }

    routeRef.current = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null,
      lineOptions: { styles: [{ color: "#3b82f6", weight: 7, opacity: 0.8 }] },
      show: false,
      fitSelectedRoutes: false,
    })
      .on("routesfound", function (e) {
        const route = e.routes[0];
        const coordinates = route.coordinates.map(coord => ({
          lat: coord.lat,
          lng: coord.lng
        }));
        if (onRouteCalculated) {
          onRouteCalculated(coordinates);
        }
      })
      .addTo(map);

    return () => {
      if (routeRef.current) {
        try {
          map.removeControl(routeRef.current);
        } catch (e) {
        }
        routeRef.current = null;
      }
    };
  }, [from?.lat, from?.lng, to?.lat, to?.lng, map, onRouteCalculated]);

  return null;
}

function AnimatedDriverMarker({ driver, routeCoords }) {
  const markerRef = useRef(null);
  const map = useMap();

  useEffect(() => {
    if (!driver || !routeCoords || routeCoords.length < 2) return;

    const marker = markerRef.current;
    if (!marker) return;

    let i = 0;
    const totalPoints = routeCoords.length;
    const duration = 30000;
    const intervalTime = duration / totalPoints;

    const moveMarker = () => {
      if (i < totalPoints) {
        const { lat, lng } = routeCoords[i];
        marker.setLatLng([lat, lng]);
        i++;
        setTimeout(moveMarker, intervalTime);
      } else {
        console.log("Driver reached pickup!");
        map.fire("driver-arrived");
      }
    };

    // Start animation
    moveMarker();

    return () => {
      i = totalPoints; // stop animation
    };
  }, [driver, routeCoords, map]);

  if (!driver) return null;

  return (
    <Marker
      ref={markerRef}
      position={[driver.lat, driver.lng]}
      icon={selectedDriverIcon}
    >
      <Popup>
        <strong>Driver is coming!</strong><br />
        Moving to pickup...
      </Popup>
    </Marker>
  );
}

export default function LeafletMap({ center, pickup, dropoff, drivers = [], userType, selectedDriver, selectedCustomer, onDriverArrived }) {
  const [routeCoords, setRouteCoords] = useState([]);
  if (!center) return <div className="h-full flex items-center justify-center">Loading map...</div>;

  const isCustomer = userType === "customer";
  const firstDriver = drivers[0]; // First nearby driver

  return (
    <>
      <MapContainer
        onDriverArrived={() => {
          if (typeof onDriverArrived === "function") onDriverArrived();
        }}
        key={`${center.lat}-${center.lng}`}
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter center={center} />

        {/* Customer pickup */}
        {isCustomer && pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={blueIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {!isCustomer && pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={greenIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* All drivers */}
        {isCustomer &&
          drivers.map((d) => {
            const isSelected = selectedDriver && d.driverId === selectedDriver.driverId;
            return (
              <Marker
                key={d.driverId}
                position={[d.lat, d.lng]}
                icon={isSelected ? selectedDriverIcon : greenIcon}
              >
                <Popup>
                  {isSelected ? <strong>Driver Coming!</strong> : `Driver ${d.driverId.slice(-6)}`}
                </Popup>
              </Marker>
            );
          })}

        {
          //Only for driver
          !isCustomer && firstDriver && (
            <Marker position={[firstDriver.lat, firstDriver.lng]} icon={blueIcon}>
              <Popup>Pickup Location</Popup>
            </Marker>
          )
        }
        {/* Animated Driver*/}
        {isCustomer && selectedDriver && routeCoords.length > 0 && (
          <AnimatedDriverMarker driver={selectedDriver} routeCoords={routeCoords} />
        )}
        {/* Route + Coordinates  */}
        {isCustomer && pickup && selectedDriver && (
          <RouteLine
            from={selectedDriver}
            to={pickup}
            onRouteCalculated={setRouteCoords}
          />
        )}
        {
          //Only for driver: pickup to dropoff
          !isCustomer && pickup && dropoff && (
            <RouteLine from={pickup} to={dropoff} />
          )
        }

        {/* Draw route from customer to first driver */}
        {isCustomer && firstDriver && selectedDriver && (
          <RouteLine from={pickup} to={{ lat: firstDriver.lat, lng: firstDriver.lng }} />
        )}

        {/* Draw route from customer to first driver */}
        {firstDriver && selectedCustomer && (
          <RouteLine from={firstDriver} to={selectedCustomer} />
        )}
      </MapContainer>
    </>
  );
}