// src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import ProductQuickView from "../components/product/ProductQuickView";

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
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight dark:text-white">
        {title}
      </h2>
    </div>
    {(viewAllLink || count !== null) && !centered && (
      <div className="flex items-center gap-3">
        {count !== null && (
          <span className="hidden rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300 sm:inline-flex">
            {count} Items
          </span>
        )}
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="group inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
        <HeroBanner settings={settings} theme={homeTheme} />

        <main className="mx-auto max-w-[1560px] px-3 sm:px-4 lg:px-5 xl:px-6">
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
          {loading && <LoadingState theme={homeTheme} />}

          {/* Category Product Sections */}
          {!loading &&
            Object.keys(grouped).map((superCat) => (
          <section key={superCat} className="py-12 sm:py-16 lg:py-20 border-t border-gray-200/70 dark:border-gray-800">
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
      <section className="relative flex min-h-[520px] items-center overflow-hidden sm:min-h-[600px] lg:min-h-[700px]">
        {/* Background Pattern */}
        <div className="absolute inset-0" style={heroBackgroundStyle} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: theme.accentGradient }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #111827 1px, transparent 1px), linear-gradient(180deg, #111827 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative max-w-[1560px] mx-auto px-3 sm:px-4 lg:px-5 xl:px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-4 text-center sm:space-y-6 lg:text-left">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme.primary }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme.primary }} />
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{heroTagline}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                {heroTitle.split(' ').slice(0, 2).join(' ')}
                <span className="block mt-1 bg-clip-text text-transparent" style={{ backgroundImage: theme.accentGradient }}>
                  {heroTitle.split(' ').slice(2).join(' ')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto max-w-lg text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl lg:mx-0">
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
                    className="w-full rounded-lg border border-gray-200 bg-white py-4 pl-12 pr-28 text-gray-900 shadow-lg shadow-gray-200/50 transition-all placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:shadow-black/20 dark:placeholder-gray-500 sm:pl-14 sm:pr-32"
                    style={{ '--tw-ring-color': theme.primary }}
                  />
                  <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg sm:px-6"
                    style={{ background: theme.accentGradient }}
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Popular:</span>
                {["Electronics", "Fashion", "Home", "Beauty"].map((tag) => (
                  <Link
                    key={tag}
                    to={`/products?category=${encodeURIComponent(tag)}`}
                    className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              <HeroStatsGrid
                items={heroStats}
                theme={theme}
                className="hidden pt-4 sm:grid lg:hidden"
              />

              <HeroStatsRail
                items={heroStats}
                theme={theme}
                className="pt-5 sm:hidden"
              />

              <HeroHighlightsGrid
                items={heroHighlights}
                theme={theme}
                className="hidden lg:hidden"
              />
            </div>

            {/* Right - Stats & Visual */}
            <div className="hidden lg:block">
              <div className="mx-auto max-w-[430px] space-y-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-6 shadow-2xl shadow-gray-300/30 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-black/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">
                        Hero Statistics
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        Numbers that impress
                      </h3>
                    </div>
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-lg"
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
      className="relative h-[430px] overflow-hidden xs:h-[460px] sm:h-[560px] lg:h-[700px]"
      style={heroBackgroundStyle}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {bannerImages.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${index === currentSlide
            ? "opacity-100 scale-100 z-10"
            : "opacity-0 scale-105 z-0"
            } ${img.link ? "cursor-pointer" : ""}`}
          onClick={() => handleImageClick(img.link)}
        >
          {/* Image */}
          <img
            src={img.url}
            alt={`Banner ${index + 1}`}
            className="h-full w-full object-cover"
            style={{ objectFit: heroImageFit }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
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
                <div className="max-w-2xl space-y-3 sm:space-y-5 lg:space-y-6">
                  <Badge variant="glass">{heroTagline}</Badge>

                  <h1 className="text-2xl font-bold leading-tight text-white xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
                    {heroTitle}
                  </h1>

                  <p className="max-w-xl text-sm leading-relaxed text-white/80 xs:text-base sm:text-lg">
                    {heroSubtitle}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-1 sm:gap-4 sm:pt-2">
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all hover:scale-105 hover:bg-gray-100 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Shop Now
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link
                      to="/categories"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:px-8 sm:py-4 sm:text-base"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Browse Categories
                    </Link>
                  </div>

                  <HeroStatsGrid
                    items={heroStats}
                    theme={theme}
                    variant="glass"
                    className="hidden pt-2 sm:grid lg:hidden"
                  />

                  <HeroStatsRail
                    items={heroStats}
                    theme={theme}
                    variant="glass"
                    className="pt-5 sm:hidden"
                  />

                  <HeroHighlightsGrid
                    items={heroHighlights}
                    theme={theme}
                    variant="glass"
                    className="hidden lg:hidden"
                  />
                </div>

                <div
                  className="hidden lg:block justify-self-end w-full max-w-[380px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-4">
                    <div className="rounded-lg border border-white/20 bg-white/12 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                            Hero Statistics
                          </p>
                          <h3 className="mt-2 text-2xl font-bold text-white">
                            Visitor-first confidence
                          </h3>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/12 text-white">
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
        <div className="absolute bottom-4 right-3 z-20 sm:bottom-5 sm:right-4 lg:right-6">
          <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-black/20 px-2.5 py-2 text-white shadow-xl backdrop-blur-xl">
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="rounded-lg bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              aria-label="Previous slide"
            >
              Prev
            </button>
            <span className="min-w-[74px] px-2 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
              {String(currentSlide + 1).padStart(2, "0")} / {String(bannerImages.length).padStart(2, "0")}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="rounded-lg bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              aria-label="Next slide"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Dots */}
      {hasMultipleImages && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
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
    <div className="relative z-20 py-5 sm:-mt-10 sm:py-6">
      <div className="rounded-lg border border-gray-200 bg-white/95 p-5 shadow-xl shadow-gray-200/50 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 dark:shadow-black/30 sm:p-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {badges.slice(0, 4).map((badge, index) => (
            <div
              key={`${badge.title}-${index}`}
              className="group flex items-center gap-4"
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 sm:h-14 sm:w-14"
                style={{ background: theme.soft, color: theme.primary }}
              >
                {typeof badge.icon === "string" ? renderHomeIcon(badge.icon, "w-6 h-6") : badge.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{badge.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">{badge.description}</p>
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
              <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gray-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  {/* Sub-category Badge */}
                  {subCount > 0 && (
                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-900 shadow-lg dark:bg-gray-900 dark:text-white">
                      {subCount}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 text-center">
                  <h3 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-gray-700 dark:text-white dark:group-hover:text-gray-200 sm:text-base">
                    {category.name}
                  </h3>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 flex h-8 w-8 translate-y-2 items-center justify-center rounded-lg bg-white text-gray-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-900 dark:text-gray-200">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="relative group/strip -mx-2 sm:-mx-3 lg:-mx-5 xl:-mx-6">
      {(showLeftArrow || showRightArrow) && (
        <>
          <button
            type="button"
            onClick={() => scrollProducts(-1)}
            disabled={!showLeftArrow}
            aria-label="Scroll products left"
            className={`absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-white/80 bg-white text-gray-700 shadow-[0_18px_45px_rgba(15,23,42,0.14)] transition-all duration-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 lg:flex ${showLeftArrow
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
            className={`absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-white/80 bg-white text-gray-700 shadow-[0_18px_45px_rgba(15,23,42,0.14)] transition-all duration-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 lg:flex ${showRightArrow
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
        className={`flex gap-3 sm:gap-5 lg:gap-6 overflow-x-auto pb-4 pt-2 px-2 sm:px-3 lg:px-5 xl:px-6 scroll-smooth scrollbar-hide snap-x snap-mandatory ${isDragging ? "cursor-grabbing select-none" : "lg:cursor-grab"}`}
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

      <div className="mt-4 flex flex-col gap-3 px-2 sm:px-3 lg:px-5 xl:px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white/85 px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/85 dark:text-gray-300 sm:text-sm">
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
              className={`flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 ${showLeftArrow
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
              className={`flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 ${showRightArrow
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
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const inventory = getProductInventory(product);

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
    <div
      data-product-card="true"
      className="group flex w-[44vw] min-w-[150px] max-w-[190px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gray-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 sm:w-[240px] sm:min-w-[240px] sm:max-w-[240px] lg:w-[280px] lg:min-w-[280px] lg:max-w-[280px]"
    >
      {/* Image Container */}
      <Link to={`/products/${product._id}`} className="relative block h-28 overflow-hidden bg-gray-100 dark:bg-gray-800 sm:h-56">
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
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border shadow-md transition-all duration-300 hover:scale-110 sm:right-3 sm:top-3 sm:h-10 sm:w-10 sm:shadow-lg ${isWishlisted
            ? 'border-red-200 bg-red-50 text-red-500'
            : 'border-white bg-white/95 text-gray-500 hover:text-red-500 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300'
            }`}
        >
          <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${isWishlisted ? 'fill-current' : ''}`} fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
          type="button"
          aria-label={`Quick view ${product.name}`}
          className="absolute bottom-3 right-3 hidden h-10 w-10 items-center justify-center rounded-lg border border-white bg-white/95 shadow-lg transition-all duration-300 hover:scale-110 dark:border-gray-700 dark:bg-gray-900/95 sm:flex sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-5">
        {/* Category */}
        <span className="truncate text-[9px] font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 sm:text-xs sm:tracking-wider">
          {product.category?.name || "General"}
        </span>

        {/* Product Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="mt-1.5 min-h-[2rem] font-semibold text-gray-900 text-[12px] leading-snug line-clamp-2 transition-colors hover:text-gray-600 dark:text-white dark:hover:text-gray-200 sm:mt-2 sm:min-h-[2.75rem] sm:text-base">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-amber-400 fill-current sm:h-4 sm:w-4" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 sm:text-sm">{product.rating || "4.5"}</span>
          </div>
          <span className="hidden text-xs text-gray-400 dark:text-gray-500 sm:inline">({product.ratingCount || 0} reviews)</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex flex-wrap items-center gap-1 sm:mt-3 sm:gap-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">Rs {price?.toLocaleString()}</span>
          {product.mrp > product.sellingPrice && (
            <span className="text-sm text-gray-400 line-through">Rs {product.mrp?.toLocaleString()}</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-2 sm:mt-3">
          <span
            title={inventory.stockLabel}
            className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold sm:gap-1.5 sm:px-3 sm:text-xs ${inventory.isComingSoon
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

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
          type="button"
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 py-2 text-[11px] font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:mt-3 sm:gap-2 sm:py-2.5 sm:text-sm"
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="sm:hidden">View</span>
          <span className="hidden sm:inline">Quick View</span>
        </button>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product); }}
          type="button"
          disabled={isAddingToCart || !inventory.canAddToCart}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[11px] font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:mt-4 sm:gap-2 sm:py-3 sm:text-sm"
          style={{ background: inventory.canAddToCart ? theme.accentGradient : '#9ca3af' }}
        >
          {isAddingToCart ? (
            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin sm:h-5 sm:w-5" />
          ) : inventory.canAddToCart ? (
            <>
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="sm:hidden">{inventory.totalStock > 0 ? "Cart" : "Order"}</span>
              <span className="hidden sm:inline">{inventory.totalStock > 0 ? "Add to Cart" : "Order Now"}</span>
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
    <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
      {/* Banner 1 */}
      <div
        className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-lg border border-gray-800 bg-gray-950 p-7 text-white shadow-xl shadow-gray-300/20 transition-transform duration-500 hover:-translate-y-1 sm:p-9"
      >
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: theme.accentGradient }} />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(135deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative z-10">
          <Badge variant="glass" className="mb-4">Limited Time</Badge>
          <h3 className="max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">Fresh Deals For Your Cart</h3>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-white/70">Save more on selected favorites before they sell out.</p>
        </div>

        <Link
          to="/products?sale=summer"
          className="relative z-10 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-gray-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-100 group-hover:shadow-xl"
        >
          Shop Sale
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Banner 2 */}
      <div className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-lg border border-gray-800 bg-gray-950 p-7 text-white shadow-xl shadow-gray-300/20 transition-transform duration-500 hover:-translate-y-1 sm:p-9">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: theme.accentGradient }} />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(135deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <div className="relative z-10">
          <Badge variant="glass" className="mb-4">Just Arrived</Badge>
          <h3 className="max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">New Season Edit</h3>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-white/70">Browse the latest products picked for everyday style.</p>
        </div>

        <Link
          to="/products?new=true"
          className="relative z-10 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-gray-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-100 group-hover:shadow-xl"
        >
          Explore Now
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="relative overflow-hidden rounded-lg bg-gray-950 p-8 text-center shadow-2xl shadow-gray-300/20 sm:p-12 lg:p-16">
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
    <section className="border-t border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950 sm:py-20">
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Shop With Confidence
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-lg mx-auto">
            We provide the best shopping experience with premium quality products and exceptional service.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.slice(0, 4).map((feature, index) => (
            <div
              key={`${feature.title}-${index}`}
              className="group rounded-lg border border-gray-200 bg-gray-50 p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-900/80"
            >
              <div
                className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-lg text-white shadow-lg transition-transform group-hover:scale-105"
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
