// src/components/admin/SettingsForm.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const SettingsForm = ({ token, settings: initialSettings, onSaved }) => {
  const [form, setForm] = useState({
    siteName: '',
    logoUrl: '',
    homepageTitle: '',
    homepageSubtitle: '',
    heroBannerImages: [],
    featuredText: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    footerText: '',
    primaryColor: '',
    secondaryColor: '',
    isMaintenanceMode: false,
    backgroundImage: '',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setForm({
        siteName: initialSettings.siteName || '',
        logoUrl: initialSettings.logoUrl || '',
        homepageTitle: initialSettings.homepageTitle || '',
        homepageSubtitle: initialSettings.homepageSubtitle || '',
        heroBannerImages: initialSettings.heroBannerImages || [],
        featuredText: initialSettings.featuredText || '',
        contactEmail: initialSettings.contactEmail || '',
        contactPhone: initialSettings.contactPhone || '',
        address: initialSettings.address || '',
        footerText: initialSettings.footerText || '',
        primaryColor: initialSettings.primaryColor || '',
        secondaryColor: initialSettings.secondaryColor || '',
        isMaintenanceMode: initialSettings.isMaintenanceMode || false,
        backgroundImage: initialSettings.backgroundImage || '',
        backgroundRepeat: initialSettings.backgroundRepeat || 'no-repeat',
        backgroundSize: initialSettings.backgroundSize || 'cover',
      });
    }
  }, [initialSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);

    try {
      setUploading(true);
      const res = await axiosClient.post('/api/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = `${window.location.origin}${res.data.url}`;
      setForm((f) => ({ ...f, [field]: url }));
      alert('Uploaded successfully');
    } catch (err) {
      console.error('Upload error', err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axiosClient.post('/api/settings', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSaved && onSaved(res.data.settings);
      window.dispatchEvent(new Event('settings:updated'));
      alert('Settings updated');
    } catch (err) {
      console.error('Save settings error:', err);
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      {/* BASIC INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Site Name
          </label>
          <input
            name="siteName"
            value={form.siteName}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Homepage Title
          </label>
          <input
            name="homepageTitle"
            value={form.homepageTitle}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Homepage Subtitle
        </label>
        <input
          name="homepageSubtitle"
          value={form.homepageSubtitle}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      {/* LOGO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Site Logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e, 'logoUrl')}
          />
          {uploading && (
            <div className="text-xs text-slate-500 mt-1">Uploading…</div>
          )}
        </div>

        {form.logoUrl && (
          <img
            src={form.logoUrl}
            alt="logo"
            className="h-14 object-contain border rounded-md p-1"
          />
        )}
      </div>

      {/* BACKGROUND IMAGE */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Background Image (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e, 'backgroundImage')}
        />

        {form.backgroundImage && (
          <img
            src={form.backgroundImage}
            alt="background"
            className="mt-2 w-full max-h-32 object-cover rounded-md border"
          />
        )}
      </div>

      {/* FEATURED TEXT */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Featured Text
        </label>
        <input
          name="featuredText"
          value={form.featuredText}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      {/* CONTACT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Contact Email
          </label>
          <input
            name="contactEmail"
            value={form.contactEmail}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Contact Phone
          </label>
          <input
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Address
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={2}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Footer Text
        </label>
        <input
          name="footerText"
          value={form.footerText}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      {/* MAINTENANCE */}
      <div className="flex items-center gap-2">
        <input
          id="maintenance"
          type="checkbox"
          checked={form.isMaintenanceMode}
          onChange={(e) =>
            setForm((f) => ({ ...f, isMaintenanceMode: e.target.checked }))
          }
        />
        <label htmlFor="maintenance" className="text-sm text-slate-700">
          Enable maintenance mode
        </label>
      </div>

      {/* SAVE */}
      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 text-white px-5 py-2 text-sm font-semibold hover:bg-blue-500 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;
