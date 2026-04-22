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

const DEFAULT_HOME_PROMO_BANNER_BADGE = 'Limited Time';
const DEFAULT_HOME_PROMO_BANNER_TITLE = 'Fresh deals with a premium storefront feel';
const DEFAULT_HOME_PROMO_BANNER_DESCRIPTION = 'Curated sale picks, elevated visuals, and quick actions that keep the homepage polished without changing any shopping flow.';
const PROMO_PRODUCT_LIMIT_OPTIONS = [1, 2, 3, 4];

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

const getCategoryId = (category) => {
  if (!category) return '';
  if (typeof category === 'string') return category;
  return category._id || '';
};

const getProductCategoryMeta = (product) => {
  const category = product?.category;
  const parent = category?.parent;
  const hasParent = Boolean(parent);

  return {
    superId: hasParent ? getCategoryId(parent) : getCategoryId(category),
    superName: hasParent ? parent?.name || 'Uncategorized' : category?.name || 'Uncategorized',
    subId: hasParent ? getCategoryId(category) : '',
    subName: hasParent ? category?.name || '' : '',
  };
};

/* ── Redesigned Sub-components (Untitled UI Style) ── */

const SectionRow = ({ title, subtitle, children, noBorder }) => (
  <div className={`py-5 sm:py-6 ${noBorder ? '' : 'border-b border-gray-200'}`}>
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
      <div className="lg:w-[280px] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  </div>
);

const InputField = ({ label, hint, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-gray-700">{label}</label>
    )}
    <input
      {...props}
      className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm
        focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-150
        hover:border-gray-400"
    />
    {hint && <p className="text-xs text-gray-500">{hint}</p>}
  </div>
);

