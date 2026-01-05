import React from 'react';

const VendorProductsList = ({ products, onEdit, onDelete }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        No products added yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const image =
          product.images && product.images.length > 0
            ? product.images[0]
            : 'https://via.placeholder.com/80x80?text=No+Image';

        return (
          <div
            key={product._id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 bg-white hover:shadow-sm transition"
          >
            {/* LEFT : IMAGE + INFO */}
            <div className="flex items-center gap-4">
              {/* IMAGE */}
              <img
                src={image}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover border"
              />

              {/* INFO */}
              <div>
                <div className="font-semibold text-slate-900">
                  {product.name}
                </div>

                {/* CATEGORY */}
                <div className="text-xs text-slate-500 mt-0.5">
                  {product.category?.parent
                    ? `${product.category.parent.name} / ${product.category.name}`
                    : product.category?.name || 'Uncategorized'}
                </div>

                {/* PRICE */}
                <div className="text-sm text-emerald-600 font-medium mt-1">
                  ₹{product.finalPrice ?? product.sellingPrice ?? product.price}
                </div>

                {/* META */}
                <div className="flex gap-3 mt-1 text-xs">
                  <span className="text-slate-500">
                    Stock: {product.totalStock ?? 0}
                  </span>

                  <span
                    className={`font-medium ${
                      product.status === 'approved'
                        ? 'text-emerald-600'
                        : product.status === 'rejected'
                        ? 'text-red-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT : ACTIONS */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(product)}
                className="text-sm px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(product._id)}
                className="text-sm px-3 py-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VendorProductsList;
