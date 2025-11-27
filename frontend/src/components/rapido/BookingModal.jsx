import React from 'react';

const BookingModal = ({ open, booking, onClose, drivers }) => {
  if (!open || !booking) return null;

  const assignedDriver = booking.assignedDriver;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
      <div className="w-full md:w-96 bg-white rounded-tl-xl rounded-tr-xl md:rounded-xl p-4 md:p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-500">{booking.vehicle.name} · {booking.fare}</div>
            <div className="font-semibold text-lg">{booking.pickup} → {booking.dropoff}</div>
            <div className="text-xs text-gray-500 mt-1">{booking.vehicle.desc}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="mt-4">
          {booking.status === 'searching' && (
            <div className="flex items-center gap-3">
              <div className="animate-pulse w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">⌛</div>
              <div>
                <div className="font-medium">Searching for drivers nearby</div>
                <div className="text-sm text-gray-500">We'll notify you once a driver accepts</div>
              </div>
            </div>
          )}

          {booking.status === 'assigned' && assignedDriver && (
            <div className="flex items-center gap-3 mt-2">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">{assignedDriver.label?.charAt(0) || 'D'}</div>
              <div className="flex-1">
                <div className="font-medium">{assignedDriver.label || `Driver ${assignedDriver.id}`}</div>
                <div className="text-sm text-gray-500">{assignedDriver.car || 'Two-wheeler'}</div>
                <div className="text-sm text-indigo-600 mt-1">Arriving in ~{Math.max(1, Math.round(booking.vehicle.eta))} min</div>
              </div>
            </div>
          )}

          {booking.status === 'completed' && (
            <div className="text-green-600 font-medium">Ride completed. Thank you!</div>
          )}
        </div>

        <div className="mt-4">
          <div className="text-xs text-gray-500">Driver locations nearby</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {drivers.slice(0,6).map(d => (
              <div key={d.id} className="p-2 bg-gray-50 rounded text-center text-xs">{d.label || d.id}</div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {booking.status !== 'completed' && (
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded">Close</button>
          )}
          {(booking.status === 'searching' || booking.status === 'assigned') && (
            <button onClick={() => onCancel && onCancel(booking.rideId)} className="px-4 py-2 bg-red-500 text-white rounded">Cancel ride</button>
          )}
          {booking.status === 'completed' && (
            <button onClick={() => onPay && onPay(booking.rideId)} className="px-4 py-2 bg-indigo-600 text-white rounded">Pay</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
