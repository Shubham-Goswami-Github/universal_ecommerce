// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, auth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    password: '',
    confirmPassword: '',
    role: 'user', // 👈 yahi select se change hoga

    gender: '',
    dateOfBirth: '',

    // address (single → backend array)
    fullName: '',
    pincode: '',
    houseNo: '',
    streetArea: '',
    city: '',
    state: '',

    acceptTerms: false,
  });

  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!form.acceptTerms) {
      setError('Please accept Terms & Conditions');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!form.mobileNumber) {
      setError('Mobile number is required');
      return;
    }

    // Kya koi address field bhari gayi hai?
    const anyAddressFilled =
      form.houseNo ||
      form.streetArea ||
      form.city ||
      form.state ||
      form.pincode;

    // Agar address de rahe ho to pincode required rakho
    if (anyAddressFilled && !form.pincode) {
      setError('Please enter pincode for the address');
      return;
    }

    // Address → backend expects ARRAY
    const addresses = anyAddressFilled
      ? [
          {
            fullName: form.fullName || form.name,
            mobileNumber: form.mobileNumber,
            pincode: form.pincode,
            houseNo: form.houseNo,
            streetArea: form.streetArea,
            city: form.city,
            state: form.state,
            country: 'India',
            addressType: 'home',
            isDefault: true,
          },
        ]
      : [];

    // Extra payload (ye body me jayega)
    const extraPayload = {
      mobileNumber: form.mobileNumber,
      alternateMobileNumber: form.alternateMobileNumber,
      gender: form.gender,         // 'male' | 'female' | 'other'
      dateOfBirth: form.dateOfBirth, // "YYYY-MM-DD", backend me new Date()
      addresses,
    };

    // register(name, email, password, role, extraPayload, file)
    const res = await register(
      form.name,
      form.email,
      form.password,
      form.role,     // 👈 yahan se 'user' ya 'vendor' jayega
      extraPayload,
      profilePic     // profile picture file
    );

    if (!res.success) {
      setError(res.message || 'Registration failed');
      return;
    }

    setSuccessMsg('Registration successful! Please login.');
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
          <h1 className="text-xl font-semibold text-slate-100 mb-4">
            Create Account
          </h1>

          {error && (
            <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/60 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-3 rounded-md bg-emerald-500/10 border border-emerald-500/60 px-3 py-2 text-sm text-emerald-200">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* BASIC */}
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            <input
              name="mobileNumber"
              placeholder="Mobile Number"
              value={form.mobileNumber}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            <input
              name="alternateMobileNumber"
              placeholder="Alternate Mobile (optional)"
              value={form.alternateMobileNumber}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            {/* ROLE SELECT (User / Vendor) */}
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              {/* admin ko yahan nahi dena, sirf admin panel se */}
            </select>

            {/* PROFILE */}
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>      {/* schema enum: 'male' */}
              <option value="female">Female</option>  {/* 'female' */}
              <option value="other">Other</option>    {/* 'other' */}
            </select>

            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            {/* PROFILE PICTURE */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
              className="w-full text-xs text-slate-300"
            />

            {/* PASSWORD */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            {/* ADDRESS (OPTIONAL) */}
            <input
              name="houseNo"
              placeholder="House / Flat No"
              value={form.houseNo}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            <input
              name="pincode"
              placeholder="Pincode"
              value={form.pincode}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            <input
              name="streetArea"
              placeholder="Street / Area"
              value={form.streetArea}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
            />

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
              />
              I accept the Terms & Conditions
            </label>

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full rounded-lg bg-teal-400 text-slate-900 text-sm font-semibold py-2"
            >
              {auth.loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-3 text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-300">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;