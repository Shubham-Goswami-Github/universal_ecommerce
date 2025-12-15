// src/components/admin/AdminProducts.jsx
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import ProductForm from "../vendor/ProductForm";

// -----------------------------------------------------------------------------
// PRODUCT CARD
// -----------------------------------------------------------------------------
function ProductCard({ p, onEdit, onDelete }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:shadow-slate-800/30 hover:-translate-y-0.5">
      <div className="flex gap-3 items-start">
        {/* Image */}
        <div className="w-20 h-20 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden">
          {p.images && p.images[0] ? (
            <img
              src={p.images[0]}
              alt={`image of ${p.name}`}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="p-2 text-xs text-slate-500 flex items-center justify-center h-full">
              No image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-100 truncate">
                {p.name}
              </div>
              <div className="text-xs text-slate-400 truncate">{p.category}</div>
              <div className="text-sm text-teal-300 mt-1 font-medium">₹{p.price}</div>
            </div>

            <div className="ml-auto text-[10px] text-slate-400 whitespace-nowrap">
              {new Date(p.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Description */}
          {p.description && (
            <div className="text-xs mt-2 text-slate-400 line-clamp-3">{p.description}</div>
          )}

          {/* Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onEdit(p)}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs transition-all"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(p)}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs transition-all"
            >
              Delete
            </button>

            {/* Status */}
            <div className="ml-auto text-xs font-semibold capitalize">
              <span
                className={
                  p.status === "pending"
                    ? "text-yellow-400"
                    : p.status === "approved"
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              >
                {p.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor */}
      {p.vendor && (
        <div className="mt-3 text-xs text-slate-400">
          Vendor:{" "}
          <span className="text-slate-100 font-semibold">{p.vendor.name}</span>
          {p.vendor.email && (
            <span className="text-xs text-slate-500 ml-2">({p.vendor.email})</span>
          )}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
export default function AdminProducts({ token: tokenProp }) {
  const { auth } = useAuth();
  const token = tokenProp || auth.token;

  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // search/filter state
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Fetch products
  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const products = res.data.products || [];

      // group by vendor
      const map = {};
      products.forEach((p) => {
        const vid = p.vendor?._id || "unknown";
        if (!map[vid])
          map[vid] = {
            vendor: p.vendor || { _id: "unknown", name: "Unknown" },
            products: [],
          };
        map[vid].products.push(p);
      });

      setGrouped(Object.values(map));
    } catch (err) {
      console.error("fetchAll products error", err);
      setGrouped([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  const handleEdit = (p) => {
    setEditingProduct(p);
    setShowEditor(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete product "${p.name}"?`)) return;

    try {
      await axiosClient.delete(`/api/admin/products/${p._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product deleted");
      fetchAll();
    } catch (err) {
      console.error("delete error", err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSaved = () => {
    setShowEditor(false);
    setEditingProduct(null);
    fetchAll();
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingProduct(null);
  };

  // client-side filtering (by name or category)
  const filteredGrouped = grouped.map((g) => {
    const filtered = g.products.filter((p) => {
      const matchesQ =
        !q ||
        p.name?.toLowerCase().includes(q.toLowerCase()) ||
        p.description?.toLowerCase().includes(q.toLowerCase());
      const matchesCat = !categoryFilter || p.category?.toLowerCase().includes(categoryFilter.toLowerCase());
      return matchesQ && matchesCat;
    });
    return { ...g, products: filtered };
  }).filter((g) => g.products.length > 0);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* MODAL EDITOR */}
      {/* ------------------------------------------------------------------ */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-12 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-slate-100 font-medium">Edit Product</h3>
              <button onClick={handleCancelEdit} className="text-xs text-slate-400 hover:text-white transition">
                ✕ Close
              </button>
            </div>

            <ProductForm
              token={token}
              product={editingProduct}
              onSaved={(p) => {
                alert("Product updated");
                handleSaved(p);
              }}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TITLE + SEARCH */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl text-slate-100 font-semibold tracking-wide">All Products</h2>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products (name / description)..."
            className="flex-1 min-w-0 rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200"
          />
          <input
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Category..."
            className="w-40 rounded-md bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200"
          />
          <button
            onClick={() => { setQ(""); setCategoryFilter(""); }}
            className="px-3 py-2 rounded-md bg-slate-800 text-slate-300 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CONTENT */}
      {/* ------------------------------------------------------------------ */}
      {loading ? (
        <div className="text-slate-400 animate-pulse">Loading products…</div>
      ) : filteredGrouped.length === 0 ? (
        <div className="text-slate-400">No products found.</div>
      ) : (
        <div className="space-y-8">
          {filteredGrouped.map((g) => (
            <div key={g.vendor._id || Math.random()}>
              {/* Vendor Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-slate-200 font-semibold text-base">{g.vendor.name}</div>
                  <div className="text-xs text-slate-400">{g.vendor.email || ""}</div>
                </div>
                <div className="text-xs text-slate-400">{g.products.length} products</div>
              </div>

              {/* Product Grid */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {g.products.map((p) => (
                  <ProductCard key={p._id} p={p} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
