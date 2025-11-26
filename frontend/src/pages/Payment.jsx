import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import rideService from '../services/rideService';

export default function PaymentPage() {
  const [params] = useSearchParams();
  const rideId = params.get('rideId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    // collect basic payment details (demo mode)
    const payload = { method: 'card', cardLast4: '4242' };
    const res = await rideService.payRide(rideId, payload);
    setLoading(false);
    if (res) {
      // in a real app, handle payment result
      navigate('/customer');
    } else {
      setError('Payment failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Payment</h2>
        <div className="text-sm text-gray-600 mb-4">Pay for ride {rideId}</div>
        <form onSubmit={handlePay} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Card number</label>
            <input className="mt-1 w-full p-2 border rounded" placeholder="4242 4242 4242 4242" />
          </div>
          <div className="flex gap-2">
            <input className="flex-1 mt-1 p-2 border rounded" placeholder="MM/YY" />
            <input className="w-24 mt-1 p-2 border rounded" placeholder="CVC" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-between items-center">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Processing…' : 'Pay'}</button>
            <button type="button" onClick={() => navigate(-1)} className="text-sm text-gray-600">Back</button>
          </div>
        </form>
      </div>
    </div>
  );
}
