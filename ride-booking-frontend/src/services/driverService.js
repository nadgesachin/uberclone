import api from './api';
import axios from 'axios';

// Driver related API helpers matching backend routes under /api/v1/driver
const base = '/driver';

const driverService = {
  // GET /api/v1/driver/info/:driverId
  getInfo: async (driverId) => {
    if (!driverId) throw new Error('driverId required');
    const res = await api.get(`${base}/info/${driverId}`);
    // backend returns { success, message, data }
    return res.data && res.data.data ? res.data.data : res.data;
  },

  // POST /api/v1/driver/status  { isOnline, status }
  updateStatus: async (driverId, opts = {}) => {
    // opts: { isOnline: boolean, lat, lng, vehicleType }
    if (!driverId) throw new Error('driverId required');
    const status = opts.isOnline ? 'online' : 'offline';
    const body = { driverId, status };
    if (opts.lat !== undefined && opts.lng !== undefined) {
      body.lat = opts.lat; body.lng = opts.lng;
    }
    if (opts.vehicleType) body.vehicleType = opts.vehicleType;
    const res = await api.post(`${base}/status`, body);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  updateLocation: async (driverId, loc) => {
    return axios.post("http://localhost:4000/api/v1/driver/location", {
      driverId,
      lat: loc.lat,
      lng: loc.lng
    });
  },

  // GET /api/v1/driver/nearby
  getNearby: async (params) => {
    const res = await api.get(`${base}/nearby`, { params });
    return res.data && res.data.data ? res.data.data : res.data;
  },

  // GET /api/v1/driver/drivers/online
  getOnlineDrivers: async () => {
    const res = await api.get(`${base}/drivers/online`);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  // Update driver profile in backend (PUT /api/v1/driver/info/:driverId)
  updateProfile: async (driverId, payload = {}) => {
    if (!driverId) throw new Error('driverId required');
    const res = await api.put(`${base}/info/${driverId}`, payload);
    return res.data && res.data.data ? res.data.data : res.data;
  },

  // NOTE: backend does not expose upload endpoints in the provided routes
  // If file upload endpoints exist (multer), they should be implemented here.
};

export default driverService;
