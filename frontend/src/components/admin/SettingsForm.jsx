// src/components/admin/SettingsForm.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const SettingsForm = ({ token, settings: initialSettings, onSaved }) => {
  const normalizeUploadedUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const trimmed = rawUrl.trim();

    // Repair accidentally concatenated values like:
    // http://localhost:3000https://res.cloudinary.com/...
    const cloudinaryMatch = trimmed.match(/https?:\/\/res\.cloudinary\.com\/.+/i);
    if (cloudinaryMatch) return cloudinaryMatch[0];

    // Already absolute (Cloudinary secure_url, CDN, etc.)
    if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) {
      return trimmed;
    }

    // Relative path support for local/static storage mode.
    const apiBaseUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');
    return `${apiBaseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  };

  const normalizeBannerImages = (images) => {
    if (!Array.isArray(images)) return [];
    return images
      .map((item) => {
        if (typeof item === 'string') {
          const url = normalizeUploadedUrl(item);
          return url ? { url, link: '' } : null;
        }
        if (item && typeof item === 'object') {
          const url = normalizeUploadedUrl(item.url || '');
          if (!url) return null;
          return { url, link: item.link || '' };
        }
        return null;
      })
      .filter(Boolean);
  };

  const [form, setForm] = useState({
    siteName: '',
    logoUrl: '',
    homepageTitle: '',
    homepageSubtitle: '',
    heroBannerImages: [],
    heroBannerSettings: {
      autoSlide: true,
      slideSpeed: 3000,
      slideDirection: 'left',
      imageSize: 'cover',
      borderColor: 'transparent',
      borderWidth: 0
    },
    featuredText: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    footerText: '',
    isMaintenanceMode: false,
    backgroundImage: '',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, background: false, banner: false });
  const [activeTab, setActiveTab] = useState('general');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setForm({
        siteName: initialSettings.siteName || '',
        logoUrl: initialSettings.logoUrl || '',
        homepageTitle: initialSettings.homepageTitle || '',
        homepageSubtitle: initialSettings.homepageSubtitle || '',
        heroBannerImages: normalizeBannerImages(initialSettings.heroBannerImages),
        heroBannerSettings: {
          autoSlide: initialSettings.heroBannerSettings?.autoSlide ?? true,
          slideSpeed: initialSettings.heroBannerSettings?.slideSpeed || 3000,
          slideDirection: initialSettings.heroBannerSettings?.slideDirection || 'left',
          imageSize: initialSettings.heroBannerSettings?.imageSize || 'cover',
          borderColor: initialSettings.heroBannerSettings?.borderColor || 'transparent',
          borderWidth: initialSettings.heroBannerSettings?.borderWidth || 0
        },
        featuredText: initialSettings.featuredText || '',
        contactEmail: initialSettings.contactEmail || '',
        contactPhone: initialSettings.contactPhone || '',
        address: initialSettings.address || '',
        footerText: initialSettings.footerText || '',
        isMaintenanceMode: initialSettings.isMaintenanceMode || false,
        backgroundImage: initialSettings.backgroundImage || '',
        backgroundRepeat: initialSettings.backgroundRepeat || 'no-repeat',
        backgroundSize: initialSettings.backgroundSize || 'cover',
        socialLinks: {
          facebook: initialSettings.socialLinks?.facebook || '',
          instagram: initialSettings.socialLinks?.instagram || '',
          twitter: initialSettings.socialLinks?.twitter || '',
          youtube: initialSettings.socialLinks?.youtube || ''
        }
      });
    }
  }, [initialSettings]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setUnsavedChanges(true);
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      socialLinks: { ...f.socialLinks, [name]: value }
    }));
    setUnsavedChanges(true);
  };

  const handleBannerSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      heroBannerSettings: {
        ...f.heroBannerSettings,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
      }
    }));
    setUnsavedChanges(true);
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please upload an image file');
      return;
    }

    const fd = new FormData();
    fd.append('image', file);

    try {
      setUploading((prev) => ({ ...prev, [field]: true }));
      const res = await axiosClient.post('/api/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = normalizeUploadedUrl(res.data.url);
      setForm((f) => ({ ...f, [field]: url }));
      setUnsavedChanges(true);
      showNotification('success', 'Image uploaded successfully!');
    } catch (err) {
      console.error('Upload error', err);
      showNotification('error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please upload an image file');
      return;
    }

    const fd = new FormData();
    fd.append('image', file);

    try {
      setUploading((prev) => ({ ...prev, banner: true }));
      const res = await axiosClient.post('/api/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.url || res.data?.secure_url || '';
      const url = normalizeUploadedUrl(uploadedUrl);
      if (!url) {
        showNotification('error', 'Upload succeeded but image URL is invalid');
        return;
      }
      
      setForm((f) => ({
        ...f,
        heroBannerImages: [...f.heroBannerImages, { url, link: '' }]
      }));
      setUnsavedChanges(true);
      showNotification('success', 'Banner image added!');
    } catch (err) {
      console.error('Upload error', err);
      showNotification('error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, banner: false }));
    }
  };

  const handleBannerLinkChange = (index, link) => {
    setForm((f) => {
      const updated = [...f.heroBannerImages];
      updated[index] = { ...updated[index], link };
      return { ...f, heroBannerImages: updated };
    });
    setUnsavedChanges(true);
  };

  const handleRemoveBannerImage = (index) => {
    setForm((f) => ({
      ...f,
      heroBannerImages: f.heroBannerImages.filter((_, i) => i !== index)
    }));
    setUnsavedChanges(true);
  };

  const handleRemoveImage = (field) => {
    setForm((f) => ({ ...f, [field]: '' }));
    setUnsavedChanges(true);
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
      setUnsavedChanges(false);
      showNotification('success', 'Settings saved successfully!');
    } catch (err) {
      console.error('Save settings error:', err);
      showNotification('error', err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'hero', label: 'Hero Banner', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { id: 'contact', label: 'Contact Info', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'advanced', label: 'Advanced', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-500 animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification({ show: false, type: '', message: '' })}
            className="ml-2 hover:opacity-80 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Site Settings
              </h1>
              <p className="mt-2 text-slate-500">
                Manage your website configuration and appearance
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unsavedChanges && (
                <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  Unsaved changes
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {saving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 mb-6 p-2 border border-white/50">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Site Identity
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Site Name
                      </label>
                      <input
                        name="siteName"
                        value={form.siteName}
                        onChange={handleChange}
                        placeholder="Enter your site name"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Homepage Title
                      </label>
                      <input
                        name="homepageTitle"
                        value={form.homepageTitle}
                        onChange={handleChange}
                        placeholder="Enter homepage title"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      Homepage Subtitle
                    </label>
                    <input
                      name="homepageSubtitle"
                      value={form.homepageSubtitle}
                      onChange={handleChange}
                      placeholder="Enter a catchy subtitle for your homepage"
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      Featured Text
                    </label>
                    <input
                      name="featuredText"
                      value={form.featuredText}
                      onChange={handleChange}
                      placeholder="Enter featured text for highlights"
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      Footer Text
                    </label>
                    <input
                      name="footerText"
                      value={form.footerText}
                      onChange={handleChange}
                      placeholder="© 2024 Your Company. All rights reserved."
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Banner Settings */}
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-fade-in">
              {/* Banner Images Upload */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Hero Banner Images
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">Add multiple images for slideshow effect</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label htmlFor="banner-upload" className="cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {uploading.banner ? (
                          <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        {uploading.banner ? 'Uploading...' : 'Click to add banner image'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Recommended: 1920x600px or higher</p>
                    </label>
                  </div>

                  {/* Banner Images List */}
                  {form.heroBannerImages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Banner Images ({form.heroBannerImages.length})
                      </h3>
                      <div className="grid gap-4">
                        {form.heroBannerImages.map((img, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="w-32 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={img.url}
                                alt={`Banner ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/320x200?text=Image+Not+Found';
                                }}
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">Image {index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBannerImage(index)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-slate-500">Click Link (optional)</label>
                                <input
                                  type="url"
                                  value={img.link || ''}
                                  onChange={(e) => handleBannerLinkChange(index, e.target.value)}
                                  placeholder="https://example.com/page"
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Slideshow Settings */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Slideshow Settings
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Auto Slide Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <h3 className="font-medium text-slate-800">Auto Slide</h3>
                      <p className="text-sm text-slate-500 mt-1">Automatically transition between images</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            heroBannerSettings: { ...f.heroBannerSettings, autoSlide: true }
                          }));
                          setUnsavedChanges(true);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          form.heroBannerSettings.autoSlide
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            heroBannerSettings: { ...f.heroBannerSettings, autoSlide: false }
                          }));
                          setUnsavedChanges(true);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          !form.heroBannerSettings.autoSlide
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Slide Speed */}
                  {form.heroBannerSettings.autoSlide && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">Slide Speed</label>
                        <span className="text-sm text-slate-500">{form.heroBannerSettings.slideSpeed / 1000}s</span>
                      </div>
                      <input
                        type="range"
                        name="slideSpeed"
                        min="1000"
                        max="10000"
                        step="500"
                        value={form.heroBannerSettings.slideSpeed}
                        onChange={handleBannerSettingsChange}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>1s (Fast)</span>
                        <span>10s (Slow)</span>
                      </div>
                    </div>
                  )}

                  {/* Slide Direction */}
                  {form.heroBannerSettings.autoSlide && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Slide Direction</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setForm(f => ({
                              ...f,
                              heroBannerSettings: { ...f.heroBannerSettings, slideDirection: 'left' }
                            }));
                            setUnsavedChanges(true);
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                            form.heroBannerSettings.slideDirection === 'left'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Slide Left
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setForm(f => ({
                              ...f,
                              heroBannerSettings: { ...f.heroBannerSettings, slideDirection: 'right' }
                            }));
                            setUnsavedChanges(true);
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                            form.heroBannerSettings.slideDirection === 'right'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          Slide Right
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Image Size */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Image Size</label>
                    <select
                      name="imageSize"
                      value={form.heroBannerSettings.imageSize}
                      onChange={handleBannerSettingsChange}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                    >
                      <option value="cover">Cover (Fill entire area)</option>
                      <option value="contain">Contain (Fit inside area)</option>
                      <option value="auto">Auto (Original size)</option>
                    </select>
                  </div>

                  {/* Border Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Border Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          name="borderColor"
                          value={form.heroBannerSettings.borderColor === 'transparent' ? '#ffffff' : form.heroBannerSettings.borderColor}
                          onChange={(e) => {
                            setForm(f => ({
                              ...f,
                              heroBannerSettings: { ...f.heroBannerSettings, borderColor: e.target.value }
                            }));
                            setUnsavedChanges(true);
                          }}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200"
                        />
                        <input
                          type="text"
                          value={form.heroBannerSettings.borderColor}
                          onChange={(e) => {
                            setForm(f => ({
                              ...f,
                              heroBannerSettings: { ...f.heroBannerSettings, borderColor: e.target.value }
                            }));
                            setUnsavedChanges(true);
                          }}
                          placeholder="transparent"
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Border Width (px)</label>
                      <input
                        type="number"
                        name="borderWidth"
                        min="0"
                        max="20"
                        value={form.heroBannerSettings.borderWidth}
                        onChange={handleBannerSettingsChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings - Without Theme Colors */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              {/* Logo Upload Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Site Logo
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 space-y-4">
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUpload(e, 'logoUrl')}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {uploading.logo ? (
                              <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-700">
                            {uploading.logo ? 'Uploading...' : 'Click to upload logo'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG up to 5MB</p>
                        </label>
                      </div>
                    </div>

                    {form.logoUrl && (
                      <div className="relative group">
                        <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl border-2 border-slate-200 p-3 flex items-center justify-center">
                          <img
                            src={form.logoUrl}
                            alt="Site Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('logoUrl')}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <span className="block text-center text-xs text-slate-500 mt-2">Current Logo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Background Image Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Background Image
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-cyan-400 hover:bg-cyan-50/50 transition-all duration-300 cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUpload(e, 'backgroundImage')}
                          className="hidden"
                          id="bg-upload"
                        />
                        <label htmlFor="bg-upload" className="cursor-pointer">
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {uploading.background ? (
                              <svg className="w-8 h-8 text-cyan-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-700">
                            {uploading.background ? 'Uploading...' : 'Click to upload background'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Recommended: 1920x1080px or higher</p>
                        </label>
                      </div>

                      {/* Background Options */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Background Size</label>
                          <select
                            name="backgroundSize"
                            value={form.backgroundSize}
                            onChange={handleChange}
                            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200"
                          >
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Background Repeat</label>
                          <select
                            name="backgroundRepeat"
                            value={form.backgroundRepeat}
                            onChange={handleChange}
                            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200"
                          >
                            <option value="no-repeat">No Repeat</option>
                            <option value="repeat">Repeat</option>
                            <option value="repeat-x">Repeat X</option>
                            <option value="repeat-y">Repeat Y</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {form.backgroundImage && (
                      <div className="relative group lg:w-72">
                        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                          <img
                            src={form.backgroundImage}
                            alt="Background Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('backgroundImage')}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <span className="block text-center text-xs text-slate-500 mt-2">Background Preview</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Settings with Social Links */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fade-in">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Information
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleChange}
                        placeholder="contact@yoursite.com"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={form.contactPhone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Enter your full business address"
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    Social Media Links
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {/* Facebook */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Facebook</label>
                      <input
                        type="url"
                        name="facebook"
                        value={form.socialLinks.facebook}
                        onChange={handleSocialChange}
                        placeholder="https://facebook.com/yourpage"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Instagram</label>
                      <input
                        type="url"
                        name="instagram"
                        value={form.socialLinks.instagram}
                        onChange={handleSocialChange}
                        placeholder="https://instagram.com/yourprofile"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Twitter */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Twitter / X</label>
                      <input
                        type="url"
                        name="twitter"
                        value={form.socialLinks.twitter}
                        onChange={handleSocialChange}
                        placeholder="https://twitter.com/yourhandle"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* YouTube */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">YouTube</label>
                      <input
                        type="url"
                        name="youtube"
                        value={form.socialLinks.youtube}
                        onChange={handleSocialChange}
                        placeholder="https://youtube.com/yourchannel"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <div className="space-y-6 animate-fade-in">
              {/* Maintenance Mode Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Maintenance Mode
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-br from-slate-50 to-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        form.isMaintenanceMode 
                          ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30' 
                          : 'bg-gradient-to-br from-slate-200 to-slate-300'
                      }`}>
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Enable Maintenance Mode</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          When enabled, visitors will see a maintenance page
                        </p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isMaintenanceMode}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, isMaintenanceMode: e.target.checked }));
                          setUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-rose-600 shadow-inner"></div>
                    </label>
                  </div>

                  {form.isMaintenanceMode && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-800">Warning: Site is in maintenance mode</p>
                          <p className="text-sm text-red-600 mt-1">
                            Your website is currently not accessible to visitors. Only administrators can access the site.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Save Button (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 md:hidden z-40">
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>

        <div className="h-24 md:hidden" />
      </form>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SettingsForm;
