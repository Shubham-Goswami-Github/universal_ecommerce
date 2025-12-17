// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          axiosClient.get("/api/settings/public"),
          axiosClient.get("/api/products"),
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
    <div className="space-y-14 bg-slate-50">
      {/* ================= HERO ================= */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 sm:p-12 shadow-md">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            {settings?.homepageTitle || "Shop Smarter, Shop Better"}
          </h1>

          <p className="mt-4 text-blue-100 text-sm sm:text-base">
            {settings?.homepageSubtitle ||
              "Discover quality products from trusted sellers at the best prices."}
          </p>

          {settings?.featuredText && (
            <div className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold text-white">
              {settings.featuredText}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              to="/products"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
            >
              Browse Products
            </Link>

            <Link
              to="/products"
              className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Today’s Deals
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="px-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Featured Products
            </h2>
            <p className="text-xs text-slate-500">
              Popular picks you shouldn’t miss
            </p>
          </div>

          <Link
            to="/products"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(0, 6).map((p) => (
            <Link
              key={p._id}
              to={`/products/${p._id}`}
              className="group rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Category */}
              <div className="mb-2">
                <span className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                  {p.category || "General"}
                </span>
              </div>

              {/* Product Info */}
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                {p.name}
              </h3>

              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {p.description || "No description available."}
              </p>

              {/* Price */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  ₹{p.price}
                </span>

                <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600 transition">
                  View →
                </span>
              </div>
            </Link>
          ))}

          {/* Empty State */}
          {products.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-sm text-slate-500">
                No products available right now.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Vendors can add products from their dashboard.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
