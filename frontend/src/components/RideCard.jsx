import React from 'react';

const RideCard = ({ ride = {} }) => {
  const pickup = ride.pickup || ride.from || 'Unknown pickup';
  const dropoff = ride.dropoff || ride.to || 'Unknown dropoff';
  const status = ride.status || 'pending';
  const fare = ride.fare != null ? `₦${ride.fare}` : (ride.estimatedFare ? `₦${ride.estimatedFare}` : '—');
  const time = ride.createdAt || ride.time || '';

  return (
    <article className="p-3 border rounded-md bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{pickup} → {dropoff}</h3>
          <p className="text-xs text-gray-500 mt-1">{time ? new Date(time).toLocaleString() : 'Time not available'}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-800">{fare}</div>
          <div className={`text-xs mt-1 ${status === 'completed' ? 'text-green-600' : status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>{status}</div>
        </div>
      </div>
    </article>
  );
};

export default RideCard;
