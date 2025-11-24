import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LocationGuard from "./components/LocationGuard.jsx";

import HomePage from './pages/HomePage.jsx';
import CustomerHome from './pages/CustomerHome.jsx';
import DriverHome from './pages/DriverHome.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import CommentsPage from './pages/Comments.jsx';
import PaymentPage from './pages/Payment.jsx';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RideDetails = lazy(() => import('./pages/RideDetails'));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">Loading…</div>
);

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <Suspense fallback={<Loading />}>
        <LocationGuard>
          <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/customer" element={<ProtectedRoute><CustomerHome /></ProtectedRoute>} />
            <Route path="/driver" element={<ProtectedRoute><DriverHome /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="/login" element={<LocationGuard><Login /></LocationGuard>} />
            <Route path="/signup" element={<LocationGuard><Signup /></LocationGuard>} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/comments" element={<ProtectedRoute><CommentsPage /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/rides/:id" element={<ProtectedRoute><RideDetails /></ProtectedRoute>} />

            <Route path="*" element={<div className="p-6">Page not found</div>} />
          </Routes>
        </LocationGuard>
      </Suspense>
    </div>
  );
}
