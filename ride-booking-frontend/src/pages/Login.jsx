import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import authService from "../services/authService.js";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await authService.login(email, password);

      if (!res.success) {
        setError(res.message);
        return;
      }

      // Save in AuthContext + localStorage
      login(res.data, res.token);

      // Redirect based on userType
      if (res.data.userType === "driver") {
        navigate("/driver");
      } else {
        navigate("/customer");
      }

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Sign in to RideBook</h2>

        <form onSubmit={handle} className="space-y-3">
          <div>
            <label className="text-sm">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border rounded"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border rounded"
              placeholder="••••••"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded">
            Login
          </button>

          <a href="/signup" className="text-indigo-600 text-sm">Create account</a>
        </form>
      </div>
    </div>
  );
}
