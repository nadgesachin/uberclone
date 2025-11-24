import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow">RB</div>
            <div>
              <div className="text-indigo-700 font-bold text-lg">RideBook</div>
              <div className="text-xs text-gray-500">Quick rides, on-demand</div>
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <a href="/customer" className="text-sm text-gray-700 hover:text-indigo-600">Customer</a>
          <a href="/driver" className="text-sm text-gray-700 hover:text-indigo-600">Driver</a>
          <a href="/about" className="text-sm text-gray-700 hover:text-indigo-600">About</a>
          <a href="/contact" className="text-sm text-gray-700 hover:text-indigo-600">Contact</a>
          <a href="/comments" className="text-sm text-gray-700 hover:text-indigo-600">Comments</a>
          <AuthControls />
        </nav>
        <div className="md:hidden">
          <a href="/customer" className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Book</a>
        </div>
      </div>
    </header>
  );
};

const AuthControls = () => {
  const { user, logout } = useAuth();
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a href="/login" className="text-sm text-indigo-600">Sign in</a>
        <a href="/signup" className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Sign up</a>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-700">Hi, {user.name}</div>
      <button onClick={() => logout()} className="text-sm text-red-600">Logout</button>
    </div>
  );
};

export default Navbar;
