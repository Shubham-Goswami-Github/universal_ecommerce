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
    // appearance
    backgroundColor: '',
    backgroundImage: '',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    fontFamily: '',
    fontColor: '',
    headingFontSize: '',
    headingColor: ''
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
        backgroundColor: initialSettings.backgroundColor || '',
        backgroundImage: initialSettings.backgroundImage || '',
        backgroundRepeat: initialSettings.backgroundRepeat || 'no-repeat',
        backgroundSize: initialSettings.backgroundSize || 'cover',
        fontFamily: initialSettings.fontFamily || '',
        fontColor: initialSettings.fontColor || '',
        headingFontSize: initialSettings.headingFontSize || '',
        headingColor: initialSettings.headingColor || ''
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
      const url = res.data.url; // e.g. /uploads/123.jpg
      const full = `${window.location.origin}${url}`;
      setForm((f) => ({ ...f, [field]: full }));
      alert('Uploaded');
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
      // dispatch event so navbar updates instantly
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
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1">Site Name</label>
          <input name="siteName" value={form.siteName} onChange={handleChange}
                 className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-100" />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1">Homepage Title</label>
          <input name="homepageTitle" value={form.homepageTitle} onChange={handleChange}
                 className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-100" />
        </div>
      </div>

      {/* Logo upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <div>
          <label className="block text-xs text-slate-300 mb-1">Logo (upload)</label>
          <div className="flex gap-2 items-center">
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'logoUrl')} className="text-sm" />
            {uploading && <div className="text-xs text-slate-400">Uploading...</div>}
          </div>
        </div>
        <div>
          {form.logoUrl && <img src={form.logoUrl} alt="logo" className="h-12 object-contain" />}
        </div>
      </div>

      {/* Background upload */}
      <div>
        <label className="block text-xs text-slate-300 mb-1">Background Image (upload)</label>
        <div className="flex gap-2 items-center">
          <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'backgroundImage')} className="text-sm" />
        </div>
        {form.backgroundImage && (
          <div className="mt-2">
            <img src={form.backgroundImage} alt="bg" className="w-full max-h-28 object-cover rounded-md" />
          </div>
        )}
      </div>

      {/* colors / fonts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1">Background Color</label>
          <input type="color" name="backgroundColor" value={form.backgroundColor} onChange={handleChange} className="w-full h-10 p-1 rounded-md" />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1">Font Color</label>
          <input type="color" name="fontColor" value={form.fontColor} onChange={handleChange} className="w-full h-10 p-1 rounded-md" />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1">Heading Color</label>
          <input type="color" name="headingColor" value={form.headingColor} onChange={handleChange} className="w-full h-10 p-1 rounded-md" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-300 mb-1">Font Family (CSS)</label>
        <input name="fontFamily" value={form.fontFamily} onChange={handleChange}
               placeholder='e.g. "Inter, system-ui, Arial"' className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1">Heading Font Size (e.g. 1.875rem)</label>
          <input name="headingFontSize" value={form.headingFontSize} onChange={handleChange}
                 className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-slate-100" />
        </div>

        <div className="flex items-center gap-3">
          <input id="maintenance" type="checkbox" checked={form.isMaintenanceMode} onChange={(e) => setForm(f => ({ ...f, isMaintenanceMode: e.target.checked }))} />
          <label htmlFor="maintenance" className="text-xs text-slate-300">Maintenance mode</label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
                className="rounded-md bg-teal-400 text-slate-900 px-4 py-2 text-sm font-semibold">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;
