// src/pages/Products.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axiosClient
      .get('/api/products')
      .then((res) => {
        setProducts(res.data.products || res.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            All Products
          </h1>
          <p className="text-sm text-slate-500">
            Browse all available products
          </p>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link
            key={p._id}
            to={`/products/${p._id}`}
            className="group rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-lg transition"
          >
            {/* Category badge */}
            <div className="mb-2">
              <span className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                {p.category || 'General'}
              </span>
            </div>

            {/* Product name */}
            <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-1">
              {p.name}
            </h3>

            {/* Description */}
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">
              {p.description || 'No description available.'}
            </p>

            {/* Price + CTA */}
            <div className="flex items-center justify-between mt-auto">
              <span className="text-lg font-bold text-blue-600">
                ₹{p.price}
              </span>
              <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600 transition">
                View →
              </span>
            </div>
          </Link>
        ))}

        {/* Empty state */}
        {products.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              No products found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
