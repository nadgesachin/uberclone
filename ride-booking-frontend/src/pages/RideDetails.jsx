import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import rideService from '../services/rideService';

const RideDetails = () => {
  const { id } = useParams();
  const [ride, setRide] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const all = await rideService.getRecentRides(20);
        const found = (all || []).find(r => (r.id || r._id || '') + '' === id + '');
        if (mounted) setRide(found || null);
      } catch (err) {
        // ignore
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  if (!ride) return <div className="p-6">Ride not found.</div>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Ride details</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p><strong>From:</strong> {ride.pickup || ride.from}</p>
        <p><strong>To:</strong> {ride.dropoff || ride.to}</p>
        <p><strong>Status:</strong> {ride.status}</p>
        <p><strong>Fare:</strong> {ride.fare ?? ride.estimatedFare ?? '—'}</p>
      </div>
    </main>
  );
};

export default RideDetails;
