// src/components/layout/Footer.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const Footer = () => {
  const [settings, setSettings] = useState({
    siteName: 'MultiVendorEcom',
    logoUrl: null,
    footerText: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
  });

  const currentYear = new Date().getFullYear();

  // Normalize logo URL (same logic as Navbar)
  const normalizeLogoUrl = (rawUrl) => {
    if (!rawUrl) return null;
    const axiosBase = axiosClient?.defaults?.baseURL?.replace(/\/$/, '') || null;

    try {
      const u = new URL(rawUrl);
      const frontendPorts = ['5173', '5174'];
      if (frontendPorts.includes(u.port)) {
        const path = u.pathname + (u.search || '');
        if (axiosBase) return axiosBase + path;
        return `${u.protocol}//${u.hostname}:3000${path}`;
      }
      return rawUrl;
    } catch {
      if (rawUrl.startsWith('/')) {
        if (axiosBase) return axiosBase + rawUrl;
        const origin = window.location.origin.replace(/:\d+$/, ':3000');
        return origin + rawUrl;
      }
      return rawUrl;
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/api/settings/public');
      const data = res.data || {};
      
      setSettings({
        siteName: data.siteName || 'MultiVendorEcom',
        logoUrl: normalizeLogoUrl(data.logoUrl) || null,
        footerText: data.footerText || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        socialLinks: {
          facebook: data.socialLinks?.facebook || '',
          instagram: data.socialLinks?.instagram || '',
          twitter: data.socialLinks?.twitter || '',
          youtube: data.socialLinks?.youtube || '',
        },
      });
    } catch (error) {
      console.error('Failed to fetch footer settings:', error);
    }
  };

  const normalizeSocialUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  useEffect(() => {
    fetchSettings();
    
    // Listen for settings updates
    const handleSettingsUpdate = () => fetchSettings();
    window.addEventListener('settings:updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings:updated', handleSettingsUpdate);
    };
  }, []);

  return (
    <footer className="mt-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.siteName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {settings.siteName?.charAt(0) || 'E'}
                  </span>
                )}
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {settings.siteName}
              </span>
            </Link>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              {settings.footerText || 'Your trusted multi-vendor marketplace. Quality products from verified sellers.'}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href={normalizeSocialUrl(settings.socialLinks?.facebook) || '#'}
                target={settings.socialLinks?.facebook ? '_blank' : undefined}
                rel={settings.socialLinks?.facebook ? 'noopener noreferrer' : undefined}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white transition-all duration-200"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={normalizeSocialUrl(settings.socialLinks?.twitter) || '#'}
                target={settings.socialLinks?.twitter ? '_blank' : undefined}
                rel={settings.socialLinks?.twitter ? 'noopener noreferrer' : undefined}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-400 dark:hover:bg-blue-400 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white transition-all duration-200"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href={normalizeSocialUrl(settings.socialLinks?.instagram) || '#'}
                target={settings.socialLinks?.instagram ? '_blank' : undefined}
                rel={settings.socialLinks?.instagram ? 'noopener noreferrer' : undefined}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-pink-600 dark:hover:bg-pink-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </a>
              <a
                href={normalizeSocialUrl(settings.socialLinks?.youtube) || '#'}
                target={settings.socialLinks?.youtube ? '_blank' : undefined}
                rel={settings.socialLinks?.youtube ? 'noopener noreferrer' : undefined}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-600 dark:hover:bg-red-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white transition-all duration-200"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            
            <div className="space-y-4">
              {settings.contactEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 break-all"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}

              {settings.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              )}

              {settings.address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {settings.address}
                  </p>
                </div>
              )}

              {!settings.contactEmail && !settings.contactPhone && !settings.address && (
                <p className="text-sm text-gray-400 italic">
                  Contact info coming soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              © {currentYear}{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {settings.siteName}
              </span>
              . All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">We accept:</span>
              {/* Visa */}
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                <svg className="h-3" viewBox="0 0 48 16" fill="none">
                  <path d="M17.437 15.755l2.734-15.51h4.375l-2.734 15.51h-4.375zm19.688-15.145c-.875-.328-2.25-.687-3.938-.687-4.343 0-7.406 2.172-7.43 5.285-.031 2.297 2.187 3.578 3.86 4.343 1.718.797 2.296 1.297 2.296 2-.016.984-1.265 1.437-2.406 1.437-1.61 0-2.453-.219-3.797-.765l-.515-.235-.563 3.282c1.032.437 2.938.813 4.922.828 4.625 0 7.625-2.141 7.656-5.453.016-1.813-1.156-3.203-3.703-4.344-1.547-.734-2.485-1.234-2.485-1.984 0-.672.813-1.391 2.563-1.391 1.453-.032 2.515.297 3.328.625l.406.188.546-3.125zm8.485-.364h-3.375c-1.047 0-1.828.281-2.281 1.313L33.734 15.75h4.61s.765-1.969.937-2.406h5.687c.125.547.531 2.406.531 2.406h4.078L45.61.245zm-5.531 9.922c.359-.922 1.75-4.453 1.75-4.453-.031.047.359-.922.579-1.516l.296 1.375s.828 3.75.985 4.594h-3.61zM15.64.245L11.36 10.74l-.454-2.172C10.202 6.287 7.719 3.943 4.954 2.74l3.922 12.985h4.656L20.297.24h-4.656z" fill="#1434CB"/>
                </svg>
              </div>
              {/* Mastercard */}
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
                <svg className="h-4" viewBox="0 0 24 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#EB001B"/>
                  <circle cx="16" cy="8" r="7" fill="#F79E1B"/>
                  <path d="M12 3.5c1.4 1.3 2.3 3.2 2.3 5.3 0 2.1-.9 4-2.3 5.3-1.4-1.3-2.3-3.2-2.3-5.3 0-2.1.9-4 2.3-5.3z" fill="#FF5F00"/>
                </svg>
              </div>
              {/* UPI */}
              <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-green-600">
                UPI
              </div>
              {/* COD */}
              <div className="w-10 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center text-[10px] font-bold text-blue-600">
                COD
              </div>
            </div>

            {/* Policy Links */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <Link to="/terms" className="hover:text-blue-600 transition-colors duration-200">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-blue-600 transition-colors duration-200">
                Privacy
              </Link>
              <Link to="/sitemap" className="hover:text-blue-600 transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
