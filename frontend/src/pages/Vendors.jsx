import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router-dom';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    axiosClient.get('/api/public/vendors')
      .then(res => setVendors(res.data.vendors || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-100">Vendors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map(v => (
          <Link key={v._id} to={`/vendor-store/${v._id}`} className="block bg-slate-900 border border-slate-800 p-4 rounded-lg hover:shadow">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-slate-800 rounded-md overflow-hidden flex items-center justify-center">
                {v.logoUrl ? <img src={v.logoUrl} alt={v.storeName||v.name} className="object-cover h-full w-full" /> : <div className="text-slate-400">{(v.name || 'V').charAt(0)}</div>}
              </div>
              <div>
                <div className="text-slate-100 font-semibold">{v.storeName || v.name}</div>
                <div className="text-slate-400 text-sm">{v.email}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Vendors;
