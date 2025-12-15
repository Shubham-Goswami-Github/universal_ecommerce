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
    password: '',
    role: 'user', // user or vendor
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = await register(
      form.name,
      form.email,
      form.password,
      form.role
    );

    if (!res.success) {
      setError(res.message);
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
            Register
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
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Account Type
              </label>
              <select
                name="role"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                value={form.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full rounded-lg bg-teal-400 text-slate-900 text-sm font-semibold py-2 hover:bg-teal-300 disabled:opacity-60"
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
