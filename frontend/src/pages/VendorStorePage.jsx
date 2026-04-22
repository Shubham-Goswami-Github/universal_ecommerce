import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const VendorStorePage = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axiosClient
      .get(`/api/vendor-store/public/${id}`)
      .then((res) => {
        setStore(res.data.store || null);
        setProducts(res.data.products || []);
      })
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div className="space-y-8 rounded-3xl p-1 dark:bg-slate-950">
      {/* Store Header */}
      {store && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.storeName}
                className="h-20 w-20 object-cover rounded-xl border dark:border-slate-700"
              />
            ) : (
              <div className="h-20 w-20 bg-slate-100 rounded-xl dark:bg-slate-800" />
            )}

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {store.storeName}
              </h1>
              <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                {store.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4 dark:text-slate-100">
          Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-40 w-full bg-slate-100 rounded-xl overflow-hidden mb-3 flex items-center justify-center dark:bg-slate-800">
                {p.images && p.images[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500">No image</span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 dark:text-slate-100">
                {p.name}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {p.category}
              </p>

              <div className="text-lg font-bold text-blue-600 mt-2">
                ₹{p.price}
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="text-slate-500 dark:text-slate-400">
              This vendor has no products.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorStorePage;
