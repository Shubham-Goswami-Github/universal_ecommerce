// src/pages/CategoryPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

/* ─────────────────────────────────────────────────────────────
   HELPER FUNCTIONS
───────────────────────────────────────────────────────────── */
const normalizeCategoryId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || null;
  return null;
};

const isProductInCategory = (product, categoryId) => {
  const productCategoryId = normalizeCategoryId(product?.category);
  const parentCategoryId = normalizeCategoryId(product?.category?.parent);
  return productCategoryId === categoryId || parentCategoryId === categoryId;
};

/* ─────────────────────────────────────────────────────────────
   BOX COLORS (Matching Home.jsx)
───────────────────────────────────────────────────────────── */
const BOX_COLORS = [
  { bg: "bg-sky-100", text: "text-sky-800", icon: "bg-sky-200", gradient: "from-sky-500 to-sky-600" },
  { bg: "bg-amber-100", text: "text-amber-800", icon: "bg-amber-200", gradient: "from-amber-500 to-amber-600" },
  { bg: "bg-rose-100", text: "text-rose-800", icon: "bg-rose-200", gradient: "from-rose-500 to-rose-600" },
  { bg: "bg-emerald-100", text: "text-emerald-800", icon: "bg-emerald-200", gradient: "from-emerald-500 to-emerald-600" },
  { bg: "bg-violet-100", text: "text-violet-800", icon: "bg-violet-200", gradient: "from-violet-500 to-violet-600" },
  { bg: "bg-orange-100", text: "text-orange-800", icon: "bg-orange-200", gradient: "from-orange-500 to-orange-600" },
  { bg: "bg-teal-100", text: "text-teal-800", icon: "bg-teal-200", gradient: "from-teal-500 to-teal-600" },
  { bg: "bg-pink-100", text: "text-pink-800", icon: "bg-pink-200", gradient: "from-pink-500 to-pink-600" },
];

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
   CATEGORY PAGE
