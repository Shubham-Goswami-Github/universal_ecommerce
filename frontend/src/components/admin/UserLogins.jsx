// src/components/admin/UserLogins.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function UserLogins({ token }) {
  const [items, setItems] = useState([]); // users (only role === 'user')
  const [loading, setLoading] = useState(false);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null => create, object => edit
  const [form, setForm] = useState({ name: '', email: '', password: '', isActive: true });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      // Filter to show only users with role === 'user'
      const all = res.data.users || [];
      const onlyUsers = all.filter(u => u.role === 'user');
      setItems(onlyUsers);
    } catch (err) {
      console.error('fetch users', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name || '', email: u.email || '', password: '', isActive: u.isActive ?? true });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        // PATCH /api/admin/users/:id
        await axiosClient.patch(`/api/admin/users/${editing._id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        alert('User updated');
      } else {
        // POST /api/admin/users (force role:user)
        await axiosClient.post('/api/admin/users', { ...form, role: 'user' }, { headers: { Authorization: `Bearer ${token}` } });
        alert('User created');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error('save user error', err);
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.name}" (${u.email})? This cannot be undone.`)) return;
    try {
      await axiosClient.delete(`/api/admin/users/${u._id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('Deleted');
      fetchUsers();
    } catch (err) {
      console.error('delete user', err);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">Manage application users</p>
        <button onClick={openCreate} className="px-3 py-1 rounded bg-teal-400 text-black text-sm">+ Add User</button>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-slate-400">No users found.</div>
      ) : (
        <div className="space-y-2">
          {items.map(u => (
            <div key={u._id} className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-100 font-semibold">{u.name}</div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-400">{u.isActive ? 'Active' : 'Blocked'}</div>
                <button onClick={() => openEdit(u)} className="px-2 py-1 rounded border text-xs">Edit</button>
                <button onClick={() => handleDelete(u)} className="px-2 py-1 rounded border text-xs text-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded w-full max-w-md">
            <h3 className="text-sm text-slate-100 mb-2">{editing ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label className="text-xs text-slate-300">Name</label>
                <input required name="name" value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))}
                  className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-100" />
              </div>

              <div>
                <label className="text-xs text-slate-300">Email</label>
                <input required name="email" value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))}
                  type="email" className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-100" />
              </div>

              <div>
                <label className="text-xs text-slate-300">{editing ? 'Change Password (leave blank to keep)' : 'Password'}</label>
                <input name="password" value={form.password} onChange={(e)=>setForm(f=>({...f, password:e.target.value}))}
                  type="password" className="w-full rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-100" />
              </div>

              <div className="flex items-center gap-2">
                <input id="active" type="checkbox" checked={form.isActive} onChange={(e)=>setForm(f=>({...f, isActive:e.target.checked}))} />
                <label htmlFor="active" className="text-xs text-slate-300">Active</label>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={()=>setShowModal(false)} className="px-3 py-1 rounded border text-sm">Cancel</button>
                <button type="submit" className="px-3 py-1 rounded bg-teal-400 text-black text-sm">{editing ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
