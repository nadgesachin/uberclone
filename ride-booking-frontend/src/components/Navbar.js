import React from 'react';

const Navbar = () => {
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-indigo-600 font-bold text-xl">RideBook</div>
          <div className="text-sm text-gray-500">Reliable rides, simplified</div>
        </div>
        <nav className="space-x-4">
          <a href="/" className="text-sm text-gray-700 hover:text-indigo-600">Home</a>
          <a href="/profile" className="text-sm text-gray-700 hover:text-indigo-600">Profile</a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
