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
      {products.map((product) => (
        <div
          key={product._id}
          className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
        >
          <div>
            <div className="font-semibold text-slate-900">
              {product.name}
            </div>

            {/* ✅ SAFE CATEGORY DISPLAY */}
            <div className="text-xs text-slate-500 mt-1">
              {product.category?.parent
                ? `${product.category.parent.name} / ${product.category.name}`
                : product.category?.name || 'Uncategorized'}
            </div>

            <div className="text-sm text-slate-600 mt-1">
              ₹{product.price}
            </div>

            <div className="text-xs mt-1">
              Status:{' '}
              <span className="font-medium">
                {product.status}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="text-sm px-3 py-1 rounded bg-slate-100 hover:bg-slate-200"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(product._id)}
              className="text-sm px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};


export default VendorProductsList;
