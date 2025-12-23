import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();

  // 🔥 super category from URL
  const superCategory = searchParams.get('category');

  useEffect(() => {
    axiosClient
      .get('/api/products')
      .then((res) => {
        const all = res.data.products || res.data || [];

        // ✅ FILTER BY SUPER CATEGORY (if present)
        const filtered = superCategory
          ? all.filter(
              (p) =>
                p.category?.parent?.name?.toLowerCase() ===
                superCategory.toLowerCase()
            )
          : all;

        setProducts(filtered);
      })
      .catch((err) => console.error(err));
  }, [superCategory]);

  /* ================= GROUP BY SUB CATEGORY ================= */
  const groupedBySub = products.reduce((acc, p) => {
    const sub = p.category?.name || 'Others';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      
      {/* ================= PAGE HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {superCategory ? superCategory : 'All Products'}
        </h1>
        <p className="text-sm text-slate-500">
          {superCategory
            ? `Showing products under ${superCategory}`
            : 'Browse all available products'}
        </p>
      </div>

      {/* ================= SUB CATEGORY SECTIONS ================= */}
      {Object.keys(groupedBySub).map((subCat) => (
        <div key={subCat} className="space-y-4">
          {/* SUB CATEGORY TITLE */}
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-1">
            {subCat}
          </h2>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {groupedBySub[subCat].map((p) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="group rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-lg transition"
              >
                {/* CATEGORY BADGE */}
                <div className="mb-2">
                  <span className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-[10px] uppercase text-slate-600">
                    {superCategory
                      ? `${superCategory} / ${p.category?.name}`
                      : p.category?.name || 'General'}
                  </span>
                </div>

                {/* PRODUCT NAME */}
                <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-1">
                  {p.name}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {p.description || 'No description available.'}
                </p>

                {/* PRICE */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    ₹{p.price}
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-blue-600 transition">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* ================= EMPTY STATE ================= */}
      {products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            No products found for this category.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
