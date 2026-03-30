// src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import ProductQuickView from "../components/product/ProductQuickView";

/* -------------------------------------------------------------
   DESIGN SYSTEM CONSTANTS - MODERN THEME
------------------------------------------------------------- */
const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
};

const DEFAULT_HOME_HERO_TAGLINE = "New Collection 2024";
const DEFAULT_HOME_ANNOUNCEMENT_TEXT = "🎉 Free shipping on orders over ₹499 | Use code: WELCOME10 for 10% off";
const DEFAULT_HOME_NEWSLETTER_BADGE = "Join 10,000+ subscribers";
const DEFAULT_HOME_NEWSLETTER_TITLE = "Stay Updated";
const DEFAULT_HOME_NEWSLETTER_DESCRIPTION = "Subscribe to get exclusive offers, new arrivals updates, and special discounts directly in your inbox.";
const DEFAULT_HOME_NEWSLETTER_INPUT_PLACEHOLDER = "Enter your email";
const DEFAULT_HOME_NEWSLETTER_BUTTON_LABEL = "Subscribe";
const DEFAULT_HOME_HERO_STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "1000+", label: "Products" },
  { value: "99%", label: "Satisfaction" },
];
const DEFAULT_HOME_HERO_HIGHLIGHTS = [
  { icon: "shipping", title: "Free Shipping", description: "On orders over Rs499" },
  { icon: "star", title: "Top Rated", description: "4.9 Average" },
];
const DEFAULT_HOME_TRUST_BADGES = [
  { icon: "shipping", title: "Free Shipping", description: "On orders over Rs499" },
  { icon: "shield", title: "Secure Payment", description: "100% Protected" },
  { icon: "returns", title: "Easy Returns", description: "7-Day Returns" },
  { icon: "support", title: "24/7 Support", description: "Dedicated Help" },
];
const DEFAULT_HOME_FEATURE_ITEMS = [
  { icon: "shipping", title: "Free Shipping", description: "On orders over Rs499" },
  { icon: "shield", title: "Secure Payment", description: "Multiple secure payment options including cards, UPI, and wallets." },
  { icon: "returns", title: "Easy Returns", description: "Hassle-free 7-day return policy with full refund guarantee." },
  { icon: "support", title: "24/7 Support", description: "Round-the-clock customer support for all your queries." },
];

const getContentItems = (items, fallback) => (
  Array.isArray(items) && items.some((item) => item?.title || item?.description || item?.value || item?.label)
    ? items
    : fallback
);

const normalizeHex = (value, fallback) => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return fallback;
};

const hexToRgb = (hex) => {
  const safeHex = normalizeHex(hex, "#0ea5e9");
  const value = safeHex.replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

const rgba = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getHomeTheme = (settings) => {
  const primary = normalizeHex(settings?.homeAccentPrimary, "#0ea5e9");
  const secondary = normalizeHex(settings?.homeAccentSecondary, "#8b5cf6");
  return {
    primary,
    secondary,
    soft: rgba(primary, 0.06),
    softStrong: rgba(primary, 0.12),
    border: rgba(primary, 0.15),
    shadow: rgba(primary, 0.15),
    glow: rgba(secondary, 0.2),
    heroBackground: `linear-gradient(180deg, ${rgba(primary, 0.04)} 0%, #ffffff 60%, ${rgba(secondary, 0.06)} 100%)`,
    accentGradient: `linear-gradient(135deg, ${primary}, ${secondary})`,
  };
};

const buildHomeBackgroundStyle = (settings) => {
  const backgroundSize = settings?.homeBackgroundSize === "custom"
    ? `${settings?.homeBackgroundWidth || "auto"} ${settings?.homeBackgroundHeight || "auto"}`
    : settings?.homeBackgroundSize || "cover";
  const accentPrimary = settings?.homeBackgroundAccentPrimary || settings?.homeAccentPrimary || "#0ea5e9";
  const accentSecondary = settings?.homeBackgroundAccentSecondary || settings?.homeAccentSecondary || "#8b5cf6";
  const overlay = `linear-gradient(135deg, ${accentPrimary}40 0%, ${accentSecondary}30 100%)`;

  return {
    backgroundColor: settings?.homeBackgroundColor || undefined,
    backgroundImage: settings?.homeBackgroundImage
      ? `${overlay}, url(${settings.homeBackgroundImage})`
      : overlay,
    backgroundRepeat: settings?.homeBackgroundImage
      ? `no-repeat, ${settings?.homeBackgroundRepeat || "no-repeat"}`
      : "no-repeat",
    backgroundSize: settings?.homeBackgroundImage ? `cover, ${backgroundSize}` : "cover",
    backgroundPosition: settings?.homeBackgroundImage ? "center center, center top" : "center center",
    backgroundAttachment: settings?.homeBackgroundFitScreen ? "fixed" : "scroll",
    opacity: Math.min(Math.max(Number(settings?.homeBackgroundOpacity ?? 100), 0), 100) / 100,
  };
};

const getProductStockCount = (product) => {
  const rawStock = product?.totalStock ?? product?.stock ?? 0;
  const parsedStock = Number(rawStock);
  return Number.isFinite(parsedStock) ? parsedStock : 0;
};

const getProductInventory = (product = {}) => {
  const totalStock = getProductStockCount(product);
  const allowBackorders = Boolean(product.allowBackorders);
  const isComingSoon = product.availabilityStatus === "coming_soon";
  const isLowStock = totalStock > 0 && totalStock <= (product.lowStockAlertQty || 5);
  const isOutOfStock = !isComingSoon && totalStock <= 0 && !allowBackorders;
  const canAddToCart = !isComingSoon && (totalStock > 0 || allowBackorders);

  let stockLabel = "Out of Stock";
  if (isComingSoon) {
    stockLabel = "Coming Soon";
  } else if (totalStock > 0) {
    stockLabel = isLowStock ? `Only ${totalStock} left` : `${totalStock} in stock`;
  } else if (allowBackorders) {
    stockLabel = "Available on order";
  }

  return {
    totalStock,
    isComingSoon,
    isLowStock,
    isOutOfStock,
    canAddToCart,
    stockLabel,
  };
};

const renderHomeIcon = (icon, className = "w-6 h-6") => {
  const icons = {
    shipping: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    shield: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    returns: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    support: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    star: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    sparkles: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zm6 11l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14zM6 14l.9 2.1L9 17l-2.1.9L6 20l-.9-2.1L3 17l2.1-.9L6 14z" />
      </svg>
    ),
    "shipping-box": (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    ),
    gift: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v13m-7-9h14M5 8h14v13H5V8zm3-3a2 2 0 014 0c0 1.105-.895 3-2 3S8 6.105 8 5zm8 0a2 2 0 10-4 0c0 1.105.895 3 2 3s2-1.895 2-3z" />
      </svg>
    ),
  };
  return icons[icon] || (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
};

