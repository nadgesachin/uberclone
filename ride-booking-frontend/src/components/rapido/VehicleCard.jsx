import React from 'react';

const VehicleCard = ({ vehicle, onSelect }) => {
  return (
    <div onClick={() => onSelect(vehicle)} className="flex items-center gap-4 p-3 rounded-xl bg-white shadow-sm hover:shadow-lg cursor-pointer transition">
      <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center text-2xl font-bold">{vehicle.icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium text-gray-800">{vehicle.name}</div>
            <div className="text-xs text-gray-500">{vehicle.desc}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">ETA {vehicle.eta} min</div>
            <div className="font-semibold text-indigo-700 mt-1">{vehicle.fare}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
