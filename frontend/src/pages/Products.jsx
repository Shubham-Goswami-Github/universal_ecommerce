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
    <div>
      <h1 className="text-xl font-semibold text-slate-100 mb-4">
        All Products
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <Link
            key={p._id}
            to={`/products/${p._id}`}
            className="group rounded-xl bg-slate-900 border border-slate-800 p-4 shadow-sm hover:border-teal-400/60 hover:shadow-md transition"
          >
            <div className="text-sm font-semibold text-slate-100 mb-1 line-clamp-1">
              {p.name}
            </div>
            <div className="text-xs text-slate-400 mb-2 line-clamp-2">
              {p.description || 'No description.'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-teal-300 font-semibold text-sm">
                ₹{p.price}
              </span>
              <span className="text-[10px] uppercase text-slate-500">
                {p.category || 'General'}
              </span>
            </div>
          </Link>
        ))}
        {products.length === 0 && (
          <p className="text-sm text-slate-400">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default Products;
