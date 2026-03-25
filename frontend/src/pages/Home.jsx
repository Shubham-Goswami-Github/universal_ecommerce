// src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

/* -------------------------------------------------------------
   DESIGN SYSTEM CONSTANTS
------------------------------------------------------------- */
const COLORS = {
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  accent: {
    amber: '#f59e0b',
    rose: '#f43f5e',
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

const buildHomeBackgroundStyle = (settings) => {
  const backgroundSize = settings?.homeBackgroundSize === "custom"
    ? `${settings?.homeBackgroundWidth || "auto"} ${settings?.homeBackgroundHeight || "auto"}`
    : settings?.homeBackgroundSize || "cover";

  return {
    backgroundColor: settings?.homeBackgroundColor || undefined,
    backgroundImage: settings?.homeBackgroundImage
      ? `url(${settings.homeBackgroundImage})`
      : undefined,
    backgroundRepeat: settings?.homeBackgroundRepeat || "no-repeat",
    backgroundSize,
    backgroundPosition: settings?.homeBackgroundImage ? "center top" : undefined,
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
        <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
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
  centered = false 
}) => (
  <div className={`mb-6 sm:mb-8 ${centered ? 'text-center' : 'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3'}`}>
    <div>
      {subtitle && (
        <span className="inline-block text-emerald-600 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-1 sm:mb-2">
          {subtitle}
        </span>
      )}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
        {title}
      </h2>
    </div>
    {viewAllLink && !centered && (
      <Link
        to={viewAllLink}
        className="group flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors duration-200 self-start sm:self-auto"
      >
        {viewAllLabel}
        <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-hover:bg-emerald-50 flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </Link>
    )}
  </div>
);

/* -------------------------------------------------------------
   BADGE COMPONENT
------------------------------------------------------------- */
const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    danger: "bg-red-50 text-red-600",
    warning: "bg-amber-50 text-amber-700",
    premium: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};

/* -------------------------------------------------------------
   SKELETON LOADER
------------------------------------------------------------- */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`} />
);

const ProductCardSkeleton = () => (
  <div className="min-w-[160px] sm:min-w-[200px] max-w-[160px] sm:max-w-[200px] bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100">
    <Skeleton className="h-36 sm:h-48 w-full" />
    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
      <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20 rounded" />
      <Skeleton className="h-3 sm:h-4 w-full rounded" />
      <Skeleton className="h-2.5 sm:h-3 w-24 sm:w-32 rounded" />
      <div className="flex gap-2 pt-1 sm:pt-2">
        <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded" />
        <Skeleton className="h-3 sm:h-4 w-10 sm:w-12 rounded" />
      </div>
      <Skeleton className="h-8 sm:h-10 w-full rounded-lg sm:rounded-xl" />
    </div>
  </div>
);

/* -------------------------------------------------------------
   HOME COMPONENT
------------------------------------------------------------- */
const Home = () => {
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="relative isolate min-h-screen bg-gray-50/50">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={homeBackgroundStyle}
      />
      
      <AnnouncementBar />
      <HeroBanner settings={settings} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <TrustBadges settings={settings} />

        {!loading && superCategories.length > 0 && (
          <section className="py-8 sm:py-12 md:py-16">
            <SectionHeader 
              title="Shop by Category" 
              subtitle="Browse Collections"
              viewAllLink="/categories" 
            />
            <CategoryGrid 
              categories={superCategories} 
              allCategories={categories} 
            />
          </section>
        )}

        {!loading && displayFeatured.length > 0 && (
          <section className="py-8 sm:py-12 md:py-16">
            <SectionHeader 
              title="Featured Products" 
              subtitle="Handpicked for You"
              viewAllLink="/products?featured=true" 
            />
            <ProductGrid products={displayFeatured} />
          </section>
        )}

        {!loading && <PromoBanner />}

        {!loading && bestSellers.length > 0 && (
          <section className="py-8 sm:py-12 md:py-16">
            <SectionHeader 
              title="Best Sellers" 
              subtitle="Customer Favorites"
              viewAllLink="/products?sort=bestselling" 
            />
            <ProductScroller products={bestSellers} />
          </section>
        )}

        {loading && <LoadingState />}

        {!loading &&
          Object.keys(grouped).map((superCat) => (
            <section key={superCat} className="py-8 sm:py-12 md:py-16 border-t border-gray-100">
              <SectionHeader
                title={superCat}
                viewAllLink={`/products?category=${encodeURIComponent(superCat)}`}
              />
              <ProductScroller products={grouped[superCat]} />
            </section>
          ))}

        {!loading && products.length === 0 && <EmptyState />}

        {!loading && <Newsletter />}
      </div>

      <FeaturesSection settings={settings} />
    </div>
  );
};

/* -------------------------------------------------------------
   ANNOUNCEMENT BAR
------------------------------------------------------------- */
const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white py-2 sm:py-2.5">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
        <p className="text-xs sm:text-sm font-medium text-center pr-8">
          🎉 Free shipping on orders over ₹499 | Use code: <span className="font-bold">WELCOME10</span> for 10% off
        </p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/* -------------------------------------------------------------
   HERO BANNER
------------------------------------------------------------- */
const HeroBanner = ({ settings }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});
  const [isPaused, setIsPaused] = useState(false);
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
    slideDirection: "left",
    imageSize: "cover",
  };
  const heroTagline = settings?.homeHeroTagline || DEFAULT_HOME_HERO_TAGLINE;
  const heroStats = getContentItems(settings?.homeHeroStats, DEFAULT_HOME_HERO_STATS);
  const heroHighlights = getContentItems(settings?.homeHeroHighlights, DEFAULT_HOME_HERO_HIGHLIGHTS);
  const overlayColor = settings?.heroBannerSettings?.overlayColor || "#0f172a";
  const overlayOpacity = Math.min(Math.max(Number(settings?.heroBannerSettings?.overlayOpacity ?? 35), 0), 100) / 100;

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

  /* -- Fallback Hero -- */
  if (!hasImages) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-teal-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-300 text-xs sm:text-sm font-medium">{heroTagline}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                {settings?.homepageTitle || (
                  <>
                    Discover Your
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                      Perfect Style
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {settings?.homepageSubtitle ||
                  "Explore our curated collection of premium products. Quality meets style in every item we offer."}
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg shadow-black/20"
                >
                  Shop Now
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Browse Categories
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-md sm:max-w-2xl mx-auto lg:mx-0">
                {heroStats.map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Highlights - Hidden on mobile, shown on lg */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[400px] xl:h-[500px]">
                <div className="absolute top-0 right-0 space-y-4">
                  {heroHighlights.map((item, index) => (
                    <div 
                      key={`${item.title}-${index}`} 
                      className={`bg-white rounded-2xl p-4 shadow-2xl max-w-xs ${
                        index % 2 === 0 ? 'animate-float' : 'animate-float-delayed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 xl:w-12 xl:h-12 rounded-xl flex items-center justify-center ${
                          index % 2 === 0 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                        }`}>
                          {renderHomeIcon(item.icon, "w-5 h-5 xl:w-6 xl:h-6")}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm xl:text-base">{item.title}</p>
                          <p className="text-xs xl:text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Central Shopping Bag Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 xl:w-64 xl:h-64 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-2xl" />
                    <svg className="absolute inset-0 m-auto w-28 h-28 xl:w-40 xl:h-40 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 30L60 27.5C120 25 240 20 360 21.5C480 23 600 31 720 33.5C840 36 960 33 1080 28.5C1200 24 1320 18 1380 15L1440 12V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V30Z" fill="#f9fafb" fillOpacity="0.5"/>
          </svg>
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
      <div className="relative w-full h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[600px] overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
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

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-lg lg:max-w-xl">
                  <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 sm:px-4 sm:py-2 mb-3 sm:mb-6">
                    <span className="text-emerald-300 text-xs sm:text-sm font-medium">{heroTagline}</span>
                  </span>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                    {settings?.homepageTitle || "Shopping And Department Store"}
                  </h1>

                  <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-white/80 leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {settings?.homepageSubtitle || "Discover amazing products at unbeatable prices."}
                  </p>

                  <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-4">
                    <Link
                      to="/products"
                      className="group inline-flex items-center gap-2 bg-white text-gray-900 px-4 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-100 transition-all shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Shop Now
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link
                      to="/categories"
                      className="hidden sm:inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-white/20 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Browse Categories
                    </Link>
                  </div>

                  {/* Stats - Hidden on mobile */}
                  <div className="hidden sm:grid mt-6 sm:mt-10 grid-cols-3 gap-4 sm:gap-6 max-w-md">
                    {heroStats.map((stat, statIndex) => (
                      <div key={`${stat.label}-${statIndex}`}>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs sm:text-sm text-gray-200/80">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows - Hidden on mobile */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "bg-white w-6 sm:w-8" 
                    : "bg-white/40 hover:bg-white/60 w-2 sm:w-2.5"
                }`}
              />
            ))}
          </div>
        )}

        {/* Slide Counter - Hidden on mobile */}
        {hasMultipleImages && (
          <div className="hidden sm:block absolute top-4 sm:top-6 right-4 sm:right-6 z-20 bg-black/50 backdrop-blur-sm text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium">
            {currentSlide + 1} / {bannerImages.length}
          </div>
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   TRUST BADGES
------------------------------------------------------------- */
const TrustBadges = ({ settings }) => {
  const badges = getContentItems(settings?.homeTrustBadges, DEFAULT_HOME_TRUST_BADGES);

  return (
    <div className="py-4 sm:py-6 md:py-8 -mt-4 sm:-mt-6 md:-mt-8 relative z-10">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {badges.slice(0, 4).map((badge, index) => (
            <div
              key={`${badge.title}-${index}`}
              className="flex items-center gap-2 sm:gap-4 group"
            >
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-lg sm:rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300">
                {typeof badge.icon === "string" ? renderHomeIcon(badge.icon, "w-5 h-5 sm:w-6 sm:h-6") : badge.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{badge.title}</h4>
                <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 truncate">{badge.description}</p>
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
const CategoryGrid = ({ categories, allCategories }) => {
  const getSubCategoryCount = (categoryId) =>
    allCategories.filter((c) => c.parent === categoryId || c.parent?._id === categoryId).length;

  const GRADIENTS = [
    "from-rose-100 to-pink-50",
    "from-sky-100 to-blue-50",
    "from-amber-100 to-yellow-50",
    "from-emerald-100 to-green-50",
    "from-violet-100 to-purple-50",
    "from-orange-100 to-red-50",
    "from-teal-100 to-cyan-50",
    "from-fuchsia-100 to-pink-50",
  ];

  const ICON_COLORS = [
    "text-rose-500",
    "text-sky-500",
    "text-amber-500",
    "text-emerald-500",
    "text-violet-500",
    "text-orange-500",
    "text-teal-500",
    "text-fuchsia-500",
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
      {categories.slice(0, 12).map((category, index) => {
        const gradient = GRADIENTS[index % GRADIENTS.length];
        const iconColor = ICON_COLORS[index % ICON_COLORS.length];
        const subCount = getSubCategoryCount(category._id);

        return (
          <Link
            key={category._id}
            to={`/category/${category._id}`}
            className="group"
          >
            <div className={`relative bg-gradient-to-br ${gradient} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 h-full min-h-[120px] sm:min-h-[140px] md:min-h-[180px] flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute -right-2 -bottom-2 sm:-right-4 sm:-bottom-4 w-12 sm:w-20 md:w-24 h-12 sm:h-20 md:h-24 bg-white/50 rounded-full" />
                <div className="absolute -left-2 -top-2 sm:-left-4 sm:-top-4 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 bg-white/30 rounded-full" />
              </div>

              {/* Image or Icon */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-2 sm:mb-3 md:mb-4">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover rounded-lg sm:rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className={`w-full h-full rounded-lg sm:rounded-xl bg-white/60 flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}

                {/* Sub-category count badge */}
                {subCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gray-900 text-white text-[8px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                    {subCount}
                  </span>
                )}
              </div>

              {/* Name */}
              <h3 className="relative font-medium sm:font-semibold text-gray-800 text-[10px] sm:text-xs md:text-sm group-hover:text-gray-900 transition-colors line-clamp-2">
                {category.name}
              </h3>

              {/* Arrow indicator - Hidden on mobile */}
              <div className="hidden md:flex absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-white/60 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
   PRODUCT GRID
------------------------------------------------------------- */
const ProductGrid = ({ products }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
    {products.map((product) => (
      <ProductCard key={product._id} product={product} variant="grid" />
    ))}
  </div>
);

/* -------------------------------------------------------------
   PRODUCT SCROLLER
------------------------------------------------------------- */
const ProductScroller = ({ products }) => {
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
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });

  return (
    <div className="relative group/scroller">
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className={`hidden sm:flex absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-200 shadow-lg rounded-full items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-200 ${
          showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-2 pt-1 px-0.5 scroll-smooth scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} variant="scroll" />
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className={`hidden sm:flex absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-200 shadow-lg rounded-full items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-200 ${
          showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

/* -------------------------------------------------------------
   PRODUCT CARD
------------------------------------------------------------- */
const ProductCard = ({ product, variant = "scroll" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const image =
    !imageError && product.images?.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/400x400?text=No+Image";

  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const price = product.finalPrice || product.sellingPrice;

  const sizeClasses = variant === "scroll" 
    ? "min-w-[150px] max-w-[150px] sm:min-w-[180px] sm:max-w-[180px] md:min-w-[220px] md:max-w-[220px]" 
    : "w-full";

  return (
    <div
      className={`${sizeClasses} bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
        )}

        {/* Product Image */}
        <Link to={`/products/${product._id}`}>
          <img
            src={image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } ${isHovered ? "scale-110" : "scale-100"}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(true); }}
          />
        </Link>

        {/* Overlay on Hover */}
        <div className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-md">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-md">
              NEW
            </span>
          )}
        </div>

        {/* Action Buttons - Desktop only */}
        <div className={`hidden sm:flex absolute top-3 right-3 flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <button
            onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              isWishlisted 
                ? 'bg-red-50 text-red-500' 
                : 'bg-white text-gray-400 hover:text-red-500'
            }`}
          >
            <svg className={`w-4 h-4 md:w-5 md:h-5 ${isWishlisted ? 'fill-current' : ''}`} fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-400 hover:text-emerald-500 transition-colors">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        {/* Mobile Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
          className={`sm:hidden absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            isWishlisted 
              ? 'bg-red-50 text-red-500' 
              : 'bg-white/90 text-gray-400'
          }`}
        >
          <svg className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick Add Button - Desktop only */}
        <Link
          to={`/products/${product._id}`}
          className={`hidden sm:block absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 bg-gray-900 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold py-2 sm:py-3 rounded-lg sm:rounded-xl text-center transition-all duration-300 shadow-lg ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Quick View
        </Link>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 md:p-4 flex flex-col flex-1">
        {/* Category */}
        <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5 sm:mb-1 truncate">
          {product.category?.name || "General"}
        </p>

        {/* Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="font-medium sm:font-semibold text-gray-800 text-xs sm:text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1.5 sm:mt-2 md:mt-3">
          <StarRating rating={product.rating || 4} count={product.ratingCount || 0} size="sm" />
        </div>

        {/* Price */}
        <div className="mt-1.5 sm:mt-2 md:mt-3 flex items-baseline gap-1 sm:gap-2 flex-wrap">
          <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
            ₹{price.toLocaleString()}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 line-through">
              ₹{product.mrp.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Link
          to={`/products/${product._id}`}
          className="mt-2 sm:mt-3 md:mt-4 w-full flex items-center justify-center gap-1 sm:gap-2 bg-gray-100 hover:bg-emerald-500 text-gray-700 hover:text-white py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 group/btn"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="hidden xs:inline">Add to</span> Cart
        </Link>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   PROMOTIONAL BANNER
------------------------------------------------------------- */
const PromoBanner = () => (
  <section className="py-6 sm:py-8 md:py-12">
    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
      {/* Banner 1 */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 sm:p-6 md:p-8 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 sm:w-36 md:w-48 h-24 sm:h-36 md:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <Badge variant="premium">Limited Time</Badge>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2 sm:mt-3 md:mt-4">Summer Sale</h3>
          <p className="text-white/80 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base max-w-xs line-clamp-2">Get up to 50% off on selected summer collection items.</p>
        </div>
        
        <Link
          to="/products?sale=summer"
          className="relative z-10 inline-flex items-center gap-1.5 sm:gap-2 bg-white text-amber-600 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors w-fit mt-3 sm:mt-4"
        >
          Shop Sale
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Banner 2 */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 sm:p-6 md:p-8 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 sm:w-36 md:w-48 h-24 sm:h-36 md:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <Badge variant="default">New Arrivals</Badge>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2 sm:mt-3 md:mt-4">Fresh Collection</h3>
          <p className="text-white/80 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base max-w-xs line-clamp-2">Discover the latest trends and newest arrivals in our store.</p>
        </div>
        
        <Link
          to="/products?new=true"
          className="relative z-10 inline-flex items-center gap-1.5 sm:gap-2 bg-white text-violet-600 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors w-fit mt-3 sm:mt-4"
        >
          Explore Now
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  <div className="py-8 sm:py-12 space-y-8 sm:space-y-12">
    {/* Categories Skeleton */}
    <div>
      <Skeleton className="h-6 sm:h-8 w-36 sm:w-48 rounded mb-4 sm:mb-6" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-28 sm:h-36 md:h-44 rounded-xl sm:rounded-2xl" />
        ))}
      </div>
    </div>

    {/* Products Skeleton */}
    <div>
      <Skeleton className="h-6 sm:h-8 w-36 sm:w-48 rounded mb-4 sm:mb-6" />
      <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-hidden">
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
const EmptyState = () => (
  <div className="py-12 sm:py-16 md:py-20 text-center">
    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
      <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </div>
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
    <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Check back later for new arrivals!</p>
    <Link
      to="/categories"
      className="inline-flex items-center gap-2 bg-emerald-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-emerald-600 transition-colors"
    >
      Browse Categories
    </Link>
  </div>
);

/* -------------------------------------------------------------
   NEWSLETTER
------------------------------------------------------------- */
const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 max-w-xl mx-auto">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">Stay Updated</h3>
          <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">Subscribe to get special offers and updates</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg sm:rounded-xl text-sm sm:text-base transition-colors"
            >
              Subscribe
            </button>
          </form>
          
          {status === "success" && (
            <p className="mt-3 text-emerald-400 text-sm">Thanks for subscribing!</p>
          )}
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   FEATURES SECTION
------------------------------------------------------------- */
const FeaturesSection = ({ settings }) => {
  const features = getContentItems(settings?.homeFeatureItems, DEFAULT_HOME_FEATURE_ITEMS);

  return (
    <section className="bg-gray-100 py-10 sm:py-12 md:py-16 mt-6 sm:mt-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-10 md:mb-12">
          <span className="inline-block text-emerald-600 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-1 sm:mb-2">
            Store Benefits
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Why Customers Shop With Us
          </h2>
          <p className="mt-2 sm:mt-3 text-gray-500 text-sm sm:text-base">
            This section is controlled from site settings and updates automatically when you add or edit items.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.slice(0, 4).map((feature, index) => (
            <div key={`${feature.title}-${index}`} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-xl sm:rounded-2xl shadow-sm text-emerald-600 mb-3 sm:mb-4">
                {typeof feature.icon === "string" ? renderHomeIcon(feature.icon, "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8") : feature.icon}
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">{feature.title}</h4>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-3">{feature.description}</p>
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
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 3s ease-in-out infinite;
  animation-delay: 1.5s;
}

/* Hide scrollbar */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Home;