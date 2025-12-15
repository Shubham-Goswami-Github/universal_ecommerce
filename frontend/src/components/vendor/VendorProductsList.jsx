import React from 'react';

const VendorProductsList = ({ products = [], onEdit, onDelete }) => {
  if (!products || products.length === 0) {
    return <div className="text-slate-400">No products yet. Add your first product.</div>;
  }

  const statusBadge = (status) => {
    if (status === 'pending') return 'bg-yellow-400 text-black';
    if (status === 'approved') return 'bg-emerald-400 text-black';
    if (status === 'rejected') return 'bg-red-500 text-white';
    return 'bg-gray-400 text-black';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => (
        <div key={p._id} className="bg-slate-900 border border-slate-800 rounded-md p-3 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="h-20 w-20 bg-slate-800 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
              {p.images && p.images[0] ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={p.images[0]} alt={`${p.name} image`} className="object-cover h-full w-full" />
              ) : (
                <div className="text-slate-500 text-xs">No image</div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-100">{p.name}</h3>
              <div className="text-xs text-slate-400">{p.category}</div>
              <div className="text-sm text-teal-300 font-semibold mt-1">₹{p.price}</div>
              <div className="text-xs text-slate-400 mt-1">Stock: {p.stock ?? 0}</div>

              {/* optional small meta */}
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(p.status)}`}>
                  {p.status}
                </span>

                <span className={`text-xs px-2 py-1 rounded ${p.isActive ? 'bg-emerald-600/10 text-emerald-300' : 'bg-yellow-600/10 text-yellow-300'}`}>
                  {p.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>

              {/* rejection reason if any */}
              {p.status === 'rejected' && p.rejectionReason && (
                <div className="mt-2 text-xs text-red-300 bg-red-900/10 p-2 rounded">
                  <strong>Rejected:</strong> {p.rejectionReason}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onEdit(p)}
              className="px-3 py-1 rounded-md bg-slate-800 text-slate-100 text-sm"
              aria-label={`Edit ${p.name}`}
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(p._id)}
              className="px-3 py-1 rounded-md bg-red-500/10 text-red-400 text-sm"
              aria-label={`Delete ${p.name}`}
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
