import api from './api';

/**
 * NOTE: adapt these endpoints to match your backend.
 * Recommended defaults used here:
 *  - POST /ride-requests -> create a ride
 *  - GET  /rides?limit=N -> list recent rides
 */

async function requestRide(payload) {
  const res = await api.post('/ride-requests', payload);
  return res.data;
}

async function acceptRide(rideId) {
  try {
    const res = await api.post(`/rides/${rideId}/accept`);
    return res.data;
  } catch (err) {
    return null;
  }
}

async function cancelRide(rideId) {
  try {
    const res = await api.post(`/rides/${rideId}/cancel`);
    return res.data;
  } catch (err) {
    return null;
  }
}

async function payRide(rideId, payload) {
  try {
    const res = await api.post(`/rides/${rideId}/pay`, payload);
    return res.data;
  } catch (err) {
    return null;
  }
}

async function getRecentRides(limit = 5) {
  try {
    const res = await api.get('/rides', { params: { limit } });
    // Normalize response to always return an array.
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.rides)) return d.rides;
    // If the API returned an object that looks like { data: [...] }
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  } catch (err) {
    // Non-fatal: return empty array to keep UI functional in dev
    return [];
  }
}

export default {
  requestRide,
  getRecentRides,
  acceptRide,
  cancelRide,
  payRide,
};