───────────────────────────────────────────────────────────── */
const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setSubCategories([]);
        setProducts([]);
        
        const categoriesRes = await axiosClient.get("/api/categories/public/all");
        const categories = categoriesRes.data?.categories || [];
        setAllCategories(categories);

        const currentCategory = categories.find(c => c._id === categoryId);
        setCategory(currentCategory);

        if (currentCategory) {
          if (currentCategory.type === 'super') {
            const subs = categories.filter(c => 
              c.parent === categoryId || c.parent?._id === categoryId
            );
            setSubCategories(subs);
          } else {
            const productsRes = await axiosClient.get(`/api/products?category=${categoryId}`);
            const apiProducts = productsRes.data?.products || productsRes.data || [];
            const filteredProducts = apiProducts.filter(
              (product) => product.status === "approved" && isProductInCategory(product, categoryId)
            );
            setProducts(filteredProducts);
          }
        }
      } catch (err) {
        console.error("Category page load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  const getParentCategory = () => {
    if (category?.type === 'sub' && category?.parent) {
      const parentId = typeof category.parent === 'string' ? category.parent : category.parent._id;
      return allCategories.find(c => c._id === parentId);
    }
    return null;
  };

  const parentCategory = getParentCategory();

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
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
      default:
        return 0;
    }
  });

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="absolute -inset-2 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Loading Category</h3>
          <p className="text-gray-500 text-sm">Fetching products for you...</p>
          
          <div className="mt-8 flex gap-3 justify-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-14 h-16 bg-gray-200 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Not Found State ─── */
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center max-w-md mx-auto">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">The category you're looking for doesn't exist or has been removed.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors text-sm"
            >
              Browse Categories
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ═══════════════════════════════════════════════════════════════
          HERO HEADER SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative bg-white border-b border-gray-100 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {category.image && (
            <img
              src={category.image}
              alt=""
              className="w-full h-full object-cover opacity-5"
            />
          )}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-amber-100 to-emerald-100 rounded-full opacity-50 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            <Link to="/" className="shrink-0 text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/categories" className="shrink-0 text-gray-500 hover:text-emerald-600 transition-colors">
              Categories
            </Link>
            {parentCategory && (
              <>
                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link to={`/category/${parentCategory._id}`} className="shrink-0 text-gray-500 hover:text-emerald-600 transition-colors">
                  {parentCategory.name}
                </Link>
              </>
            )}
            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="shrink-0 text-gray-900 font-medium">{category.name}</span>
          </nav>

          {/* Category Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Category Image */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Type Badge */}
              <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-lg px-2 py-0.5 shadow-md border border-gray-100">
                <span className={`text-[10px] font-bold ${category.type === 'super' ? 'text-violet-600' : 'text-emerald-600'}`}>
                  {category.type === 'super' ? 'MAIN' : 'SUB'}
                </span>
              </div>
            </div>

            {/* Category Details */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1.5">
                {category.name}
              </h1>
              
              {category.description && (
                <p className="text-gray-500 text-sm sm:text-base mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}

              {/* Stats & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Stats Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                    {category.type === 'super' ? (
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-lg font-bold text-emerald-700">
                      {category.type === 'super' ? subCategories.length : products.length}
                    </span>
                    <span className="text-emerald-600 text-xs ml-1">
                      {category.type === 'super' ? 'Subcategories' : 'Products'}
                    </span>
                  </div>
                </div>

                {/* Parent Category Link */}
                {parentCategory && (
                  <Link
                    to={`/category/${parentCategory._id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors text-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-medium">{parentCategory.name}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Super Category - Show Sub Categories */}
        {category.type === 'super' && (
          <div className="space-y-5">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Subcategories</h2>
                  <p className="text-gray-500 text-xs">{subCategories.length} categories available</p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 mr-1">View:</span>
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {subCategories.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {subCategories.map((subCat, index) => (
                    <SubCategoryCard key={subCat._id} category={subCat} index={index} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {subCategories.map((subCat, index) => (
                    <SubCategoryListCard key={subCat._id} category={subCat} index={index} />
                  ))}
                </div>
              )
            ) : (
              <EmptyState type="subcategories" categoryName={category.name} />
            )}
          </div>
        )}

        {/* Sub Category - Show Products */}
        {category.type === 'sub' && (
          <div className="space-y-5">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Products</h2>
                  <p className="text-gray-500 text-xs">{products.length} products found</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-gray-100 hover:bg-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                    <option value="discount">Highest Discount</option>
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {products.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedProducts.map((product) => (
                    <ProductListCard key={product._id} product={product} />
                  ))}
                </div>
              )
            ) : (
              <EmptyState type="products" categoryName={category.name} />
            )}
          </div>
        )}

        {/* Related Categories Section */}
        {category.type === 'sub' && parentCategory && (
          <div className="mt-10">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="related-pattern" patternUnits="userSpaceOnUse" width="30" height="30">
                      <circle cx="15" cy="15" r="2" fill="white"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#related-pattern)"/>
                </svg>
              </div>

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    Explore More in {parentCategory.name}
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    Check out other subcategories and discover more products
                  </p>
                </div>
                <Link
                  to={`/category/${parentCategory._id}`}
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-sm"
                >
                  View All Subcategories
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Browse More Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            to="/categories"
            className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">All Categories</h3>
                <p className="text-gray-500 text-xs">Browse our complete collection</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/products"
            className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">All Products</h3>
                <p className="text-gray-500 text-xs">Explore our entire inventory</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-11 h-11 bg-gray-900 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUB CATEGORY CARD (Grid)
═══════════════════════════════════════════════════════════════ */
const SubCategoryCard = ({ category, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const colorScheme = BOX_COLORS[index % BOX_COLORS.length];

  return (
    <Link to={`/category/${category._id}`} className="group">
      <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
        {/* Image */}
        <div className={`relative aspect-[4/3] overflow-hidden ${colorScheme.bg}`}>
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}
          
          {category.image && !imageError ? (
            <img
              src={category.image}
              alt={category.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => { setImageError(true); setImageLoaded(true); }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center`}>
              <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          )}

          {/* Index Badge */}
          <div className="absolute top-2 left-2">
            <div className="w-7 h-7 bg-white/95 backdrop-blur-sm rounded-lg shadow-md flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-[10px]">{String(index + 1).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
            <span className="bg-white text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1">
              View Products
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUB CATEGORY CARD (List)
═══════════════════════════════════════════════════════════════ */
const SubCategoryListCard = ({ category, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const colorScheme = BOX_COLORS[index % BOX_COLORS.length];

  return (
    <Link to={`/category/${category._id}`} className="group">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-4 p-4">
          {/* Image */}
          <div className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ${colorScheme.bg}`}>
            {!imageLoaded && !imageError && (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}
            
            {category.image && !imageError ? (
              <img
                src={category.image}
                alt={category.name}
                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => { setImageError(true); setImageLoaded(true); }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">#{String(index + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {category.description}
              </p>
            )}
          </div>

          {/* Arrow */}
          <div className="shrink-0 w-9 h-9 bg-gray-100 group-hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-300">
            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD (Grid) - Matching Home.jsx Style
═══════════════════════════════════════════════════════════════ */
const ProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  
  const image = !imageError && product.images?.length > 0 ? product.images[0] : null;
  const discount = product.mrp > product.sellingPrice 
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0;
  const price = product.finalPrice || product.sellingPrice;

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col">
      {/* Image */}
      <div className="relative h-36 sm:h-40 bg-gray-50 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
        )}
        <Link to={`/products/${product._id}`}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => { setImageError(true); setImageLoaded(true); }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlist((w) => !w); }}
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
   PRODUCT CARD (List)
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
          <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 relative">
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
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={product.rating || 4} count={product.ratingCount || 0} />
            </div>
            
            <div className="flex items-baseline gap-2 flex-wrap mt-1">
              <span className="text-base font-bold text-gray-900">
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

          {/* Arrow */}
          <div className="shrink-0 w-9 h-9 bg-gray-100 group-hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-300">
            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
const EmptyState = ({ type, categoryName }) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
      <div className="max-w-sm mx-auto">
        <div className="relative w-24 h-24 mx-auto mb-5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full animate-pulse"></div>
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
            {type === 'products' ? (
              <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {type === 'products' ? 'No Products Found' : 'No Subcategories'}
        </h3>
        
        <p className="text-gray-500 text-sm mb-5">
          {type === 'products' 
            ? `There are no products available in ${categoryName} yet.`
            : `${categoryName} doesn't have any subcategories.`
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/categories"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
            Browse Categories
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;