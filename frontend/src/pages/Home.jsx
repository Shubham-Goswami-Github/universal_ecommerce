import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

/* ================= HOME ================= */
const Home = () => {
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          axiosClient.get("/api/settings/public"),
          axiosClient.get("/api/products"),
        ]);

        setSettings(settingsRes.data || null);

        // ✅ ONLY APPROVED PRODUCTS
        const approved =
          productsRes.data?.products?.filter(
            (p) => p.status === "approved"
          ) || [];

        setProducts(approved);
      } catch (err) {
        console.error("Home load error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ================= GROUP BY SUPER CATEGORY ================= */
  const grouped = products.reduce((acc, p) => {
    // 🔥 SAFE CATEGORY NAME (works even if not populated)
    const superCat =
      p.category?.parent?.name ||
      p.category?.name ||
      "Others";

    if (!acc[superCat]) acc[superCat] = [];
    acc[superCat].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-16 min-h-screen">
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

          <div className="mt-6">
            <Link
              to="/products"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="text-center text-sm text-slate-500">
          Loading products...
        </div>
      )}

      {/* ================= CATEGORY ROWS ================= */}
      {!loading &&
        Object.keys(grouped).map((superCat) => (
          <CategoryRow
            key={superCat}
            title={superCat}
            products={grouped[superCat]}
          />
        ))}

      {/* ================= EMPTY ================= */}
      {!loading && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">
            No products available right now.
          </p>
        </div>
      )}
    </div>
  );
};

/* ================= CATEGORY ROW ================= */
const CategoryRow = ({ title, products }) => {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    rowRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <Link
          to={`/products?category=${title}`}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full w-9 h-9 flex items-center justify-center"
        >
          ◀
        </button>

        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-10"
        >
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full w-9 h-9 flex items-center justify-center"
        >
          ▶
        </button>
      </div>
    </section>
  );
};

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ product }) => {
  const image =
    product.images?.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <Link
      to={`/products/${product._id}`}
      className="min-w-[240px] max-w-[240px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
    >
      <div className="h-40 bg-slate-100">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <span className="inline-block mb-2 rounded-full bg-slate-100 px-3 py-0.5 text-[10px] uppercase text-slate-600">
          {product.category?.name || "General"}
        </span>

        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
          {product.name}
        </h3>

        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
          {product.shortDescription ||
            product.fullDescription ||
            "No description available."}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-blue-600">
              ₹{product.finalPrice || product.sellingPrice}
            </span>

            {product.mrp > product.sellingPrice && (
              <span className="ml-2 text-xs text-slate-400 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>

          <span className="text-xs text-slate-400">View →</span>
        </div>
      </div>
    </Link>
  );
};

export default Home;
