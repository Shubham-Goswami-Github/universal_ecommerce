// src/components/vendor/VendorProductsList.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductQuickView from '../product/ProductQuickView';


const statusClasses = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  rejected: 'bg-red-50 text-red-700 border-red-100',
};

const VendorProductsList = ({ products, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  if (!products || products.length === 0) {
    return (
      <div className="text-sm text-slate-500 bg-white border border-dashed border-slate-200 rounded-xl p-4 text-center">
        You haven&apos;t added any products yet.
      </div>
    );
  }

  const handleViewDetails = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const image =
          product.images && product.images.length > 0
            ? product.images[0]
            : 'https://via.placeholder.com/80x80?text=No+Image';

        const price =
          product.finalPrice ?? product.sellingPrice ?? product.price ?? 0;

        const status = product.status || 'pending';
        const statusStyle =
          statusClasses[status] ||
          'bg-slate-50 text-slate-700 border-slate-200';

        return (
          <div
            key={product._id}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-slate-200 p-4 bg-white hover:shadow-md transition-shadow"
          >
            {/* LEFT : IMAGE + INFO */}
            <div className="flex items-start gap-4 flex-1">
              {/* IMAGE */}
              <div
                className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => handleViewDetails(product)}
              >
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* INFO */}
              <div className="space-y-1">
                {/* Name + status */}
                <div className="flex items-start gap-2 flex-wrap">
                  <h3
                    className="font-semibold text-slate-900 text-sm md:text-base cursor-pointer hover:text-blue-600"
                    onClick={() => handleViewDetails(product)}
                  >
                    {product.name}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-[2px] text-[11px] font-semibold uppercase ${statusStyle}`}
                  >
                    {status}
                  </span>
                </div>

                {/* Category */}
                <div className="text-xs text-slate-500">
                  {product.category?.parent
                    ? `${product.category.parent.name} / ${product.category.name}`
                    : product.category?.name || 'Uncategorized'}
                </div>

                {/* Price + Stock */}
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-[2px] font-medium">
                    ₹{price}
                  </span>
                  <span className="text-slate-500">
                    Stock:{' '}
                    <span className="font-medium">
                      {product.totalStock ?? 0}
                    </span>
                  </span>
                  {product.mrp && product.mrp > price && (
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Save ₹{product.mrp - price}
                    </span>
                  )}
                </div>

                {/* Meta line */}
                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
                  {product.createdAt && (
                    <span>
                      Added:{' '}
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {product.updatedAt && (
                    <span>
                      Updated:{' '}
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT : ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
              {/* View product details (public) */}
              <button
                onClick={() => handleViewDetails(product)}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                View Details
              </button>

              <button
                onClick={() => onEdit(product)}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(product._id)}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}

      <ProductQuickView
        product={quickViewProduct}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default VendorProductsList;