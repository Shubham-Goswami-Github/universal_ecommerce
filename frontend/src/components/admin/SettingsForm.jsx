// src/components/admin/SettingsForm.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const ICON_OPTIONS = [
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'shield', label: 'Shield' },
  { value: 'returns', label: 'Returns' },
  { value: 'support', label: 'Support' },
  { value: 'star', label: 'Star' },
  { value: 'shipping-box', label: 'Box' },
  { value: 'gift', label: 'Gift' }
];

const createContentItem = (item = {}) => ({
  icon: item.icon || 'sparkles',
  title: item.title || '',
  description: item.description || ''
});

const createStatItem = (item = {}) => ({
  value: item.value || '',
  label: item.label || ''
});

const DEFAULT_HOME_HERO_STATS = [
  createStatItem({ value: '50K+', label: 'Happy Customers' }),
  createStatItem({ value: '1000+', label: 'Products' }),
  createStatItem({ value: '99%', label: 'Satisfaction' })
];

const DEFAULT_HOME_HERO_HIGHLIGHTS = [
  createContentItem({ icon: 'shipping', title: 'Free Shipping', description: 'On orders over Rs499' }),
  createContentItem({ icon: 'star', title: 'Top Rated', description: '4.9 Average' })
];

const DEFAULT_HOME_TRUST_BADGES = [
  createContentItem({ icon: 'shipping', title: 'Free Shipping', description: 'On orders over Rs499' }),
  createContentItem({ icon: 'shield', title: 'Secure Payment', description: '100% Protected' }),
  createContentItem({ icon: 'returns', title: 'Easy Returns', description: '7-Day Returns' }),
  createContentItem({ icon: 'support', title: '24/7 Support', description: 'Dedicated Help' })
];

const DEFAULT_HOME_FEATURE_ITEMS = [
  createContentItem({ icon: 'shield', title: 'Secure Payment', description: 'Multiple secure payment options including cards, UPI, and wallets.' }),
  createContentItem({ icon: 'shipping-box', title: 'Fast Delivery', description: 'Quick and reliable shipping to your doorstep within 2-5 days.' }),
  createContentItem({ icon: 'returns', title: 'Easy Returns', description: 'Hassle-free 7-day return policy with full refund guarantee.' }),
  createContentItem({ icon: 'support', title: '24/7 Support', description: 'Round-the-clock customer support for all your queries.' })
];

const BACKGROUND_REPEAT_OPTIONS = [
  { value: 'no-repeat', label: 'No Repeat' },
  { value: 'repeat', label: 'Repeat' },
  { value: 'repeat-x', label: 'Repeat X' },
  { value: 'repeat-y', label: 'Repeat Y' }
];

const BACKGROUND_SIZE_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'auto', label: 'Auto' }
];

