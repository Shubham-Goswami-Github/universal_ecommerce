// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          axiosClient.get('/api/settings/public'),
          axiosClient.get('/api/products'),
        ]);
        setSettings(settingsRes.data);
        setProducts(productsRes.data.products || productsRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-7 shadow-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-50">
          {settings?.homepageTitle || 'Welcome to our store'}
        </h1>
        <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl">
          {settings?.homepageSubtitle || 'Your one-stop shop for everything.'}
        </p>
        {settings?.featuredText && (
          <p className="mt-3 text-teal-300 text-sm font-semibold">
            {settings.featuredText}
          </p>
        )}
        <div className="mt-5">
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-teal-400 text-slate-900 font-semibold text-sm hover:bg-teal-300"
          >
            Browse Products
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-100">
            Featured Products
          </h2>
          <Link
            to="/products"
            className="text-xs text-teal-300 hover:text-teal-200"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.slice(0, 6).map((p) => (
            <Link
              key={p._id}
              to={`/products/${p._id}`}
              className="group rounded-xl bg-slate-900 border border-slate-800 p-4 shadow-sm hover:border-teal-400/60 hover:shadow-md transition"
            >
              <div className="text-sm font-semibold text-slate-100 mb-1 line-clamp-1">
                {p.name}
              </div>
              <div className="text-xs text-slate-400 mb-2 line-clamp-2">
                {p.description || 'No description.'}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-teal-300 font-semibold text-sm">
                  ₹{p.price}
                </span>
                <span className="text-[10px] uppercase text-slate-500">
                  {p.category || 'General'}
                </span>
              </div>
            </Link>
          ))}
          {products.length === 0 && (
            <p className="text-sm text-slate-400">
              No products yet. Vendors can add products from their dashboard.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
