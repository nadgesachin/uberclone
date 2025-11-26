import React from 'react';

const BookingPanel = ({ selected, onBook }) => {
  if (!selected) return (
    <div className="mt-4 p-4 rounded-md border border-dashed border-gray-200 text-center text-sm text-gray-500">Select a vehicle to see booking options</div>
  );
  return (
    <div className="mt-4 bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-2xl">{selected.icon}</div>
          <div>
            <div className="font-semibold text-gray-800">{selected.name}</div>
            <div className="text-sm text-gray-500">{selected.desc}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-500 text-sm">ETA</div>
          <div className="font-bold text-xl text-indigo-700">{selected.fare}</div>
          <div className="text-xs text-gray-500">{selected.eta} min</div>
        </div>
      </div>
      <div className="mt-4">
        <button onClick={() => onBook(selected)} className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow">Book {selected.name}</button>
      </div>
    </div>
  );
};

export default BookingPanel;
