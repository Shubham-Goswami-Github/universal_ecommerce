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
  Search: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Grid: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  Edit: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Delete: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Eye: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Close: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Store: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Package: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Camera: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-2h6l2 2h4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      <circle cx="12" cy="12" r="3.5" strokeWidth={2} />
    </svg>
  ),
  Save: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Refresh: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  ChevronDown: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronUp: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Image: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  TrendingUp: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  ShoppingBag: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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
      label: "Approved"
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
      label: "Rejected"
    },
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      label: "Pending"
    },
  };

  const styles = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-semibold capitalize border ${styles.bg} ${styles.text} ${styles.border} whitespace-nowrap`}
    >
      <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${styles.dot} flex-shrink-0`}></span>
      <span className="hidden xs:inline">{styles.label}</span>
      <span className="xs:hidden">{status?.charAt(0)?.toUpperCase()}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* INLINE PHOTO EDITOR                                                        */
/* -------------------------------------------------------------------------- */
function InlinePhotoEditor({
  product,
  isOpen,
  previewImages,
  saving,
  onToggle,
  onFileChange,
  onSave,
  onCancel,
}) {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => onToggle(product)}
        className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 text-xs sm:text-sm font-medium text-slate-700 hover:bg-gradient-to-b hover:from-blue-50 hover:to-white hover:border-blue-200 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow"
      >
        <Icons.Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden xs:inline">Update Photo</span>
        <span className="xs:hidden">Photo</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl sm:rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/90 via-white to-slate-50 p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
            <Icons.Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-tight">Update Product Photos</p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
              Select one or multiple images to add to this product.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors flex-shrink-0"
          title="Close"
        >
          <Icons.Close />
        </button>
      </div>

      {/* Upload Area */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <label className="cursor-pointer rounded-xl border border-dashed border-blue-300 bg-white px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFileChange(product, e)}
          />
          <span className="flex items-center gap-2.5 font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
              <Icons.Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">Choose Photo(s)</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">PNG, JPG, WEBP up to 5MB each</span>
            </span>
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-500">
          <span className="px-2.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
            Current: <span className="font-semibold text-slate-700">{product.images?.length || 0}</span>
          </span>
          <span className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-sm">
            New: {previewImages.length}
          </span>
        </div>
      </div>

      {/* Image Preview Grid */}
      {(previewImages.length > 0 || (product.images?.length > 0)) && (
        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-2 sm:p-3">
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {(previewImages.length > 0 ? previewImages : (product.images?.slice(0, 6) || [])).map((image, index) => (
            <div 
              key={`${image}-${index}`} 
              className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 relative"
            >
              <img
                src={image}
                alt={`${product.name}-${index + 1}`}
                className="w-full h-full object-cover"
              />
              {previewImages.length > 0 && index === 0 && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded">
                  NEW
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="sm:min-w-[96px] px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(product)}
          disabled={previewImages.length === 0 || saving}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/25"
        >
          {saving ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Icons.Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Photos"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PRODUCT CARD - GRID VIEW                                                   */
/* -------------------------------------------------------------------------- */
function ProductCardGrid({
  product,
  onEdit,
  onDelete,
  onView,
  photoEditorOpen,
  photoPreviews,
  photoSaving,
  onTogglePhotoEditor,
  onPhotoFileChange,
  onPhotoSave,
  onPhotoCancel,
}) {
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
    <div className="group h-full bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden cursor-pointer" onClick={() => onView(product)}>
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount Badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg shadow-red-500/30">
            -{discountPercent}%
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <StatusBadge status={product.status} />
        </div>

        {/* Image Count Badge */}
        {product.images?.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex items-center gap-1">
            <Icons.Image className="w-3 h-3" />
            {product.images.length}
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onView(product); }}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-sm text-slate-800 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-white transition-colors shadow-lg"
            >
              <Icons.Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">View</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(product); }}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 bg-blue-500 text-white py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Icons.Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Edit</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(product); }}
              className="flex items-center justify-center bg-red-500 text-white p-1.5 sm:p-2 rounded-lg hover:bg-red-600 transition-colors shadow-lg"
            >
              <Icons.Delete className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col">
        {/* Title */}
        <h3
          className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors leading-snug min-h-[2.5em]"
          onClick={() => onView(product)}
        >
          {product.name}
        </h3>

        {/* Category */}
        <p className="text-[10px] sm:text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-full">
            {product.category?.parent
              ? `${product.category.parent.name} › ${product.category.name}`
              : product.category?.name || "Uncategorized"}
          </span>
        </p>

        {/* Price Section */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            ₹{price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-sm text-slate-400 line-through">
              ₹{product.mrp.toLocaleString()}
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                (product.totalStock ?? product.stock ?? 0) > 10
                  ? "bg-emerald-500"
                  : (product.totalStock ?? product.stock ?? 0) > 0
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            ></span>
            <span className="text-[10px] sm:text-xs text-slate-600">
              {product.totalStock ?? product.stock ?? 0} <span className="hidden xs:inline">in stock</span>
            </span>
          </div>
          {typeof product.totalOrderedQuantity === "number" && product.totalOrderedQuantity > 0 && (
            <span className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-0.5 sm:gap-1">
              <Icons.ShoppingBag className="w-3 h-3" />
              {product.totalOrderedQuantity} <span className="hidden xs:inline">sold</span>
            </span>
          )}
        </div>

        {/* Photo Editor */}
        <div className="mt-auto pt-2 sm:pt-3">
          <InlinePhotoEditor
            product={product}
            isOpen={photoEditorOpen}
            previewImages={photoPreviews}
            saving={photoSaving}
            onToggle={onTogglePhotoEditor}
            onFileChange={onPhotoFileChange}
            onSave={onPhotoSave}
            onCancel={onPhotoCancel}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PRODUCT CARD - LIST VIEW                                                   */
/* -------------------------------------------------------------------------- */
function ProductCardList({
  product,
  onEdit,
  onDelete,
  onView,
  photoEditorOpen,
  photoPreviews,
  photoSaving,
  onTogglePhotoEditor,
  onPhotoFileChange,
  onPhotoSave,
  onPhotoCancel,
}) {
  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/80x80?text=No+Image";

  const price = product.finalPrice ?? product.sellingPrice ?? product.price ?? 0;
  const hasDiscount = product.mrp && product.mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - price) / product.mrp) * 100)
    : 0;

  return (
    <div className="group bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 space-y-3 sm:space-y-4">
      <div className="flex gap-3 sm:gap-4">
        {/* Image */}
        <div
          className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer relative group/image"
          onClick={() => onView(product)}
        >
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
          />
          {hasDiscount && discountPercent > 0 && (
            <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full">
              -{discountPercent}%
            </div>
          )}
          {product.images?.length > 1 && (
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] sm:text-[10px] font-medium px-1 py-0.5 rounded flex items-center gap-0.5">
              <Icons.Image className="w-2.5 h-2.5" />
              {product.images.length}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1 sm:line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors flex-1"
                onClick={() => onView(product)}
              >
                {product.name}
              </h3>
              <StatusBadge status={product.status} />
            </div>

            <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1">
              {product.category?.parent
                ? `${product.category.parent.name} › ${product.category.name}`
                : product.category?.name || "Uncategorized"}
            </p>

            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-baseline gap-1 sm:gap-1.5">
                <span className="text-sm sm:text-base font-bold text-slate-900">₹{price.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through">₹{product.mrp.toLocaleString()}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    (product.totalStock ?? product.stock ?? 0) > 10
                      ? "bg-emerald-500"
                      : (product.totalStock ?? product.stock ?? 0) > 0
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                ></span>
                <span className="text-[10px] sm:text-xs text-slate-500">
                  {product.totalStock ?? product.stock ?? 0} stock
                </span>
              </div>
              {typeof product.totalOrderedQuantity === "number" && product.totalOrderedQuantity > 0 && (
                <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:flex items-center gap-1">
                  <Icons.TrendingUp className="w-3 h-3 text-emerald-500" />
                  {product.totalOrderedQuantity} sold
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-start sm:items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => onView(product)}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="View"
          >
            <Icons.Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Edit"
          >
            <Icons.Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete"
          >
            <Icons.Delete className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Photo Editor */}
      <InlinePhotoEditor
        product={product}
        isOpen={photoEditorOpen}
        previewImages={photoPreviews}
        saving={photoSaving}
        onToggle={onTogglePhotoEditor}
        onFileChange={onPhotoFileChange}
        onSave={onPhotoSave}
        onCancel={onPhotoCancel}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VENDOR GROUP SECTION                                                       */
/* -------------------------------------------------------------------------- */
function VendorSection({
  vendor,
  products,
  viewMode,
  onEdit,
  onDelete,
  onView,
  activePhotoEditorId,
  photoPreviews,
  photoSavingId,
  onTogglePhotoEditor,
  onPhotoFileChange,
  onPhotoSave,
  onPhotoCancel,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate vendor stats
  const totalStock = products.reduce((acc, p) => acc + (p.totalStock ?? p.stock ?? 0), 0);
  const totalSold = products.reduce((acc, p) => acc + (p.totalOrderedQuantity ?? 0), 0);

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/80 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Vendor Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50/80 to-white hover:from-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Icons.Store className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{vendor.name || "Unknown Vendor"}</h3>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 flex-wrap">
              {vendor.email && <span className="hidden sm:inline truncate max-w-[150px]">{vendor.email}</span>}
              <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                <Icons.Package className="w-3 h-3" />
                {products.length}
              </span>
              <span className="hidden xs:inline-flex items-center gap-0.5 sm:gap-1 bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                {totalStock} stock
              </span>
              {totalSold > 0 && (
                <span className="hidden sm:inline-flex items-center gap-0.5 sm:gap-1 bg-purple-100 text-purple-700 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                  {totalSold} sold
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
          <Icons.ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </button>

      {/* Products Grid/List */}
      {isExpanded && (
        <div className="p-3 sm:p-4 pt-0">
          {viewMode === "grid" ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {products.map((p) => (
                <ProductCardGrid
                  key={p._id}
                  product={p}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  photoEditorOpen={activePhotoEditorId === p._id}
                  photoPreviews={activePhotoEditorId === p._id ? photoPreviews : []}
                  photoSaving={photoSavingId === p._id}
                  onTogglePhotoEditor={onTogglePhotoEditor}
                  onPhotoFileChange={onPhotoFileChange}
                  onPhotoSave={onPhotoSave}
                  onPhotoCancel={onPhotoCancel}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {products.map((p) => (
                <ProductCardList
                  key={p._id}
                  product={p}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  photoEditorOpen={activePhotoEditorId === p._id}
                  photoPreviews={activePhotoEditorId === p._id ? photoPreviews : []}
                  photoSaving={photoSavingId === p._id}
                  onTogglePhotoEditor={onTogglePhotoEditor}
                  onPhotoFileChange={onPhotoFileChange}
                  onPhotoSave={onPhotoSave}
                  onPhotoCancel={onPhotoCancel}
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
    <div className="space-y-4 sm:space-y-6">
      {[1, 2].map((group) => (
        <div key={group} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden">
          {/* Header Skeleton */}
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3 animate-pulse">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-slate-200 rounded-lg sm:rounded-xl"></div>
              <div className="space-y-1.5 sm:space-y-2 flex-1">
                <div className="w-24 sm:w-32 h-3 sm:h-4 bg-slate-200 rounded"></div>
                <div className="w-36 sm:w-48 h-2.5 sm:h-3 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="p-3 sm:p-4">
            {viewMode === "grid" ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-50 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-slate-200"></div>
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="w-full h-3 sm:h-4 bg-slate-200 rounded"></div>
                      <div className="w-2/3 h-2.5 sm:h-3 bg-slate-200 rounded"></div>
                      <div className="w-1/2 h-4 sm:h-5 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 animate-pulse">
                    <div className="w-16 h-16 xs:w-20 xs:h-20 bg-slate-200 rounded-lg sm:rounded-xl flex-shrink-0"></div>
                    <div className="flex-1 space-y-1.5 sm:space-y-2">
                      <div className="w-1/2 h-3 sm:h-4 bg-slate-200 rounded"></div>
                      <div className="w-1/3 h-2.5 sm:h-3 bg-slate-200 rounded"></div>
                      <div className="w-1/4 h-4 sm:h-5 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner">
        <Icons.Package className="w-7 h-7 sm:w-9 sm:h-9 text-slate-400" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 sm:mb-2 text-center">No products found</h3>
      <p className="text-xs sm:text-sm text-slate-500 text-center max-w-md mb-4 sm:mb-6 px-4">
        {hasFilters
          ? "No products match your current filters. Try adjusting your search criteria."
          : "There are no products in the system yet."}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STATS CARDS                                                                */
/* -------------------------------------------------------------------------- */
function StatsCards({ totalProducts, totalVendors, filteredProducts }) {
  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Icons.Package,
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-700"
    },
    {
      label: "Active Vendors",
      value: totalVendors,
      icon: Icons.Store,
      gradient: "from-purple-500 to-pink-600",
      bg: "bg-purple-50",
      text: "text-purple-700"
    },
    {
      label: "Showing",
      value: filteredProducts,
      icon: Icons.Eye,
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700"
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bg} rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/50`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className={`text-base sm:text-lg md:text-xl font-bold ${stat.text}`}>{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
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
  const [activePhotoEditorId, setActivePhotoEditorId] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [photoSavingId, setPhotoSavingId] = useState(null);

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

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  // Handlers
  const handleEdit = (p) => {
    setEditingProduct(p);
    setShowEditor(true);
  };

  const resetPhotoEditor = () => {
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setActivePhotoEditorId(null);
    setPhotoFiles([]);
    setPhotoPreviews([]);
  };

  const handleTogglePhotoEditor = (product) => {
    if (activePhotoEditorId === product._id) {
      resetPhotoEditor();
      return;
    }

    setActivePhotoEditorId(product._id);
    setPhotoFiles([]);
    setPhotoPreviews([]);
  };

  const handlePhotoFileChange = (product, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      alert("Please select only image files.");
      e.target.value = "";
      return;
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      alert("Each image must be less than 5MB.");
      e.target.value = "";
      return;
    }

    if ((product.images?.length || 0) + files.length > 10) {
      alert("Maximum 10 images allowed per product.");
      e.target.value = "";
      return;
    }

    photoPreviews.forEach((url) => URL.revokeObjectURL(url));

    setActivePhotoEditorId(product._id);
    setPhotoFiles(files);
    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
    e.target.value = "";
  };

  const handlePhotoSave = async (product) => {
    if (!photoFiles.length || activePhotoEditorId !== product._id) {
      alert("Please choose image files first.");
      return;
    }

    try {
      setPhotoSavingId(product._id);

      const uploadData = new FormData();
      photoFiles.forEach((file) => uploadData.append("images", file));

      const uploadRes = await axiosClient.post("/api/upload/product-images", uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedImages = uploadRes.data?.images || uploadRes.data?.urls || [];
      if (!uploadedImages.length) {
        throw new Error("Image upload failed.");
      }

      const reorderedImages = [
        ...uploadedImages,
        ...(Array.isArray(product.images) ? product.images.filter((img) => img && !uploadedImages.includes(img)) : []),
      ];

      const formData = new FormData();
      formData.append("existingImages", JSON.stringify(reorderedImages));

      await axiosClient.put(`/api/products/${product._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchAll();
      resetPhotoEditor();
    } catch (err) {
      console.error("Error updating product photo:", err);
      alert(err.response?.data?.message || err.message || "Failed to update product photo.");
    } finally {
      setPhotoSavingId(null);
    }
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
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-1">
      {/* EDIT MODAL */}
      {showEditor && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowEditor(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl shadow-2xl my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-t-xl sm:rounded-t-2xl">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">Edit Product</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{editingProduct?.name}</p>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-12rem)] overflow-y-auto">
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
      <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 md:p-5 shadow-sm">
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          {/* Title & Stats */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Icons.Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">All Products</h2>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-500">
                {hasFilters ? (
                  <>
                    Showing <span className="font-semibold text-blue-600">{filteredProducts}</span> of {totalProducts}
                  </>
                ) : (
                  <>Manage products from all vendors</>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Refresh */}
            <button
              onClick={fetchAll}
              disabled={loading}
              className="p-2 sm:p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-all duration-200 border border-slate-200 hover:border-blue-200 disabled:opacity-50"
              title="Refresh"
            >
              <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <Icons.Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="List View"
              >
                <Icons.List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border transition-all duration-200 ${
                showFilters || hasFilters
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Icons.Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">Filters</span>
              {hasFilters && (
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          totalProducts={totalProducts}
          totalVendors={grouped.length}
          filteredProducts={filteredProducts}
        />

        {/* FILTERS PANEL */}
        {showFilters && (
          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-slate-200">
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {/* Search */}
              <div className="relative xs:col-span-2 lg:col-span-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icons.Search className="w-4 h-4" />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <input
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="Filter by category..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
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
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg sm:rounded-xl transition-all duration-200"
                >
                  <Icons.Close className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Clear All</span>
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
        <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm">
          <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredGrouped.map((g, i) => (
            <VendorSection
              key={g.vendor._id || i}
              vendor={g.vendor}
              products={g.products}
              viewMode={viewMode}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              activePhotoEditorId={activePhotoEditorId}
              photoPreviews={photoPreviews}
              photoSavingId={photoSavingId}
              onTogglePhotoEditor={handleTogglePhotoEditor}
              onPhotoFileChange={handlePhotoFileChange}
              onPhotoSave={handlePhotoSave}
              onPhotoCancel={resetPhotoEditor}
            />
          ))}
        </div>
      )}

      {/* FOOTER STATS */}
      {!loading && filteredGrouped.length > 0 && (
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 py-3 sm:py-4 px-3 sm:px-5 bg-gradient-to-r from-slate-50 to-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs sm:text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredProducts}</span> products
            from <span className="font-semibold text-slate-900">{filteredGrouped.length}</span> vendors
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
