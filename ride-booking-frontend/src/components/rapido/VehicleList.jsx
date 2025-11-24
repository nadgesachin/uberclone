import React from 'react';
import VehicleCard from './VehicleCard.jsx';

const VehicleList = ({ vehicles = [], onSelect }) => {
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {vehicles.length === 0 && <div className="text-sm text-gray-500">No vehicles — search to see options</div>}
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} onSelect={onSelect} />
      ))}
    </div>
  );
};

export default VehicleList;
