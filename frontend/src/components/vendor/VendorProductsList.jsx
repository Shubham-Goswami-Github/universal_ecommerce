import React from 'react';

const VendorProductsList = ({ products = [], onEdit, onDelete }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-slate-500 text-sm">
        No products yet. Add your first product.
      </div>
    );
  }

  const statusBadge = (status) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'approved') return 'bg-emerald-100 text-emerald-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((p) => (
        <div
          key={p._id}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col"
        >
          <div className="flex gap-4">
            {/* Image */}
            <div className="h-20 w-20 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {p.images && p.images[0] ? (
                <img
                  src={p.images[0]}
                  alt={`${p.name} image`}
                  className="object-cover h-full w-full"
                />
              ) : (
                <span className="text-xs text-slate-400">No image</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">
                {p.name}
              </h3>
              <div className="text-xs text-slate-500">{p.category}</div>
              <div className="text-sm font-bold text-blue-600 mt-1">
                ₹{p.price}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Stock: {p.stock ?? 0}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(
                    p.status
                  )}`}
                >
                  {p.status}
                </span>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    p.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {p.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>

              {p.status === 'rejected' && p.rejectionReason && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  <strong>Rejected:</strong> {p.rejectionReason}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => onEdit(p)}
              className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(p._id)}
              className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100"
            >
              Delete
            </button>

            <div className="ml-auto text-xs text-slate-400">
              Added: {new Date(p.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorProductsList;
