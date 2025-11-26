import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    userType: "customer",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/api/v1/user/create", form);

      if (!res.data.success) {
        return setError(res.data.message);
      }

      // USER + TOKEN
      login(res.data.data, res.data.token);

      // Redirect based on role
      if (form.userType === "driver") navigate("/driver");
      else navigate("/customer");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Create your RideBook account</h2>

        <form onSubmit={submit} className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              placeholder="+91 9876543210"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              placeholder="••••••"
              required
            />
          </div>

          {/* USER TYPE */}
          <div>
            <label className="text-sm text-gray-600">I am a</label>
            <select
              name="userType"
              value={form.userType}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded"
          >
            Create Account
          </button>

          <div className="text-center mt-2">
            <a href="/login" className="text-sm text-indigo-600">
              Already have an account?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
