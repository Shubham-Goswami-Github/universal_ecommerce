import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import ProductForm from "../vendor/ProductForm";

/* -------------------------------------------------------------------------- */
/* PRODUCT CARD */
/* -------------------------------------------------------------------------- */
function ProductCard({ p, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-full shadow-sm hover:shadow-md transition">
      {/* IMAGE */}
      <div className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden mb-3">
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No image
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 truncate">
          {p.name}
        </h3>
        <p className="text-xs text-slate-500 truncate">{p.category}</p>

        <p className="text-sm font-bold text-blue-600 mt-1">₹{p.price}</p>

        {p.description && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
            {p.description}
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onEdit(p)}
          className="flex-1 px-2 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(p)}
          className="flex-1 px-2 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium"
        >
          Delete
        </button>
      </div>

      {/* STATUS */}
      <div className="mt-2 text-xs font-semibold capitalize">
        <span
          className={
            p.status === "pending"
              ? "text-yellow-600"
              : p.status === "approved"
              ? "text-emerald-600"
              : "text-red-600"
          }
        >
          {p.status}
        </span>
      </div>

      {/* VENDOR */}
      {p.vendor && (
        <div className="mt-2 text-[11px] text-slate-500 truncate">
          Vendor:{" "}
          <span className="text-slate-800 font-medium">
            {p.vendor.name}
          </span>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT */
/* -------------------------------------------------------------------------- */
export default function AdminProducts({ token: tokenProp }) {
  const { auth } = useAuth();
  const token = tokenProp || auth.token;

  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const products = res.data.products || [];

      const map = {};
      products.forEach((p) => {
        const vid = p.vendor?._id || "unknown";
        if (!map[vid]) {
          map[vid] = {
            vendor: p.vendor || { name: "Unknown" },
            products: [],
          };
        }
        map[vid].products.push(p);
      });

      setGrouped(Object.values(map));
    } catch (err) {
      console.error(err);
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
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await axiosClient.delete(`/api/admin/products/${p._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAll();
  };

  const filteredGrouped = grouped
    .map((g) => ({
      ...g,
      products: g.products.filter((p) => {
        const qMatch =
          !q ||
          p.name?.toLowerCase().includes(q.toLowerCase()) ||
          p.description?.toLowerCase().includes(q.toLowerCase());
        const cMatch =
          !categoryFilter ||
          p.category?.toLowerCase().includes(categoryFilter.toLowerCase());
        return qMatch && cMatch;
      }),
    }))
    .filter((g) => g.products.length);

  return (
    <div className="space-y-6">
      {/* MODAL */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-10 px-3">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 shadow-lg">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Product
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="text-slate-400 text-sm"
              >
                ✕
              </button>
            </div>

            <ProductForm
              token={token}
              product={editingProduct}
              onSaved={() => {
                setShowEditor(false);
                fetchAll();
              }}
              onCancel={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          All Products
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="w-full sm:w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Category…"
            className="w-full sm:w-40 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : filteredGrouped.length === 0 ? (
        <div className="text-slate-500">No products found</div>
      ) : (
        filteredGrouped.map((g, i) => (
          <div key={i}>
            <div className="mb-3">
              <h3 className="text-slate-800 font-semibold">
                {g.vendor.name}
              </h3>
              <p className="text-xs text-slate-500">
                {g.products.length} products
              </p>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {g.products.map((p) => (
                <ProductCard
                  key={p._id}
                  p={p}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
