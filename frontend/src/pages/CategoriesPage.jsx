// src/pages/CategoriesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

/* ─────────────────────────────────────────────────────────────
   BOX COLORS (Matching Home.jsx)
───────────────────────────────────────────────────────────── */
const BOX_COLORS = [
  { bg: "bg-sky-100", text: "text-sky-800", icon: "bg-sky-200", border: "border-sky-200", hover: "hover:border-sky-300" },
  { bg: "bg-amber-100", text: "text-amber-800", icon: "bg-amber-200", border: "border-amber-200", hover: "hover:border-amber-300" },
  { bg: "bg-rose-100", text: "text-rose-800", icon: "bg-rose-200", border: "border-rose-200", hover: "hover:border-rose-300" },
  { bg: "bg-emerald-100", text: "text-emerald-800", icon: "bg-emerald-200", border: "border-emerald-200", hover: "hover:border-emerald-300" },
  { bg: "bg-violet-100", text: "text-violet-800", icon: "bg-violet-200", border: "border-violet-200", hover: "hover:border-violet-300" },
  { bg: "bg-orange-100", text: "text-orange-800", icon: "bg-orange-200", border: "border-orange-200", hover: "hover:border-orange-300" },
  { bg: "bg-teal-100", text: "text-teal-800", icon: "bg-teal-200", border: "border-teal-200", hover: "hover:border-teal-300" },
  { bg: "bg-pink-100", text: "text-pink-800", icon: "bg-pink-200", border: "border-pink-200", hover: "hover:border-pink-300" },
];

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axiosClient.get("/api/categories/public/all");
        setCategories(res.data?.categories || []);
      } catch (err) {
        console.error("Categories load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const superCategories = categories.filter(c => c.type === 'super');
  
  const filteredCategories = superCategories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubCategories = (parentId) => {
    return categories.filter(c => 
      c.parent === parentId || c.parent?._id === parentId
    );
  };

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {/* Animated Loader */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Loading Categories</h3>
          <p className="text-gray-500 text-sm">Discovering amazing products for you...</p>
          
          {/* Loading skeleton preview */}
          <div className="mt-8 flex gap-3 justify-center">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse" 
                style={{ animationDelay: `${i * 200}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative bg-white border-b border-gray-100">
        {/* Subtle Background Pattern */}
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
            <span className="text-gray-900 font-medium">Categories</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Title Section */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                Shop by Category
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Browse through <span className="text-emerald-600 font-semibold">{superCategories.length}</span> categories 
                and <span className="text-emerald-600 font-semibold">{categories.length - superCategories.length}</span> subcategories
              </p>
            </div>

            {/* Search & View Controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 lg:w-72">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-100 hover:bg-gray-50 focus:bg-white rounded-xl border-2 border-transparent focus:border-emerald-400 transition-all text-gray-800 placeholder-gray-400 outline-none text-sm"
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

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1">
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

          {/* Quick Category Pills */}
          {superCategories.length > 0 && (
            <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setSearchTerm('')}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  !searchTerm 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {superCategories.slice(0, 6).map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSearchTerm(cat.name)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    searchTerm.toLowerCase() === cat.name.toLowerCase() 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {filteredCategories.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              /* ─── Grid View ─── */
              <div className="space-y-10">
                {filteredCategories.map((superCat, index) => {
                  const subCategories = getSubCategories(superCat._id);
                  const colorScheme = BOX_COLORS[index % BOX_COLORS.length];
                  
                  return (
                    <div key={superCat._id} className="group/section">
                      {/* Super Category Card */}
                      <Link
                        to={`/category/${superCat._id}`}
                        className="block relative rounded-2xl overflow-hidden mb-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                        onMouseEnter={() => setHoveredCategory(superCat._id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div className="relative h-44 sm:h-52 lg:h-56 overflow-hidden">
                          {superCat.image ? (
                            <img
                              src={superCat.image}
                              alt={superCat.name}
                              className={`w-full h-full object-cover transition-transform duration-700 ${hoveredCategory === superCat._id ? 'scale-110' : 'scale-100'}`}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700">
                              <div className="absolute inset-0 opacity-20">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <defs>
                                    <pattern id={`pattern-${index}`} patternUnits="userSpaceOnUse" width="20" height="20">
                                      <circle cx="10" cy="10" r="1.5" fill="white"/>
                                    </pattern>
                                  </defs>
                                  <rect width="100" height="100" fill={`url(#pattern-${index})`}/>
                                </svg>
                              </div>
                            </div>
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent"></div>
                          
                          {/* Content */}
                          <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-center">
                            <div className="max-w-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 bg-emerald-500/30 backdrop-blur-sm text-emerald-200 text-[10px] font-bold rounded-full border border-emerald-400/30">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-sm text-white/80 text-[10px] font-medium rounded-full">
                                  {subCategories.length} Subcategories
                                </span>
                              </div>
                              
                              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1.5">
                                {superCat.name}
                              </h2>
                              
                              {superCat.description && (
                                <p className="text-white/70 text-xs sm:text-sm line-clamp-2 mb-3 max-w-md">
                                  {superCat.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                <span>Explore Collection</span>
                                <svg 
                                  className={`w-4 h-4 transition-transform duration-300 ${hoveredCategory === superCat._id ? 'translate-x-1.5' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Right Side Image Preview */}
                          <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2">
                            <div className="relative">
                              <div className={`w-28 h-28 bg-white rounded-2xl shadow-2xl p-1.5 transition-transform duration-500 ${hoveredCategory === superCat._id ? 'rotate-6 scale-110' : ''}`}>
                                {superCat.image ? (
                                  <img src={superCat.image} alt="" className="w-full h-full object-cover rounded-xl"/>
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              {/* Decorative Blur */}
                              <div className="absolute -z-10 inset-0 bg-emerald-500/20 rounded-2xl blur-xl"></div>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Sub Categories Grid */}
                      {subCategories.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {subCategories.slice(0, 6).map((subCat, subIndex) => {
                            const subColor = BOX_COLORS[(index + subIndex) % BOX_COLORS.length];
                            return (
                              <Link
                                key={subCat._id}
                                to={`/category/${subCat._id}`}
                                className={`group bg-white rounded-xl p-3 border ${subColor.border} ${subColor.hover} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
                              >
                                {/* Image */}
                                <div className={`relative aspect-square rounded-lg overflow-hidden ${subColor.bg} mb-2.5`}>
                                  {subCat.image ? (
                                    <img
                                      src={subCat.image}
                                      alt={subCat.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className={`w-full h-full ${subColor.icon} flex items-center justify-center`}>
                                      <svg className={`w-8 h-8 ${subColor.text} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Name */}
                                <h4 className={`font-semibold text-gray-800 text-xs text-center truncate group-hover:${subColor.text} transition-colors`}>
                                  {subCat.name}
                                </h4>
                              </Link>
                            );
                          })}
                          
                          {/* View More Card */}
                          {subCategories.length > 6 && (
                            <Link
                              to={`/category/${superCat._id}`}
                              className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border-2 border-dashed border-emerald-200 hover:border-emerald-400 flex flex-col items-center justify-center transition-all duration-300"
                            >
                              <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mb-2 group-hover:scale-110 group-hover:shadow-lg transition-all">
                                <span className="text-lg font-bold text-emerald-600">+{subCategories.length - 6}</span>
                              </div>
                              <span className="text-emerald-600 font-semibold text-xs">View All</span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ─── List View ─── */
              <div className="space-y-3">
                {filteredCategories.map((superCat, index) => {
                  const subCategories = getSubCategories(superCat._id);
                  const colorScheme = BOX_COLORS[index % BOX_COLORS.length];
                  
                  return (
                    <Link
                      key={superCat._id}
                      to={`/category/${superCat._id}`}
                      className="block bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                      <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5">
                        {/* Image */}
                        <div className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden ${colorScheme.bg}`}>
                          {superCat.image ? (
                            <img
                              src={superCat.image}
                              alt={superCat.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              #{String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {subCategories.length} subcategories
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                            {superCat.name}
                          </h3>
                          {superCat.description && (
                            <p className="text-gray-500 text-xs line-clamp-1 mt-0.5">
                              {superCat.description}
                            </p>
                          )}
                          
                          {/* Subcategory Tags */}
                          {subCategories.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                              {subCategories.slice(0, 3).map((sub) => (
                                <span key={sub._id} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded truncate">
                                  {sub.name}
                                </span>
                              ))}
                              {subCategories.length > 3 && (
                                <span className="text-[10px] text-emerald-600 font-medium">
                                  +{subCategories.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="shrink-0 w-9 h-9 bg-gray-100 group-hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-300">
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* ─── Empty State ─── */
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 sm:p-16 text-center">
            <div className="max-w-sm mx-auto">
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'No Results Found' : 'No Categories Yet'}
              </h3>
              <p className="text-gray-500 text-sm mb-5">
                {searchTerm 
                  ? `We couldn't find categories matching "${searchTerm}"`
                  : 'Categories will appear here once added'
                }
              </p>
              
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── Help Section ─── */}
        {filteredCategories.length > 0 && (
          <div className="mt-12 relative overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-10">
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
                    Need Help Finding Products?
                  </h3>
                  <p className="text-emerald-100 text-sm sm:text-base">
                    Our team is here to assist you 24/7
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contact Support
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Browse Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Scroll to Top Button ─── */}
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

export default CategoriesPage;