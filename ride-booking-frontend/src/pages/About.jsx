import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-3xl bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-3">About RideBook</h1>
        <p className="text-gray-700 leading-relaxed">RideBook is a demo ride-booking frontend inspired by Rapido — fast, on-demand rides for short distances. This UI is built with React, Vite and Tailwind and demonstrates a production-oriented component structure with real-time driver updates via WebSocket and a Leaflet map.</p>
        <div className="mt-4 text-sm text-gray-500">Built as part of a coding exercise.</div>
      </div>
    </div>
  );
}
