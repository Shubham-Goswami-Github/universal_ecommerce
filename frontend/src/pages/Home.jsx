// src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import ProductQuickView from "../components/product/ProductQuickView";

const DEFAULT_HOME_HERO_TAGLINE = "New Collection 2024";
const DEFAULT_HOME_ANNOUNCEMENT_TEXT = "🎉 Free shipping on orders over ₹499 | Use code: WELCOME10 for 10% off";
const DEFAULT_HOME_NEWSLETTER_BADGE = "Join 10,000+ subscribers";
const DEFAULT_HOME_NEWSLETTER_TITLE = "Stay Updated";
const DEFAULT_HOME_NEWSLETTER_DESCRIPTION = "Subscribe to get exclusive offers, new arrivals updates, and special discounts directly in your inbox.";
const DEFAULT_HOME_NEWSLETTER_INPUT_PLACEHOLDER = "Enter your email";
const DEFAULT_HOME_NEWSLETTER_BUTTON_LABEL = "Subscribe";
const DEFAULT_HOME_PROMO_BANNER_BADGE = "Limited Time";
const DEFAULT_HOME_PROMO_BANNER_TITLE = "Fresh deals with a premium storefront feel";
const DEFAULT_HOME_PROMO_BANNER_DESCRIPTION = "Curated sale picks, elevated visuals, and quick actions that keep the homepage polished without changing any shopping flow.";
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

const clampNumber = (value, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
};

