import React, { useEffect, useState } from 'react';
import RideCard from '../components/RideCard.jsx';
import rideService from '../services/rideService';
import SearchBar from '../components/rapido/SearchBar.jsx';
import VehicleList from '../components/rapido/VehicleList.jsx';
import BookingPanel from '../components/rapido/BookingPanel.jsx';

const sampleVehicles = [
  { id: 'v1', name: 'Bike', icon: '🛵', eta: 2, desc: 'Quick 1-seater', fare: '₹45' },
  { id: 'v2', name: 'Auto', icon: '🛺', eta: 4, desc: '3-seater Auto', fare: '₹60' },
  { id: 'v3', name: 'Mini', icon: '🚗', eta: 6, desc: 'AC Mini', fare: '₹110' },
];

const HomePage = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [recentRides, setRecentRides] = useState([]);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadRecent() {
      try {
        const data = await rideService.getRecentRides(5);
        if (mounted) setRecentRides(data || []);
      } catch (err) {
        console.warn('Could not load recent rides', err.message || err);
      }
    }
    loadRecent();
    return () => { mounted = false; };
  }, []);

  const validate = () => {
    if (!pickup.trim() || !dropoff.trim()) {
      setError('Please enter both pickup and dropoff locations.');
      return false;
    }
    if (pickup.trim().toLowerCase() === dropoff.trim().toLowerCase()) {
      setError('Pickup and dropoff cannot be the same.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSearch = () => {
    setSuccessMessage('');
    if (!validate()) return;
    // For now we use sample data. In production you'd call an API for availability/pricing.
    setVehicles(sampleVehicles);
    setSelected(null);
  };

  const handleBook = async (vehicle) => {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        pickup: pickup.trim(),
        dropoff: dropoff.trim(),
        vehicle: vehicle.name,
        eta: vehicle.eta,
        fare: vehicle.fare,
      };
      const created = await rideService.requestRide(payload);
      setSuccessMessage('Ride requested successfully.');
      setRecentRides((r) => [created, ...r].slice(0, 5));
      // keep inputs for confirmation, or clear if desired
      setSelected(null);
    } catch (err) {
      setError(err?.message || 'Failed to request ride.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="max-w-6xl mx-auto p-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map + recent rides */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-4 h-96">
              <h2 className="text-lg font-medium mb-3">Map</h2>
              <div className="flex-1 bg-gray-100 rounded-md border border-dashed border-gray-200 h-72 flex items-center justify-center text-gray-500">Map placeholder — integrate Mapbox/Google Maps here</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-medium mb-3">Recent rides</h2>
              {recentRides.length === 0 && <div className="text-sm text-gray-500">No recent rides yet.</div>}
              <ul className="space-y-3 mt-2">{recentRides.map((ride) => (<li key={ride.id || ride._id || JSON.stringify(ride)}><RideCard ride={ride} /></li>))}</ul>
            </div>
          </div>

          {/* Booking panel */}
          <aside className="bg-white shadow rounded-lg p-4">
            <div className="sticky top-6">
              <SearchBar pickup={pickup} dropoff={dropoff} onChangePickup={setPickup} onChangeDropoff={setDropoff} onSearch={handleSearch} />

              <div className="mt-4">
                {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
                {successMessage && <div role="status" className="text-sm text-green-600">{successMessage}</div>}
              </div>

              <div className="mt-4">
                <VehicleList vehicles={vehicles} onSelect={(v) => setSelected(v)} />
              </div>

              <BookingPanel selected={selected} onBook={handleBook} />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
