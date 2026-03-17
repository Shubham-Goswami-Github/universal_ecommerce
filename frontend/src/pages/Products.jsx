// src/pages/Products.jsx
import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

/* ─────────────────────────────────────────────────────────────
   STAR RATING (Matching Home.jsx)
───────────────────────────────────────────────────────────── */
const StarRating = ({ rating = 4, count = 0 }) => (
  <div className="flex items-center gap-1">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    {count > 0 && <span className="text-[10px] text-gray-400">({count})</span>}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER (Matching Home.jsx)
───────────────────────────────────────────────────────────── */
const SectionHeader = ({ title, count, viewAllLink }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {count > 0 && (
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {count} products
        </span>
      )}
    </div>
    {viewAllLink && (
      <Link
        to={viewAllLink}
        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
      >
        View All
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   BOX COLORS (Matching Home.jsx)
───────────────────────────────────────────────────────────── */
const BOX_COLORS = [
  { bg: "bg-sky-50", border: "border-sky-100", accent: "text-sky-600" },
  { bg: "bg-amber-50", border: "border-amber-100", accent: "text-amber-600" },
  { bg: "bg-rose-50", border: "border-rose-100", accent: "text-rose-600" },
  { bg: "bg-emerald-50", border: "border-emerald-100", accent: "text-emerald-600" },
  { bg: "bg-violet-50", border: "border-violet-100", accent: "text-violet-600" },
  { bg: "bg-orange-50", border: "border-orange-100", accent: "text-orange-600" },
  { bg: "bg-teal-50", border: "border-teal-100", accent: "text-teal-600" },
  { bg: "bg-pink-50", border: "border-pink-100", accent: "text-pink-600" },
];

/* ─────────────────────────────────────────────────────────────
   PRODUCTS PAGE
───────────────────────────────────────────────────────────── */
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('category'); // category, grid, list
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  // 🔥 super category from URL
  const superCategory = searchParams.get('category');

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get('/api/products')
      .then((res) => {
        const all = res.data.products || res.data || [];

        // ✅ Only approved products
        const approved = all.filter((p) => p.status === 'approved');

        // ✅ FILTER BY SUPER CATEGORY (if present)
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

  // Filter by search term
  const searchFiltered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by price range
  const priceFiltered = searchFiltered.filter((p) => {
    const price = p.finalPrice || p.sellingPrice;
    if (priceRange.min && price < Number(priceRange.min)) return false;
    if (priceRange.max && price > Number(priceRange.max)) return false;
    return true;
  });

  // Sort products
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

  /* ================= GROUP BY SUB CATEGORY ================= */
  const groupedBySub = sortedProducts.reduce((acc, p) => {
    const sub = p.category?.name || 'Others';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(p);
    return acc;
  }, {});

  const subCategories = Object.keys(groupedBySub);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('default');
    setPriceRange({ min: '', max: '' });
  };

  const hasActiveFilters = searchTerm || sortBy !== 'default' || priceRange.min || priceRange.max;

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>

          {/* Filter Bar Skeleton */}
          <div className="animate-pulse bg-white rounded-2xl p-4 mb-6 border border-gray-100">
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-40"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
            </div>
          </div>

          {/* Products Skeleton */}
          <div className="space-y-8">
            {[1, 2].map((section) => (
              <div key={section}>
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div className="h-36 bg-gray-200 animate-pulse"></div>
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ═══════════════════════════════════════════════════════════════
          HERO HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative bg-white border-b border-gray-100">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-40 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-amber-100 to-emerald-100 rounded-full opacity-40 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-5">
            <Link to="/" className="text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {superCategory ? (
              <>
                <Link to="/products" className="text-gray-500 hover:text-emerald-600 transition-colors">
                  Products
                </Link>
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium">{superCategory}</span>
              </>
            ) : (
              <span className="text-gray-900 font-medium">All Products</span>
            )}
          </nav>

          {/* Title & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {superCategory ? superCategory : 'All Products'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {superCategory
                  ? `Showing ${sortedProducts.length} products under ${superCategory}`
                  : `Browse all ${sortedProducts.length} available products`}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm font-semibold text-emerald-700">{sortedProducts.length}</span>
                <span className="text-xs text-emerald-600">Products</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-sm font-semibold text-amber-700">{subCategories.length}</span>
                <span className="text-xs text-amber-600">Categories</span>
              </div>
            </div>
          </div>

          {/* Category Pills (for super category) */}
          {superCategory && subCategories.length > 0 && (
            <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              <span className="text-xs text-gray-500 shrink-0">Quick Jump:</span>
              {subCategories.slice(0, 8).map((cat) => (
                <a
                  key={cat}
                  href={`#${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                >
                  {cat}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FILTERS & CONTROLS
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-xl border-2 border-transparent focus:border-emerald-400 transition-all text-gray-800 placeholder-gray-400 outline-none text-sm"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="appearance-none bg-gray-50 hover:bg-gray-100 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all min-w-[160px]"
              >
                <option value="default">Sort: Default</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="discount">Highest Discount</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('category')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'category' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Category View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="List View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                {/* Price Range */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Price:</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-24 px-3 py-2 bg-gray-50 rounded-lg text-sm border-2 border-transparent focus:border-emerald-400 outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-24 px-3 py-2 bg-gray-50 rounded-lg text-sm border-2 border-transparent focus:border-emerald-400 outline-none"
                  />
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            {/* Category View - Horizontal Scroll Rows */}
            {viewMode === 'category' && (
              <div className="space-y-10">
                {subCategories.map((subCat, index) => (
                  <CategoryRow
                    key={subCat}
                    title={subCat}
                    products={groupedBySub[subCat]}
                    colorIndex={index}
                    superCategory={superCategory}
                  />
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {sortedProducts.map((product) => (
                  <ProductListCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* ─── Empty State ─── */
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-500 text-sm mb-5">
                {searchTerm
                  ? `No products match "${searchTerm}"`
                  : superCategory
                  ? `No products found in ${superCategory}`
                  : 'No products available at the moment'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── Help Section ─── */}
        {sortedProducts.length > 0 && (
          <div className="mt-12">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="help-pattern" patternUnits="userSpaceOnUse" width="30" height="30">
                      <circle cx="15" cy="15" r="2" fill="white"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#help-pattern)"/>
                </svg>
              </div>
              
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    Can't Find What You're Looking For?
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    Browse our categories or contact us for assistance
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/categories"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                    Browse Categories
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-sm"
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
        )}
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-11 h-11 bg-gray-900 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all z-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CATEGORY ROW - Horizontal Scroll (Matching Home.jsx)
═══════════════════════════════════════════════════════════════ */
const CategoryRow = ({ title, products, colorIndex, superCategory }) => {
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
      return () => row.removeEventListener("scroll", checkArrows);
    }
  }, [products]);

  const scroll = (dir) =>
    rowRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });

  return (
    <section id={title.replace(/\s+/g, '-').toLowerCase()}>
      {/* Section Header */}
      <div className={`flex items-center justify-between mb-4 p-3 rounded-xl ${colorScheme.bg} border ${colorScheme.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center`}>
            <svg className={`w-4 h-4 ${colorScheme.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{products.length} products</p>
          </div>
        </div>
        <Link
          to={`/category/${title}`}
          className={`text-sm font-semibold ${colorScheme.accent} hover:underline flex items-center gap-1`}
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Products Row */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-md rounded-full w-9 h-9 flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all ${
            showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto pb-2 pt-1 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-md rounded-full w-9 h-9 flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all ${
            showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD - Grid (Matching Home.jsx)
═══════════════════════════════════════════════════════════════ */
const ProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [wishlist, setWishlist] = useState(false);

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
    <div className="min-w-[180px] max-w-[180px] sm:min-w-[200px] sm:max-w-[200px] bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col">
      {/* Image */}
      <div className="relative h-36 sm:h-40 bg-gray-50 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
        )}
        <Link to={`/products/${product._id}`}>
          <img
            src={image}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(true); }}
          />
        </Link>

        {/* Wishlist button */}
        <button
          onClick={() => setWishlist((w) => !w)}
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
          aria-label="Add to wishlist"
        >
          <svg className={`w-3.5 h-3.5 transition-colors ${wishlist ? "text-red-500 fill-red-500" : "text-gray-400 fill-none"}`} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate">
          {product.category?.name || "General"}
        </p>
        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed flex-1">
          {product.shortDescription || product.fullDescription || ""}
        </p>

        {/* Rating */}
        <div className="mt-2">
          <StarRating rating={product.rating || 4} count={product.ratingCount || 0} />
        </div>

        {/* Price row */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-base font-extrabold text-gray-900">
              ₹{price?.toLocaleString()}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-[11px] text-gray-400 line-through ml-1">
                ₹{product.mrp?.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart button */}
        <Link
          to={`/products/${product._id}`}
          className="mt-3 w-full text-center bg-gray-900 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors duration-200"
        >
          Add to Cart
        </Link>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD - List View
═══════════════════════════════════════════════════════════════ */
const ProductListCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const image = !imageError && product.images?.length > 0 ? product.images[0] : null;
  const discount = product.mrp > product.sellingPrice 
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0;
  const price = product.finalPrice || product.sellingPrice;

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-4 p-4">
          {/* Image */}
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 relative">
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
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-1 left-1">
                <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  -{discount}%
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate">
              {product.category?.name || "General"}
            </p>
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {product.shortDescription || product.fullDescription || ""}
            </p>
            
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating rating={product.rating || 4} count={product.ratingCount || 0} />
            </div>
            
            <div className="flex items-baseline gap-2 flex-wrap mt-1.5">
              <span className="text-lg font-bold text-gray-900">
                ₹{price?.toLocaleString()}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{product.mrp?.toLocaleString()}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs text-emerald-600 font-medium">
                  {discount}% off
                </span>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="w-9 h-9 bg-gray-100 group-hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-300">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Products;