const getHomeTheme = (settings) => {
  const primary = normalizeHex(settings?.homeAccentPrimary, "#0f766e");
  const secondary = normalizeHex(settings?.homeAccentSecondary, "#db2777");
  return {
    primary,
    secondary,
    soft: rgba(primary, 0.06),
    softStrong: rgba(primary, 0.12),
    border: rgba(primary, 0.15),
    shadow: rgba(primary, 0.15),
    glow: rgba(secondary, 0.2),
    heroBackground: `linear-gradient(180deg, ${rgba(primary, 0.06)} 0%, #ffffff 58%, ${rgba(secondary, 0.05)} 100%)`,
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

const getProductCategoryMeta = (product) => {
  const category = product?.category;
  const parent = category?.parent;
  const hasParent = Boolean(parent);

  return {
    superName: hasParent ? parent?.name || "Featured" : category?.name || "Featured",
    subName: hasParent ? category?.name || "" : "",
  };
};

const buildPromoBannerBackgroundStyle = (settings, theme) => {
  const backgroundMode = settings?.homePromoBannerBackgroundMode || "gradient";
  const baseColor = normalizeHex(settings?.homePromoBannerBackgroundColor, "#0f766e");
  const accentPrimary = normalizeHex(settings?.homePromoBannerBackgroundAccentPrimary || theme.primary, theme.primary);
  const accentSecondary = normalizeHex(settings?.homePromoBannerBackgroundAccentSecondary || "#065f46", "#065f46");
  const backgroundImage = typeof settings?.homePromoBannerBackgroundImage === "string"
    ? settings.homePromoBannerBackgroundImage.trim()
    : "";

  if (backgroundMode === "image" && backgroundImage) {
    return {
      backgroundColor: baseColor,
      backgroundImage: `linear-gradient(125deg, ${rgba(baseColor, 0.88)} 0%, ${rgba(accentSecondary, 0.72)} 100%), url(${backgroundImage})`,
      backgroundSize: "cover, cover",
      backgroundPosition: "center center, center center",
      backgroundRepeat: "no-repeat, no-repeat",
    };
  }

  return {
    backgroundColor: baseColor,
    backgroundImage: `
      radial-gradient(circle at top left, ${rgba(accentPrimary, 0.28)} 0%, transparent 34%),
      radial-gradient(circle at bottom right, ${rgba(accentSecondary, 0.24)} 0%, transparent 30%),
      linear-gradient(135deg, ${accentPrimary} 0%, ${baseColor} 52%, ${accentSecondary} 100%)
    `,
  };
};

const getProductPrimaryImage = (product) => {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images[0];
  }
  return "";
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
  <div className={`mb-6 ${centered ? "text-center" : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"}`}>
    <div className="space-y-2">
      {subtitle && (
        <span
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
          style={{ color: theme.primary }}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.primary }} />
          {subtitle}
        </span>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[2rem]">
        {title}
      </h2>
    </div>
    {(viewAllLink || count !== null) && !centered && (
      <div className="flex items-center gap-3 self-start sm:self-auto">
        {count !== null && (
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 sm:inline-flex">
            {count} picks
          </span>
        )}
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-gray-300 dark:hover:text-white"
            style={{ color: theme.primary }}
          >
            {viewAllLabel}
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    default: "bg-white/90 text-gray-700 border border-gray-200/50 shadow-sm dark:bg-gray-900/90 dark:text-gray-200 dark:border-gray-700",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    danger: "bg-red-50 text-red-600 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    premium: "bg-gray-950 text-white shadow-lg",
    glass: "bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg",
  };

  return (
    <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium ${variants[variant]} ${className}`}>
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
          className={`rounded-lg border p-4 ${isGlass
            ? "border-white/15 bg-white/10 backdrop-blur-xl shadow-lg shadow-black/20"
            : "border-gray-100 bg-white shadow-lg shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20"
            }`}
        >
          <p
            className={`text-xl sm:text-2xl font-bold ${isGlass ? "text-white" : "bg-clip-text text-transparent"
              }`}
            style={isGlass ? undefined : { backgroundImage: theme.accentGradient }}
          >
            {stat.value}
          </p>
          <p className={`mt-1 text-xs leading-relaxed ${isGlass ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

const HeroStatsRail = ({ items, theme, variant = "solid", className = "" }) => {
  const isGlass = variant === "glass";

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {items.slice(0, 3).map((stat, index) => (
        <div
          key={`${stat.label}-${index}`}
          className={`min-w-0 rounded-lg border px-2.5 py-3 text-center ${isGlass
            ? "border-white/15 bg-white/12 shadow-lg shadow-black/20 backdrop-blur-xl"
            : "border-gray-200 bg-white/90 shadow-lg shadow-gray-200/40 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-black/20"
            }`}
        >
          <p
            className={`truncate text-lg font-extrabold leading-none ${isGlass ? "text-white" : "bg-clip-text text-transparent"}`}
            style={isGlass ? undefined : { backgroundImage: theme.accentGradient }}
          >
            {stat.value}
          </p>
          <p className={`mt-1 truncate text-[10px] font-medium ${isGlass ? "text-white/75" : "text-gray-500 dark:text-gray-400"}`}>
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
          className={`rounded-lg border p-4 ${isGlass
            ? "border-white/15 bg-white/10 backdrop-blur-xl shadow-lg shadow-black/20"
            : "border-gray-100 bg-white shadow-lg shadow-gray-200/40 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20"
            }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-lg ${isGlass ? "bg-white/12 text-white" : ""
                }`}
              style={isGlass ? undefined : { background: theme.soft, color: theme.primary }}
            >
              {renderHomeIcon(item.icon, "w-5 h-5")}
            </div>
            <div className="min-w-0">
              <p className={`font-semibold ${isGlass ? "text-white" : "text-gray-900 dark:text-white"}`}>
                {item.title}
              </p>
              <p className={`mt-1 text-sm leading-relaxed ${isGlass ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>
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
   CART NOTIFICATION COMPONENT
------------------------------------------------------------- */
const CartNotification = ({ message, type = "success", onClose }) => {
  const isError = type === "error" || message?.toLowerCase().includes("denied") || message?.toLowerCase().includes("failed");

  return (
    <div className="fixed top-20 right-4 z-[95] max-w-sm w-full animate-slide-in-right">
      <div className={`rounded-lg border p-4 shadow-2xl backdrop-blur-xl ${isError
        ? 'bg-red-50/95 border-red-200 text-red-800'
        : 'bg-white/95 border-emerald-200 text-emerald-800'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${isError ? 'bg-red-100' : 'bg-emerald-100'
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

  const selectedPromoBannerProducts = Array.isArray(settings?.homePromoBannerProductIds)
    ? settings.homePromoBannerProductIds
      .map((productId) => products.find((product) => String(product._id) === String(productId)))
      .filter(Boolean)
    : [];

  const promoBannerFallbackProducts = displayFeatured.length > 0
    ? displayFeatured
    : bestSellers.length > 0
      ? bestSellers
      : products;

  const promoBannerProducts = selectedPromoBannerProducts.length > 0
    ? [
      ...selectedPromoBannerProducts,
      ...promoBannerFallbackProducts.filter(
        (product) => !selectedPromoBannerProducts.some((selected) => String(selected._id) === String(product._id))
      ),
    ]
    : promoBannerFallbackProducts;

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
      className="home-page relative min-h-screen bg-white dark:bg-gray-950"
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
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 hidden bg-gray-950/90 pointer-events-none dark:block"
      />

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #111827 1px, transparent 1px), linear-gradient(180deg, #111827 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
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

        <div className="mx-auto w-full max-w-[1540px] px-0 pt-3 pb-4 sm:px-3 sm:pt-4 sm:pb-6 lg:px-4 lg:pt-5 lg:pb-8">
          <div className="overflow-hidden rounded-none border-x-0 border-b border-white/70 bg-white/90 px-0 pb-4 pt-0 shadow-[0_28px_90px_rgba(148,163,184,0.22)] backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90 dark:shadow-black/25 sm:rounded-[24px] sm:border sm:pb-6 lg:rounded-[26px] lg:pb-8">
            <HeroBanner settings={settings} theme={homeTheme} />
            <div className="px-4 sm:px-6 lg:px-8">
              <TrustBadges settings={settings} theme={homeTheme} />

              <main className="space-y-12 pt-8 sm:space-y-14 lg:space-y-16">
                {!loading && superCategories.length > 0 && (
                  <section>
                    <SectionHeader
                      title="Explore Popular Categories"
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

                {!loading && displayFeatured.length > 0 && (
                  <section>
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

                {!loading && <PromoBanner settings={settings} theme={homeTheme} products={promoBannerProducts} />}

                {!loading && bestSellers.length > 0 && (
                  <section>
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

                {loading && <LoadingState theme={homeTheme} />}

                {!loading &&
                  Object.keys(grouped).map((superCat, index) => (
                    <section
                      key={superCat}
                      className={index === 0 ? "" : "border-t border-slate-200/80 pt-12 dark:border-gray-800 sm:pt-14 lg:pt-16"}
                    >
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

                {!loading && products.length === 0 && <EmptyState theme={homeTheme} />}

                {!loading && <Newsletter settings={settings} theme={homeTheme} />}
              </main>
            </div>
          </div>
        </div>

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
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-colors hover:bg-white/20"
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
  const heroFeatureCards = heroHighlights.slice(0, 2);

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

  return (
    <section className="pb-6 sm:pb-7 lg:pb-8">
      <div className="grid items-stretch gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.72fr)_minmax(320px,0.88fr)] xl:gap-6">
        <div
          className="relative overflow-hidden rounded-[20px] border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:border-gray-800 dark:shadow-black/30 sm:rounded-[24px] lg:rounded-[26px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {!hasImages && (
            <div className="absolute inset-0" style={heroBackgroundStyle} />
          )}

          {hasImages && bannerImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide ? "z-10 opacity-100 scale-100" : "z-0 scale-105 opacity-0"} ${img.link ? "cursor-pointer" : ""}`}
              onClick={() => handleImageClick(img.link)}
            >
              <img
                src={img.url}
                alt={`Banner ${index + 1}`}
                className="h-full w-full object-cover"
                style={{ objectFit: heroImageFit }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, ${rgba(overlayColor, Math.min(overlayOpacity + 0.45, 0.92))} 0%, ${rgba(overlayColor, Math.max(overlayOpacity + 0.08, 0.2))} 55%, ${rgba(overlayColor, Math.max(overlayOpacity - 0.14, 0.04))} 100%)`,
                }}
              />
            </div>
          ))}

          <div className="relative z-20 flex min-h-[340px] flex-col justify-between p-5 sm:min-h-[410px] sm:p-7 lg:min-h-[520px] lg:p-10">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/88 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-lg backdrop-blur">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                {heroTagline}
              </div>

              <div className="space-y-3 text-white">
                <h1 className={`max-w-xl font-bold leading-[1.02] tracking-tight ${hasImages ? "text-3xl sm:text-4xl lg:text-5xl xl:text-[3.6rem]" : "text-slate-900 dark:text-white text-3xl sm:text-4xl lg:text-5xl"}`}>
                  {heroTitle}
                </h1>
                <p className={`max-w-xl text-sm leading-relaxed sm:text-base lg:text-lg ${hasImages ? "text-white/85" : "text-slate-600 dark:text-gray-300"}`}>
                  {heroSubtitle}
                </p>
              </div>

              {!hasImages && (
                <form onSubmit={handleSearch} className="max-w-xl">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for any product or brand"
                      className="w-full rounded-full border border-white/70 bg-white/92 py-4 pl-14 pr-32 text-sm text-slate-900 shadow-lg backdrop-blur placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900/90 dark:text-white sm:text-base"
                      style={{ "--tw-ring-color": theme.primary }}
                    />
                    <svg className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
                      style={{ background: theme.accentGradient }}
                    >
                      Search
                    </button>
                  </div>
                </form>
              )}

              <div className="flex flex-wrap gap-3 pb-4 sm:pb-5 lg:pb-6">
                <Link
                  to="/products"
                  className={`inline-flex min-h-[46px] items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02] sm:px-6 ${hasImages ? "bg-white text-slate-900" : "text-white"}`}
                  style={hasImages ? undefined : { background: theme.accentGradient }}
                >
                  Shop Now
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/categories"
                  className={`inline-flex min-h-[46px] items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors sm:px-6 ${hasImages ? "border-white/35 bg-white/10 text-white backdrop-blur hover:bg-white/20" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"}`}
                >
                  Browse Categories
                </Link>
              </div>

              <HeroStatsRail
                items={heroStats}
                theme={theme}
                variant={hasImages ? "glass" : "solid"}
                className="sm:hidden"
              />
            </div>

            <div className="space-y-4">
              <HeroStatsGrid
                items={heroStats}
                theme={theme}
                variant={hasImages ? "glass" : "solid"}
                className="hidden max-w-xl sm:grid lg:max-w-[560px]"
              />
            </div>
          </div>

          {hasMultipleImages && (
            <>
              <div className="absolute bottom-5 right-5 z-30 hidden items-center gap-2 rounded-full border border-white/20 bg-black/25 px-2 py-2 text-white shadow-xl backdrop-blur lg:flex">
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  aria-label="Previous slide"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <span className="min-w-[70px] text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                  {String(currentSlide + 1).padStart(2, "0")} / {String(bannerImages.length).padStart(2, "0")}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  aria-label="Next slide"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>

              <div className="absolute bottom-5 left-6 z-30 flex gap-2">
                {bannerImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                    className={`rounded-full transition-all duration-300 ${index === currentSlide ? "h-2.5 w-8 bg-white" : "h-2.5 w-2.5 bg-white/55 hover:bg-white/75"}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:gap-5">
          {heroFeatureCards.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className={`relative overflow-hidden rounded-[20px] border p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:shadow-black/20 sm:rounded-[24px] sm:p-6 ${index === 0 ? "min-h-[220px] xl:min-h-[248px]" : "min-h-[220px]"}`}
              style={{
                background: index === 0
                  ? `linear-gradient(135deg, ${rgba(theme.primary, 0.96)} 0%, ${rgba(theme.secondary, 0.92)} 100%)`
                  : `linear-gradient(135deg, ${rgba(theme.secondary, 0.16)} 0%, #ffffff 60%, ${rgba(theme.primary, 0.1)} 100%)`,
                color: index === 0 ? "#ffffff" : "#0f172a",
                borderColor: index === 0 ? "transparent" : theme.border,
              }}
            >
              <div className="absolute right-[-20px] top-[-24px] h-32 w-32 rounded-full bg-white/12" />
              <div className="absolute bottom-[-36px] right-[-8px] h-24 w-24 rounded-full bg-white/10" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="space-y-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${index === 0 ? "bg-white/18 text-white" : "bg-white text-slate-700 shadow-md"}`}>
                    {renderHomeIcon(item.icon, "h-6 w-6")}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${index === 0 ? "text-white/70" : "text-slate-500"}`}>
                      Spotlight
                    </p>
                    <h3 className={`mt-2 text-2xl font-bold leading-tight ${index === 0 ? "text-white" : "text-slate-900 dark:text-white"}`}>
                      {item.title}
                    </h3>
                    <p className={`mt-3 text-sm leading-relaxed ${index === 0 ? "text-white/80" : "text-slate-600 dark:text-gray-300"}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <Link
                  to={index === 0 ? "/products?sale=featured" : "/categories"}
                  className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.02] ${index === 0 ? "bg-white text-slate-900" : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"}`}
                >
                  Shop now
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:bg-gray-900 sm:rounded-[24px] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Popular now</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Store Highlights</h3>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ background: theme.accentGradient }}
              >
                {renderHomeIcon("sparkles", "h-6 w-6")}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {heroStats.slice(0, 3).map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm shadow-sm dark:bg-gray-950">
                  <span className="font-medium text-slate-500 dark:text-gray-400">{stat.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white" style={{ color: theme.primary }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   TRUST BADGES
------------------------------------------------------------- */
const TrustBadges = ({ settings, theme }) => {
  const badges = getContentItems(settings?.homeTrustBadges, DEFAULT_HOME_TRUST_BADGES);

  return (
    <div className="relative z-20 py-6 sm:py-7">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 sm:p-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {badges.slice(0, 4).map((badge, index) => (
            <div
              key={`${badge.title}-${index}`}
              className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 dark:bg-gray-950"
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                style={{ background: theme.softStrong, color: theme.primary }}
              >
                {typeof badge.icon === "string" ? renderHomeIcon(badge.icon, "h-5 w-5") : badge.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">{badge.title}</h4>
                <p className="truncate text-xs text-slate-500 dark:text-gray-400 sm:text-sm">{badge.description}</p>
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
    "from-fuchsia-500 to-rose-500",
    "from-sky-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-red-500 to-rose-500",
  ];

  return (
    <div className="relative">
      <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide sm:gap-6">
        {categories.slice(0, 12).map((category, index) => {
          const gradient = gradients[index % gradients.length];
          const subCount = getSubCategoryCount(category._id);

          return (
            <Link
              key={category._id}
              to={`/category/${category._id}`}
              className="group min-w-[112px] flex-shrink-0 text-center sm:min-w-[132px]"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-gray-800 dark:bg-gray-900 sm:h-28 sm:w-28">
                <div className="relative h-full w-full overflow-hidden rounded-full">
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
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-slate-700 dark:text-white dark:group-hover:text-gray-200 sm:text-[15px]">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {subCount > 0 ? `${subCount} collections` : "Explore"}
                </p>
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

  const scrollProducts = useCallback((direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector("[data-product-card='true']");
    const computedStyle = window.getComputedStyle(container);
    const gap = Number.parseFloat(computedStyle.columnGap || computedStyle.gap || "0");
    const cardWidth = firstCard?.getBoundingClientRect().width || container.clientWidth * 0.8;
    const cardsPerJump = window.innerWidth < 640 ? 3 : window.innerWidth < 1024 ? 2 : 1;
    const scrollAmount = Math.max((cardWidth + gap) * cardsPerJump, container.clientWidth * 0.72);

    container.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const scrollHint = showRightArrow
    ? showLeftArrow
      ? "Use arrows, swipe, or drag for more picks"
      : "Swipe, drag, or tap arrows to explore"
    : "You've reached the last card";

  return (
    <div className="relative group/strip">
      {(showLeftArrow || showRightArrow) && (
        <>
          <button
            type="button"
            onClick={() => scrollProducts(-1)}
            disabled={!showLeftArrow}
            aria-label="Scroll products left"
            className={`absolute left-2 top-[43%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-gray-700 shadow-[0_18px_45px_rgba(15,23,42,0.14)] transition-all duration-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 lg:flex ${showLeftArrow
              ? "pointer-events-auto opacity-100 hover:-translate-x-1 hover:scale-105"
              : "pointer-events-none opacity-0"
              }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 6l-6 6 6 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => scrollProducts(1)}
            disabled={!showRightArrow}
            aria-label="Scroll products right"
            className={`absolute right-2 top-[43%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-gray-700 shadow-[0_18px_45px_rgba(15,23,42,0.14)] transition-all duration-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 lg:flex ${showRightArrow
              ? "pointer-events-auto opacity-100 hover:translate-x-1 hover:scale-105"
              : "pointer-events-none opacity-0"
              }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      )}

      {/* Products Container */}
      <div
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto pb-4 pt-2 scroll-smooth scrollbar-hide snap-x snap-mandatory sm:gap-5 lg:gap-6 ${isDragging ? "cursor-grabbing select-none" : "lg:cursor-grab"}`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          touchAction: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
        }}
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 sm:text-sm">
          <span className={`h-2 w-2 rounded-full ${showRightArrow ? "bg-emerald-500" : "bg-gray-300"}`} />
          {showLeftArrow || showRightArrow ? scrollHint : "All cards visible"}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => scrollProducts(-1)}
              disabled={!showLeftArrow}
              aria-label="Scroll products left"
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 ${showLeftArrow
                ? "opacity-100 hover:-translate-x-0.5 hover:shadow-md"
                : "opacity-40"
                }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollProducts(1)}
              disabled={!showRightArrow}
              aria-label="Scroll products right"
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 ${showRightArrow
                ? "opacity-100 hover:translate-x-0.5 hover:shadow-md"
                : "opacity-40"
                }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="h-2 w-full min-w-[140px] sm:w-40 rounded-full bg-gray-200/80 dark:bg-gray-800 overflow-hidden">
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
  const { auth } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const inventory = getProductInventory(product);
  const canShowWishlist = !auth?.user || auth.user.role === "user";
  const wishlistActive = isWishlisted(product._id);

  const image =
    !imageError && product.images?.length > 0
      ? product.images[0]
      : "";

  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const price = product.finalPrice || product.sellingPrice;

  return (
    <article
      data-product-card="true"
      className="group relative flex w-[44vw] min-w-[170px] max-w-[205px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)] dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 sm:w-[235px] sm:min-w-[235px] sm:max-w-[235px] lg:w-[250px] lg:min-w-[250px] lg:max-w-[250px]"
    >
      <Link
        to={`/products/${product._id}`}
        aria-label={`Open details for ${product.name}`}
        className="absolute inset-0 z-10 rounded-[24px]"
      />

      {/* Image Container */}
      <div className="relative z-0 block overflow-hidden bg-slate-50 p-4 dark:bg-gray-800/70">
        <div className="relative h-32 overflow-hidden rounded-[20px] bg-white sm:h-48">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 text-gray-400 dark:from-gray-800 dark:to-gray-700 dark:text-gray-500">
              {renderHomeIcon("shipping-box", "h-9 w-9 sm:h-14 sm:w-14")}
            </div>
          )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
          {discount > 0 && (
            <span className="rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg sm:rounded-lg sm:px-2.5 sm:text-[11px]">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg sm:rounded-lg sm:px-2.5 sm:text-[11px]">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {canShowWishlist && (
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!auth?.user) {
                navigate("/login", { state: { from: window.location.pathname } });
                return;
              }
              await toggleWishlist(product._id);
            }}
            className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg border shadow-md transition-all duration-300 hover:scale-110 sm:right-3 sm:top-3 sm:h-10 sm:w-10 sm:shadow-lg ${wishlistActive
              ? 'border-red-200 bg-red-50 text-red-500'
              : 'border-white bg-white/95 text-gray-500 hover:text-red-500 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300'
              }`}
          >
            <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${wishlistActive ? 'fill-current' : ''}`} fill={wishlistActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Quick View Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
          type="button"
          aria-label={`Quick view ${product.name}`}
          className="absolute bottom-3 right-3 z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-white bg-white/95 shadow-lg transition-all duration-300 hover:scale-110 dark:border-gray-700 dark:bg-gray-900/95 sm:flex sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative z-20 flex flex-1 flex-col p-3.5 sm:p-5">
        {/* Category */}
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 sm:text-[11px]">
          {product.category?.name || "General"}
        </span>

        {/* Product Name */}
        <h3 className="mt-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-slate-700 dark:text-white dark:group-hover:text-gray-200 sm:min-h-[2.9rem] sm:text-[15px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-amber-400 fill-current sm:h-4 sm:w-4" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[11px] font-medium text-slate-700 dark:text-gray-300 sm:text-sm">{product.rating || "4.5"}</span>
          </div>
          <span className="hidden text-xs text-slate-400 dark:text-gray-500 sm:inline">({product.ratingCount || 0})</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Rs {price?.toLocaleString()}</span>
          {product.mrp > product.sellingPrice && (
            <span className="text-sm text-slate-400 line-through">Rs {product.mrp?.toLocaleString()}</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-2.5">
          <span
            title={inventory.stockLabel}
            className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:gap-1.5 sm:px-3 sm:text-xs ${inventory.isComingSoon
              ? "bg-sky-50 text-sky-700"
              : inventory.isOutOfStock
                ? "bg-red-50 text-red-700"
                : inventory.isLowStock
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${inventory.isComingSoon
                ? "bg-sky-500"
                : inventory.isOutOfStock
                  ? "bg-red-500"
                  : inventory.isLowStock
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
            />
            <span className="truncate">{inventory.stockLabel}</span>
          </span>
        </div>

        {/* Spacer */}
        <div className="min-h-2 flex-1 sm:min-h-4" />

        <div className="relative z-20 mt-3 grid grid-cols-[44px_minmax(0,1fr)] gap-2.5">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
            type="button"
            className="flex h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product); }}
            type="button"
            disabled={isAddingToCart || !inventory.canAddToCart}
            className="flex h-11 items-center justify-center gap-2 rounded-full px-4 text-[11px] font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            style={{ background: inventory.canAddToCart ? theme.accentGradient : "#9ca3af" }}
          >
            {isAddingToCart ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin sm:h-5 sm:w-5" />
            ) : inventory.canAddToCart ? (
              <>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{inventory.totalStock > 0 ? "Add to Cart" : "Order Now"}</span>
              </>
            ) : (
              inventory.stockLabel
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

/* -------------------------------------------------------------
   PROMOTIONAL BANNER
------------------------------------------------------------- */
const PromoBanner = ({ settings, theme, products = [] }) => {
  if (settings?.homePromoBannerEnabled === false) return null;

  const badgeText = settings?.homePromoBannerBadgeText || DEFAULT_HOME_PROMO_BANNER_BADGE;
  const title = settings?.homePromoBannerTitle || DEFAULT_HOME_PROMO_BANNER_TITLE;
  const description = settings?.homePromoBannerDescription || DEFAULT_HOME_PROMO_BANNER_DESCRIPTION;
  const productCount = clampNumber(settings?.homePromoBannerProductCount || 4, 1, 4);
  const visibleProducts = products.slice(0, productCount);
  const backgroundStyle = buildPromoBannerBackgroundStyle(settings, theme);
  const fallbackSlots = Math.max(productCount - visibleProducts.length, 0);

  return (
    <section className="py-8 sm:py-10">
      <div
        className="relative overflow-hidden rounded-[28px] border border-white/10 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-6 lg:p-7"
        style={backgroundStyle}
      >
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{ backgroundImage: "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.24) 0, transparent 24%), radial-gradient(circle at 86% 82%, rgba(255,255,255,0.14) 0, transparent 22%)" }}
        />
        <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-gradient-to-l from-black/15 via-transparent to-transparent lg:block" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div className="max-w-2xl space-y-4">
            <Badge variant="glass" className="rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.28em]">
              {badgeText}
            </Badge>

            <div className="space-y-2.5">
              <h3 className="max-w-xl text-2xl font-bold leading-tight sm:text-[2rem]">
                {title}
              </h3>
              <p className="max-w-xl text-sm leading-7 text-white/78 sm:text-base">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:scale-[1.02]"
              >
                Browse Products
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                {visibleProducts.length} curated pick{visibleProducts.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {visibleProducts.map((product, index) => {
              const meta = getProductCategoryMeta(product);

              return (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group rounded-[22px] border border-white/10 bg-white/10 p-3 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:bg-white/14"
                >
                  <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
                    <div className="overflow-hidden rounded-[16px] bg-white/90 shadow-inner">
                      {getProductPrimaryImage(product) ? (
                        <img
                          src={getProductPrimaryImage(product)}
                          alt={product.name}
                          className="h-[88px] w-[88px] object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="flex h-[88px] w-[88px] items-center justify-center text-white"
                          style={{ background: `linear-gradient(135deg, ${rgba(theme.secondary, 0.55)} 0%, ${rgba(theme.primary, 0.9)} 100%)` }}
                        >
                          {renderHomeIcon(index % 2 === 0 ? "gift" : "sparkles", "h-8 w-8")}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                        {meta.superName}
                        {meta.subName ? ` • ${meta.subName}` : ""}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">
                        {product.name}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white/88">
                        Rs{Number(product.finalPrice || product.sellingPrice || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}

            {Array.from({ length: fallbackSlots }).map((_, index) => (
              <div
                key={`promo-placeholder-${index}`}
                className="rounded-[22px] border border-dashed border-white/15 bg-white/8 p-3 backdrop-blur-sm"
              >
                <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
                  <div
                    className="flex h-[88px] w-[88px] items-center justify-center rounded-[16px] text-white"
                    style={{ background: `linear-gradient(135deg, ${rgba(theme.secondary, 0.4)} 0%, ${rgba(theme.primary, 0.82)} 100%)` }}
                  >
                    {renderHomeIcon(index % 2 === 0 ? "sparkles" : "gift", "h-8 w-8")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">Selected Product</p>
                    <p className="mt-1 text-sm font-semibold text-white/82">Choose more items from admin settings</p>
                    <p className="mt-2 text-xs text-white/60">This slot fills automatically after selection.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   LOADING STATE
------------------------------------------------------------- */
const LoadingState = ({ theme }) => (
  <div className="flex min-h-[260px] items-center justify-center py-16">
    <div className="rounded-lg border border-gray-200 bg-white/90 px-6 py-5 text-center shadow-lg shadow-gray-200/50 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-black/30">
      <div
        className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-gray-200 border-t-transparent"
        style={{ borderTopColor: theme.primary }}
      />
      <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">Loading fresh picks</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Curating the storefront for you.</p>
    </div>
  </div>
);

/* -------------------------------------------------------------
   EMPTY STATE
------------------------------------------------------------- */
const EmptyState = ({ theme }) => (
  <div className="py-24 text-center">
    <div
      className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-lg shadow-lg"
      style={{ background: theme.soft }}
    >
      <svg className="w-12 h-12" style={{ color: theme.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Products Available</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Check back later for new arrivals!</p>
    <Link
      to="/categories"
      className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
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
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.2)] sm:p-12 lg:p-16 dark:border-gray-800">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: theme.accentGradient }} />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(135deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
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
                className="w-full rounded-lg border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>
            <button
              type={buttonLink ? "button" : "submit"}
              onClick={buttonLink ? handleButtonClick : undefined}
              className="rounded-lg px-8 py-4 font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
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
    <section className="border-t border-slate-200 bg-[#eef3f8] py-16 dark:border-gray-800 dark:bg-gray-950 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-5 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
          <span
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em]"
            style={{ color: theme.primary }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.primary }} />
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Shop With Confidence
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-lg mx-auto">
            We provide the best shopping experience with premium quality products and exceptional service.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {features.slice(0, 4).map((feature, index) => (
            <div
              key={`${feature.title}-${index}`}
              className="group rounded-[24px] border border-slate-200 bg-white p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)] dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-900/80"
            >
              <div
                className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-105"
                style={{ background: theme.accentGradient }}
              >
                {typeof feature.icon === "string" ? renderHomeIcon(feature.icon, "w-8 h-8") : feature.icon}
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{feature.title}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
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

.home-page [data-product-card='true'] {
  scroll-snap-align: start;
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
  .animate-ping {
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
