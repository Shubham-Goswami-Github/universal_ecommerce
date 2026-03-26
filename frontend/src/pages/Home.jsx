// src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import ProductQuickView from "../components/product/ProductQuickView";

/* -------------------------------------------------------------
   DESIGN SYSTEM CONSTANTS - UPDATED BLUE THEME
------------------------------------------------------------- */
const COLORS = {
  primary: {
    50: '#eaf2ff',
    100: '#dce7ff',
    500: '#0056b3',
    600: '#004a9c',
    700: '#003d82',
  },
  accent: {
    cyan: '#00c4ff',
    light: '#00a0ff',
  },
  text: {
    primary: '#0d1b2a',
    secondary: '#4a5e80',
    muted: '#6c7a90',
  },
  background: {
    primary: '#f7faff',
    card: '#ffffff',
    glass: 'rgba(255,255,255,0.8)',
  }
};

const DEFAULT_HOME_HERO_TAGLINE = "New Collection 2024";
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
  const safeHex = normalizeHex(hex, "#0056b3");
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
  const primary = normalizeHex(settings?.homeAccentPrimary, "#0056b3");
  const secondary = normalizeHex(settings?.homeAccentSecondary, "#00a0ff");
  return {
    primary,
    secondary,
    soft: rgba(primary, 0.08),
    softStrong: rgba(primary, 0.14),
    border: rgba(primary, 0.18),
    shadow: rgba(primary, 0.18),
    glow: rgba(secondary, 0.16),
    heroBackground: `linear-gradient(180deg, ${rgba(primary, 0.06)} 0%, #ffffff 50%, ${rgba(secondary, 0.08)} 100%)`,
    accentGradient: `linear-gradient(135deg, ${primary}, ${secondary})`,
  };
};

