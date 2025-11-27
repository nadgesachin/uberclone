import React from 'react';

const SearchBar = ({ pickup, dropoff, onChangePickup, onChangeDropoff, onSearch }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">P</div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Pickup</label>
            <input
              aria-label="pickup"
              className="mt-1 w-full p-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="Enter pickup location"
              value={pickup}
              onChange={(e) => onChangePickup(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-semibold">D</div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Dropoff</label>
            <input
              aria-label="dropoff"
              className="mt-1 w-full p-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="Enter dropoff location"
              value={dropoff}
              onChange={(e) => onChangeDropoff(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={onSearch} className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 font-semibold">Find rides</button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
