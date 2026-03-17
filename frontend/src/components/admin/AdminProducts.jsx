// src/components/admin/AdminProducts.jsx
import { useEffect, useState, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import ProductForm from "../vendor/ProductForm";
import ProductQuickView from "../product/ProductQuickView";

/* -------------------------------------------------------------------------- */
/* ICONS                                                                      */
/* -------------------------------------------------------------------------- */
const Icons = {
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Delete: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Store: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
};

/* -------------------------------------------------------------------------- */
/* STATUS BADGE                                                               */
/* -------------------------------------------------------------------------- */
function StatusBadge({ status }) {
  const config = {
    approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
    },
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
  };

  const styles = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
      {status || "pending"}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* PRODUCT CARD - GRID VIEW                                                   */
/* -------------------------------------------------------------------------- */
function ProductCardGrid({ product, onEdit, onDelete, onView }) {
  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/200x200?text=No+Image";

  const price = product.finalPrice ?? product.sellingPrice ?? product.price ?? 0;
  const hasDiscount = product.mrp && product.mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - price) / product.mrp) * 100)
    : 0;

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onClick={() => onView(product)}
        />

        {/* Discount Badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            {discountPercent}% OFF
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={product.status} />
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <button
              onClick={() => onView(product)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-800 py-2 rounded-lg text-xs font-medium hover:bg-white transition-colors"
            >
              <Icons.Eye />
              View
            </button>
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
            >
              <Icons.Edit />
              Edit
            </button>
            <button
              onClick={() => onDelete(product)}
              className="flex items-center justify-center bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <Icons.Delete />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3
          className="text-sm font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors leading-snug"
          onClick={() => onView(product)}
        >
          {product.name}
        </h3>

        {/* Category */}
        <p className="text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
            {product.category?.parent
              ? `${product.category.parent.name} › ${product.category.name}`
              : product.category?.name || "Uncategorized"}
          </span>
        </p>

        {/* Price Section */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">₹{price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">₹{product.mrp.toLocaleString()}</span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                (product.totalStock ?? product.stock ?? 0) > 10
                  ? "bg-emerald-500"
                  : (product.totalStock ?? product.stock ?? 0) > 0
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            ></span>
            <span className="text-xs text-slate-600">
              {product.totalStock ?? product.stock ?? 0} in stock
            </span>
          </div>
          {typeof product.totalOrderedQuantity === "number" && (
            <span className="text-xs text-slate-500">
              {product.totalOrderedQuantity} sold
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PRODUCT CARD - LIST VIEW                                                   */
/* -------------------------------------------------------------------------- */
function ProductCardList({ product, onEdit, onDelete, onView }) {
  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/80x80?text=No+Image";

  const price = product.finalPrice ?? product.sellingPrice ?? product.price ?? 0;
  const hasDiscount = product.mrp && product.mrp > price;

  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex gap-4">
        {/* Image */}
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => onView(product)}
        >
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-sm font-semibold text-slate-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onView(product)}
              >
                {product.name}
              </h3>
              <StatusBadge status={product.status} />
            </div>

            <p className="text-xs text-slate-500 line-clamp-1">
              {product.category?.parent
                ? `${product.category.parent.name} › ${product.category.name}`
                : product.category?.name || "Uncategorized"}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900">₹{price.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">₹{product.mrp.toLocaleString()}</span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                Stock: {product.totalStock ?? product.stock ?? 0}
              </span>
              {typeof product.totalOrderedQuantity === "number" && (
                <span className="text-xs text-slate-500">
                  Sold: {product.totalOrderedQuantity}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onView(product)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View"
          >
            <Icons.Eye />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Icons.Edit />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Icons.Delete />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VENDOR GROUP SECTION                                                       */
/* -------------------------------------------------------------------------- */
function VendorSection({ vendor, products, viewMode, onEdit, onDelete, onView }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-slate-50/50 border border-slate-200 rounded-2xl overflow-hidden">
      {/* Vendor Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
            <Icons.Store />
            <span className="text-white font-bold text-sm sr-only">
              {vendor.name?.charAt(0)?.toUpperCase() || "V"}
            </span>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-900">{vendor.name || "Unknown Vendor"}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {vendor.email && <span>{vendor.email}</span>}
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                <Icons.Package />
                {products.length} product{products.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="text-slate-400">
          {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
        </div>
      </button>

      {/* Products Grid/List */}
      {isExpanded && (
        <div className="p-4 pt-0">
          {viewMode === "grid" ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {products.map((p) => (
                <ProductCardGrid
                  key={p._id}
                  product={p}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <ProductCardList
                  key={p._id}
                  product={p}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* LOADING SKELETON                                                           */
/* -------------------------------------------------------------------------- */
function LoadingSkeleton({ viewMode }) {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2].map((group) => (
        <div key={group} className="bg-slate-50 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200 rounded"></div>
              <div className="w-48 h-3 bg-slate-200 rounded"></div>
            </div>
          </div>
          {viewMode === "grid" ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <div className="aspect-square bg-slate-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="w-full h-4 bg-slate-200 rounded"></div>
                    <div className="w-2/3 h-3 bg-slate-200 rounded"></div>
                    <div className="w-1/2 h-5 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
                    <div className="w-1/3 h-3 bg-slate-200 rounded"></div>
                    <div className="w-1/4 h-5 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */
function EmptyState({ hasFilters, onClearFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icons.Package />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
      <p className="text-sm text-slate-500 text-center max-w-md mb-4">
        {hasFilters
          ? "No products match your current filters. Try adjusting your search criteria."
          : "There are no products in the system yet."}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
export default function AdminProducts({ token: tokenProp }) {
  const { auth } = useAuth();
  const token = tokenProp || auth.token;

  // States
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  // Edit Modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // QuickView
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Fetch Products
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
            vendor: p.vendor || { name: "Unknown Vendor" },
            products: [],
          };
        }
        map[vid].products.push(p);
      });

      setGrouped(Object.values(map));
    } catch (err) {
      console.error("Error fetching products:", err);
      setGrouped([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  // Handlers
  const handleEdit = (p) => {
    setEditingProduct(p);
    setShowEditor(true);
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete "${p.name}"? This action cannot be undone.`)) return;
    try {
      await axiosClient.delete(`/api/admin/products/${p._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAll();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setStatusFilter("");
  };

  // Filtered Data
  const filteredGrouped = useMemo(() => {
    return grouped
      .map((g) => ({
        ...g,
        products: g.products.filter((p) => {
          const qMatch =
            !searchQuery ||
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());

          const cMatch =
            !categoryFilter ||
            (typeof p.category === "string"
              ? p.category.toLowerCase().includes(categoryFilter.toLowerCase())
              : p.category?.name?.toLowerCase().includes(categoryFilter.toLowerCase()));

          const sMatch = !statusFilter || p.status === statusFilter;

          return qMatch && cMatch && sMatch;
        }),
      }))
      .filter((g) => g.products.length > 0);
  }, [grouped, searchQuery, categoryFilter, statusFilter]);

  // Stats
  const totalProducts = grouped.reduce((acc, g) => acc + g.products.length, 0);
  const filteredProducts = filteredGrouped.reduce((acc, g) => acc + g.products.length, 0);
  const hasFilters = searchQuery || categoryFilter || statusFilter;

  return (
    <div className="space-y-5">
      {/* EDIT MODAL */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start p-4 overflow-y-auto">
          <div
            className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Edit Product</h3>
                <p className="text-sm text-slate-500 mt-0.5">{editingProduct?.name}</p>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Icons.Close />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
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

      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title & Stats */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white">
                  <Icons.Package />
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">All Products</h2>
                <p className="text-sm text-slate-500">
                  {hasFilters ? (
                    <>
                      Showing {filteredProducts} of {totalProducts} products
                    </>
                  ) : (
                    <>Manage products from all vendors</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={fetchAll}
              disabled={loading}
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200"
              title="Refresh"
            >
              <Icons.Refresh />
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <Icons.Grid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="List View"
              >
                <Icons.List />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                showFilters || hasFilters
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icons.Filter />
              <span className="text-sm font-medium hidden sm:inline">Filters</span>
              {hasFilters && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* FILTERS PANEL */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icons.Search />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Category Filter */}
              <input
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="Filter by category..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Clear Filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <Icons.Close />
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CONTENT */}
      {loading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : filteredGrouped.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGrouped.map((g, i) => (
            <VendorSection
              key={g.vendor._id || i}
              vendor={g.vendor}
              products={g.products}
              viewMode={viewMode}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* FOOTER STATS */}
      {!loading && filteredGrouped.length > 0 && (
        <div className="flex items-center justify-between py-4 px-5 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredProducts}</span> products
            from <span className="font-semibold text-slate-900">{filteredGrouped.length}</span> vendors
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}