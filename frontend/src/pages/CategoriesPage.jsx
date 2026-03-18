// src/pages/CategoriesPage.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

/* ─────────────────────────────────────────────────────────────
   DESIGN CONSTANTS
───────────────────────────────────────────────────────────── */
const CATEGORY_COLORS = [
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
  { bg: "from-sky-500 to-blue-600", light: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
  { bg: "from-amber-500 to-orange-600", light: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  { bg: "from-fuchsia-500 to-pink-600", light: "bg-fuchsia-50", text: "text-fuchsia-600", border: "border-fuchsia-200" },
  { bg: "from-cyan-500 to-teal-600", light: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
  { bg: "from-indigo-500 to-blue-600", light: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "count-desc", label: "Most Products" },
  { value: "count-asc", label: "Least Products" },
];

/* ─────────────────────────────────────────────────────────────
   SKELETON COMPONENTS
───────────────────────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`} />
);

const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <Skeleton className="h-40 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4 rounded-lg" />
      <Skeleton className="h-3 w-1/2 rounded-lg" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

const SubCategoryCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-3">
    <Skeleton className="aspect-square w-full rounded-lg mb-3" />
    <Skeleton className="h-3 w-3/4 mx-auto rounded" />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const CategoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const contentRef = useRef(null);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load categories
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

  // Get super categories
  const superCategories = categories.filter((c) => c.type === "super");

  // Get subcategories for a parent
  const getSubCategories = useCallback(
    (parentId) => {
      return categories.filter(
        (c) => c.parent === parentId || c.parent?._id === parentId
      );
    },
    [categories]
  );

  // Filter categories
  const filteredCategories = superCategories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "count-desc":
        return getSubCategories(b._id).length - getSubCategories(a._id).length;
      case "count-asc":
        return getSubCategories(a._id).length - getSubCategories(b._id).length;
      default:
        return 0;
    }
  });

  // Toggle category expansion
  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Toggle filter
  const toggleFilter = (categoryId) => {
    setSelectedFilters((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchTerm("");
    setSortBy("default");
  };

  // Get active filters count
  const activeFiltersCount =
    selectedFilters.length + (searchTerm ? 1 : 0) + (sortBy !== "default" ? 1 : 0);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
                <Skeleton className="h-6 w-32" />
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Skeleton */}
            <div className="flex-1">
              <div className="flex justify-between mb-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <CategoryCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══════════════════════════════════════════════════════════════
          HERO HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative bg-white border-b border-gray-100 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h20v20H0z%22%20fill%3D%22none%22%2F%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%221%22%20fill%3D%22%23e5e7eb%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">All Categories</span>
          </nav>

          {/* Title Section */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Browse Categories
                </h1>
              </div>
              <p className="text-gray-500 text-sm sm:text-base max-w-xl">
                Explore our collection of{" "}
                <span className="text-emerald-600 font-semibold">{superCategories.length}</span> categories
                and{" "}
                <span className="text-emerald-600 font-semibold">
                  {categories.length - superCategories.length}
                </span>{" "}
                subcategories to find exactly what you're looking for.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{superCategories.length}</div>
                <div className="text-xs text-gray-500">Categories</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                <div className="text-2xl font-bold text-emerald-600">
                  {categories.length - superCategories.length}
                </div>
                <div className="text-xs text-gray-500">Subcategories</div>
              </div>
            </div>
          </div>

          {/* Quick Category Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSearchTerm("")}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !searchTerm
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              All Categories
            </button>
            {superCategories.slice(0, 8).map((cat, index) => (
              <button
                key={cat._id}
                onClick={() => setSearchTerm(cat.name)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  searchTerm.toLowerCase() === cat.name.toLowerCase()
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                {cat.image && (
                  <img src={cat.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* ─────────────────────────────────────────────
              SIDEBAR (Desktop)
          ───────────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Find category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter by Category */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter
                  </span>
                  {selectedFilters.length > 0 && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      {selectedFilters.length}
                    </span>
                  )}
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                  {superCategories.slice(0, 10).map((cat) => (
                    <label
                      key={cat._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(cat._id)}
                        onChange={() => toggleFilter(cat._id)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1 truncate">
                        {cat.name}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {getSubCategories(cat._id).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sort By
                </h3>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        sortBy === option.value
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All Filters ({activeFiltersCount})
                </button>
              )}
            </div>
          </aside>

          {/* ─────────────────────────────────────────────
              MAIN CONTENT
          ───────────────────────────────────────────── */}
          <main className="flex-1 min-w-0" ref={contentRef}>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              {/* Results Count & Active Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-gray-600 text-sm">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">{sortedCategories.length}</span>{" "}
                  {sortedCategories.length === 1 ? "category" : "categories"}
                </p>
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-emerald-600 text-sm font-medium">
                      {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} applied
                    </span>
                  </div>
                )}
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown (Mobile/Tablet) */}
                <div className="relative lg:hidden">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Grid View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="List View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("compact")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "compact"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Compact View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Content */}
            {sortedCategories.length > 0 ? (
              <>
                {/* ─── Grid View ─── */}
                {viewMode === "grid" && (
                  <div className="space-y-12">
                    {sortedCategories.map((superCat, index) => {
                      const subCategories = getSubCategories(superCat._id);
                      const colorScheme = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                      const isExpanded = expandedCategories[superCat._id] ?? true;

                      return (
                        <div key={superCat._id} className="group/category">
                          {/* Category Banner */}
                          <Link
                            to={`/category/${superCat._id}`}
                            className="block relative rounded-2xl overflow-hidden mb-6 shadow-sm hover:shadow-xl transition-all duration-500"
                            onMouseEnter={() => setHoveredCategory(superCat._id)}
                            onMouseLeave={() => setHoveredCategory(null)}
                          >
                            <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                              {superCat.image ? (
                                <img
                                  src={superCat.image}
                                  alt={superCat.name}
                                  className={`w-full h-full object-cover transition-transform duration-700 ${
                                    hoveredCategory === superCat._id ? "scale-110" : "scale-100"
                                  }`}
                                />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg}`}>
                                  <div className="absolute inset-0 opacity-20">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                      <defs>
                                        <pattern id={`dots-${index}`} patternUnits="userSpaceOnUse" width="20" height="20">
                                          <circle cx="10" cy="10" r="2" fill="white" />
                                        </pattern>
                                      </defs>
                                      <rect width="100" height="100" fill={`url(#dots-${index})`} />
                                    </svg>
                                  </div>
                                </div>
                              )}

                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/30" />

                              {/* Content */}
                              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-center">
                                <div className="max-w-xl">
                                  {/* Badges */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                                      #{String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="px-3 py-1 bg-emerald-500/30 backdrop-blur-sm text-emerald-200 text-xs font-medium rounded-full flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                      </svg>
                                      {subCategories.length} Subcategories
                                    </span>
                                  </div>

                                  {/* Title */}
                                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                                    {superCat.name}
                                  </h2>

                                  {/* Description */}
                                  {superCat.description && (
                                    <p className="text-white/70 text-sm sm:text-base line-clamp-2 max-w-md mb-4">
                                      {superCat.description}
                                    </p>
                                  )}

                                  {/* CTA */}
                                  <div className="inline-flex items-center gap-2 text-white font-semibold group/cta">
                                    <span>Explore Collection</span>
                                    <svg
                                      className={`w-5 h-5 transition-transform duration-300 ${
                                        hoveredCategory === superCat._id ? "translate-x-2" : ""
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              {/* Floating Preview */}
                              <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2">
                                <div
                                  className={`relative transition-all duration-500 ${
                                    hoveredCategory === superCat._id ? "rotate-6 scale-110" : ""
                                  }`}
                                >
                                  <div className="w-32 h-32 bg-white rounded-2xl shadow-2xl p-2 overflow-hidden">
                                    {superCat.image ? (
                                      <img src={superCat.image} alt="" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                      <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} rounded-xl flex items-center justify-center`}>
                                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="absolute -z-10 inset-0 bg-white/20 rounded-2xl blur-xl" />
                                </div>
                              </div>
                            </div>
                          </Link>

                          {/* Subcategories Grid */}
                          {subCategories.length > 0 && (
                            <div>
                              {/* Toggle Button */}
                              <button
                                onClick={() => toggleCategoryExpand(superCat._id)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 mb-4 transition-colors"
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                {isExpanded ? "Hide" : "Show"} Subcategories ({subCategories.length})
                              </button>

                              {/* Subcategory Cards */}
                              {isExpanded && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fadeIn">
                                  {subCategories.slice(0, 12).map((subCat, subIndex) => {
                                    const subColor = CATEGORY_COLORS[(index + subIndex) % CATEGORY_COLORS.length];
                                    return (
                                      <Link
                                        key={subCat._id}
                                        to={`/category/${subCat._id}`}
                                        className="group bg-white rounded-xl border border-gray-100 hover:border-emerald-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                      >
                                        {/* Image */}
                                        <div className={`aspect-square ${subColor.light} relative overflow-hidden`}>
                                          {subCat.image ? (
                                            <img
                                              src={subCat.image}
                                              alt={subCat.name}
                                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <svg className={`w-10 h-10 ${subColor.text} opacity-40`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                            </div>
                                          )}
                                          {/* Hover Overlay */}
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-3 left-3 right-3">
                                              <span className="text-white text-xs font-medium flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Products
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        {/* Name */}
                                        <div className="p-3 text-center">
                                          <h4 className="font-medium text-gray-800 text-sm truncate group-hover:text-emerald-600 transition-colors">
                                            {subCat.name}
                                          </h4>
                                        </div>
                                      </Link>
                                    );
                                  })}

                                  {/* View More Card */}
                                  {subCategories.length > 12 && (
                                    <Link
                                      to={`/category/${superCat._id}`}
                                      className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 flex flex-col items-center justify-center aspect-square transition-all duration-300 hover:shadow-lg"
                                    >
                                      <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <span className="text-xl font-bold text-emerald-600">
                                          +{subCategories.length - 12}
                                        </span>
                                      </div>
                                      <span className="text-emerald-600 font-semibold text-sm">View All</span>
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─── List View ─── */}
                {viewMode === "list" && (
                  <div className="space-y-4">
                    {sortedCategories.map((superCat, index) => {
                      const subCategories = getSubCategories(superCat._id);
                      const colorScheme = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

                      return (
                        <Link
                          key={superCat._id}
                          to={`/category/${superCat._id}`}
                          className="group flex items-center gap-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 p-5 hover:shadow-lg transition-all duration-300"
                        >
                          {/* Image */}
                          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden">
                            {superCat.image ? (
                              <img
                                src={superCat.image}
                                alt={superCat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center`}>
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold ${colorScheme.text} ${colorScheme.light} px-2 py-0.5 rounded`}>
                                #{String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="text-xs text-gray-400">
                                {subCategories.length} subcategories
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                              {superCat.name}
                            </h3>
                            {superCat.description && (
                              <p className="text-gray-500 text-sm line-clamp-1 mt-1">
                                {superCat.description}
                              </p>
                            )}

                            {/* Subcategory Tags */}
                            {subCategories.length > 0 && (
                              <div className="flex items-center gap-2 mt-3 overflow-hidden">
                                {subCategories.slice(0, 4).map((sub) => (
                                  <span
                                    key={sub._id}
                                    className="shrink-0 text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg truncate"
                                  >
                                    {sub.name}
                                  </span>
                                ))}
                                {subCategories.length > 4 && (
                                  <span className="shrink-0 text-xs text-emerald-600 font-medium">
                                    +{subCategories.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          <div className="shrink-0 w-10 h-10 bg-gray-100 group-hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
                            <svg
                              className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* ─── Compact View ─── */}
                {viewMode === "compact" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {sortedCategories.map((superCat, index) => {
                      const subCategories = getSubCategories(superCat._id);
                      const colorScheme = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

                      return (
                        <Link
                          key={superCat._id}
                          to={`/category/${superCat._id}`}
                          className="group bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Image */}
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {superCat.image ? (
                              <img
                                src={superCat.image}
                                alt={superCat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center`}>
                                <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                            )}
                            {/* Badge */}
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold rounded-lg shadow-sm">
                                {subCategories.length}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                              {superCat.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {subCategories.length} subcategories
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* ─── Empty State ─── */
              <EmptyState searchTerm={searchTerm} onClearSearch={() => setSearchTerm("")} />
            )}
          </main>
        </div>

        {/* ─── Help Section ─── */}
        {sortedCategories.length > 0 && (
          <div className="mt-16">
            <HelpSection />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE FILTER DRAWER
      ═══════════════════════════════════════════════════════════════ */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        superCategories={superCategories}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearAllFilters={clearAllFilters}
        activeFiltersCount={activeFiltersCount}
        getSubCategories={getSubCategories}
      />

      {/* ═══════════════════════════════════════════════════════════════
          SCROLL TO TOP BUTTON
      ═══════════════════════════════════════════════════════════════ */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gray-900 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all z-50 animate-fadeIn"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MOBILE FILTER DRAWER COMPONENT
───────────────────────────────────────────────────────────── */
const MobileFilterDrawer = ({
  isOpen,
  onClose,
  superCategories,
  selectedFilters,
  toggleFilter,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
  clearAllFilters,
  activeFiltersCount,
  getSubCategories,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-hidden flex flex-col animate-slideInLeft">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <p className="text-xs text-gray-500">{activeFiltersCount} active</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Search */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Search Categories</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Find category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Sort By</label>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Categories
              {selectedFilters.length > 0 && (
                <span className="ml-2 text-emerald-600">({selectedFilters.length} selected)</span>
              )}
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {superCategories.map((cat) => (
                <label
                  key={cat._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(cat._id)}
                    onChange={() => toggleFilter(cat._id)}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="flex-1 text-sm font-medium text-gray-700">{cat.name}</span>
                  <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-lg">
                    {getSubCategories(cat._id).length}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-5 space-y-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
              Clear All Filters
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE COMPONENT
───────────────────────────────────────────────────────────── */
const EmptyState = ({ searchTerm, onClearSearch }) => (
  <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 sm:p-16 text-center">
    <div className="max-w-sm mx-auto">
      {/* Icon */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full animate-pulse" />
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {searchTerm ? "No Categories Found" : "No Categories Yet"}
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        {searchTerm
          ? `We couldn't find any categories matching "${searchTerm}"`
          : "Categories will appear here once they're added by the admin."}
      </p>

      {/* Actions */}
      {searchTerm && (
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Search
        </button>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   HELP SECTION COMPONENT
───────────────────────────────────────────────────────────── */
const HelpSection = () => (
  <div className="relative overflow-hidden">
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 rounded-3xl p-8 sm:p-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="help-dots" patternUnits="userSpaceOnUse" width="20" height="20">
              <circle cx="10" cy="10" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#help-dots)" />
        </svg>
      </div>

      {/* Gradient Blurs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Content */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-emerald-300 text-sm font-medium">24/7 Support Available</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Need Help Finding Products?
          </h3>
          <p className="text-gray-300 text-sm sm:text-base max-w-md">
            Our customer support team is here to assist you with any questions or concerns.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact Support
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default CategoriesPage;