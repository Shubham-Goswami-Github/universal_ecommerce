// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, auth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(form.email, form.password);
    if (!res.success) {
      setError(res.message);
      return;
    }

    const role = res.user.role;
    if (role === 'vendor') navigate('/vendor');
    else if (role === 'admin') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
          <h1 className="text-xl font-semibold text-slate-100 mb-4">
            Login
          </h1>

          {error && (
            <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/60 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
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

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full rounded-lg bg-teal-400 text-slate-900 text-sm font-semibold py-2 hover:bg-teal-300 disabled:opacity-60"
            >
              {auth.loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-3 text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-teal-300">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