const buildHomeBackgroundStyle = (settings) => {
  const backgroundSize = settings?.homeBackgroundSize === "custom"
    ? `${settings?.homeBackgroundWidth || "auto"} ${settings?.homeBackgroundHeight || "auto"}`
    : settings?.homeBackgroundSize || "cover";
  const accentPrimary = settings?.homeBackgroundAccentPrimary || settings?.homeAccentPrimary || "#0056b3";
  const accentSecondary = settings?.homeBackgroundAccentSecondary || settings?.homeAccentSecondary || "#00a0ff";
  const overlay = `linear-gradient(135deg, ${accentPrimary}59 0%, ${accentSecondary}40 100%)`;

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

const renderHomeIcon = (icon, className = "w-6 h-6") => {
  switch (icon) {
    case "shipping":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    case "shield":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "returns":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case "support":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "star":
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
};

/* -------------------------------------------------------------
   STAR RATING COMPONENT
------------------------------------------------------------- */
const StarRating = ({ rating = 4, count = 0, size = "sm" }) => {
  const sizes = {
    sm: "w-3 h-3 sm:w-3.5 sm:h-3.5",
    md: "w-3.5 h-3.5 sm:w-4 sm:h-4",
    lg: "w-4 h-4 sm:w-5 sm:h-5"
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = star === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <div key={star} className="relative">
              <svg
                className={`${sizes[size]} text-gray-200`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {(filled || partial) && (
                <svg
                  className={`${sizes[size]} text-amber-400 absolute inset-0`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={partial ? { clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` } : {}}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
      {count > 0 && (
        <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
   SECTION HEADER COMPONENT - REDESIGNED
------------------------------------------------------------- */
const SectionHeader = ({ 
  title, 
  subtitle,
  viewAllLink, 
  viewAllLabel = "View All",
  centered = false,
  count = null,
  theme = getHomeTheme(),
}) => (
  <div className={`mb-6 sm:mb-8 md:mb-10 ${centered ? 'text-center' : 'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'}`}>
    <div>
      {subtitle && (
        <span className="inline-block text-xs sm:text-sm font-semibold tracking-wide uppercase mb-1 sm:mb-2" style={{ color: theme.primary }}>
          {subtitle}
        </span>
      )}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0d1b2a] tracking-tight leading-tight">
        {title.split(' ').map((word, i) => 
          i === 1 ? (
            <span key={i} className="bg-clip-text text-transparent" style={{ backgroundImage: theme.accentGradient }}> {word} </span>
          ) : (
            <span key={i}>{word} </span>
          )
        )}
      </h2>
    </div>
    {(viewAllLink || count !== null) && !centered && (
      <div className="flex items-center gap-3">
        {count !== null && (
          <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm border" style={{ backgroundColor: theme.soft, color: theme.primary, borderColor: theme.border }}>
            {count} Items
          </span>
        )}
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="group flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:shadow-lg"
            style={{ background: theme.accentGradient, boxShadow: `0 10px 30px ${theme.shadow}` }}
          >
            {viewAllLabel}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        )}
      </div>
    )}
  </div>
);

/* -------------------------------------------------------------
   BADGE COMPONENT - REDESIGNED
------------------------------------------------------------- */
const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-[#eaf2ff] text-[#0056b3] border border-[#dce7ff]",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    danger: "bg-red-50 text-red-600 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    premium: "bg-gradient-to-r from-[#0056b3] to-[#00a0ff] text-white",
    glass: "bg-white/20 backdrop-blur-sm text-white border border-white/30",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};

/* -------------------------------------------------------------
   SKELETON LOADER - REDESIGNED
------------------------------------------------------------- */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gradient-to-r from-[#eaf2ff] via-white to-[#eaf2ff] bg-[length:200%_100%] rounded-xl ${className}`} />
);

const ProductCardSkeleton = () => (
  <div className="min-w-[232px] sm:min-w-[248px] lg:min-w-[256px] max-w-[232px] sm:max-w-[248px] lg:max-w-[256px] bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-lg">
    <Skeleton className="h-40 sm:h-44 lg:h-48 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-3 w-20 rounded-full" />
      <Skeleton className="h-5 w-full rounded-lg" />
      <Skeleton className="h-3 w-32 rounded-lg" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-lg" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  </div>
);

/* -------------------------------------------------------------
   CART NOTIFICATION COMPONENT - NEW
------------------------------------------------------------- */
const CartNotification = ({ message, type = "success", onClose }) => {
  const isError = type === "error" || message?.toLowerCase().includes("denied") || message?.toLowerCase().includes("failed");
  
  return (
    <div className={`fixed top-20 right-4 lg:top-24 z-[95] max-w-sm w-full mx-4 sm:mx-0 animate-slide-in-right`}>
      <div className={`rounded-2xl p-4 shadow-2xl backdrop-blur-xl border ${
        isError 
          ? 'bg-red-50/95 border-red-200 text-red-800' 
          : 'bg-white/95 border-emerald-200 text-emerald-800'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            isError ? 'bg-red-100' : 'bg-emerald-100'
          }`}>
            {isError ? (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              {isError ? 'Action Failed' : 'Added to Cart'}
            </p>
            <p className={`text-sm mt-0.5 ${isError ? 'text-red-600' : 'text-emerald-600'}`}>
              {message}
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
              isError ? 'hover:bg-red-100' : 'hover:bg-emerald-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    // Check if user is logged in
    if (!auth || !auth.user) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    // Check if user role is "user" (customer)
    const userRole = auth.user.role?.toLowerCase();
    if (userRole !== "user") {
      setCartMessage("Access denied: Only customers can add items to cart");
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
      className="relative isolate min-h-screen overflow-x-hidden"
      style={{
        "--home-accent-primary": homeTheme.primary,
        "--home-accent-secondary": homeTheme.secondary,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{ background: homeTheme.heroBackground }}
      />
      {quickViewOpen && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}

      {cartMessage && (
        <CartNotification 
          message={cartMessage} 
          onClose={() => setCartMessage("")}
        />
      )}

      {/* Background decorations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" style={{ background: `linear-gradient(135deg, ${rgba(homeTheme.primary, 0.12)}, ${rgba(homeTheme.secondary, 0.12)})` }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2" style={{ background: `linear-gradient(135deg, ${rgba(homeTheme.primary, 0.1)}, ${rgba(homeTheme.secondary, 0.1)})` }} />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={homeBackgroundStyle}
      />

      <div className="relative z-10">
        <AnnouncementBar theme={homeTheme} />
        <HeroBanner settings={settings} />

        <div className="max-w-[92rem] mx-auto px-2 sm:px-3 lg:px-4">
          <TrustBadges settings={settings} theme={homeTheme} />

        {!loading && superCategories.length > 0 && (
          <section className="py-10 sm:py-14 md:py-20">
            <SectionHeader 
              title="Shop by Category" 
              subtitle="Browse Collections"
              viewAllLink="/categories" 
              theme={homeTheme}
            />
            <CategoryGrid 
              categories={superCategories} 
              allCategories={categories} 
            />
          </section>
        )}

        {!loading && displayFeatured.length > 0 && (
          <section className="py-10 sm:py-14 md:py-20">
            <SectionHeader 
              title="Featured Products" 
              subtitle="Handpicked for You"
              viewAllLink="/products?featured=true"
              count={displayFeatured.length}
              theme={homeTheme}
            />
            <QuickFilters theme={homeTheme} />
            <ProductStrip products={displayFeatured} theme={homeTheme} onQuickView={handleQuickView} onAddToCart={handleAddToCart} addingToCartId={addingToCartId} />
          </section>
        )}

        {!loading && <PromoBanner theme={homeTheme} />}

        {!loading && bestSellers.length > 0 && (
          <section className="py-10 sm:py-14 md:py-20">
            <SectionHeader 
              title="Best Sellers" 
              subtitle="Customer Favorites"
              viewAllLink="/products?sort=bestselling"
              count={bestSellers.length}
              theme={homeTheme}
            />
            <ProductStrip products={bestSellers} theme={homeTheme} onQuickView={handleQuickView} onAddToCart={handleAddToCart} addingToCartId={addingToCartId} />
          </section>
        )}

        {loading && <LoadingState />}

        {!loading &&
          Object.keys(grouped).map((superCat) => (
            <section key={superCat} className="py-10 sm:py-14 md:py-20 border-t border-[#eaf2ff]">
              <SectionHeader
                title={`Explore ${superCat}`}
                viewAllLink={`/products?category=${encodeURIComponent(superCat)}`}
                count={grouped[superCat].length}
                theme={homeTheme}
              />
              <ProductStrip products={grouped[superCat]} theme={homeTheme} onQuickView={handleQuickView} onAddToCart={handleAddToCart} addingToCartId={addingToCartId} />
            </section>
          ))}

        {!loading && products.length === 0 && <EmptyState theme={homeTheme} />}

          {!loading && <Newsletter theme={homeTheme} />}
        </div>

        <FeaturesSection settings={settings} theme={homeTheme} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   ANNOUNCEMENT BAR - REDESIGNED
------------------------------------------------------------- */
const AnnouncementBar = ({ theme = getHomeTheme() }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative text-white py-2.5 sm:py-3 overflow-hidden" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.primary}, ${theme.secondary})` }}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10S0 14.5 0 20s4.5 10 10 10 10-4.5 10-10zm10 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }} />
      </div>
      
      <div className="max-w-[92rem] mx-auto px-3 sm:px-4 flex items-center justify-center relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <p className="text-xs sm:text-sm font-medium text-center">
            🎉 Free shipping on orders over ₹499 | Use code: <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">WELCOME10</span> for 10% off
          </p>
        </div>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/* -------------------------------------------------------------
   HERO BANNER - COMPLETELY REDESIGNED
------------------------------------------------------------- */
const HeroBanner = ({ settings }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
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

  const bannerSettings = settings?.heroBannerSettings || {
    autoSlide: true,
    slideSpeed: 5000,
  };
  const heroTagline = settings?.homeHeroTagline || DEFAULT_HOME_HERO_TAGLINE;
  const heroStats = getContentItems(settings?.homeHeroStats, DEFAULT_HOME_HERO_STATS);
  const heroHighlights = getContentItems(settings?.homeHeroHighlights, DEFAULT_HOME_HERO_HIGHLIGHTS);

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

  const quickSearchTags = ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports"];

  /* -- Fallback Hero (No Images) -- */
  if (!hasImages) {
    return (
      <section className="relative overflow-hidden">
        {/* Background gradient matching the design */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f7faff] via-[#eaf2ff] to-[#f7faff]" />
        
        {/* Decorative blobs */}
        <div className="absolute top-[-180px] right-[-160px] w-[420px] h-[420px] bg-gradient-to-br from-[#0056b3] to-[#00c4ff] opacity-10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-gradient-to-br from-[#00a0ff] to-[#0056b3] opacity-8 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-[92rem] mx-auto px-3 sm:px-4 lg:px-5 py-16 sm:py-20 md:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            
            {/* LEFT CONTENT */}
            <div className="text-center lg:text-left">
              {/* Tagline badge */}
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#dce7ff] rounded-full px-4 py-2 mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0056b3] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0056b3]"></span>
                </span>
                <span className="text-[#0056b3] text-sm font-medium">{heroTagline}</span>
              </div>

              {/* Main heading with gradient */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0d1b2a] leading-[1.1] tracking-tight">
                {settings?.homepageTitle || (
                  <>
                    Find Your Perfect
                    <span className="block bg-gradient-to-r from-[#0056b3] to-[#00a0ff] bg-clip-text text-transparent">
                      Products & Deals
                    </span>
                    with Our Modern Store
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="mt-5 sm:mt-6 text-base sm:text-lg text-[#4a5e80] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {settings?.homepageSubtitle ||
                  "Discover amazing products, exclusive deals, and fast delivery — curated for shoppers who value quality."}
              </p>

              {/* SEARCH BOX - Glassmorphism style */}
              <form onSubmit={handleSearch} className="mt-8 bg-white/75 backdrop-blur-xl border border-white/50 rounded-2xl p-3 sm:p-4 shadow-xl shadow-[#0056b3]/5">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c7a90]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products, brands..."
                      className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl border border-[#dce7ff] bg-[#f7faff] text-[#0d1b2a] placeholder-[#6c7a90] focus:bg-white focus:border-[#0056b3] focus:ring-4 focus:ring-[#0056b3]/15 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* Category/Location Input */}
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c7a90]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Category or Brand"
                      className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl border border-[#dce7ff] bg-[#f7faff] text-[#0d1b2a] placeholder-[#6c7a90] focus:bg-white focus:border-[#0056b3] focus:ring-4 focus:ring-[#0056b3]/15 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-[#0056b3] hover:bg-[#004a9c] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#0056b3]/30 text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </form>

              {/* Quick Search Tags */}
              <div className="mt-5 flex flex-wrap gap-2 justify-center lg:justify-start">
                {quickSearchTags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/products?category=${encodeURIComponent(tag)}`}
                    className="px-4 py-2 bg-[#eaf2ff] hover:bg-[#dce7ff] border border-[#dce7ff] rounded-full text-[#004a9c] text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT - FLOATING PRODUCT CARDS */}
            <div className="hidden lg:block relative h-[450px]">
              <div className="absolute inset-0 flex items-center justify-center">
                
                {/* Card 1 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] bg-white rounded-2xl p-5 border border-[#eaf2ff] shadow-xl shadow-[#0056b3]/10 animate-float" style={{ '--float-delay': '0s' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#eaf2ff] to-[#dce7ff] flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#0056b3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0d1b2a]">Premium Electronics</h3>
                      <p className="text-[#6c7a90] text-sm">Latest gadgets & devices</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-[#eaf2ff] rounded-lg text-xs font-medium text-[#0056b3]">New Arrival</span>
                    <span className="px-3 py-1 bg-[#eaf2ff] rounded-lg text-xs font-medium text-[#0056b3]">Trending</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="absolute top-[140px] left-1/2 -translate-x-1/2 w-[80%] bg-white rounded-2xl p-5 border border-[#eaf2ff] shadow-xl shadow-[#0056b3]/10 animate-float-delayed" style={{ transform: 'translateX(-50%) rotate(2deg)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0d1b2a]">Fashion Collection</h3>
                      <p className="text-[#6c7a90] text-sm">Curated styles for you</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-amber-50 rounded-lg text-xs font-medium text-amber-700">50% Off</span>
                    <span className="px-3 py-1 bg-emerald-50 rounded-lg text-xs font-medium text-emerald-700">Free Ship</span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="absolute top-[280px] left-1/2 -translate-x-1/2 w-[80%] bg-white rounded-2xl p-5 border border-[#eaf2ff] shadow-xl shadow-[#0056b3]/10 animate-float" style={{ transform: 'translateX(-50%) rotate(-1deg)', animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0d1b2a]">Home & Living</h3>
                      <p className="text-[#6c7a90] text-sm">Transform your space</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-emerald-50 rounded-lg text-xs font-medium text-emerald-700">Best Seller</span>
                    <span className="px-3 py-1 bg-violet-50 rounded-lg text-xs font-medium text-violet-700">Premium</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto lg:mx-0">
            {heroStats.map((stat, i) => (
              <div key={i} className="text-center lg:text-left p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50">
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#0056b3] to-[#00a0ff] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[#4a5e80] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* -- Slideshow Hero -- */
  return (
    <section 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {bannerImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              index === currentSlide 
                ? "opacity-100 scale-100 z-10" 
                : "opacity-0 scale-105 z-0"
            } ${img.link ? "cursor-pointer" : ""}`}
            onClick={() => handleImageClick(img.link)}
          >
            {!imageLoaded[index] && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#eaf2ff] via-white to-[#eaf2ff] animate-pulse" />
            )}
            <img
              src={img.url}
              alt={`Banner ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imageLoaded[index] ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded((prev) => ({ ...prev, [index]: true }))}
              onError={(e) => { e.target.src = "https://via.placeholder.com/1920x600?text=Banner"; }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b2a]/80 via-[#0d1b2a]/50 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-[92rem] mx-auto px-3 sm:px-4 lg:px-5 w-full">
                <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="max-w-lg pl-2 pr-3 sm:pl-4 sm:pr-4 lg:max-w-2xl lg:pl-6">
                    <Badge variant="glass">{heroTagline}</Badge>

                    <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                      {settings?.homepageTitle || "Shopping And Department Store"}
                    </h1>

                    <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-white/80 leading-relaxed max-w-md">
                      {settings?.homepageSubtitle || "Discover amazing products at unbeatable prices."}
                    </p>

                    <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                      <Link
                        to="/products"
                        className="group inline-flex items-center gap-2 bg-white text-[#0d1b2a] px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold hover:bg-[#f7faff] transition-all shadow-xl hover:shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Shop Now
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                      <Link
                        to="/categories"
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:bg-white/20 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Browse Categories
                      </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:max-w-3xl">
                      {heroStats.map((stat, statIndex) => (
                        <div
                          key={`${stat.label}-${statIndex}`}
                          className="min-w-0 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-3.5 text-center lg:text-left"
                        >
                          <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-none">{stat.value}</div>
                          <div className="mt-1 text-[11px] sm:text-sm text-white/70 leading-snug break-words">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-col gap-4 justify-center">
                    {heroHighlights.slice(0, 2).map((highlight, index) => (
                      <div
                        key={`${highlight.title}-${index}`}
                        className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                            {renderHomeIcon(highlight.icon, "w-6 h-6")}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">{highlight.title}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-white/75">{highlight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300"
            >
              <svg className="w-5 h-5 text-[#0d1b2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300"
            >
              <svg className="w-5 h-5 text-[#0d1b2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "bg-white w-8" 
                    : "bg-white/40 hover:bg-white/60 w-2.5"
                }`}
              />
            ))}
          </div>
        )}

        {/* Slide Counter */}
        {hasMultipleImages && (
          <div className="absolute top-6 right-6 z-20 bg-[#0d1b2a]/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full font-medium">
            {currentSlide + 1} / {bannerImages.length}
          </div>
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   TRUST BADGES - REDESIGNED
------------------------------------------------------------- */
const TrustBadges = ({ settings, theme = getHomeTheme() }) => {
  const badges = getContentItems(settings?.homeTrustBadges, DEFAULT_HOME_TRUST_BADGES);

  return (
    <div className="py-6 sm:py-8 -mt-8 sm:-mt-12 relative z-20">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/50 p-5 sm:p-8" style={{ boxShadow: `0 18px 40px ${rgba(theme.primary, 0.08)}` }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {badges.slice(0, 4).map((badge, index) => (
            <div
              key={`${badge.title}-${index}`}
              className="flex items-center gap-3 sm:gap-4 group cursor-pointer"
            >
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300" style={{ background: `linear-gradient(135deg, ${theme.soft}, ${theme.softStrong})`, color: theme.primary }}>
                {typeof badge.icon === "string" ? renderHomeIcon(badge.icon, "w-6 h-6 sm:w-7 sm:h-7") : badge.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-[#0d1b2a] text-sm sm:text-base truncate">{badge.title}</h4>
                <p className="text-[#6c7a90] text-xs sm:text-sm mt-0.5 truncate">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   QUICK FILTERS
------------------------------------------------------------- */
const QuickFilters = ({ theme = getHomeTheme() }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'All', icon: 'grid' },
    { id: 'new', label: 'New Arrivals', icon: 'sparkles' },
    { id: 'trending', label: 'Trending', icon: 'fire' },
    { id: 'sale', label: 'On Sale', icon: 'tag' },
  ];

  return (
    <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveFilter(filter.id)}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
            activeFilter === filter.id
              ? 'text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-sm text-[#4a5e80] hover:-translate-y-0.5'
          }`}
          style={activeFilter === filter.id ? { background: theme.accentGradient, boxShadow: `0 12px 28px ${theme.shadow}` } : { border: `1px solid ${theme.border}` }}
        >
          {filter.icon === 'grid' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          )}
          {filter.icon === 'sparkles' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
          {filter.icon === 'fire' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          )}
          {filter.icon === 'tag' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          )}
          {filter.label}
        </button>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------
   CATEGORY GRID - REDESIGNED
------------------------------------------------------------- */
const CategoryGrid = ({ categories, allCategories }) => {
  const getSubCategoryCount = (categoryId) =>
    allCategories.filter((c) => c.parent === categoryId || c.parent?._id === categoryId).length;

  const GRADIENTS = [
    "from-[#7C4DFF]/10 to-[#00D1B2]/10",
    "from-[#0056b3]/10 to-[#00a0ff]/10",
    "from-[#FF6B6B]/10 to-[#FFD93D]/10",
    "from-[#6C5CE7]/10 to-[#A29BFE]/10",
    "from-[#00D1B2]/10 to-[#00B894]/10",
    "from-[#FD79A8]/10 to-[#FDCB6E]/10",
    "from-rose-100/80 to-pink-50/80",
    "from-amber-100/80 to-yellow-50/80",
  ];

  const ICON_BG_GRADIENTS = [
    "from-[#7C4DFF] to-[#00D1B2]",
    "from-[#0056b3] to-[#00a0ff]",
    "from-[#FF6B6B] to-[#FFD93D]",
    "from-[#6C5CE7] to-[#A29BFE]",
    "from-[#00D1B2] to-[#00B894]",
    "from-[#FD79A8] to-[#FDCB6E]",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-yellow-500",
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
      {categories.slice(0, 12).map((category, index) => {
        const gradient = GRADIENTS[index % GRADIENTS.length];
        const iconGradient = ICON_BG_GRADIENTS[index % ICON_BG_GRADIENTS.length];
        const subCount = getSubCategoryCount(category._id);

        return (
          <Link
            key={category._id}
            to={`/category/${category._id}`}
            className="group"
          >
            <div className={`relative bg-gradient-to-br ${gradient} backdrop-blur-sm rounded-2xl p-5 sm:p-6 h-full min-h-[160px] sm:min-h-[180px] flex flex-col items-center justify-center text-center overflow-hidden border border-white/50 shadow-sm hover:shadow-xl hover:shadow-[#0056b3]/10 transition-all duration-500 hover:-translate-y-2`}>
              
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-50">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/30 rounded-full blur-xl" />
                <div className="absolute -left-4 -top-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />
              </div>

              {/* Icon Box */}
              <div className="relative mb-4">
                {category.image ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}

                {/* Sub-category count badge */}
                {subCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#0d1b2a] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {subCount}
                  </span>
                )}
              </div>

              {/* Name */}
              <h3 className="relative font-bold text-[#0d1b2a] text-sm sm:text-base group-hover:text-[#0056b3] transition-colors line-clamp-2">
                {category.name}
              </h3>

              {/* Hover arrow */}
              <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg className="w-4 h-4 text-[#0056b3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------
   PRODUCT STRIP - REDESIGNED WITH PROFESSIONAL ARROWS
------------------------------------------------------------- */
const ProductStrip = ({ products, theme = getHomeTheme(), onQuickView, onAddToCart, addingToCartId }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
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
      };
    }
  }, [products]);

  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });

  return (
    <div className="relative group/strip">
      {/* Gradient fade on edges */}
      <div className={`absolute left-0 top-0 bottom-4 w-10 sm:w-16 bg-gradient-to-r from-[#f7faff] via-[#f7faff]/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute right-0 top-0 bottom-4 w-10 sm:w-16 bg-gradient-to-l from-[#f7faff] via-[#f7faff]/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`} />

      {/* Left Arrow - Professional Design */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 group/arrow transition-all duration-300 ${
          showLeftArrow 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
      >
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r opacity-0 group-hover/arrow:opacity-100 blur-md transition-opacity duration-300" style={{ background: theme.accentGradient }} />
          
          {/* Button */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 group-hover/arrow:border-transparent group-hover/arrow:shadow-xl transition-all duration-300 group-hover/arrow:scale-105" style={{ '--tw-shadow-color': rgba(theme.primary, 0.15) }}>
            <svg 
              className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600 group-hover/arrow:text-[#0056b3] transition-colors duration-300 -translate-x-px" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </div>
        </div>
      </button>

      {/* Products Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-2 px-0.5 scroll-smooth scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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

      {/* Right Arrow - Professional Design */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 group/arrow transition-all duration-300 ${
          showRightArrow 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 translate-x-4 pointer-events-none"
        }`}
      >
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r opacity-0 group-hover/arrow:opacity-100 blur-md transition-opacity duration-300" style={{ background: theme.accentGradient }} />
          
          {/* Button */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 group-hover/arrow:border-transparent group-hover/arrow:shadow-xl transition-all duration-300 group-hover/arrow:scale-105" style={{ '--tw-shadow-color': rgba(theme.primary, 0.15) }}>
            <svg 
              className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600 group-hover/arrow:text-[#0056b3] transition-colors duration-300 translate-x-px" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};

/* -------------------------------------------------------------
   PRODUCT CARD - COMPLETELY REDESIGNED (Opportunity Strip Style)
------------------------------------------------------------- */
const ProductCard = ({ product, theme = getHomeTheme(), onQuickView, onAddToCart, isAddingToCart = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
    <Link
      to={`/products/${product._id}`}
      className="flex-shrink-0 w-[232px] sm:w-[248px] lg:w-[256px] xl:w-[264px] bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 group flex flex-col"
      style={{ border: `1px solid ${theme.border}`, boxShadow: `0 16px 36px ${rgba(theme.primary, 0.08)}` }}
    >
      {/* Card Header - Image */}
      <div className="relative h-40 sm:h-44 lg:h-48 overflow-hidden" style={{ background: `linear-gradient(135deg, ${rgba(theme.secondary, 0.08)}, ${theme.soft})` }}>
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse" style={{ background: `linear-gradient(90deg, ${theme.soft}, #ffffff, ${theme.soft})` }} />
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
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-bold rounded-lg shadow-lg">
              -{discount}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold rounded-lg shadow-lg">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
            isWishlisted 
              ? 'bg-red-50 text-red-500 border border-red-200' 
              : 'bg-white/90 backdrop-blur-sm text-[#6c7a90] hover:text-red-500 border border-white/50'
          }`}
        >
          <svg className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[11px] font-semibold rounded-lg border border-white/50" style={{ color: theme.primary }}>
            {product.category?.name || "General"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Product Name */}
        <h3 className="font-bold text-[#0d1b2a] text-[15px] sm:text-base leading-tight line-clamp-2 transition-colors group-hover:opacity-90" style={{ color: theme.primary }}>
          {product.name}
        </h3>

        {/* Brand/Seller */}
        <p className="mt-1.5 text-[#6c7a90] text-xs sm:text-sm flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: theme.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {product.brand || product.seller?.name || "Premium Brand"}
        </p>

        {/* Details Grid */}
        <div className="mt-3 space-y-2.5">
          {/* Rating */}
          <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${theme.softStrong}` }}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[#6c7a90] text-xs sm:text-sm">Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-[#0d1b2a]">{product.rating || "4.5"}</span>
              <span className="text-[#6c7a90] text-[11px]">({product.ratingCount || 0})</span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${theme.softStrong}` }}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[#6c7a90] text-xs sm:text-sm">Stock</span>
            </div>
            <span className={`font-semibold text-xs sm:text-sm ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Price - Highlighted */}
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl border" style={{ backgroundColor: theme.soft, borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: theme.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[#6c7a90] text-xs sm:text-sm">Price</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg" style={{ color: theme.primary }}>₹{price.toLocaleString()}</span>
              {product.mrp > product.sellingPrice && (
                <span className="text-[#6c7a90] text-xs sm:text-sm line-through">₹{product.mrp.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 pb-4 pt-2 flex gap-2.5" style={{ backgroundColor: theme.soft, borderTop: `1px solid ${theme.softStrong}` }}>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product); }}
          disabled={isAddingToCart}
          className="flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg disabled:opacity-70"
          style={{ background: theme.accentGradient, boxShadow: `0 12px 28px ${theme.shadow}` }}
        >
          {isAddingToCart ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
          className="w-11 h-11 bg-white border rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-gray-50"
          style={{ borderColor: theme.border, color: theme.primary }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </Link>
  );
};

/* -------------------------------------------------------------
   PROMOTIONAL BANNER - REDESIGNED
------------------------------------------------------------- */
const PromoBanner = ({ theme = getHomeTheme() }) => (
  <section className="py-10 sm:py-14">
    <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
      {/* Banner 1 */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 min-h-[220px] sm:min-h-[280px] flex flex-col justify-between group" style={{ background: theme.accentGradient }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-36 sm:w-56 h-36 sm:h-56 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative z-10">
          <Badge variant="glass">🔥 Limited Time</Badge>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-4">Summer Sale</h3>
          <p className="text-white/80 mt-2 sm:mt-3 text-sm sm:text-base max-w-xs leading-relaxed">Get up to 50% off on selected summer collection items.</p>
        </div>
        
        <Link
          to="/products?sale=summer"
          className="relative z-10 inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#f7faff] transition-all duration-300 w-fit shadow-lg hover:shadow-xl group/btn"
          style={{ color: theme.primary }}
        >
          Shop Sale
          <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Banner 2 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] p-6 sm:p-8 md:p-10 min-h-[220px] sm:min-h-[280px] flex flex-col justify-between group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-36 sm:w-56 h-36 sm:h-56 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <Badge variant="glass">✨ New Arrivals</Badge>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-4">Fresh Collection</h3>
          <p className="text-white/80 mt-2 sm:mt-3 text-sm sm:text-base max-w-xs leading-relaxed">Discover the latest trends and newest arrivals in our store.</p>
        </div>
        
        <Link
          to="/products?new=true"
          className="relative z-10 inline-flex items-center gap-2 bg-white text-[#6C5CE7] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#f7faff] transition-all duration-300 w-fit shadow-lg hover:shadow-xl group/btn"
        >
          Explore Now
          <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------
   LOADING STATE - REDESIGNED
------------------------------------------------------------- */
const LoadingState = () => (
  <div className="py-12 sm:py-16 space-y-12 sm:space-y-16">
    {/* Categories Skeleton */}
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40 sm:h-48 rounded-2xl" />
        ))}
      </div>
    </div>

    {/* Products Skeleton */}
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------
   EMPTY STATE - REDESIGNED
------------------------------------------------------------- */
const EmptyState = ({ theme = getHomeTheme() }) => (
  <div className="py-16 sm:py-24 text-center">
    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: `linear-gradient(135deg, ${theme.soft}, ${theme.softStrong})`, boxShadow: `0 14px 30px ${theme.shadow}` }}>
      <svg className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: theme.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-[#0d1b2a] mb-3">No Products Available</h3>
    <p className="text-[#4a5e80] mb-6 max-w-md mx-auto">Check back later for new arrivals! We're constantly updating our collection.</p>
    <Link
      to="/categories"
      className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
      style={{ background: theme.accentGradient, boxShadow: `0 14px 30px ${theme.shadow}` }}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
      Browse Categories
    </Link>
  </div>
);

/* -------------------------------------------------------------
   NEWSLETTER - REDESIGNED
------------------------------------------------------------- */
const Newsletter = ({ theme = getHomeTheme() }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="relative bg-gradient-to-br from-[#0d1b2a] to-[#1e3a5f] rounded-3xl p-8 sm:p-10 md:p-14 text-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ background: `linear-gradient(135deg, ${rgba(theme.primary, 0.32)}, ${rgba(theme.secondary, 0.28)})` }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" style={{ background: `linear-gradient(135deg, ${rgba(theme.secondary, 0.2)}, ${rgba(theme.primary, 0.24)})` }} />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00a0ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00a0ff]"></span>
            </span>
            <span className="text-sm font-medium" style={{ color: theme.secondary }}>Join 10,000+ subscribers</span>
          </div>
          
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Stay <span className="bg-clip-text text-transparent" style={{ backgroundImage: theme.accentGradient }}>Updated</span>
          </h3>
          <p className="text-white/70 text-sm sm:text-base mb-8 max-w-lg mx-auto">Subscribe to get exclusive offers, new arrivals updates, and special discounts directly in your inbox.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-[#0056b3]/30 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50"
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 text-white font-bold rounded-xl text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ background: theme.accentGradient, boxShadow: `0 14px 30px ${theme.shadow}` }}
            >
              Subscribe
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
   FEATURES SECTION - REDESIGNED
------------------------------------------------------------- */
const FeaturesSection = ({ settings, theme = getHomeTheme() }) => {
  const features = getContentItems(settings?.homeFeatureItems, DEFAULT_HOME_FEATURE_ITEMS);

  const FEATURE_GRADIENTS = [
    "linear-gradient(135deg, #7C4DFF, #00D1B2)",
    theme.accentGradient,
    "linear-gradient(135deg, #FF6B6B, #FFD93D)",
    "linear-gradient(135deg, #6C5CE7, #A29BFE)",
  ];

  return (
    <section className="relative py-16 sm:py-20 md:py-24 mt-8 overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.soft}, white, ${rgba(theme.secondary, 0.08)})` }}>
      {/* Background decorations */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ background: `linear-gradient(135deg, ${rgba(theme.primary, 0.12)}, ${rgba(theme.secondary, 0.12)})` }} />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none" style={{ background: `linear-gradient(135deg, ${rgba(theme.secondary, 0.12)}, ${rgba(theme.primary, 0.1)})` }} />

      <div className="max-w-[92rem] mx-auto px-3 sm:px-4 lg:px-5 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <span className="inline-block text-xs sm:text-sm font-semibold tracking-wide uppercase mb-2" style={{ color: theme.primary }}>
            Store Benefits
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0d1b2a] tracking-tight">
            Why Customers <span className="bg-clip-text text-transparent" style={{ backgroundImage: theme.accentGradient }}>Shop With Us</span>
          </h2>
          <p className="mt-4 text-[#4a5e80] text-sm sm:text-base max-w-lg mx-auto">
            We provide the best shopping experience with premium quality products and exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {features.slice(0, 4).map((feature, index) => (
            <div 
              key={`${feature.title}-${index}`} 
              className="group text-center p-6 sm:p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg transition-all duration-500 hover:-translate-y-2"
              style={{ boxShadow: `0 14px 32px ${rgba(theme.primary, 0.08)}` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-lg text-white mb-5 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300" style={{ background: FEATURE_GRADIENTS[index % FEATURE_GRADIENTS.length] }}>
                {typeof feature.icon === "string" ? renderHomeIcon(feature.icon, "w-8 h-8 sm:w-10 sm:h-10") : feature.icon}
              </div>
              <h4 className="font-bold text-[#0d1b2a] text-sm sm:text-base md:text-lg mb-2 transition-colors group-hover:opacity-90" style={{ color: theme.primary }}>{feature.title}</h4>
              <p className="text-xs sm:text-sm text-[#6c7a90] leading-relaxed line-clamp-3">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   CUSTOM STYLES - ANIMATIONS & UTILITIES
------------------------------------------------------------- */
const styles = `
@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(-50%); }
  50% { transform: translateY(-12px) translateX(-50%); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px) translateX(-50%) rotate(2deg); }
  50% { transform: translateY(-10px) translateX(-50%) rotate(2deg); }
}

@keyframes slide-in-right {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.animate-float {
  animation: float 5s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 6s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-slide-in-right {
  animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Custom Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Gradient Text */
.gradient-text {
  background: linear-gradient(90deg, #0056b3, #00a0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass Effect */
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Smooth Hover Lift */
.hover-lift {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-8px);
}

/* Custom focus states */
*:focus-visible {
  outline: 2px solid #0056b3;
  outline-offset: 2px;
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
