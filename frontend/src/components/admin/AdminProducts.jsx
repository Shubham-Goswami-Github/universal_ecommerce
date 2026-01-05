// src/pages/AdminProducts.jsx  (or wherever this file is)
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import ProductForm from "../vendor/ProductForm";
import ProductQuickView from "../product/ProductQuickView";

/* -------------------------------------------------------------------------- */
/* PRODUCT CARD */
/* -------------------------------------------------------------------------- */
function ProductCard({ p, onEdit, onDelete, onView }) {
  const image =
    p.images && p.images.length > 0
      ? p.images[0]
      : "https://via.placeholder.com/120x120?text=No+Image";

  const price = p.finalPrice ?? p.sellingPrice ?? p.price ?? 0;
  const hasDiscount = p.mrp && p.mrp > price;
  const discountLabel =
    p.discountType === "percentage"
      ? `${p.discountValue}% OFF`
      : p.discountType === "flat" && p.discountValue > 0
      ? `₹${p.discountValue} OFF`
      : null;

  const statusColor =
    p.status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : p.status === "rejected"
      ? "bg-red-50 text-red-700 border-red-100"
      : "bg-amber-50 text-amber-700 border-amber-100";

  const handleView = () => {
    if (!p?._id) return;
    onView && onView(p);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      {/* TOP: NAME + STATUS */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className="text-sm font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600"
          onClick={handleView}
          title={p.name}
        >
          {p.name}
        </h3>
        <span
          className={`inline-flex items-center rounded-full px-2 py-[2px] text-[11px] font-semibold capitalize border ${statusColor}`}
        >
          {p.status || "pending"}
        </span>
      </div>

      {/* IMAGE */}
      <div
        className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden mb-3 cursor-pointer hover:scale-[1.02] transition-transform"
        onClick={handleView}
      >
        <img src={image} alt={p.name} className="w-full h-full object-cover" />
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* CATEGORY + VENDOR */}
        <p className="text-[11px] text-slate-500 truncate">
          Category:{" "}
          <span className="text-slate-700 font-medium">
            {p.category?.parent
              ? `${p.category.parent.name} / ${p.category.name}`
              : p.category?.name || "Uncategorized"}
          </span>
        </p>

        {p.vendor && (
          <p className="text-[11px] text-slate-500 truncate">
            Vendor:{" "}
            <span className="text-slate-800 font-medium">
              {p.vendor.name}
            </span>
          </p>
        )}

        {/* PRICE */}
        <div className="mt-1 flex items-end gap-2">
          <span className="text-sm font-bold text-blue-600">₹{price}</span>
          {hasDiscount && (
            <>
              <span className="text-xs text-slate-400 line-through">
                ₹{p.mrp}
              </span>
              {discountLabel && (
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {discountLabel}
                </span>
              )}
            </>
          )}
        </div>

        {/* STOCK / META */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
          <span>
            Stock:{" "}
            <span className="font-medium">
              {p.totalStock ?? p.stock ?? 0}
            </span>
          </span>
          {typeof p.totalOrderedQuantity === "number" && (
            <span>
              Sold:{" "}
              <span className="font-medium">
                {p.totalOrderedQuantity}
              </span>
            </span>
          )}
        </div>

        {/* SHORT DESCRIPTION */}
        {p.shortDescription && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {p.shortDescription}
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleView}
          className="flex-1 px-2 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
        >
          View
        </button>

        <button
          onClick={() => onEdit(p)}
          className="flex-1 px-2 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 text-xs font-medium"
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

  // QuickView state
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

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
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await axiosClient.delete(`/api/admin/products/${p._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAll();
  };

  const handleView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
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
          (typeof p.category === "string"
            ? p.category.toLowerCase().includes(categoryFilter.toLowerCase())
            : p.category?.name
                ?.toLowerCase()
                .includes(categoryFilter.toLowerCase()));
        return qMatch && cMatch;
      }),
    }))
    .filter((g) => g.products.length);

  return (
    <div className="space-y-6">
      {/* EDIT MODAL */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-10 px-3">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 shadow-lg">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Product
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="text-slate-400 text-sm hover:text-slate-600"
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

      {/* QUICK VIEW MODAL */}
      {quickViewOpen && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          onEdit={(prod) => {
            setQuickViewOpen(false);
            handleEdit(prod);
          }}
          onDelete={(prod) => {
            setQuickViewOpen(false);
            handleDelete(prod);
          }}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            All Products
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            View and manage all products from all vendors.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or description…"
            className="w-full sm:w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Filter by category…"
            className="w-full sm:w-40 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-slate-500 text-sm">Loading…</div>
      ) : filteredGrouped.length === 0 ? (
        <div className="text-slate-500 text-sm">No products found</div>
      ) : (
        filteredGrouped.map((g, i) => (
          <div key={i} className="space-y-2">
            {/* Vendor header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-slate-800 font-semibold">
                  {g.vendor.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {g.vendor.email && (
                    <>
                      <span>{g.vendor.email}</span>
                      <span className="mx-1">•</span>
                    </>
                  )}
                  {g.products.length} product
                  {g.products.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {g.products.map((p) => (
                <ProductCard
                  key={p._id}
                  p={p}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}