// src/pages/Products.jsx
import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

/* ─────────────────────────────────────────────────────────────
   STAR RATING
───────────────────────────────────────────────────────────── */
const StarRating = ({ rating = 4, count = 0, size = "sm" }) => {
  const sizes = {
    sm: "w-3 h-3 sm:w-3.5 sm:h-3.5",
    md: "w-3.5 h-3.5 sm:w-4 sm:h-4",
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={`${sizes[size]} ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count > 0 && <span className="text-[9px] sm:text-[10px] text-gray-400">({count})</span>}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   BOX COLORS
───────────────────────────────────────────────────────────── */
const BOX_COLORS = [
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50", border: "border-rose-200", accent: "text-rose-600", glow: "shadow-rose-500/20" },
  { bg: "from-sky-500 to-blue-600", light: "bg-sky-50", border: "border-sky-200", accent: "text-sky-600", glow: "shadow-sky-500/20" },
  { bg: "from-amber-500 to-orange-600", light: "bg-amber-50", border: "border-amber-200", accent: "text-amber-600", glow: "shadow-amber-500/20" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", border: "border-emerald-200", accent: "text-emerald-600", glow: "shadow-emerald-500/20" },
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", border: "border-violet-200", accent: "text-violet-600", glow: "shadow-violet-500/20" },
  { bg: "from-orange-500 to-red-600", light: "bg-orange-50", border: "border-orange-200", accent: "text-orange-600", glow: "shadow-orange-500/20" },
  { bg: "from-teal-500 to-cyan-600", light: "bg-teal-50", border: "border-teal-200", accent: "text-teal-600", glow: "shadow-teal-500/20" },
  { bg: "from-pink-500 to-rose-600", light: "bg-pink-50", border: "border-pink-200", accent: "text-pink-600", glow: "shadow-pink-500/20" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Default", icon: "M4 6h16M4 12h16M4 18h16" },
  { value: "newest", label: "Newest", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { value: "price-low", label: "Price: Low", icon: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" },
  { value: "price-high", label: "Price: High", icon: "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" },
  { value: "name", label: "A to Z", icon: "M3 4h13M3 8h9m-9 4h6" },
  { value: "discount", label: "Best Deals", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

/* ─────────────────────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`} />
);

/* ─────────────────────────────────────────────────────────────
   ANIMATED BACKGROUND
───────────────────────────────────────────────────────────── */
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-10 left-10 w-40 sm:w-72 h-40 sm:h-72 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float" />
    <div className="absolute top-20 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl animate-float-delayed" />
    <div className="absolute bottom-10 left-1/3 w-36 sm:w-80 h-36 sm:h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-float" />
    
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }} />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   PRODUCTS PAGE
───────────────────────────────────────────────────────────── */
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('category');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const superCategory = searchParams.get('category');

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get('/api/products')
      .then((res) => {
        const all = res.data.products || res.data || [];
        const approved = all.filter((p) => p.status === 'approved');
        const filtered = superCategory
          ? approved.filter(
              (p) =>
                p.category?.parent?.name?.toLowerCase() ===
                superCategory.toLowerCase()
            )
          : approved;
        setProducts(filtered);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [superCategory]);

  const searchFiltered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const priceFiltered = searchFiltered.filter((p) => {
    const price = p.finalPrice || p.sellingPrice;
    if (priceRange.min && price < Number(priceRange.min)) return false;
    if (priceRange.max && price > Number(priceRange.max)) return false;
    return true;
  });

  const sortedProducts = [...priceFiltered].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.finalPrice || a.sellingPrice) - (b.finalPrice || b.sellingPrice);
      case 'price-high':
        return (b.finalPrice || b.sellingPrice) - (a.finalPrice || a.sellingPrice);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'discount':
        const discountA = a.mrp > a.sellingPrice ? ((a.mrp - a.sellingPrice) / a.mrp) : 0;
        const discountB = b.mrp > b.sellingPrice ? ((b.mrp - b.sellingPrice) / b.mrp) : 0;
        return discountB - discountA;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const groupedBySub = sortedProducts.reduce((acc, p) => {
    const sub = p.category?.name || 'Others';
    const categoryId = p.category?._id || p.category?.id || null;
    if (!acc[sub]) {
      acc[sub] = {
        categoryId,
        products: [],
      };
    }
    if (!acc[sub].categoryId && categoryId) {
      acc[sub].categoryId = categoryId;
    }
    acc[sub].products.push(p);
    return acc;
  }, {});

  const subCategories = Object.keys(groupedBySub);

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('default');
    setPriceRange({ min: '', max: '' });
  };

  const hasActiveFilters = searchTerm || sortBy !== 'default' || priceRange.min || priceRange.max;

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 relative overflow-hidden">
          <AnimatedBackground />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
            <Skeleton className="h-3 sm:h-4 w-28 sm:w-36 rounded-lg bg-white/10 mb-4 sm:mb-6" />
            <Skeleton className="h-8 sm:h-10 lg:h-12 w-48 sm:w-64 lg:w-80 rounded-xl bg-white/10 mb-3 sm:mb-4" />
            <Skeleton className="h-3 sm:h-4 w-40 sm:w-56 rounded-lg bg-white/10" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white/85 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 mb-6 border border-white/70 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Skeleton className="h-10 sm:h-12 rounded-xl flex-1" />
              <Skeleton className="h-10 sm:h-12 w-28 sm:w-36 rounded-xl" />
              <Skeleton className="h-10 sm:h-12 w-20 sm:w-28 rounded-xl" />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {[1, 2].map((section) => (
              <div key={section}>
                <Skeleton className="h-12 sm:h-14 w-full rounded-xl mb-4" />
                <div className="flex gap-3 sm:gap-4 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="min-w-[150px] sm:min-w-[200px] bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
                      <Skeleton className="h-32 sm:h-40 w-full" />
                      <div className="p-3 sm:p-4 space-y-2">
                        <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16 rounded" />
                        <Skeleton className="h-3 sm:h-4 w-full rounded" />
                        <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24 rounded" />
                        <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded" />
                        <Skeleton className="h-8 sm:h-10 w-full rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-16 sm:pb-20">
      {/* ═══════════════════════════════════════════════════════════════
          HERO HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 overflow-hidden">
        <AnimatedBackground />
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 sm:gap-1.5 group">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span className="hidden sm:inline">Home</span>
            </Link>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {superCategory ? (
              <>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                  Products
                </Link>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white font-medium truncate max-w-[120px] sm:max-w-none">{superCategory}</span>
              </>
            ) : (
              <span className="text-white font-medium">All Products</span>
            )}
          </nav>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-300 text-xs sm:text-sm font-medium">
                  {sortedProducts.length} Products Available
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-2 sm:mb-3">
                {superCategory ? (
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                      {superCategory}
                    </span>
                  </>
                ) : (
                  <>
                    Discover Our
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                      Products
                    </span>
                  </>
                )}
              </h1>

              <p className="text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
                {superCategory
                  ? `Explore ${sortedProducts.length} products across ${subCategories.length} categories`
                  : `Browse our collection of ${sortedProducts.length} quality products`}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 hover:bg-white/15 transition-all">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{sortedProducts.length}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">Products</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl sm:rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 hover:bg-white/15 transition-all">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-violet-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{subCategories.length}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">Categories</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump Pills */}
          {superCategory && subCategories.length > 0 && (
            <div className="mt-4 sm:mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="shrink-0 text-[10px] sm:text-xs text-gray-400">Jump to:</span>
              {subCategories.slice(0, 8).map((cat) => (
                <a
                  key={cat}
                  href={`#${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  className="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20 transition-all truncate max-w-[100px] sm:max-w-none"
                >
                  {cat}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 30L60 27C120 24 240 18 360 19.5C480 21 600 30 720 33C840 36 960 33 1080 28.5C1200 24 1320 18 1380 15L1440 12V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V30Z" fill="rgba(255,255,255,0.18)"/>
          </svg>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FILTERS & CONTROLS
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/70 shadow-sm p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-xl border-2 border-transparent focus:border-emerald-400 transition-all text-gray-800 placeholder-gray-400 outline-none text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-50 hover:bg-gray-100 rounded-xl pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all w-full sm:min-w-[150px]"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-white rounded-full"></span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              {[
                { mode: 'category', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                { mode: 'grid', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                { mode: 'list', icon: 'M4 6h16M4 12h16M4 18h16' }
              ].map(({ mode, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === mode
                      ? 'bg-white shadow-sm text-emerald-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 animate-fadeIn">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Price:</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-20 sm:w-24 px-2.5 sm:px-3 py-2 bg-gray-50 rounded-lg text-xs sm:text-sm border-2 border-transparent focus:border-emerald-400 outline-none"
                  />
                  <span className="text-gray-300">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-20 sm:w-24 px-2.5 sm:px-3 py-2 bg-gray-50 rounded-lg text-xs sm:text-sm border-2 border-transparent focus:border-emerald-400 outline-none"
                  />
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PRODUCTS CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sortedProducts.length > 0 ? (
          <>
            {/* Category View */}
            {viewMode === 'category' && (
              <div className="space-y-8 sm:space-y-10 lg:space-y-12">
                {subCategories.map((subCat, index) => (
                  <CategoryRow
                    key={subCat}
                    title={subCat}
                    products={groupedBySub[subCat].products}
                    categoryId={groupedBySub[subCat].categoryId}
                    colorIndex={index}
                    superCategory={superCategory}
                  />
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
                {sortedProducts.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-2.5 sm:space-y-3">
                {sortedProducts.map((product, index) => (
                  <ProductListCard key={product._id} product={product} index={index} />
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState 
            searchTerm={searchTerm} 
            superCategory={superCategory} 
            hasActiveFilters={hasActiveFilters} 
            clearFilters={clearFilters} 
          />
        )}

        {/* Help Section */}
        {sortedProducts.length > 0 && (
          <div className="mt-10 sm:mt-12 lg:mt-16">
            <HelpSection />
          </div>
        )}
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center hover:scale-110 transition-all z-50 animate-fadeIn"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CATEGORY ROW
═══════════════════════════════════════════════════════════════ */
const CategoryRow = ({ title, products, categoryId, colorIndex, superCategory }) => {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const colorScheme = BOX_COLORS[colorIndex % BOX_COLORS.length];

  const checkArrows = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkArrows();
    const row = rowRef.current;
    if (row) {
      row.addEventListener("scroll", checkArrows);
      window.addEventListener("resize", checkArrows);
      return () => {
        row.removeEventListener("scroll", checkArrows);
        window.removeEventListener("resize", checkArrows);
      };
    }
  }, [products]);

  const scroll = (dir) =>
    rowRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });

  return (
    <section id={title.replace(/\s+/g, '-').toLowerCase()} className="animate-fadeIn">
      {/* Section Header */}
      <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl mb-4 sm:mb-5 ${colorScheme.light} border ${colorScheme.border}`}>
        <div className="absolute inset-0 opacity-50">
          <div className={`absolute -right-10 -top-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br ${colorScheme.bg} rounded-full blur-3xl opacity-30`} />
        </div>
        
        <div className="relative flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center shadow-lg ${colorScheme.glow}`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{title}</h2>
              <p className="text-[10px] sm:text-xs text-gray-500">{products.length} products</p>
            </div>
          </div>
          {categoryId ? (
            <Link
              to={`/category/${categoryId}`}
              className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${colorScheme.accent} hover:underline`}
            >
              <span className="hidden sm:inline">View All</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-gray-400">View All</span>
          )}
        </div>
      </div>

      {/* Products Row */}
      <div className="relative group/row">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className={`hidden sm:flex absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-xl rounded-full w-9 h-9 md:w-11 md:h-11 items-center justify-center hover:scale-110 transition-all ${
            showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={rowRef}
          className="flex gap-2.5 sm:gap-3 md:gap-4 overflow-x-auto pb-2 pt-1 px-0.5 scrollbar-hide"
        >
          {products.map((p, index) => (
            <ProductCard key={p._id} product={p} index={index} />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className={`hidden sm:flex absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-xl rounded-full w-9 h-9 md:w-11 md:h-11 items-center justify-center hover:scale-110 transition-all ${
            showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════════════════ */
const ProductCard = ({ product, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const image =
    !imageError && product.images?.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/300x200?text=No+Image";

  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const price = product.finalPrice || product.sellingPrice;

  return (
    <div 
      className="min-w-[150px] max-w-[150px] sm:min-w-[180px] sm:max-w-[180px] md:min-w-[200px] md:max-w-[200px] bg-white border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image */}
      <div className="relative h-32 sm:h-36 md:h-44 bg-gray-50 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
        )}
        <Link to={`/products/${product._id}`}>
          <img
            src={image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"} ${isHovered ? "scale-110" : "scale-100"}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(true); }}
          />
        </Link>

        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlist((w) => !w); }}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
        >
          <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${wishlist ? "text-red-500 fill-red-500" : "text-gray-400"}`} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" fill={wishlist ? "currentColor" : "none"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow">
              NEW
            </span>
          )}
        </div>

        {/* Quick View - Desktop */}
        <Link
          to={`/products/${product._id}`}
          className={`hidden sm:block absolute bottom-2 left-2 right-2 bg-gray-900/90 backdrop-blur-sm hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg text-center transition-all duration-300 shadow-lg ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          Quick View
        </Link>
      </div>

      {/* Info */}
      <div className="p-2.5 sm:p-3 md:p-4 flex flex-col flex-1">
        <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate">
          {product.category?.name || "General"}
        </p>
        <Link to={`/products/${product._id}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 sm:mt-2">
          <StarRating rating={product.rating || 4} count={product.ratingCount || 0} />
        </div>

        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-gray-900">
            ₹{price?.toLocaleString()}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
              ₹{product.mrp?.toLocaleString()}
            </span>
          )}
        </div>

        <Link
          to={`/products/${product._id}`}
          className="mt-2 sm:mt-3 w-full flex items-center justify-center gap-1 bg-gray-100 hover:bg-emerald-500 text-gray-700 hover:text-white text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-lg transition-all duration-300"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </Link>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT LIST CARD
═══════════════════════════════════════════════════════════════ */
const ProductListCard = ({ product, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const image = !imageError && product.images?.length > 0 ? product.images[0] : null;
  const discount = product.mrp > product.sellingPrice 
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0;
  const price = product.finalPrice || product.sellingPrice;

  return (
    <Link 
      to={`/products/${product._id}`} 
      className="group animate-fadeIn"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
          {/* Image */}
          <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 relative">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}
            
            {image ? (
              <img 
                src={image} 
                alt={product.name} 
                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => { setImageError(true); setImageLoaded(true); }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {discount > 0 && (
              <div className="absolute top-1 left-1">
                <span className="bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded">
                  -{discount}%
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate">
              {product.category?.name || "General"}
            </p>
            <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {product.name}
            </h3>
            <p className="hidden sm:block text-[10px] sm:text-xs text-gray-500 line-clamp-1 mt-0.5">
              {product.shortDescription || ""}
            </p>
            
            <div className="mt-1 sm:mt-1.5">
              <StarRating rating={product.rating || 4} count={product.ratingCount || 0} />
            </div>
            
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap mt-1 sm:mt-1.5">
              <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                ₹{price?.toLocaleString()}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                  ₹{product.mrp?.toLocaleString()}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[10px] sm:text-xs text-emerald-600 font-medium">
                  {discount}% off
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 group-hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/25">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ searchTerm, superCategory, hasActiveFilters, clearFilters }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-200 p-8 sm:p-12 lg:p-16 text-center">
    <div className="max-w-sm mx-auto">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 sm:mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full animate-pulse" />
        <div className="absolute inset-3 sm:inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>
      
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
      <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6">
        {searchTerm
          ? `No products match "${searchTerm}"`
          : superCategory
          ? `No products found in ${superCategory}`
          : 'No products available at the moment'}
      </p>
      
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Filters
        </button>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   HELP SECTION
═══════════════════════════════════════════════════════════════ */
const HelpSection = () => (
  <div className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl sm:rounded-3xl" />
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }} />
    </div>

    <div className="relative p-5 sm:p-6 md:p-8 lg:p-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-2 sm:mb-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-white/90 text-xs sm:text-sm font-medium">24/7 Support</span>
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">
            Can't Find What You Need?
          </h3>
          <p className="text-white/80 text-xs sm:text-sm max-w-md">
            Browse categories or contact us for help
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
          <Link
            to="/categories"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-xs sm:text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
            Categories
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/30 transition-colors text-xs sm:text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default Products;