const SectionCard = ({ title, subtitle, icon, gradient, children }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <div className={`${gradient} px-4 sm:px-6 py-4`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-white/80 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

const InputField = ({ label, hint, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
    )}
    <input
      {...props}
      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 
        focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200
        hover:border-slate-300"
    />
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

const UploadBox = ({ id, label, hint, uploading, onUpload, accept = "image/*", cloudinaryBadge = true }) => (
  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group">
    <input
      type="file"
      accept={accept}
      onChange={onUpload}
      className="hidden"
      id={id}
    />
    <label htmlFor={id} className="cursor-pointer block">
      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {uploading ? (
          <svg className="w-7 h-7 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
      </div>
      <p className="text-sm font-semibold text-slate-700">
        {uploading ? 'Uploading...' : label}
      </p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {cloudinaryBadge && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2-15.86c3.94.49 7 3.85 7 7.93s-3.06 7.44-7 7.93V4.07z"/>
          </svg>
          Cloudinary CDN
        </div>
      )}
    </label>
  </div>
);

const PreviewBox = ({ label, hasImage, imageUrl, onRemove, aspectRatio = "aspect-square" }) => (
  <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-4 border border-slate-200">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Preview</h4>
      <span className={`w-2 h-2 rounded-full ${hasImage ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
    </div>
    <div className={`${aspectRatio} bg-white rounded-xl border-2 border-slate-200 overflow-hidden flex items-center justify-center`}>
      {hasImage ? (
        <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="text-center text-slate-400 p-4">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs">No {label}</p>
        </div>
      )}
    </div>
    {hasImage && (
      <button
        type="button"
        onClick={onRemove}
        className="mt-3 w-full py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Remove
      </button>
    )}
  </div>
);

const SettingsForm = ({ token, settings: initialSettings, onSaved }) => {
  const [form, setForm] = useState({
    siteName: '',
    logoUrl: '',
    tabName: '',
    tabIconUrl: '',
    homepageTitle: '',
    homepageSubtitle: '',
    heroBannerImages: [],
    heroBannerSettings: {
      autoSlide: true,
      slideSpeed: 3000,
      slideDirection: 'left',
      imageSize: 'cover',
      borderColor: 'transparent',
      borderWidth: 0,
      overlayColor: '#0f172a',
      overlayOpacity: 35
    },
    homeHeroTagline: '',
    homeHeroStats: DEFAULT_HOME_HERO_STATS,
    homeHeroHighlights: DEFAULT_HOME_HERO_HIGHLIGHTS,
    homeTrustBadges: DEFAULT_HOME_TRUST_BADGES,
    homeFeatureItems: DEFAULT_HOME_FEATURE_ITEMS,
    featuredText: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    footerText: '',
    isMaintenanceMode: false,
    homeBackgroundColor: '#f8fafc',
    homeBackgroundImage: '',
    homeBackgroundRepeat: 'no-repeat',
    homeBackgroundSize: 'cover',
    homeBackgroundOpacity: 100,
    homeBackgroundFitScreen: false,
    homeBackgroundWidth: 'auto',
    homeBackgroundHeight: 'auto',
    restBackgroundColor: '#ffffff',
    restBackgroundImage: '',
    restBackgroundRepeat: 'no-repeat',
    restBackgroundSize: 'cover',
    restBackgroundFitScreen: false,
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({
    logoUrl: false,
    tabIconUrl: false,
    homeBackgroundImage: false,
    restBackgroundImage: false,
    banner: false
  });
  const [activeTab, setActiveTab] = useState('general');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [uploadPopup, setUploadPopup] = useState({ show: false, imageUrl: '', type: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setForm({
        siteName: initialSettings.siteName || '',
        logoUrl: initialSettings.logoUrl || '',
        tabName: initialSettings.tabName || initialSettings.siteName || '',
        tabIconUrl: initialSettings.tabIconUrl || '',
        homepageTitle: initialSettings.homepageTitle || '',
        homepageSubtitle: initialSettings.homepageSubtitle || '',
        heroBannerImages: initialSettings.heroBannerImages || [],
        heroBannerSettings: {
          autoSlide: initialSettings.heroBannerSettings?.autoSlide ?? true,
          slideSpeed: initialSettings.heroBannerSettings?.slideSpeed || 3000,
          slideDirection: initialSettings.heroBannerSettings?.slideDirection || 'left',
          imageSize: initialSettings.heroBannerSettings?.imageSize || 'cover',
          borderColor: initialSettings.heroBannerSettings?.borderColor || 'transparent',
          borderWidth: initialSettings.heroBannerSettings?.borderWidth || 0,
          overlayColor: initialSettings.heroBannerSettings?.overlayColor || '#0f172a',
          overlayOpacity: initialSettings.heroBannerSettings?.overlayOpacity ?? 35
        },
        homeHeroTagline: initialSettings.homeHeroTagline || '',
        homeHeroStats: initialSettings.homeHeroStats?.length
          ? initialSettings.homeHeroStats.map(createStatItem)
          : DEFAULT_HOME_HERO_STATS,
        homeHeroHighlights: initialSettings.homeHeroHighlights?.length
          ? initialSettings.homeHeroHighlights.map(createContentItem)
          : DEFAULT_HOME_HERO_HIGHLIGHTS,
        homeTrustBadges: initialSettings.homeTrustBadges?.length
          ? initialSettings.homeTrustBadges.map(createContentItem)
          : DEFAULT_HOME_TRUST_BADGES,
        homeFeatureItems: initialSettings.homeFeatureItems?.length
          ? initialSettings.homeFeatureItems.map(createContentItem)
          : DEFAULT_HOME_FEATURE_ITEMS,
        featuredText: initialSettings.featuredText || '',
        contactEmail: initialSettings.contactEmail || '',
        contactPhone: initialSettings.contactPhone || '',
        address: initialSettings.address || '',
        footerText: initialSettings.footerText || '',
        isMaintenanceMode: initialSettings.isMaintenanceMode || false,
        homeBackgroundColor: initialSettings.homeBackgroundColor || '#f8fafc',
        homeBackgroundImage: initialSettings.homeBackgroundImage || '',
        homeBackgroundRepeat: initialSettings.homeBackgroundRepeat || 'no-repeat',
        homeBackgroundSize: initialSettings.homeBackgroundSize || 'cover',
        homeBackgroundOpacity: initialSettings.homeBackgroundOpacity ?? 100,
        homeBackgroundFitScreen: initialSettings.homeBackgroundFitScreen || false,
        homeBackgroundWidth: initialSettings.homeBackgroundWidth || 'auto',
        homeBackgroundHeight: initialSettings.homeBackgroundHeight || 'auto',
        restBackgroundColor: initialSettings.restBackgroundColor || initialSettings.backgroundColor || '#ffffff',
        restBackgroundImage: initialSettings.restBackgroundImage || initialSettings.backgroundImage || '',
        restBackgroundRepeat: initialSettings.restBackgroundRepeat || initialSettings.backgroundRepeat || 'no-repeat',
        restBackgroundSize: initialSettings.restBackgroundSize || initialSettings.backgroundSize || 'cover',
        restBackgroundFitScreen: initialSettings.restBackgroundFitScreen || false,
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

  const showUploadPopup = (imageUrl, type) => {
    setUploadPopup({ show: true, imageUrl, type });
    setTimeout(() => {
      setUploadPopup({ show: false, imageUrl: '', type: '' });
    }, 3000);
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

  const createArrayItem = (field) => {
    if (field === 'homeHeroStats') return createStatItem();
    return createContentItem();
  };

  const handleArrayItemChange = (field, index, key, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
    setUnsavedChanges(true);
  };

  const handleAddArrayItem = (field) => {
    setForm((current) => ({
      ...current,
      [field]: [...current[field], createArrayItem(field)]
    }));
    setUnsavedChanges(true);
  };

  const handleRemoveArrayItem = (field, index) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index)
    }));
    setUnsavedChanges(true);
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadConfig = {
      logoUrl: { label: 'Logo', acceptSvgOnly: false },
      tabIconUrl: { label: 'Tab icon', acceptSvgOnly: true },
      homeBackgroundImage: { label: 'Home background', acceptSvgOnly: false },
      restBackgroundImage: { label: 'Rest pages background', acceptSvgOnly: false }
    };
    const config = uploadConfig[field] || { label: 'Image', acceptSvgOnly: false };

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please upload an image file');
      return;
    }

    if (config.acceptSvgOnly) {
      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
      if (!isSvg) {
        showNotification('error', 'Please upload an SVG file for the tab icon');
        return;
      }
    }

    const fd = new FormData();
    fd.append('image', file);

    try {
      setUploading((prev) => ({ ...prev, [field]: true }));
      
      const res = await axiosClient.post('/api/upload/image', fd, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });

      if (res.data.success) {
        const cloudinaryUrl = res.data.url;
        setForm((f) => ({ ...f, [field]: cloudinaryUrl }));
        setUnsavedChanges(true);
        showUploadPopup(cloudinaryUrl, config.label);
        showNotification('success', `${config.label} uploaded to Cloudinary!`);
      }
    } catch (err) {
      console.error('Upload error', err);
      showNotification('error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
      e.target.value = '';
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
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });

      if (res.data.success) {
        const cloudinaryUrl = res.data.url;
        
        setForm((f) => ({
          ...f,
          heroBannerImages: [...f.heroBannerImages, { url: cloudinaryUrl, link: '' }]
        }));
        setUnsavedChanges(true);
        showUploadPopup(cloudinaryUrl, 'Banner');
        showNotification('success', 'Banner image uploaded to Cloudinary!');
      }
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
    { id: 'general', label: 'General', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'blue' },
    { id: 'hero', label: 'Hero Banner', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'purple' },
    { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', color: 'pink' },
    { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'emerald' },
    { id: 'advanced', label: 'Advanced', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* Upload Success Popup */}
      {uploadPopup.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-bounce-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-green-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Upload Complete!</h3>
              <p className="text-slate-500 text-sm mb-4">{uploadPopup.type} uploaded successfully</p>
              <div className="bg-slate-100 rounded-2xl p-3 mb-4">
                <img src={uploadPopup.imageUrl} alt="Uploaded" className="max-h-40 mx-auto rounded-xl object-contain" />
              </div>
              <button
                onClick={() => setUploadPopup({ show: false, imageUrl: '', type: '' })}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-slide-down ${
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
          <span className="font-medium text-sm sm:text-base">{notification.message}</span>
          <button onClick={() => setNotification({ show: false, type: '', message: '' })} className="ml-2 hover:opacity-80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="pb-32 sm:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent truncate">
                  Site Settings
                </h1>
                <p className="text-slate-500 text-sm mt-0.5 hidden sm:block">
                  Customize your website appearance and configuration
                </p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {unsavedChanges && (
                  <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                    Unsaved
                  </span>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
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
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Tabs Navigation */}
          <div className="mb-6">
            {/* Mobile Tab Selector */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tabs.find(t => t.id === activeTab)?.icon} />
                  </svg>
                  <span className="font-semibold text-slate-700">{tabs.find(t => t.id === activeTab)?.label}</span>
                </div>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {mobileMenuOpen && (
                <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden animate-fade-in">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      <span className="font-medium">{tab.label}</span>
                      {activeTab === tab.id && (
                        <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Tabs */}
            <div className="hidden sm:block bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-1.5">
              <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6 animate-fade-in">
            {/* General Settings */}
            {activeTab === 'general' && (
              <>
                <SectionCard
                  title="Site Identity"
                  subtitle="Basic information about your website"
                  icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  gradient="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="Site Name"
                      name="siteName"
                      value={form.siteName}
                      onChange={handleChange}
                      placeholder="My Awesome Store"
                    />
                    <InputField
                      label="Browser Tab Name"
                      name="tabName"
                      value={form.tabName}
                      onChange={handleChange}
                      placeholder="My Store | Best Products"
                      hint="Shows in browser tab title"
                    />
                    <InputField
                      label="Homepage Title"
                      name="homepageTitle"
                      value={form.homepageTitle}
                      onChange={handleChange}
                      placeholder="Welcome to Our Store"
                    />
                    <InputField
                      label="Hero Tagline"
                      name="homeHeroTagline"
                      value={form.homeHeroTagline}
                      onChange={handleChange}
                      placeholder="New Collection 2024"
                    />
                    <div className="sm:col-span-2">
                      <InputField
                        label="Homepage Subtitle"
                        name="homepageSubtitle"
                        value={form.homepageSubtitle}
                        onChange={handleChange}
                        placeholder="Discover amazing products at unbeatable prices"
                      />
                    </div>
                    <InputField
                      label="Featured Text"
                      name="featuredText"
                      value={form.featuredText}
                      onChange={handleChange}
                      placeholder="🔥 Featured Products"
                    />
                    <InputField
                      label="Footer Text"
                      name="footerText"
                      value={form.footerText}
                      onChange={handleChange}
                      placeholder="© 2024 Your Company. All rights reserved."
                    />
                  </div>
                </SectionCard>

                {/* Hero Stats */}
                <SectionCard
                  title="Hero Statistics"
                  subtitle="Numbers that impress your visitors"
                  icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  gradient="bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">Add statistics like "50K+ Happy Customers"</p>
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('homeHeroStats')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>
                    {form.homeHeroStats.map((item, index) => (
                      <div key={`stat-${index}`} className="flex flex-col sm:flex-row gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleArrayItemChange('homeHeroStats', index, 'value', e.target.value)}
                          placeholder="50K+"
                          className="flex-1 sm:w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleArrayItemChange('homeHeroStats', index, 'label', e.target.value)}
                          placeholder="Happy Customers"
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('homeHeroStats', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Trust Badges */}
                <SectionCard
                  title="Trust Badge Strip"
                  subtitle="Build trust with shipping, payment, and support badges"
                  icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  gradient="bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">Badges shown below the hero banner</p>
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('homeTrustBadges')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-semibold hover:bg-violet-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Badge
                      </button>
                    </div>
                    {form.homeTrustBadges.map((item, index) => (
                      <div key={`badge-${index}`} className="grid gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 sm:grid-cols-[120px_1fr_1fr_auto]">
                        <select
                          value={item.icon}
                          onChange={(e) => handleArrayItemChange('homeTrustBadges', index, 'icon', e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleArrayItemChange('homeTrustBadges', index, 'title', e.target.value)}
                          placeholder="Title"
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleArrayItemChange('homeTrustBadges', index, 'description', e.target.value)}
                          placeholder="Description"
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('homeTrustBadges', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Feature Items */}
                <SectionCard
                  title="Bottom Features Section"
                  subtitle="Highlight key features with icons and descriptions"
                  icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  gradient="bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">Feature cards at the bottom of homepage</p>
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('homeFeatureItems')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Feature
                      </button>
                    </div>
                    {form.homeFeatureItems.map((item, index) => (
                      <div key={`feature-${index}`} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            value={item.icon}
                            onChange={(e) => handleArrayItemChange('homeFeatureItems', index, 'icon', e.target.value)}
                            className="sm:w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          >
                            {ICON_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleArrayItemChange('homeFeatureItems', index, 'title', e.target.value)}
                            placeholder="Feature Title"
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem('homeFeatureItems', index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleArrayItemChange('homeFeatureItems', index, 'description', e.target.value)}
                          rows={2}
                          placeholder="Feature description..."
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Browser Tab Settings */}
                <SectionCard
                  title="Browser Tab Icon (Favicon)"
                  subtitle="Upload an SVG icon for browser tabs"
                  icon="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  gradient="bg-gradient-to-r from-sky-600 to-cyan-600"
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
                    <UploadBox
                      id="tab-icon-upload"
                      label="Click to upload favicon"
                      hint="SVG only, up to 5MB"
                      uploading={uploading.tabIconUrl}
                      onUpload={(e) => handleUpload(e, 'tabIconUrl')}
                      accept=".svg,image/svg+xml"
                    />
                    <PreviewBox
                      label="favicon"
                      hasImage={!!form.tabIconUrl}
                      imageUrl={form.tabIconUrl}
                      onRemove={() => handleRemoveImage('tabIconUrl')}
                    />
                  </div>
                </SectionCard>
              </>
            )}

            {/* Hero Banner Settings */}
            {activeTab === 'hero' && (
              <>
                <SectionCard
                  title="Banner Images"
                  subtitle="Add images for the hero slideshow"
                  icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  gradient="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                      <UploadBox
                        id="banner-upload"
                        label="Add Banner Image"
                        hint="Recommended: 1920x600px"
                        uploading={uploading.banner}
                        onUpload={handleBannerImageUpload}
                      />
                      {form.heroBannerImages.length > 0 && (
                        <div className="bg-gradient-to-br from-slate-50 to-purple-50/50 rounded-2xl p-4 border border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Latest Upload</h4>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                              {form.heroBannerImages.length} image{form.heroBannerImages.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="aspect-video bg-white rounded-xl overflow-hidden border-2 border-white shadow-sm">
                            <img
                              src={form.heroBannerImages[form.heroBannerImages.length - 1].url}
                              alt="Latest Banner"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {form.heroBannerImages.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                          <span>All Banner Images</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                            {form.heroBannerImages.length}
                          </span>
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {form.heroBannerImages.map((img, index) => (
                            <div key={index} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                              <div className="w-24 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                                <img src={img.url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-slate-700">Image {index + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBannerImage(index)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                <input
                                  type="url"
                                  value={img.link || ''}
                                  onChange={(e) => handleBannerLinkChange(index, e.target.value)}
                                  placeholder="Link URL (optional)"
                                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* Slideshow Settings */}
                <SectionCard
                  title="Slideshow Settings"
                  subtitle="Configure how the banner slides"
                  icon="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  gradient="bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  <div className="space-y-6">
                    {/* Auto Slide Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <h3 className="font-semibold text-slate-800">Auto Slide</h3>
                        <p className="text-sm text-slate-500">Automatically cycle through images</p>
                      </div>
                      <div className="flex gap-2">
                        {['Yes', 'No'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setForm(f => ({
                                ...f,
                                heroBannerSettings: { ...f.heroBannerSettings, autoSlide: option === 'Yes' }
                              }));
                              setUnsavedChanges(true);
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              (option === 'Yes' ? form.heroBannerSettings.autoSlide : !form.heroBannerSettings.autoSlide)
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {form.heroBannerSettings.autoSlide && (
                      <>
                        {/* Slide Speed */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="font-semibold text-slate-700">Slide Speed</label>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                              {form.heroBannerSettings.slideSpeed / 1000}s
                            </span>
                          </div>
                          <input
                            type="range"
                            name="slideSpeed"
                            min="1000"
                            max="10000"
                            step="500"
                            value={form.heroBannerSettings.slideSpeed}
                            onChange={handleBannerSettingsChange}
                            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                          />
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>1s (Fast)</span>
                            <span>10s (Slow)</span>
                          </div>
                        </div>

                        {/* Slide Direction */}
                        <div className="space-y-2">
                          <label className="font-semibold text-slate-700">Slide Direction</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'left', label: 'Left', icon: 'M15 19l-7-7 7-7' },
                              { value: 'right', label: 'Right', icon: 'M9 5l7 7-7 7' }
                            ].map((dir) => (
                              <button
                                key={dir.value}
                                type="button"
                                onClick={() => {
                                  setForm(f => ({
                                    ...f,
                                    heroBannerSettings: { ...f.heroBannerSettings, slideDirection: dir.value }
                                  }));
                                  setUnsavedChanges(true);
                                }}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                                  form.heroBannerSettings.slideDirection === dir.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={dir.icon} />
                                </svg>
                                {dir.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Image Size */}
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-700">Image Fit</label>
                      <select
                        name="imageSize"
                        value={form.heroBannerSettings.imageSize}
                        onChange={handleBannerSettingsChange}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="cover">Cover (Fill area, may crop)</option>
                        <option value="contain">Contain (Show full image)</option>
                        <option value="auto">Auto (Original size)</option>
                      </select>
                    </div>

                    {/* Border Settings */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="font-semibold text-slate-700">Border Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={form.heroBannerSettings.borderColor === 'transparent' ? '#ffffff' : form.heroBannerSettings.borderColor}
                            onChange={(e) => {
                              setForm(f => ({
                                ...f,
                                heroBannerSettings: { ...f.heroBannerSettings, borderColor: e.target.value }
                              }));
                              setUnsavedChanges(true);
                            }}
                            className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-200"
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
                            className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-sm focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold text-slate-700">Border Width</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            name="borderWidth"
                            min="0"
                            max="20"
                            value={form.heroBannerSettings.borderWidth}
                            onChange={handleBannerSettingsChange}
                            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 focus:border-blue-500"
                          />
                          <span className="text-slate-500 font-medium">px</span>
                        </div>
                      </div>
                    </div>

                    {/* Overlay Settings */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="font-semibold text-slate-700">Overlay Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={form.heroBannerSettings.overlayColor}
                            onChange={(e) => {
                              setForm(f => ({
                                ...f,
                                heroBannerSettings: { ...f.heroBannerSettings, overlayColor: e.target.value }
                              }));
                              setUnsavedChanges(true);
                            }}
                            className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-200"
                          />
                          <input
                            type="text"
                            value={form.heroBannerSettings.overlayColor}
                            onChange={(e) => {
                              setForm(f => ({
                                ...f,
                                heroBannerSettings: { ...f.heroBannerSettings, overlayColor: e.target.value }
                              }));
                              setUnsavedChanges(true);
                            }}
                            className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-sm focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold text-slate-700">Overlay Opacity</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.heroBannerSettings.overlayOpacity}
                            onChange={(e) => {
                              setForm(f => ({
                                ...f,
                                heroBannerSettings: { ...f.heroBannerSettings, overlayOpacity: Number(e.target.value) }
                              }));
                              setUnsavedChanges(true);
                            }}
                            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 focus:border-blue-500"
                          />
                          <span className="text-slate-500 font-medium">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Hero Highlights */}
                <SectionCard
                  title="Hero Highlight Cards"
                  subtitle="Cards shown beside the hero image"
                  icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  gradient="bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">Small feature cards next to hero</p>
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('homeHeroHighlights')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Card
                      </button>
                    </div>
                    {form.homeHeroHighlights.map((item, index) => (
                      <div key={`highlight-${index}`} className="grid gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 sm:grid-cols-[120px_1fr_1fr_auto]">
                        <select
                          value={item.icon}
                          onChange={(e) => handleArrayItemChange('homeHeroHighlights', index, 'icon', e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleArrayItemChange('homeHeroHighlights', index, 'title', e.target.value)}
                          placeholder="Title"
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500"
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleArrayItemChange('homeHeroHighlights', index, 'description', e.target.value)}
                          placeholder="Description"
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('homeHeroHighlights', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <>
                <SectionCard
                  title="Site Logo"
                  subtitle="Upload your brand logo"
                  icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  gradient="bg-gradient-to-r from-pink-600 to-rose-600"
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
                    <UploadBox
                      id="logo-upload"
                      label="Click to upload logo"
                      hint="PNG, JPG, SVG up to 5MB"
                      uploading={uploading.logoUrl}
                      onUpload={(e) => handleUpload(e, 'logoUrl')}
                    />
                    <PreviewBox
                      label="logo"
                      hasImage={!!form.logoUrl}
                      imageUrl={form.logoUrl}
                      onRemove={() => handleRemoveImage('logoUrl')}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Home Page Background"
                  subtitle="Apply only on the home page without changing the hero banner"
                  icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  gradient="bg-gradient-to-r from-indigo-600 to-violet-600"
                >
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                      <div className="space-y-4">
                        <UploadBox
                          id="home-bg-upload"
                          label="Click to upload home background"
                          hint="Recommended: 1920x1080px"
                          uploading={uploading.homeBackgroundImage}
                          onUpload={(e) => handleUpload(e, 'homeBackgroundImage')}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Background Color</label>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                name="homeBackgroundColor"
                                value={form.homeBackgroundColor}
                                onChange={handleChange}
                                className="h-11 w-14 rounded-xl border-2 border-slate-200 bg-white p-1"
                              />
                              <input
                                type="text"
                                name="homeBackgroundColor"
                                value={form.homeBackgroundColor}
                                onChange={handleChange}
                                className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Size</label>
                            <select
                              name="homeBackgroundSize"
                              value={form.homeBackgroundSize}
                              onChange={handleChange}
                              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500"
                            >
                              {BACKGROUND_SIZE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                              <option value="custom">Custom Width / Height</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Repeat</label>
                            <select
                              name="homeBackgroundRepeat"
                              value={form.homeBackgroundRepeat}
                              onChange={handleChange}
                              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500"
                            >
                              {BACKGROUND_REPEAT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Opacity</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                name="homeBackgroundOpacity"
                                value={form.homeBackgroundOpacity}
                                onChange={handleChange}
                                className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500"
                              />
                              <span className="text-sm font-medium text-slate-500">%</span>
                            </div>
                          </div>
                        </div>
                        {form.homeBackgroundSize === 'custom' && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <InputField
                              label="Custom Width"
                              name="homeBackgroundWidth"
                              value={form.homeBackgroundWidth}
                              onChange={handleChange}
                              placeholder="100%, 1200px, auto"
                            />
                            <InputField
                              label="Custom Height"
                              name="homeBackgroundHeight"
                              value={form.homeBackgroundHeight}
                              onChange={handleChange}
                              placeholder="100vh, 700px, auto"
                            />
                          </div>
                        )}
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <input
                            type="checkbox"
                            name="homeBackgroundFitScreen"
                            checked={form.homeBackgroundFitScreen}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Fit To Screen</div>
                            <p className="text-xs text-slate-500">Viewport ke hisaab se background ko fit rakhta hai.</p>
                          </div>
                        </label>
                      </div>
                      <PreviewBox
                        label="home background"
                        hasImage={!!form.homeBackgroundImage}
                        imageUrl={form.homeBackgroundImage}
                        onRemove={() => handleRemoveImage('homeBackgroundImage')}
                        aspectRatio="aspect-video"
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Rest Pages Background"
                  subtitle="Apply on all non-home user pages"
                  icon="M3 3h18v18H3V3zm4 4h10v10H7V7z"
                  gradient="bg-gradient-to-r from-sky-600 to-cyan-600"
                >
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                      <div className="space-y-4">
                        <UploadBox
                          id="rest-bg-upload"
                          label="Click to upload rest pages background"
                          hint="Products, categories, profile aur baki non-home pages ke liye"
                          uploading={uploading.restBackgroundImage}
                          onUpload={(e) => handleUpload(e, 'restBackgroundImage')}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Background Color</label>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                name="restBackgroundColor"
                                value={form.restBackgroundColor}
                                onChange={handleChange}
                                className="h-11 w-14 rounded-xl border-2 border-slate-200 bg-white p-1"
                              />
                              <input
                                type="text"
                                name="restBackgroundColor"
                                value={form.restBackgroundColor}
                                onChange={handleChange}
                                className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-sky-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Size</label>
                            <select
                              name="restBackgroundSize"
                              value={form.restBackgroundSize}
                              onChange={handleChange}
                              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-sky-500"
                            >
                              {BACKGROUND_SIZE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Repeat</label>
                          <select
                            name="restBackgroundRepeat"
                            value={form.restBackgroundRepeat}
                            onChange={handleChange}
                            className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm focus:border-sky-500"
                          >
                            {BACKGROUND_REPEAT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <input
                            type="checkbox"
                            name="restBackgroundFitScreen"
                            checked={form.restBackgroundFitScreen}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-700">Fit To Screen</div>
                            <p className="text-xs text-slate-500">Viewport ke saath background ko fixed rakhta hai.</p>
                          </div>
                        </label>
                      </div>
                      <PreviewBox
                        label="rest pages background"
                        hasImage={!!form.restBackgroundImage}
                        imageUrl={form.restBackgroundImage}
                        onRemove={() => handleRemoveImage('restBackgroundImage')}
                        aspectRatio="aspect-video"
                      />
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Contact Settings */}
            {activeTab === 'contact' && (
              <>
                <SectionCard
                  title="Contact Information"
                  subtitle="How customers can reach you"
                  icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  gradient="bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InputField
                        label="Email Address"
                        type="email"
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleChange}
                        placeholder="contact@example.com"
                      />
                      <InputField
                        label="Phone Number"
                        type="tel"
                        name="contactPhone"
                        value={form.contactPhone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">Address</label>
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Your full business address"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none"
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Social Media"
                  subtitle="Connect your social profiles"
                  icon="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  gradient="bg-gradient-to-r from-pink-600 to-rose-600"
                >
                  <div className="space-y-4">
                    {[
                      { name: 'facebook', label: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', color: 'blue', placeholder: 'https://facebook.com/yourpage' },
                      { name: 'instagram', label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', color: 'pink', placeholder: 'https://instagram.com/yourprofile' },
                      { name: 'twitter', label: 'Twitter / X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', color: 'sky', placeholder: 'https://twitter.com/yourhandle' },
                      { name: 'youtube', label: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', color: 'red', placeholder: 'https://youtube.com/yourchannel' }
                    ].map((social) => (
                      <div key={social.name} className="flex items-center gap-3">
                        <div className={`w-11 h-11 bg-${social.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <svg className={`w-5 h-5 text-${social.color}-600`} fill="currentColor" viewBox="0 0 24 24">
                            <path d={social.icon} />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <input
                            type="url"
                            name={social.name}
                            value={form.socialLinks[social.name]}
                            onChange={handleSocialChange}
                            placeholder={social.placeholder}
                            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-700 placeholder-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </>
            )}

            {/* Advanced Settings */}
            {activeTab === 'advanced' && (
              <SectionCard
                title="Maintenance Mode"
                subtitle="Take your site offline for updates"
                icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                gradient="bg-gradient-to-r from-red-600 to-rose-600"
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-br from-slate-50 to-red-50/50 rounded-2xl border border-red-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
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
                        <h3 className="font-bold text-slate-800 text-lg">Enable Maintenance Mode</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Visitors will see a "Site Under Maintenance" page
                        </p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={form.isMaintenanceMode}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, isMaintenanceMode: e.target.checked }));
                          setUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-rose-600 shadow-inner"></div>
                    </label>
                  </div>

                  {form.isMaintenanceMode && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-red-800">Site is currently offline!</p>
                        <p className="text-sm text-red-600 mt-0.5">
                          Only administrators can access the site. Remember to turn this off when done!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        </div>

        {/* Floating Save Button (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent sm:hidden z-50">
          <div className="flex items-center gap-3">
            {unsavedChanges && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                Unsaved
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 disabled:opacity-60 active:scale-[0.98] transition-transform"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }

        @media (min-width: 640px) {
          @keyframes slide-down {
            from {
              transform: translateX(0) translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(0) translateY(0);
              opacity: 1;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsForm;