/* -------------------------------------------------------------
   SECTION HEADER COMPONENT
------------------------------------------------------------- */
const SectionHeader = ({ 
  title, 
  subtitle,
  viewAllLink, 
  viewAllLabel = "View All",
  centered = false,
  count = null,
  theme,
}) => (
  <div className={`mb-6 sm:mb-8 lg:mb-12 ${centered ? 'text-center' : 'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'}`}>
    <div className="space-y-1 sm:space-y-2">
      {subtitle && (
        <span 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase" 
          style={{ color: theme.primary }}
        >
          <span className="w-8 h-0.5 rounded-full" style={{ backgroundColor: theme.primary }} />
          {subtitle}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
        {title}
      </h2>
    </div>
    {(viewAllLink || count !== null) && !centered && (
      <div className="flex items-center gap-3">
        {count !== null && (
          <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {count} Items
          </span>
        )}
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{ background: theme.accentGradient }}
          >
            {viewAllLabel}
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    )}
  </div>
);

/* -------------------------------------------------------------
   BADGE COMPONENT
------------------------------------------------------------- */
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-white/90 text-gray-700 border border-gray-200/50 shadow-sm",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    danger: "bg-red-50 text-red-600 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    premium: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg",
    glass: "bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const HeroStatsGrid = ({ items, theme, variant = "solid", className = "" }) => {
  const isGlass = variant === "glass";

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {items.slice(0, 4).map((stat, index) => (
        <div
          key={`${stat.label}-${index}`}
          className={`rounded-2xl border p-4 ${
            isGlass
              ? "border-white/15 bg-white/10 backdrop-blur-xl shadow-lg shadow-black/20"
              : "border-gray-100 bg-white shadow-lg shadow-gray-200/40"
          }`}
        >
          <p
            className={`text-xl sm:text-2xl font-bold ${
              isGlass ? "text-white" : "bg-clip-text text-transparent"
            }`}
            style={isGlass ? undefined : { backgroundImage: theme.accentGradient }}
          >
            {stat.value}
          </p>
          <p className={`mt-1 text-xs leading-relaxed ${isGlass ? "text-white/70" : "text-gray-500"}`}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

const HeroHighlightsGrid = ({ items, theme, variant = "solid", className = "" }) => {
  const isGlass = variant === "glass";

  return (
    <div className={`grid gap-3 ${className}`}>
      {items.slice(0, 3).map((item, index) => (
        <div
          key={`${item.title}-${index}`}
          className={`rounded-2xl border p-4 ${
            isGlass
              ? "border-white/15 bg-white/10 backdrop-blur-xl shadow-lg shadow-black/20"
              : "border-gray-100 bg-white shadow-lg shadow-gray-200/40"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                isGlass ? "bg-white/12 text-white" : ""
              }`}
              style={isGlass ? undefined : { background: theme.soft, color: theme.primary }}
            >
              {renderHomeIcon(item.icon, "w-5 h-5")}
            </div>
            <div className="min-w-0">
              <p className={`font-semibold ${isGlass ? "text-white" : "text-gray-900"}`}>
                {item.title}
              </p>
              <p className={`mt-1 text-sm leading-relaxed ${isGlass ? "text-white/70" : "text-gray-500"}`}>
                {item.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------
   SKELETON LOADER
------------------------------------------------------------- */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-2xl ${className}`} />
);

const ProductCardSkeleton = () => (
  <div className="min-w-[200px] sm:min-w-[240px] lg:min-w-[280px] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
    <Skeleton className="h-48 sm:h-56 w-full rounded-none" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-3 w-20 rounded-full" />
      <Skeleton className="h-5 w-full rounded-lg" />
      <Skeleton className="h-3 w-32 rounded-lg" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-lg" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  </div>
);

/* -------------------------------------------------------------
   CART NOTIFICATION COMPONENT
------------------------------------------------------------- */
const CartNotification = ({ message, type = "success", onClose }) => {
  const isError = type === "error" || message?.toLowerCase().includes("denied") || message?.toLowerCase().includes("failed");
  
  return (
    <div className="fixed top-20 right-4 z-[95] max-w-sm w-full animate-slide-in-right">
      <div className={`rounded-2xl p-4 shadow-2xl backdrop-blur-xl border ${
        isError 
          ? 'bg-red-50/95 border-red-200 text-red-800' 
          : 'bg-white/95 border-emerald-200 text-emerald-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            isError ? 'bg-red-100' : 'bg-emerald-100'
          }`}>
            {isError ? (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              {isError ? 'Oops!' : 'Success!'}
            </p>
            <p className={`text-sm truncate ${isError ? 'text-red-600' : 'text-emerald-600'}`}>
              {message}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   HOME COMPONENT
------------------------------------------------------------- */
const Home = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, productsRes, categoriesRes] = await Promise.all([
          axiosClient.get("/api/settings/public"),
          axiosClient.get("/api/products"),
          axiosClient.get("/api/categories/public/all"),
        ]);

        setSettings(settingsRes.data || null);
        const approved = productsRes.data?.products?.filter((p) => p.status === "approved") || [];
        setProducts(approved);
        setCategories(categoriesRes.data?.categories || []);
      } catch (err) {
        console.error("Home load error:", err);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const superCategories = categories.filter((c) => c.type === "super");

  const grouped = products.reduce((acc, p) => {
    const superCat = p.category?.parent?.name || p.category?.name || "Others";
    if (!acc[superCat]) acc[superCat] = [];
    acc[superCat].push(p);
    return acc;
  }, {});

  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  const bestSellers = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 8);

  const homeBackgroundStyle = buildHomeBackgroundStyle(settings);
  const homeTheme = getHomeTheme(settings);

  useEffect(() => {
    if (!cartMessage) return undefined;
    const timer = window.setTimeout(() => setCartMessage(""), 3500);
    return () => window.clearTimeout(timer);
  }, [cartMessage]);

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  const handleAddToCart = async (product) => {
    if (!auth || !auth.user) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const userRole = auth.user.role?.toLowerCase();
    if (userRole !== "user") {
      setCartMessage("Access denied: Only customers can add items to cart");
      return;
    }

    const inventory = getProductInventory(product);
    if (!inventory.canAddToCart) {
      setCartMessage(
        inventory.isComingSoon
          ? `${product.name} is coming soon`
          : `${product.name} is currently out of stock`
      );
      return;
    }

    try {
      setAddingToCartId(product._id);
      await axiosClient.post("/api/cart/add", {
        productId: product._id,
        quantity: product.minPurchaseQty || 1,
      });
      window.dispatchEvent(new Event("cart:updated"));
      setCartMessage(`${product.name} added to cart`);
    } catch (error) {
      console.error("Home add to cart error:", error);
      setCartMessage(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  return (
    <div
      className="home-page relative min-h-screen bg-gray-50/50"
      style={{
        "--home-accent-primary": homeTheme.primary,
        "--home-accent-secondary": homeTheme.secondary,
      }}
    >
      {/* Background Layer */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={homeBackgroundStyle}
      />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-30" 
          style={{ background: homeTheme.accentGradient }} 
        />
        <div 
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20" 
          style={{ background: homeTheme.accentGradient }} 
        />
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}

      {/* Cart Notification */}
      {cartMessage && (
        <CartNotification 
          message={cartMessage} 
          onClose={() => setCartMessage("")}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10">
        <AnnouncementBar settings={settings} theme={homeTheme} />
        <HeroBanner settings={settings} theme={homeTheme} />

        <main className="max-w-[1560px] mx-auto px-3 sm:px-4 lg:px-5 xl:px-6">
          <TrustBadges settings={settings} theme={homeTheme} />

          {/* Categories Section */}
          {!loading && superCategories.length > 0 && (
            <section className="py-12 sm:py-16 lg:py-20">
              <SectionHeader 
                title="Shop by Category" 
                subtitle="Collections"
                viewAllLink="/categories" 
                theme={homeTheme}
              />
              <CategoryGrid 
                categories={superCategories} 
                allCategories={categories}
                theme={homeTheme}
              />
            </section>
          )}

          {/* Featured Products Section */}
          {!loading && displayFeatured.length > 0 && (
            <section className="py-12 sm:py-16 lg:py-20">
              <SectionHeader 
                title="Featured Products" 
                subtitle="Handpicked"
                viewAllLink="/products?featured=true"
                count={displayFeatured.length}
                theme={homeTheme}
              />
              <ProductGrid 
                products={displayFeatured} 
                theme={homeTheme} 
                onQuickView={handleQuickView} 
                onAddToCart={handleAddToCart} 
                addingToCartId={addingToCartId} 
              />
            </section>
          )}

          {/* Promo Banner */}
          {!loading && <PromoBanner theme={homeTheme} />}

          {/* Best Sellers Section */}
          {!loading && bestSellers.length > 0 && (
            <section className="py-12 sm:py-16 lg:py-20">
              <SectionHeader 
                title="Best Sellers" 
                subtitle="Top Picks"
                viewAllLink="/products?sort=bestselling"
                count={bestSellers.length}
                theme={homeTheme}
              />
              <ProductGrid 
                products={bestSellers} 
                theme={homeTheme} 
                onQuickView={handleQuickView} 
                onAddToCart={handleAddToCart} 
                addingToCartId={addingToCartId} 
              />
            </section>
          )}

          {/* Loading State */}
          {loading && <LoadingState />}

          {/* Category Product Sections */}
          {!loading &&
            Object.keys(grouped).map((superCat) => (
              <section key={superCat} className="py-12 sm:py-16 lg:py-20 border-t border-gray-200/50">
                <SectionHeader
                  title={superCat}
                  subtitle="Explore"
                  viewAllLink={`/products?category=${encodeURIComponent(superCat)}`}
                  count={grouped[superCat].length}
                  theme={homeTheme}
                />
                <ProductGrid 
                  products={grouped[superCat]} 
                  theme={homeTheme} 
                  onQuickView={handleQuickView} 
                  onAddToCart={handleAddToCart} 
                  addingToCartId={addingToCartId} 
                />
              </section>
            ))}

          {/* Empty State */}
          {!loading && products.length === 0 && <EmptyState theme={homeTheme} />}

          {/* Newsletter */}
          {!loading && <Newsletter settings={settings} theme={homeTheme} />}
        </main>

        {/* Features Section */}
        <FeaturesSection settings={settings} theme={homeTheme} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   ANNOUNCEMENT BAR
------------------------------------------------------------- */
const AnnouncementBar = ({ settings, theme }) => {
  const [isVisible, setIsVisible] = useState(true);
  const announcementText = (settings?.homeAnnouncementText || DEFAULT_HOME_ANNOUNCEMENT_TEXT).trim();

  useEffect(() => {
    setIsVisible(true);
  }, [announcementText, settings?.homeAnnouncementEnabled]);

  if (settings?.homeAnnouncementEnabled === false || !announcementText || !isVisible) return null;

  return (
    <div 
      className="relative text-white py-2.5 overflow-hidden"
      style={{ background: theme.accentGradient }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <p className="text-xs sm:text-sm font-medium text-center">{announcementText}</p>
        </div>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close announcement"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/* -------------------------------------------------------------
   HERO BANNER - MODERN DESIGN
------------------------------------------------------------- */
const HeroBanner = ({ settings, theme }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const slideInterval = useRef(null);

  const normalizeBannerUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    const url = rawUrl.trim();
    const cloudinaryMatch = url.match(/https?:\/\/res\.cloudinary\.com\/.+/i);
    if (cloudinaryMatch) return cloudinaryMatch[0];
    if (/^https?:\/\//i.test(url) || /^data:/i.test(url) || /^blob:/i.test(url)) return url;
    const apiBase = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, "");
    return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const bannerImages = settings?.heroBannerImages
    ?.map((img) => {
      if (typeof img === "object" && img.url) return { ...img, url: normalizeBannerUrl(img.url) };
      if (typeof img === "string") return { url: normalizeBannerUrl(img), link: "" };
      return null;
    })
    .filter(Boolean) || [];

  const bannerSettings = settings?.heroBannerSettings || { autoSlide: true, slideSpeed: 5000 };
  const heroTagline = settings?.homeHeroTagline || DEFAULT_HOME_HERO_TAGLINE;
  const heroStats = getContentItems(settings?.homeHeroStats, DEFAULT_HOME_HERO_STATS);
  const heroHighlights = getContentItems(settings?.homeHeroHighlights, DEFAULT_HOME_HERO_HIGHLIGHTS);
  const heroTitle = settings?.homepageTitle || "Discover Amazing Products";
  const heroSubtitle = settings?.homepageSubtitle || "Shop the latest trends with exclusive deals and fast delivery.";
  const overlayColor = normalizeHex(bannerSettings.overlayColor, "#0f172a");
  const overlayOpacity = Math.min(Math.max(Number(bannerSettings.overlayOpacity ?? 35), 0), 100) / 100;
  const heroImageFit = bannerSettings.imageSize === "auto" ? "scale-down" : bannerSettings.imageSize;
  const heroFallbackColor = normalizeHex(settings?.heroBannerFallbackColor, "#ffffff");
  const heroFallbackAccentPrimary = normalizeHex(settings?.heroBannerFallbackAccentPrimary || theme.primary, theme.primary);
  const heroFallbackAccentSecondary = normalizeHex(settings?.heroBannerFallbackAccentSecondary || theme.secondary, theme.secondary);
  const heroFallbackImage = normalizeBannerUrl(settings?.heroBannerFallbackImage);
  const heroFallbackRepeat = settings?.heroBannerFallbackRepeat || "no-repeat";
  const heroFallbackSize = settings?.heroBannerFallbackSize || "cover";
  const heroBackgroundStyle = {
    backgroundColor: heroFallbackColor,
    backgroundImage: heroFallbackImage
      ? `linear-gradient(135deg, ${rgba(heroFallbackAccentPrimary, 0.58)} 0%, ${rgba(heroFallbackAccentSecondary, 0.72)} 100%), url(${heroFallbackImage})`
      : `radial-gradient(circle at top right, ${rgba(heroFallbackAccentSecondary, 0.28)} 0%, transparent 42%), radial-gradient(circle at bottom left, ${rgba(heroFallbackAccentPrimary, 0.22)} 0%, transparent 38%), linear-gradient(135deg, ${heroFallbackColor} 0%, ${rgba(heroFallbackAccentPrimary, 0.12)} 48%, ${rgba(heroFallbackAccentSecondary, 0.2)} 100%)`,
    backgroundRepeat: heroFallbackImage ? `no-repeat, ${heroFallbackRepeat}` : "no-repeat",
    backgroundSize: heroFallbackImage ? `cover, ${heroFallbackSize}` : "cover",
    backgroundPosition: heroFallbackImage ? "center center, center center" : "center center",
    backgroundAttachment: settings?.heroBannerFallbackFitScreen ? "fixed" : "scroll",
  };

  const hasImages = bannerImages.length > 0;
  const hasMultipleImages = bannerImages.length > 1;

  useEffect(() => {
    if (hasMultipleImages && bannerSettings.autoSlide && !isPaused) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
      }, bannerSettings.slideSpeed);
    }
    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [hasMultipleImages, bannerSettings.autoSlide, bannerSettings.slideSpeed, bannerImages.length, isPaused]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = useCallback(() => setCurrentSlide((prev) => (prev + 1) % bannerImages.length), [bannerImages.length]);
  const prevSlide = useCallback(() => setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1)), [bannerImages.length]);

  const handleImageClick = (link) => {
    if (link) {
      if (link.startsWith("http")) window.open(link, "_blank");
      else navigate(link);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  /* Fallback Hero (No Images) */
  if (!hasImages) {
    return (
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0" style={heroBackgroundStyle} />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Decorative Blobs */}
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/4"
          style={{ background: `linear-gradient(135deg, ${rgba(heroFallbackAccentPrimary, 0.4)}, ${rgba(heroFallbackAccentSecondary, 0.3)})` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-30 translate-y-1/2 -translate-x-1/4"
          style={{ background: `linear-gradient(135deg, ${rgba(heroFallbackAccentSecondary, 0.3)}, ${rgba(heroFallbackAccentPrimary, 0.2)})` }}
        />

        <div className="relative max-w-[1560px] mx-auto px-3 sm:px-4 lg:px-5 xl:px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme.primary }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme.primary }} />
                </span>
                <span className="text-sm font-medium text-gray-700">{heroTagline}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                {heroTitle.split(' ').slice(0, 2).join(' ')}
                <span className="block mt-1 bg-clip-text text-transparent" style={{ backgroundImage: theme.accentGradient }}>
                  {heroTitle.split(' ').slice(2).join(' ')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {heroSubtitle}
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full pl-14 pr-32 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/50 focus:border-transparent focus:ring-2 focus:ring-offset-2 transition-all text-gray-900 placeholder-gray-400"
                    style={{ '--tw-ring-color': theme.primary }}
                  />
                  <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ background: theme.accentGradient }}
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-2">
                <span className="text-sm text-gray-500">Popular:</span>
                {["Electronics", "Fashion", "Home", "Beauty"].map((tag) => (
                  <Link
                    key={tag}
                    to={`/products?category=${encodeURIComponent(tag)}`}
                    className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              <HeroStatsGrid
                items={heroStats}
                theme={theme}
                className="pt-4 lg:hidden"
              />

              <HeroHighlightsGrid
                items={heroHighlights}
                theme={theme}
                className="pt-1 lg:hidden"
              />
            </div>

            {/* Right - Stats & Visual */}
            <div className="hidden lg:block">
              <div className="mx-auto max-w-[430px] space-y-4">
                <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-gray-300/30 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
                        Hero Statistics
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-gray-900">
                        Numbers that impress
                      </h3>
                    </div>
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ background: theme.soft, color: theme.primary }}
                    >
                      {renderHomeIcon("sparkles", "w-7 h-7")}
                    </div>
                  </div>

                  <HeroStatsGrid items={heroStats} theme={theme} className="mt-6" />
                </div>

                <HeroHighlightsGrid
                  items={heroHighlights}
                  theme={theme}
                  className="grid-cols-1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* Slideshow Hero */
  return (
    <section 
      className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden"
      style={heroBackgroundStyle}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {bannerImages.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide 
              ? "opacity-100 scale-100 z-10" 
              : "opacity-0 scale-105 z-0"
          } ${img.link ? "cursor-pointer" : ""}`}
          onClick={() => handleImageClick(img.link)}
        >
          {/* Image */}
          <img
            src={img.url}
            alt={`Banner ${index + 1}`}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded[index] ? "opacity-100" : "opacity-0"
            }`}
            style={{ objectFit: heroImageFit }}
            onLoad={() => setImageLoaded((prev) => ({ ...prev, [index]: true }))}
            onError={(e) => { e.target.src = "https://via.placeholder.com/1920x700?text=Banner"; }}
          />

          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${rgba(overlayColor, Math.min(overlayOpacity + 0.35, 0.92))} 0%, ${rgba(overlayColor, Math.max(overlayOpacity, 0.18))} 48%, ${rgba(overlayColor, Math.max(overlayOpacity - 0.18, 0.06))} 100%)`,
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1560px] mx-auto px-3 sm:px-4 lg:px-5 xl:px-6 w-full">
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="max-w-2xl space-y-6">
                  <Badge variant="glass">{heroTagline}</Badge>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                    {heroTitle}
                  </h1>

                  <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                    {heroSubtitle}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Shop Now
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link
                      to="/categories"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Browse Categories
                    </Link>
                  </div>

                  <HeroStatsGrid
                    items={heroStats}
                    theme={theme}
                    variant="glass"
                    className="pt-4 lg:hidden"
                  />

                  <HeroHighlightsGrid
                    items={heroHighlights}
                    theme={theme}
                    variant="glass"
                    className="pt-1 lg:hidden"
                  />
                </div>

                <div
                  className="hidden lg:block justify-self-end w-full max-w-[380px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-4">
                    <div className="rounded-[32px] border border-white/20 bg-white/12 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                            Hero Statistics
                          </p>
                          <h3 className="mt-2 text-2xl font-bold text-white">
                            Visitor-first confidence
                          </h3>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 text-white">
                          {renderHomeIcon("sparkles", "w-7 h-7")}
                        </div>
                      </div>

                      <HeroStatsGrid items={heroStats} theme={theme} variant="glass" className="mt-6" />
                    </div>

                    <HeroHighlightsGrid
                      items={heroHighlights}
                      theme={theme}
                      variant="glass"
                      className="grid-cols-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Controls */}
      {hasMultipleImages && (
        <div className="absolute bottom-5 right-3 sm:right-4 lg:right-6 z-20">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-2.5 py-2 text-white shadow-xl backdrop-blur-xl">
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              aria-label="Previous slide"
            >
              Prev
            </button>
            <span className="min-w-[74px] px-2 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
              {String(currentSlide + 1).padStart(2, "0")} / {String(bannerImages.length).padStart(2, "0")}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              aria-label="Next slide"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Dots */}
      {hasMultipleImages && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "bg-white w-8" 
                  : "bg-white/50 hover:bg-white/70 w-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

/* -------------------------------------------------------------
   TRUST BADGES
------------------------------------------------------------- */
const TrustBadges = ({ settings, theme }) => {
  const badges = getContentItems(settings?.homeTrustBadges, DEFAULT_HOME_TRUST_BADGES);

  return (
    <div className="py-6 -mt-8 sm:-mt-12 relative z-20">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-6 sm:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {badges.slice(0, 4).map((badge, index) => (
            <div
              key={`${badge.title}-${index}`}
              className="flex items-center gap-4 group"
            >
              <div 
                className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: theme.soft, color: theme.primary }}
              >
                {typeof badge.icon === "string" ? renderHomeIcon(badge.icon, "w-6 h-6") : badge.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{badge.title}</h4>
                <p className="text-gray-500 text-xs sm:text-sm truncate">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   CATEGORY GRID
------------------------------------------------------------- */
const CategoryGrid = ({ categories, allCategories, theme }) => {
  const getSubCategoryCount = (categoryId) =>
    allCategories.filter((c) => c.parent === categoryId || c.parent?._id === categoryId).length;

  const gradients = [
    "from-rose-500 to-pink-500",
    "from-violet-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-red-500 to-rose-500",
  ];

  return (
    <div className="-mx-1 sm:-mx-2 lg:-mx-4 xl:-mx-6">
      <div className="grid grid-cols-2 gap-4 px-1 sm:grid-cols-3 sm:gap-5 sm:px-2 lg:grid-cols-4 lg:px-4 xl:grid-cols-6 xl:px-6">
        {categories.slice(0, 12).map((category, index) => {
          const gradient = gradients[index % gradients.length];
          const subCount = getSubCategoryCount(category._id);

          return (
            <Link
              key={category._id}
              to={`/category/${category._id}`}
              className="group relative"
            >
              <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                {/* Image/Icon Container */}
                <div className="relative h-32 sm:h-40 overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Sub-category Badge */}
                  {subCount > 0 && (
                    <span className="absolute top-3 right-3 w-6 h-6 bg-white text-gray-900 text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {subCount}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-transparent group-hover:bg-clip-text transition-all" style={{ '--tw-gradient-from': theme.primary, '--tw-gradient-to': theme.secondary }}>
                    {category.name}
                  </h3>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   PRODUCT GRID - HORIZONTAL SCROLL
------------------------------------------------------------- */
const ProductGrid = ({ products, theme, onQuickView, onAddToCart, addingToCartId }) => {
  const scrollRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    isDragging: false,
    suppressClick: false,
    suppressTimer: null,
  });
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(100);
  const [isDragging, setIsDragging] = useState(false);

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = Math.max(scrollWidth - clientWidth, 0);
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 100);
    }
  };

  useEffect(() => {
    checkArrows();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkArrows);
      window.addEventListener("resize", checkArrows);
      return () => {
        container.removeEventListener("scroll", checkArrows);
        window.removeEventListener("resize", checkArrows);
        if (dragStateRef.current.suppressTimer) {
          window.clearTimeout(dragStateRef.current.suppressTimer);
        }
      };
    }
  }, [products]);

  const isDesktopDragPointer = (pointerType) => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 1024 && window.matchMedia("(pointer: fine)").matches && pointerType !== "touch";
  };

  const finishDrag = useCallback((pointerId) => {
    const container = scrollRef.current;
    const dragState = dragStateRef.current;

    if (container && pointerId !== undefined && container.hasPointerCapture?.(pointerId)) {
      try {
        container.releasePointerCapture(pointerId);
      } catch {
        // Ignore release errors when pointer capture is already gone.
      }
    }

    dragState.active = false;
    dragState.pointerId = null;

    if (dragState.isDragging) {
      dragState.suppressClick = true;
      if (dragState.suppressTimer) {
        window.clearTimeout(dragState.suppressTimer);
      }
      dragState.suppressTimer = window.setTimeout(() => {
        dragStateRef.current.suppressClick = false;
      }, 160);
    }

    dragState.isDragging = false;
    setIsDragging(false);
  }, []);

  const handlePointerDown = (event) => {
    const container = scrollRef.current;
    if (!container || event.button !== 0 || !isDesktopDragPointer(event.pointerType)) return;
    if (event.target.closest("button, input, textarea, select, label")) return;

    dragStateRef.current.active = true;
    dragStateRef.current.pointerId = event.pointerId;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startScrollLeft = container.scrollLeft;
    dragStateRef.current.isDragging = false;

    if (dragStateRef.current.suppressTimer) {
      window.clearTimeout(dragStateRef.current.suppressTimer);
      dragStateRef.current.suppressTimer = null;
    }
    dragStateRef.current.suppressClick = false;
    container.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const container = scrollRef.current;
    const dragState = dragStateRef.current;
    if (!container || !dragState.active || dragState.pointerId !== event.pointerId) return;

    const delta = event.clientX - dragState.startX;
    if (!dragState.isDragging && Math.abs(delta) > 6) {
      dragState.isDragging = true;
      setIsDragging(true);
    }

    if (dragState.isDragging) {
      container.scrollLeft = dragState.startScrollLeft - delta;
      event.preventDefault();
    }
  };

  const handlePointerUp = (event) => {
    if (dragStateRef.current.pointerId === event.pointerId) {
      finishDrag(event.pointerId);
    }
  };

  const handlePointerCancel = (event) => {
    if (dragStateRef.current.pointerId === event.pointerId) {
      finishDrag(event.pointerId);
    }
  };

  const scrollHint = showRightArrow
    ? showLeftArrow
      ? "Keep scrolling for more picks"
      : "Swipe or drag to explore"
    : "You've reached the last card";

  return (
    <div className="relative group/strip -mx-2 sm:-mx-3 lg:-mx-5 xl:-mx-6">
      {/* Gradient Fades */}
      <div className={`absolute left-0 top-0 bottom-0 w-16 sm:w-20 bg-gradient-to-r from-gray-50 via-gray-50/90 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute right-0 top-0 bottom-0 w-16 sm:w-20 bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`} />

      {/* Products Container */}
      <div
        ref={scrollRef}
        className={`flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 px-2 sm:px-3 lg:px-5 xl:px-6 scroll-smooth scrollbar-hide snap-x snap-mandatory ${isDragging ? "cursor-grabbing select-none" : "lg:cursor-grab"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", touchAction: "pan-y" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (dragStateRef.current.suppressClick) {
            event.preventDefault();
            event.stopPropagation();
            dragStateRef.current.suppressClick = false;
          }
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            theme={theme}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
            isAddingToCart={addingToCartId === product._id}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 px-2 sm:px-3 lg:px-5 xl:px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-gray-200 bg-white/85 px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur-sm sm:text-sm">
          <span className={`h-2 w-2 rounded-full ${showRightArrow ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
          {showLeftArrow || showRightArrow ? scrollHint : "All cards visible"}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2 w-full min-w-[140px] sm:w-40 rounded-full bg-gray-200/80 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(scrollProgress, 10)}%`, background: theme.accentGradient }}
            />
          </div>
          <span className="text-xs font-semibold tracking-[0.2em] text-gray-400">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   PRODUCT CARD - MODERN DESIGN
------------------------------------------------------------- */
const ProductCard = ({ product, theme, onQuickView, onAddToCart, isAddingToCart = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const inventory = getProductInventory(product);

  const image =
    !imageError && product.images?.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/400x400?text=No+Image";

  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const price = product.finalPrice || product.sellingPrice;

  return (
    <div className="flex-shrink-0 w-[220px] sm:w-[260px] lg:w-[280px] bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group flex flex-col">
      {/* Image Container */}
      <Link to={`/products/${product._id}`} className="relative block h-48 sm:h-56 overflow-hidden bg-gray-100">
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
        )}

        {/* Product Image */}
        <img
          src={image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-110`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-[11px] font-bold rounded-lg shadow-lg">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[11px] font-bold rounded-lg shadow-lg">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
          className={`absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
            isWishlisted 
              ? 'bg-red-50 text-red-500 border border-red-200' 
              : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-500'
          }`}
        >
          <svg className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick View Button */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
          type="button"
          aria-label={`Quick view ${product.name}`}
          className="absolute bottom-3 right-3 sm:w-10 sm:h-10 px-3 sm:px-0 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 hover:scale-110"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="sm:hidden text-xs font-semibold text-gray-700">Quick View</span>
        </button>
      </Link>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category */}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {product.category?.name || "General"}
        </span>

        {/* Product Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="mt-2 font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{product.rating || "4.5"}</span>
          </div>
          <span className="text-xs text-gray-400">({product.ratingCount || 0} reviews)</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">₹{price?.toLocaleString()}</span>
          {product.mrp > product.sellingPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.mrp?.toLocaleString()}</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              inventory.isComingSoon
                ? "bg-sky-50 text-sky-700"
                : inventory.isOutOfStock
                ? "bg-red-50 text-red-700"
                : inventory.isLowStock
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                inventory.isComingSoon
                  ? "bg-sky-500"
                  : inventory.isOutOfStock
                  ? "bg-red-500"
                  : inventory.isLowStock
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
            {inventory.stockLabel}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
          type="button"
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 bg-gray-50 text-gray-700 transition-all duration-300 hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Quick View
        </button>

        {/* Add to Cart Button */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product); }}
          type="button"
          disabled={isAddingToCart || !inventory.canAddToCart}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
          style={{ background: inventory.canAddToCart ? theme.accentGradient : '#9ca3af' }}
        >
          {isAddingToCart ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : inventory.canAddToCart ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {inventory.totalStock > 0 ? "Add to Cart" : "Order Now"}
            </>
          ) : (
            inventory.stockLabel
          )}
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   PROMOTIONAL BANNER
------------------------------------------------------------- */
const PromoBanner = ({ theme }) => (
  <section className="py-12 sm:py-16">
    <div className="grid sm:grid-cols-2 gap-6">
      {/* Banner 1 */}
      <div 
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10 min-h-[280px] flex flex-col justify-between group"
        style={{ background: theme.accentGradient }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <Badge variant="glass" className="mb-4">🔥 Limited Time</Badge>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">Summer Sale</h3>
          <p className="text-white/80 mt-3 text-lg max-w-xs">Up to 50% off on selected items</p>
        </div>
        
        <Link
          to="/products?sale=summer"
          className="relative z-10 inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl font-semibold text-gray-900 hover:bg-gray-100 transition-all w-fit shadow-lg group/btn"
        >
          Shop Sale
          <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Banner 2 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 sm:p-10 min-h-[280px] flex flex-col justify-between group">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <Badge variant="glass" className="mb-4">✨ Just Arrived</Badge>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">New Collection</h3>
          <p className="text-white/80 mt-3 text-lg max-w-xs">Discover the latest trends</p>
        </div>
        
        <Link
          to="/products?new=true"
          className="relative z-10 inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl font-semibold text-gray-900 hover:bg-gray-100 transition-all w-fit shadow-lg group/btn"
        >
          Explore Now
          <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------
   LOADING STATE
------------------------------------------------------------- */
const LoadingState = () => (
  <div className="py-16 space-y-16">
    {/* Categories Skeleton */}
    <div>
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-3xl" />
        ))}
      </div>
    </div>

    {/* Products Skeleton */}
    <div>
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
      <div className="flex gap-6 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------
   EMPTY STATE
------------------------------------------------------------- */
const EmptyState = ({ theme }) => (
  <div className="py-24 text-center">
    <div 
      className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
      style={{ background: theme.soft }}
    >
      <svg className="w-12 h-12" style={{ color: theme.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Available</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">Check back later for new arrivals!</p>
    <Link
      to="/categories"
      className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
      style={{ background: theme.accentGradient }}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
      Browse Categories
    </Link>
  </div>
);

/* -------------------------------------------------------------
   NEWSLETTER
------------------------------------------------------------- */
const Newsletter = ({ settings, theme }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const badgeText = settings?.homeNewsletterBadgeText || DEFAULT_HOME_NEWSLETTER_BADGE;
  const title = settings?.homeNewsletterTitle || DEFAULT_HOME_NEWSLETTER_TITLE;
  const description = settings?.homeNewsletterDescription || DEFAULT_HOME_NEWSLETTER_DESCRIPTION;
  const inputPlaceholder = settings?.homeNewsletterInputPlaceholder || DEFAULT_HOME_NEWSLETTER_INPUT_PLACEHOLDER;
  const buttonLabel = settings?.homeNewsletterButtonLabel || DEFAULT_HOME_NEWSLETTER_BUTTON_LABEL;
  const buttonLink = settings?.homeNewsletterButtonLink?.trim() || "";

  if (settings?.homeNewsletterEnabled === false) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleButtonClick = () => {
    if (!buttonLink) return;
    if (/^https?:\/\//i.test(buttonLink)) {
      window.open(buttonLink, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(buttonLink);
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="relative bg-gray-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden">
        {/* Decorative elements */}
        <div 
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-30"
          style={{ background: theme.accentGradient }}
        />
        <div 
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-20"
          style={{ background: theme.accentGradient }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme.secondary }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme.secondary }} />
            </span>
            <span className="text-sm font-medium text-white/80">{badgeText}</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h3>
          <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto">{description}</p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50"
                required
              />
            </div>
            <button
              type={buttonLink ? "button" : "submit"}
              onClick={buttonLink ? handleButtonClick : undefined}
              className="px-8 py-4 text-white font-bold rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: theme.accentGradient }}
            >
              {buttonLabel}
            </button>
          </form>

          {status === "success" && (
            <div className="mt-4 inline-flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Thanks for subscribing!
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   FEATURES SECTION
------------------------------------------------------------- */
const FeaturesSection = ({ settings, theme }) => {
  const features = getContentItems(settings?.homeFeatureItems, DEFAULT_HOME_FEATURE_ITEMS);

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
          <span 
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase mb-3"
            style={{ color: theme.primary }}
          >
            <span className="w-8 h-0.5 rounded-full" style={{ backgroundColor: theme.primary }} />
            Why Choose Us
            <span className="w-8 h-0.5 rounded-full" style={{ backgroundColor: theme.primary }} />
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Shop With Confidence
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-lg mx-auto">
            We provide the best shopping experience with premium quality products and exceptional service.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.slice(0, 4).map((feature, index) => (
            <div 
              key={`${feature.title}-${index}`}
              className="group text-center p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-500"
            >
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg text-white mb-6 group-hover:scale-110 transition-transform"
                style={{ background: theme.accentGradient }}
              >
                {typeof feature.icon === "string" ? renderHomeIcon(feature.icon, "w-8 h-8") : feature.icon}
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   CUSTOM STYLES
------------------------------------------------------------- */
const styles = `
.home-page {
  width: 100%;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes slide-in-right {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-slide-in-right {
  animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

*:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-slide-in-right,
  .animate-ping,
  .animate-pulse {
    animation: none !important;
  }
  
  * {
    transition-duration: 0.01ms !important;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('home-custom-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'home-custom-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

export default Home;
