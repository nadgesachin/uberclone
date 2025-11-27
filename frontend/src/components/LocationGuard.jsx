import React, { useEffect, useState } from "react";

export default function LocationGuard({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setAllowed(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => setAllowed(true),
      () => setAllowed(false),
      { enableHighAccuracy: true }
    );
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking GPS access…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
        <h2 className="text-2xl font-semibold text-red-600 mb-3">
          Location Permission Required
        </h2>
        <p className="text-gray-700 mb-6 text-center max-w-md">
          To continue, please enable GPS and allow location access.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-blue-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return children;
}