const UploadBox = ({ id, label, hint, uploading, onUpload, accept = "image/*", cloudinaryBadge = true }) => (
  <div className="border border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer group">
    <input
      type="file"
      accept={accept}
      onChange={onUpload}
      className="hidden"
      id={id}
    />
    <label htmlFor={id} className="cursor-pointer block">
      <div className="w-10 h-10 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
        {uploading ? (
          <svg className="w-5 h-5 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
      </div>
      <p className="text-sm font-medium text-gray-700">
        {uploading ? 'Uploading...' : label}
      </p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      {cloudinaryBadge && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2-15.86c3.94.49 7 3.85 7 7.93s-3.06 7.44-7 7.93V4.07z" />
          </svg>
          Cloudinary CDN
        </div>
      )}
    </label>
  </div>
);

const PreviewBox = ({ label, hasImage, imageUrl, onRemove, aspectRatio = "aspect-square" }) => (
  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</h4>
      <span className={`w-2 h-2 rounded-full ${hasImage ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
    </div>
    <div className={`${aspectRatio} bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center`}>
      {hasImage ? (
        <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="text-center text-gray-400 p-4">
          <svg className="w-8 h-8 mx-auto mb-1.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        className="mt-2 w-full py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    heroBannerFallbackColor: '#ffffff',
    heroBannerFallbackAccentPrimary: '#2cd6e2',
    heroBannerFallbackAccentSecondary: '#0056b3',
    heroBannerFallbackImage: '',
    heroBannerFallbackRepeat: 'no-repeat',
    heroBannerFallbackSize: 'cover',
    heroBannerFallbackFitScreen: false,
    homeHeroTagline: '',
    homeAccentPrimary: '#0056b3',
    homeAccentSecondary: '#00a0ff',
    homeAnnouncementEnabled: true,
    homeAnnouncementText: '🎉 Free shipping on orders over ₹499 | Use code: WELCOME10 for 10% off',
    homeNewsletterEnabled: true,
    homeNewsletterBadgeText: 'Join 10,000+ subscribers',
    homeNewsletterTitle: 'Stay Updated',
    homeNewsletterDescription: 'Subscribe to get exclusive offers, new arrivals updates, and special discounts directly in your inbox.',
    homeNewsletterInputPlaceholder: 'Enter your email',
    homeNewsletterButtonLabel: 'Subscribe',
    homeNewsletterButtonLink: '',
    homePromoBannerEnabled: true,
    homePromoBannerBadgeText: DEFAULT_HOME_PROMO_BANNER_BADGE,
    homePromoBannerTitle: DEFAULT_HOME_PROMO_BANNER_TITLE,
    homePromoBannerDescription: DEFAULT_HOME_PROMO_BANNER_DESCRIPTION,
    homePromoBannerProductCount: 4,
    homePromoBannerProductIds: [],
    homePromoBannerBackgroundMode: 'gradient',
    homePromoBannerBackgroundColor: '#0f766e',
    homePromoBannerBackgroundAccentPrimary: '#0ea5e9',
    homePromoBannerBackgroundAccentSecondary: '#065f46',
    homePromoBannerBackgroundImage: '',
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
    homeBackgroundAccentPrimary: '#0056b3',
    homeBackgroundAccentSecondary: '#00a0ff',
    homeBackgroundImage: '',
    homeBackgroundRepeat: 'no-repeat',
    homeBackgroundSize: 'cover',
    homeBackgroundOpacity: 100,
    homeBackgroundFitScreen: false,
    homeBackgroundWidth: 'auto',
    homeBackgroundHeight: 'auto',
    restBackgroundColor: '#ffffff',
    restBackgroundAccentPrimary: '#0056b3',
    restBackgroundAccentSecondary: '#00a0ff',
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
    heroBannerFallbackImage: false,
    homePromoBannerBackgroundImage: false,
    homeBackgroundImage: false,
    restBackgroundImage: false,
    banner: false
  });
  const [activeTab, setActiveTab] = useState('general');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [uploadPopup, setUploadPopup] = useState({ show: false, imageUrl: '', type: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [promoProducts, setPromoProducts] = useState([]);
  const [promoCategories, setPromoCategories] = useState([]);
  const [promoCatalogLoading, setPromoCatalogLoading] = useState(false);
  const [promoFilters, setPromoFilters] = useState({
    superCategoryId: 'all',
    subCategoryId: 'all'
  });

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
        heroBannerFallbackColor: initialSettings.heroBannerFallbackColor || '#ffffff',
        heroBannerFallbackAccentPrimary: initialSettings.heroBannerFallbackAccentPrimary || initialSettings.homeAccentPrimary || '#2cd6e2',
        heroBannerFallbackAccentSecondary: initialSettings.heroBannerFallbackAccentSecondary || initialSettings.homeAccentSecondary || '#0056b3',
        heroBannerFallbackImage: initialSettings.heroBannerFallbackImage || '',
        heroBannerFallbackRepeat: initialSettings.heroBannerFallbackRepeat || 'no-repeat',
        heroBannerFallbackSize: initialSettings.heroBannerFallbackSize || 'cover',
        heroBannerFallbackFitScreen: initialSettings.heroBannerFallbackFitScreen || false,
        homeHeroTagline: initialSettings.homeHeroTagline || '',
        homeAccentPrimary: initialSettings.homeAccentPrimary || '#0056b3',
        homeAccentSecondary: initialSettings.homeAccentSecondary || '#00a0ff',
        homeAnnouncementEnabled: initialSettings.homeAnnouncementEnabled ?? true,
        homeAnnouncementText: initialSettings.homeAnnouncementText || '🎉 Free shipping on orders over ₹499 | Use code: WELCOME10 for 10% off',
        homeNewsletterEnabled: initialSettings.homeNewsletterEnabled ?? true,
        homeNewsletterBadgeText: initialSettings.homeNewsletterBadgeText || 'Join 10,000+ subscribers',
        homeNewsletterTitle: initialSettings.homeNewsletterTitle || 'Stay Updated',
        homeNewsletterDescription: initialSettings.homeNewsletterDescription || 'Subscribe to get exclusive offers, new arrivals updates, and special discounts directly in your inbox.',
        homeNewsletterInputPlaceholder: initialSettings.homeNewsletterInputPlaceholder || 'Enter your email',
        homeNewsletterButtonLabel: initialSettings.homeNewsletterButtonLabel || 'Subscribe',
        homeNewsletterButtonLink: initialSettings.homeNewsletterButtonLink || '',
        homePromoBannerEnabled: initialSettings.homePromoBannerEnabled ?? true,
        homePromoBannerBadgeText: initialSettings.homePromoBannerBadgeText || DEFAULT_HOME_PROMO_BANNER_BADGE,
        homePromoBannerTitle: initialSettings.homePromoBannerTitle || DEFAULT_HOME_PROMO_BANNER_TITLE,
        homePromoBannerDescription: initialSettings.homePromoBannerDescription || DEFAULT_HOME_PROMO_BANNER_DESCRIPTION,
        homePromoBannerProductCount: Number(initialSettings.homePromoBannerProductCount) || 4,
        homePromoBannerProductIds: Array.isArray(initialSettings.homePromoBannerProductIds)
          ? initialSettings.homePromoBannerProductIds
          : [],
        homePromoBannerBackgroundMode: initialSettings.homePromoBannerBackgroundMode || 'gradient',
        homePromoBannerBackgroundColor: initialSettings.homePromoBannerBackgroundColor || '#0f766e',
        homePromoBannerBackgroundAccentPrimary: initialSettings.homePromoBannerBackgroundAccentPrimary || '#0ea5e9',
        homePromoBannerBackgroundAccentSecondary: initialSettings.homePromoBannerBackgroundAccentSecondary || '#065f46',
        homePromoBannerBackgroundImage: initialSettings.homePromoBannerBackgroundImage || '',
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
        homeBackgroundAccentPrimary: initialSettings.homeBackgroundAccentPrimary || initialSettings.homeAccentPrimary || '#0056b3',
        homeBackgroundAccentSecondary: initialSettings.homeBackgroundAccentSecondary || initialSettings.homeAccentSecondary || '#00a0ff',
        homeBackgroundImage: initialSettings.homeBackgroundImage || '',
        homeBackgroundRepeat: initialSettings.homeBackgroundRepeat || 'no-repeat',
        homeBackgroundSize: initialSettings.homeBackgroundSize || 'cover',
        homeBackgroundOpacity: initialSettings.homeBackgroundOpacity ?? 100,
        homeBackgroundFitScreen: initialSettings.homeBackgroundFitScreen || false,
        homeBackgroundWidth: initialSettings.homeBackgroundWidth || 'auto',
        homeBackgroundHeight: initialSettings.homeBackgroundHeight || 'auto',
        restBackgroundColor: initialSettings.restBackgroundColor || initialSettings.backgroundColor || '#ffffff',
        restBackgroundAccentPrimary: initialSettings.restBackgroundAccentPrimary || initialSettings.homeAccentPrimary || '#0056b3',
        restBackgroundAccentSecondary: initialSettings.restBackgroundAccentSecondary || initialSettings.homeAccentSecondary || '#00a0ff',
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

  useEffect(() => {
    const loadPromoCatalog = async () => {
      try {
        setPromoCatalogLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          axiosClient.get('/api/products'),
          axiosClient.get('/api/categories/public/all')
        ]);

        const approvedProducts = (productsRes.data?.products || []).filter(
          (product) => product?.status === 'approved' && product?.isActive !== false
        );

        setPromoProducts(approvedProducts);
        setPromoCategories(categoriesRes.data?.categories || []);
      } catch (error) {
        console.error('Promo catalog load error:', error);
        setPromoProducts([]);
        setPromoCategories([]);
      } finally {
        setPromoCatalogLoading(false);
      }
    };

    loadPromoCatalog();
  }, []);

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
      heroBannerFallbackImage: { label: 'Hero banner background', acceptSvgOnly: false },
      homePromoBannerBackgroundImage: { label: 'Promo banner background', acceptSvgOnly: false },
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

  const handlePromoFilterChange = (field, value) => {
    setPromoFilters((current) => {
      if (field === 'superCategoryId') {
        return {
          superCategoryId: value,
          subCategoryId: 'all'
        };
      }

      return {
        ...current,
        [field]: value
      };
    });
  };

  const handlePromoProductToggle = (productId) => {
    setForm((current) => {
      const selectedIds = current.homePromoBannerProductIds || [];
      const isSelected = selectedIds.includes(productId);

      return {
        ...current,
        homePromoBannerProductIds: isSelected
          ? selectedIds.filter((id) => id !== productId)
          : [...selectedIds, productId]
      };
    });
    setUnsavedChanges(true);
  };

  const handlePromoProductCountChange = (event) => {
    setForm((current) => ({
      ...current,
      homePromoBannerProductCount: Number(event.target.value) || 1
    }));
    setUnsavedChanges(true);
  };

  const selectedPromoProducts = (form.homePromoBannerProductIds || [])
    .map((productId) => promoProducts.find((product) => String(product?._id) === String(productId)))
    .filter(Boolean);

  const superCategoryOptions = promoCategories
    .filter((category) => category?.type === 'super')
    .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));

  const subCategoryOptions = promoCategories
    .filter((category) => {
      if (category?.type !== 'sub') return false;
      if (promoFilters.superCategoryId === 'all') return true;
      return getCategoryId(category?.parent) === promoFilters.superCategoryId;
    })
    .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));

  const filteredPromoProducts = promoProducts
    .filter((product) => {
      const meta = getProductCategoryMeta(product);

      if (promoFilters.superCategoryId !== 'all' && meta.superId !== promoFilters.superCategoryId) {
        return false;
      }

      if (promoFilters.subCategoryId !== 'all' && meta.subId !== promoFilters.subCategoryId) {
        return false;
      }

      return true;
    })
    .sort((first, second) => (first?.name || '').localeCompare(second?.name || ''));

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
    { id: 'general', label: 'General' },
    { id: 'hero', label: 'Hero Banner' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'contact', label: 'Contact' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Upload Success Popup */}
      {uploadPopup.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-settings-bounce-in border border-gray-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Complete!</h3>
              <p className="text-gray-500 text-sm mb-4">{uploadPopup.type} uploaded successfully</p>
              <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                <img src={uploadPopup.imageUrl} alt="Uploaded" className="max-h-36 mx-auto rounded-lg object-contain" />
              </div>
              <button
                onClick={() => setUploadPopup({ show: false, imageUrl: '', type: '' })}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border animate-settings-slide-down ${notification.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          {notification.type === 'success' ? (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="font-medium text-sm">{notification.message}</span>
          <button onClick={() => setNotification({ show: false, type: '', message: '' })} className="ml-1 hover:opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="pb-32 sm:pb-8">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-0">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  Settings
                </h1>
                {unsavedChanges && (
                  <p className="text-sm text-amber-600 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                    You have unsaved changes
                  </p>
                )}
              </div>

              {/* Three-dot menu */}
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            {/* Tabs Navigation */}
            {/* Mobile Tab Selector */}
            <div className="sm:hidden mb-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 shadow-sm text-sm"
              >
                <span className="font-medium text-gray-700">{tabs.find(t => t.id === activeTab)?.label}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {mobileMenuOpen && (
                <div className="mt-1 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden absolute left-4 right-4 z-30 animate-settings-fade-in">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <span>{tab.label}</span>
                      {activeTab === tab.id && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Tabs — clean text-only horizontal like the reference */}
            <div className="hidden sm:flex gap-0 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          {/* Tab Content */}
          <div className="animate-settings-fade-in">

            {/* ═══════════ General Settings ═══════════ */}
            {activeTab === 'general' && (
              <>
                {/* Section heading */}
                <div className="pt-6 pb-1 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">General</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">Basic information about your website</p>
                </div>

                <SectionRow title="Site Name" subtitle="Your brand name used across the website.">
                  <InputField
                    name="siteName"
                    value={form.siteName}
                    onChange={handleChange}
                    placeholder="My Awesome Store"
                  />
                </SectionRow>

                <SectionRow title="Browser Tab" subtitle="Shows in the browser tab title.">
                  <InputField
                    name="tabName"
                    value={form.tabName}
                    onChange={handleChange}
                    placeholder="My Store | Best Products"
                    hint="Shows in browser tab title"
                  />
                </SectionRow>

                <SectionRow title="Homepage Title" subtitle="Main heading on the homepage.">
                  <InputField
                    name="homepageTitle"
                    value={form.homepageTitle}
                    onChange={handleChange}
                    placeholder="Welcome to Our Store"
                  />
                </SectionRow>

                <SectionRow title="Hero Tagline" subtitle="Tagline above the homepage title.">
                  <InputField
                    name="homeHeroTagline"
                    value={form.homeHeroTagline}
                    onChange={handleChange}
                    placeholder="New Collection 2024"
                  />
                </SectionRow>

                <SectionRow title="Homepage Subtitle" subtitle="Secondary text below the homepage title.">
                  <InputField
                    name="homepageSubtitle"
                    value={form.homepageSubtitle}
                    onChange={handleChange}
                    placeholder="Discover amazing products at unbeatable prices"
                  />
                </SectionRow>

                <SectionRow title="Featured Text" subtitle="Label for featured product section.">
                  <InputField
                    name="featuredText"
                    value={form.featuredText}
                    onChange={handleChange}
                    placeholder="🔥 Featured Products"
                  />
                </SectionRow>

                <SectionRow title="Footer Text" subtitle="Copyright text in the footer.">
                  <InputField
                    name="footerText"
                    value={form.footerText}
                    onChange={handleChange}
                    placeholder="© 2024 Your Company. All rights reserved."
                  />
                </SectionRow>

                {/* Announcement Bar */}
                <div className="pt-6 pb-1 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Promo Sections</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">Control the announcement bar, compact promo banner, and newsletter content</p>
                </div>

                <SectionRow title="Announcement Bar" subtitle="Homepage top promo message.">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Enable announcement bar</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="homeAnnouncementEnabled"
                          checked={form.homeAnnouncementEnabled}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Announcement Text</label>
                      <textarea
                        name="homeAnnouncementText"
                        value={form.homeAnnouncementText}
                        onChange={handleChange}
                        rows={3}
                        placeholder="🎉 Free shipping on orders over ₹499 | Use code: WELCOME10 for 10% off"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                </SectionRow>

                <SectionRow title="Promo Banner Section" subtitle="Compact featured products block shown on the homepage.">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Enable promo banner section</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="homePromoBannerEnabled"
                          checked={form.homePromoBannerEnabled}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <InputField
                        label="Top Badge Text"
                        name="homePromoBannerBadgeText"
                        value={form.homePromoBannerBadgeText}
                        onChange={handleChange}
                        placeholder="Limited Time"
                      />

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">Products on Right Side</label>
                        <select
                          value={form.homePromoBannerProductCount}
                          onChange={handlePromoProductCountChange}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                          {PROMO_PRODUCT_LIMIT_OPTIONS.map((count) => (
                            <option key={count} value={count}>
                              {count} product{count > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500">Homepage par selected products me se itne cards show honge.</p>
                      </div>
                    </div>

                    <InputField
                      label="Heading"
                      name="homePromoBannerTitle"
                      value={form.homePromoBannerTitle}
                      onChange={handleChange}
                      placeholder="Fresh deals with a premium storefront feel"
                    />

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="homePromoBannerDescription"
                        value={form.homePromoBannerDescription}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Curated sale picks, elevated visuals, and quick actions that keep the homepage polished without changing any shopping flow."
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Background Control</h4>
                          <p className="text-xs text-gray-500 mt-1">Gradient ya image background admin panel se switch kar sakte ho.</p>
                        </div>
                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                          {[
                            { value: 'gradient', label: 'Gradient' },
                            { value: 'image', label: 'Image' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setForm((current) => ({ ...current, homePromoBannerBackgroundMode: option.value }));
                                setUnsavedChanges(true);
                              }}
                              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                form.homePromoBannerBackgroundMode === option.value
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Base Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              name="homePromoBannerBackgroundColor"
                              value={form.homePromoBannerBackgroundColor}
                              onChange={handleChange}
                              className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                            />
                            <input
                              type="text"
                              name="homePromoBannerBackgroundColor"
                              value={form.homePromoBannerBackgroundColor}
                              onChange={handleChange}
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Primary Accent</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              name="homePromoBannerBackgroundAccentPrimary"
                              value={form.homePromoBannerBackgroundAccentPrimary}
                              onChange={handleChange}
                              className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                            />
                            <input
                              type="text"
                              name="homePromoBannerBackgroundAccentPrimary"
                              value={form.homePromoBannerBackgroundAccentPrimary}
                              onChange={handleChange}
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Secondary Accent</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              name="homePromoBannerBackgroundAccentSecondary"
                              value={form.homePromoBannerBackgroundAccentSecondary}
                              onChange={handleChange}
                              className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                            />
                            <input
                              type="text"
                              name="homePromoBannerBackgroundAccentSecondary"
                              value={form.homePromoBannerBackgroundAccentSecondary}
                              onChange={handleChange}
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      {form.homePromoBannerBackgroundMode === 'image' && (
                        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_180px]">
                          <UploadBox
                            id="promo-banner-bg-upload"
                            label="Click to upload promo banner background"
                            hint="Recommended: wide banner image"
                            uploading={uploading.homePromoBannerBackgroundImage}
                            onUpload={(e) => handleUpload(e, 'homePromoBannerBackgroundImage')}
                          />
                          <PreviewBox
                            label="promo banner background"
                            hasImage={!!form.homePromoBannerBackgroundImage}
                            imageUrl={form.homePromoBannerBackgroundImage}
                            onRemove={() => handleRemoveImage('homePromoBannerBackgroundImage')}
                            aspectRatio="aspect-[16/10]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white">
                      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Select Products</h4>
                          <p className="text-xs text-gray-500 mt-1">Super category aur sub category ke hisaab se products filter karke choose karo.</p>
                        </div>
                        <div className="text-xs font-medium text-indigo-600">
                          Selected: {selectedPromoProducts.length}
                        </div>
                      </div>

                      <div className="grid gap-3 border-b border-gray-100 p-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Super Category</label>
                          <select
                            value={promoFilters.superCategoryId}
                            onChange={(event) => handlePromoFilterChange('superCategoryId', event.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="all">All Super Categories</option>
                            {superCategoryOptions.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Sub Category</label>
                          <select
                            value={promoFilters.subCategoryId}
                            onChange={(event) => handlePromoFilterChange('subCategoryId', event.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="all">All Sub Categories</option>
                            {subCategoryOptions.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="max-h-[360px] overflow-y-auto p-4">
                        {promoCatalogLoading ? (
                          <div className="flex items-center justify-center py-10 text-sm text-gray-500">
                            Loading approved products...
                          </div>
                        ) : filteredPromoProducts.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                            Is filter me koi approved product nahi mila.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredPromoProducts.map((product) => {
                              const meta = getProductCategoryMeta(product);
                              const isSelected = (form.homePromoBannerProductIds || []).some(
                                (productId) => String(productId) === String(product._id)
                              );

                              return (
                                <label
                                  key={product._id}
                                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                                    isSelected
                                      ? 'border-indigo-300 bg-indigo-50'
                                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handlePromoProductToggle(product._id)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 flex-shrink-0">
                                    {product.images?.[0] ? (
                                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">
                                        No Image
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                                      <span>{meta.superName}</span>
                                      {meta.subName && <span>{meta.subName}</span>}
                                    </div>
                                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">{product.name}</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      {product.brandName || 'No brand'} • Rs{Number(product.finalPrice || product.sellingPrice || 0).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedPromoProducts.length > 0 && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Selected Products Preview</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Homepage par inme se first {form.homePromoBannerProductCount} product{form.homePromoBannerProductCount > 1 ? 's' : ''} show honge.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedPromoProducts.map((product) => (
                            <button
                              key={`selected-${product._id}`}
                              type="button"
                              onClick={() => handlePromoProductToggle(product._id)}
                              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-red-200 hover:text-red-600"
                            >
                              <span className="max-w-[180px] truncate">{product.name}</span>
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SectionRow>

                <SectionRow title="Newsletter Section" subtitle="Subscribe block on the homepage.">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Enable newsletter section</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="homeNewsletterEnabled"
                          checked={form.homeNewsletterEnabled}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InputField
                        label="Badge Text"
                        name="homeNewsletterBadgeText"
                        value={form.homeNewsletterBadgeText}
                        onChange={handleChange}
                        placeholder="Join 10,000+ subscribers"
                      />
                      <InputField
                        label="Title"
                        name="homeNewsletterTitle"
                        value={form.homeNewsletterTitle}
                        onChange={handleChange}
                        placeholder="Stay Updated"
                      />
                      <InputField
                        label="Input Placeholder"
                        name="homeNewsletterInputPlaceholder"
                        value={form.homeNewsletterInputPlaceholder}
                        onChange={handleChange}
                        placeholder="Enter your email"
                      />
                      <InputField
                        label="Button Label"
                        name="homeNewsletterButtonLabel"
                        value={form.homeNewsletterButtonLabel}
                        onChange={handleChange}
                        placeholder="Subscribe"
                      />
                      <InputField
                        label="Button Link"
                        name="homeNewsletterButtonLink"
                        value={form.homeNewsletterButtonLink}
                        onChange={handleChange}
                        placeholder="/products or https://example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="homeNewsletterDescription"
                        value={form.homeNewsletterDescription}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Subscribe to get exclusive offers, new arrivals updates, and special discounts directly in your inbox."
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                </SectionRow>

                {/* Hero Stats */}
                <div className="pt-6 pb-1 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Hero Statistics</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">Numbers that impress your visitors</p>
                </div>

                <SectionRow title="Stats Items" subtitle='Add statistics like "50K+ Happy Customers"'>
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('homeHeroStats')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>
                    {form.homeHeroStats.map((item, index) => (
                      <div key={`stat-${index}`} className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleArrayItemChange('homeHeroStats', index, 'value', e.target.value)}
                          placeholder="50K+"
                          className="flex-1 sm:w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleArrayItemChange('homeHeroStats', index, 'label', e.target.value)}
                          placeholder="Happy Customers"
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('homeHeroStats', index)}
                          className="px-2.5 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </SectionRow>

                {/* Trust Badges */}
                <SectionRow title="Trust Badges" subtitle="Badges shown below the hero banner">
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('homeTrustBadges')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Badge
                      </button>
                    </div>
                    {form.homeTrustBadges.map((item, index) => (
                      <div key={`badge-${index}`} className="grid gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 sm:grid-cols-[120px_1fr_1fr_auto]">
                        <select
                          value={item.icon}
                          onChange={(e) => handleArrayItemChange('homeTrustBadges', index, 'icon', e.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleArrayItemChange('homeTrustBadges', index, 'description', e.target.value)}
                          placeholder="Description"
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('homeTrustBadges', index)}
                          className="px-2.5 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </SectionRow>

                {/* Feature Items */}
                <SectionRow title="Bottom Features" subtitle="Feature cards at the bottom of homepage">
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('homeFeatureItems')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Feature
                      </button>
                    </div>
                    {form.homeFeatureItems.map((item, index) => (
                      <div key={`feature-${index}`} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            value={item.icon}
                            onChange={(e) => handleArrayItemChange('homeFeatureItems', index, 'icon', e.target.value)}
                            className="sm:w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem('homeFeatureItems', index)}
                            className="px-2.5 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleArrayItemChange('homeFeatureItems', index, 'description', e.target.value)}
                          rows={2}
                          placeholder="Feature description..."
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </SectionRow>

                {/* Browser Tab Settings */}
                <SectionRow title="Favicon" subtitle="Upload an SVG icon for browser tabs" noBorder>
                  <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
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
                </SectionRow>
              </>
            )}

            {/* ═══════════ Hero Banner Settings ═══════════ */}
            {activeTab === 'hero' && (
              <>
                <div className="pt-6 pb-1 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Hero Banner</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">Manage hero slideshow images and settings</p>
                </div>

                <SectionRow title="Banner Images" subtitle="Add images for the hero slideshow.">
                  <div className="space-y-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                      <UploadBox
                        id="banner-upload"
                        label="Add Banner Image"
                        hint="Recommended: 1920x600px"
                        uploading={uploading.banner}
                        onUpload={handleBannerImageUpload}
                      />
                      {form.heroBannerImages.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Latest</h4>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                              {form.heroBannerImages.length} image{form.heroBannerImages.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="aspect-video bg-white rounded-lg overflow-hidden border border-gray-200">
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
                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span>All Banner Images</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {form.heroBannerImages.length}
                          </span>
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {form.heroBannerImages.map((img, index) => (
                            <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                              <div className="w-20 h-14 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                <img src={img.url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Image {index + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBannerImage(index)}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                <input
                                  type="url"
                                  value={img.link || ''}
                                  onChange={(e) => handleBannerLinkChange(index, e.target.value)}
                                  placeholder="Link URL (optional)"
                                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SectionRow>

                {/* Banner Background */}
                <SectionRow title="Banner Background" subtitle="Branded hero background without slideshow images.">
                  <div className="space-y-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                      <div className="space-y-4">
                        <UploadBox
                          id="hero-banner-bg-upload"
                          label="Click to upload banner background"
                          hint="Image optional hai. Banner images na ho to ye hero section me dikhega."
                          uploading={uploading.heroBannerFallbackImage}
                          onUpload={(e) => handleUpload(e, 'heroBannerFallbackImage')}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Background Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                name="heroBannerFallbackColor"
                                value={form.heroBannerFallbackColor}
                                onChange={handleChange}
                                className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                name="heroBannerFallbackColor"
                                value={form.heroBannerFallbackColor}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="#ffffff"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Primary Accent</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                name="heroBannerFallbackAccentPrimary"
                                value={form.heroBannerFallbackAccentPrimary}
                                onChange={handleChange}
                                className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                name="heroBannerFallbackAccentPrimary"
                                value={form.heroBannerFallbackAccentPrimary}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="#2cd6e2"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Secondary Accent</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                name="heroBannerFallbackAccentSecondary"
                                value={form.heroBannerFallbackAccentSecondary}
                                onChange={handleChange}
                                className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                name="heroBannerFallbackAccentSecondary"
                                value={form.heroBannerFallbackAccentSecondary}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="#0056b3"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Size</label>
                            <select
                              name="heroBannerFallbackSize"
                              value={form.heroBannerFallbackSize}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              {BACKGROUND_SIZE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Repeat</label>
                          <select
                            name="heroBannerFallbackRepeat"
                            value={form.heroBannerFallbackRepeat}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          >
                            {BACKGROUND_REPEAT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Preview</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <div
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200"
                              style={{ backgroundColor: form.heroBannerFallbackColor }}
                            >
                              Solid
                            </div>
                            <div
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                              style={{ background: `linear-gradient(135deg, ${form.heroBannerFallbackColor}, ${form.heroBannerFallbackAccentSecondary || '#0056b3'})` }}
                            >
                              Gradient
                            </div>
                            <div
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                              style={{ background: `linear-gradient(135deg, ${form.heroBannerFallbackAccentPrimary || '#2cd6e2'}, ${form.heroBannerFallbackAccentSecondary || '#0056b3'})` }}
                            >
                              Accent
                            </div>
                          </div>
                        </div>
                        <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
                          <input
                            type="checkbox"
                            name="heroBannerFallbackFitScreen"
                            checked={form.heroBannerFallbackFitScreen}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-700">Fit To Screen</div>
                            <p className="text-xs text-gray-500">Hero fallback background ko viewport feel deta hai.</p>
                          </div>
                        </label>
                      </div>
                      <PreviewBox
                        label="hero banner background"
                        hasImage={!!form.heroBannerFallbackImage}
                        imageUrl={form.heroBannerFallbackImage}
                        onRemove={() => handleRemoveImage('heroBannerFallbackImage')}
                        aspectRatio="aspect-video"
                      />
                    </div>
                  </div>
                </SectionRow>

                {/* Slideshow Settings */}
                <div className="pt-6 pb-1 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Slideshow Settings</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">Configure how the banner slides</p>
                </div>

                <SectionRow title="Auto Slide" subtitle="Automatically cycle through images.">
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${(option === 'Yes' ? form.heroBannerSettings.autoSlide : !form.heroBannerSettings.autoSlide)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </SectionRow>

                {form.heroBannerSettings.autoSlide && (
                  <>
                    <SectionRow title="Slide Speed" subtitle="Time between each slide.">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Speed</span>
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
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
                          className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>1s (Fast)</span>
                          <span>10s (Slow)</span>
                        </div>
                      </div>
                    </SectionRow>

                    <SectionRow title="Slide Direction" subtitle="Direction of slide animation.">
                      <div className="grid grid-cols-2 gap-2">
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
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.heroBannerSettings.slideDirection === dir.value
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={dir.icon} />
                            </svg>
                            {dir.label}
                          </button>
                        ))}
                      </div>
                    </SectionRow>
                  </>
                )}

                <SectionRow title="Image Fit" subtitle="How images fill the banner area.">
                  <select
                    name="imageSize"
                    value={form.heroBannerSettings.imageSize}
                    onChange={handleBannerSettingsChange}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="cover">Cover (Fill area, may crop)</option>
                    <option value="contain">Contain (Show full image)</option>
                    <option value="auto">Auto (Original size)</option>
                  </select>
                </SectionRow>

                <SectionRow title="Border" subtitle="Border around the banner.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Color</label>
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
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
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
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Width</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="borderWidth"
                          min="0"
                          max="20"
                          value={form.heroBannerSettings.borderWidth}
                          onChange={handleBannerSettingsChange}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-500">px</span>
                      </div>
                    </div>
                  </div>
                </SectionRow>

                <SectionRow title="Overlay" subtitle="Dark overlay on banner images.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Color</label>
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
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
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
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Opacity</label>
                      <div className="flex items-center gap-2">
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                </SectionRow>

                {/* Hero Highlights */}
                <SectionRow title="Hero Highlights" subtitle="Cards shown beside the hero image." noBorder>
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('homeHeroHighlights')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Card
                      </button>
                    </div>
                    {form.homeHeroHighlights.map((item, index) => (
                      <div key={`highlight-${index}`} className="grid gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 sm:grid-cols-[120px_1fr_1fr_auto]">
                        <select
                          value={item.icon}
                          onChange={(e) => handleArrayItemChange('homeHeroHighlights', index, 'icon', e.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleArrayItemChange('homeHeroHighlights', index, 'description', e.target.value)}
                          placeholder="Description"
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('homeHeroHighlights', index)}
                          className="px-2.5 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </SectionRow>
              </>
            )}

            {/* ═══════════ Appearance Settings ═══════════ */}
            {activeTab === 'appearance' && (
              <>
                <div className="pt-6 pb-1 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">Change how your website looks and feels</p>
                </div>

                <SectionRow title="Site Logo" subtitle="Upload your brand logo.">
                  <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
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
                </SectionRow>

                <SectionRow title="Accent Colors" subtitle="Control product cards and home page highlights.">
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Primary Accent</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            name="homeAccentPrimary"
                            value={form.homeAccentPrimary}
                            onChange={handleChange}
                            className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                          />
                          <input
                            type="text"
                            name="homeAccentPrimary"
                            value={form.homeAccentPrimary}
                            onChange={handleChange}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="#0056b3"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Secondary Accent</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            name="homeAccentSecondary"
                            value={form.homeAccentSecondary}
                            onChange={handleChange}
                            className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                          />
                          <input
                            type="text"
                            name="homeAccentSecondary"
                            value={form.homeAccentSecondary}
                            onChange={handleChange}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="#00a0ff"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Live Preview</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                          style={{ background: `linear-gradient(135deg, ${form.homeAccentPrimary}, ${form.homeAccentSecondary})` }}
                        >
                          Accent Button
                        </div>
                        <div
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                          style={{
                            color: form.homeAccentPrimary,
                            backgroundColor: `${form.homeAccentPrimary}14`,
                            borderColor: `${form.homeAccentPrimary}33`,
                          }}
                        >
                          Product Badge
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionRow>

                {/* Home Page Background */}
                <SectionRow title="Home Background" subtitle="Background for the home page only.">
                  <div className="space-y-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                      <div className="space-y-4">
                        <UploadBox
                          id="home-bg-upload"
                          label="Click to upload home background"
                          hint="Recommended: 1920x1080px"
                          uploading={uploading.homeBackgroundImage}
                          onUpload={(e) => handleUpload(e, 'homeBackgroundImage')}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Background Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                name="homeBackgroundColor"
                                value={form.homeBackgroundColor}
                                onChange={handleChange}
                                className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                name="homeBackgroundColor"
                                value={form.homeBackgroundColor}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Primary Accent</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                name="homeBackgroundAccentPrimary"
                                value={form.homeBackgroundAccentPrimary}
                                onChange={handleChange}
                                className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                name="homeBackgroundAccentPrimary"
                                value={form.homeBackgroundAccentPrimary}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="#0056b3"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Secondary Accent</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                name="homeBackgroundAccentSecondary"
                                value={form.homeBackgroundAccentSecondary}
                                onChange={handleChange}
                                className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                name="homeBackgroundAccentSecondary"
                                value={form.homeBackgroundAccentSecondary}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="#00a0ff"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Size</label>
                            <select
                              name="homeBackgroundSize"
                              value={form.homeBackgroundSize}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              {BACKGROUND_SIZE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                              <option value="custom">Custom Width / Height</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Repeat</label>
                            <select
                              name="homeBackgroundRepeat"
                              value={form.homeBackgroundRepeat}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              {BACKGROUND_REPEAT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Opacity</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                name="homeBackgroundOpacity"
                                value={form.homeBackgroundOpacity}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Preview</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <div
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200"
                              style={{ backgroundColor: form.homeBackgroundColor }}
                            >
                              Solid
                            </div>
                            <div
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                              style={{ background: `linear-gradient(135deg, ${form.homeBackgroundColor}, ${form.homeAccentSecondary || '#00a0ff'})` }}
                            >
                              Gradient
                            </div>
                            <div
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                              style={{ background: `linear-gradient(135deg, ${form.homeBackgroundAccentPrimary || '#0056b3'}, ${form.homeBackgroundAccentSecondary || '#00a0ff'})` }}
                            >
                              Accent
                            </div>
                          </div>
                        </div>
                        {form.homeBackgroundSize === 'custom' && (
                          <div className="grid gap-3 sm:grid-cols-2">
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
                        <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
                          <input
                            type="checkbox"
                            name="homeBackgroundFitScreen"
                            checked={form.homeBackgroundFitScreen}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-700">Fit To Screen</div>
                            <p className="text-xs text-gray-500">Viewport ke hisaab se background ko fit rakhta hai.</p>
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
                </SectionRow>

                {/* Rest Pages Background */}
                <SectionRow title="Rest Pages Background" subtitle="Background for all non-home pages." noBorder>
                  <div className="space-y-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                      <div className="space-y-4">
                        <UploadBox
                          id="rest-bg-upload"
                          label="Click to upload rest pages background"
                          hint="Products, categories, profile aur baki non-home pages ke liye"
                          uploading={uploading.restBackgroundImage}
                          onUpload={(e) => handleUpload(e, 'restBackgroundImage')}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Background Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                name="restBackgroundColor"
                                value={form.restBackgroundColor}
                                onChange={handleChange}
                                className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                name="restBackgroundColor"
                                value={form.restBackgroundColor}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Primary Accent</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                name="restBackgroundAccentPrimary"
                                value={form.restBackgroundAccentPrimary}
                                onChange={handleChange}
                                className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                name="restBackgroundAccentPrimary"
                                value={form.restBackgroundAccentPrimary}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="#0056b3"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Secondary Accent</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                name="restBackgroundAccentSecondary"
                                value={form.restBackgroundAccentSecondary}
                                onChange={handleChange}
                                className="h-10 w-12 rounded-lg border border-gray-300 bg-white p-1 cursor-pointer"
                              />
                              <input
                                type="text"
                                name="restBackgroundAccentSecondary"
                                value={form.restBackgroundAccentSecondary}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                placeholder="#00a0ff"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Size</label>
                            <select
                              name="restBackgroundSize"
                              value={form.restBackgroundSize}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              {BACKGROUND_SIZE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Repeat</label>
                          <select
                            name="restBackgroundRepeat"
                            value={form.restBackgroundRepeat}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          >
                            {BACKGROUND_REPEAT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Preview</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <div
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200"
                              style={{ backgroundColor: form.restBackgroundColor }}
                            >
                              Solid
                            </div>
                            <div
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                              style={{ background: `linear-gradient(135deg, ${form.restBackgroundColor}, ${form.restBackgroundAccentSecondary || '#00a0ff'})` }}
                            >
                              Gradient
                            </div>
                            <div
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                              style={{ background: `linear-gradient(135deg, ${form.restBackgroundAccentPrimary || '#0056b3'}, ${form.restBackgroundAccentSecondary || '#00a0ff'})` }}
                            >
                              Accent
                            </div>
                          </div>
                        </div>
                        <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
                          <input
                            type="checkbox"
                            name="restBackgroundFitScreen"
                            checked={form.restBackgroundFitScreen}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-700">Fit To Screen</div>
                            <p className="text-xs text-gray-500">Viewport ke saath background ko fixed rakhta hai.</p>
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
                </SectionRow>
              </>
            )}

            {/* ═══════════ Contact Settings ═══════════ */}
            {activeTab === 'contact' && (
              <>
                <div className="pt-6 pb-1 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">How customers can reach you</p>
                </div>

                <SectionRow title="Email Address" subtitle="Primary contact email.">
                  <InputField
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                  />
                </SectionRow>

                <SectionRow title="Phone Number" subtitle="Customer support number.">
                  <InputField
                    type="tel"
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </SectionRow>

                <SectionRow title="Address" subtitle="Your business address.">
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Your full business address"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </SectionRow>

                {/* Social Media */}
                <div className="pt-6 pb-1 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Social Media</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">Connect your social profiles</p>
                </div>

                <SectionRow title="Social Links" subtitle="URLs to your social media profiles." noBorder>
                  <div className="space-y-3">
                    {[
                      { name: 'facebook', label: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', color: 'blue', placeholder: 'https://facebook.com/yourpage' },
                      { name: 'instagram', label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', color: 'pink', placeholder: 'https://instagram.com/yourprofile' },
                      { name: 'twitter', label: 'Twitter / X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', color: 'sky', placeholder: 'https://twitter.com/yourhandle' },
                      { name: 'youtube', label: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', color: 'red', placeholder: 'https://youtube.com/yourchannel' }
                    ].map((social) => (
                      <div key={social.name} className="flex items-center gap-3">
                        <div className={`w-9 h-9 bg-${social.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <svg className={`w-4 h-4 text-${social.color}-600`} fill="currentColor" viewBox="0 0 24 24">
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
                            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionRow>
              </>
            )}

            {/* ═══════════ Advanced Settings ═══════════ */}
            {activeTab === 'advanced' && (
              <>
                <div className="pt-6 pb-1 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Advanced</h2>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">Take your site offline for updates</p>
                </div>

                <SectionRow title="Maintenance Mode" subtitle='Visitors will see a "Site Under Maintenance" page.' noBorder>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${form.isMaintenanceMode
                          ? 'bg-red-100'
                          : 'bg-gray-100'
                          }`}>
                          <svg className={`w-5 h-5 ${form.isMaintenanceMode ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Enable Maintenance Mode</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Visitors will see a maintenance page
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    {form.isMaintenanceMode && (
                      <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg animate-settings-fade-in">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-800">Site is currently offline!</p>
                          <p className="text-xs text-red-600 mt-0.5">
                            Only administrators can access the site. Remember to turn this off when done!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionRow>
              </>
            )}
          </div>

          {/* Bottom action bar — Cancel + Save changes (like the reference) */}
          <div className="hidden sm:flex items-center justify-end gap-3 py-6 mt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                if (initialSettings) {
                  window.location.reload();
                }
              }}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </div>

        {/* Floating Save Button (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent sm:hidden z-50">
          <div className="flex items-center gap-3">
            {unsavedChanges && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                Unsaved
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes settings-slide-down {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes settings-fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes settings-bounce-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-settings-slide-down {
          animation: settings-slide-down 0.3s ease-out;
        }
        
        .animate-settings-fade-in {
          animation: settings-fade-in 0.2s ease-out;
        }
        
        .animate-settings-bounce-in {
          animation: settings-bounce-in 0.3s ease-out;
        }

        @media (min-width: 640px) {
          @keyframes settings-slide-down {
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
