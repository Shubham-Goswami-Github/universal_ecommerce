import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const VendorStorePage = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axiosClient.get(`/api/vendor-store/public/${id}`)
      .then(res => {
        setStore(res.data.store || null);
        setProducts(res.data.products || []);
      })
      .catch(err => console.error(err));
  }, [id]);

  return (
    <div>
      {store && (
        <div className="bg-slate-900 p-4 rounded mb-4">
          <div className="flex items-center gap-4">
            {store.logoUrl ? <img src={store.logoUrl} alt={store.storeName} className="h-20 w-20 object-cover rounded" /> : <div className="h-20 w-20 bg-slate-800 rounded" />}
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">{store.storeName}</h1>
              <p className="text-sm text-slate-400">{store.description}</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg text-slate-100 mb-3">Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p._id} className="bg-slate-900 border border-slate-800 p-3 rounded">
            <div className="h-36 w-full bg-slate-800 rounded overflow-hidden mb-2">
              {p.images && p.images[0] ? <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" /> : <div className="text-slate-500 p-4">No image</div>}
            </div>
            <div className="text-slate-100 font-semibold">{p.name}</div>
            <div className="text-slate-400 text-sm">{p.category}</div>
            <div className="text-teal-300 font-semibold mt-2">₹{p.price}</div>
          </div>
        ))}
        {products.length === 0 && <div className="text-slate-400">This vendor has no products.</div>}
      </div>
    </div>
  );
};

export default VendorStorePage;
