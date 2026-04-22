// src/pages/CategoryPage.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

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
  { value: "default", label: "Default", icon: "M4 6h16M4 12h16M4 18h16" },
  { value: "price-low", label: "Price: Low to High", icon: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" },
  { value: "price-high", label: "Price: High to Low", icon: "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" },
  { value: "name", label: "Name: A to Z", icon: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" },
  { value: "discount", label: "Highest Discount", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const PRICE_RANGES = [
  { value: "all", label: "All Prices", min: 0, max: Infinity },
  { value: "0-500", label: "Under ₹500", min: 0, max: 500 },
  { value: "500-1000", label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { value: "1000-2500", label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
  { value: "2500-5000", label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
  { value: "5000+", label: "Above ₹5,000", min: 5000, max: Infinity },
];

const RATING_OPTIONS = [
  { value: 0, label: "All Ratings" },
  { value: 4, label: "4★ & above" },
  { value: 3, label: "3★ & above" },
  { value: 2, label: "2★ & above" },
];

/* ─────────────────────────────────────────────────────────────
   SKELETON COMPONENTS
───────────────────────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`} />
);

const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-3 w-16 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-3 w-24 rounded" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-4 w-14 rounded" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  </div>
);

const SubCategoryCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   STAR RATING COMPONENT
───────────────────────────────────────────────────────────── */
const StarRating = ({ rating = 4, count = 0, size = "sm" }) => {
  const sizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-1.5">
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
        <span className="text-xs text-gray-500 font-medium">({count.toLocaleString()})</span>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // Data states
  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const contentRef = useRef(null);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setSubCategories([]);
        setProducts([]);

        const categoriesRes = await axiosClient.get("/api/categories/public/all");
        const categories = categoriesRes.data?.categories || [];
        setAllCategories(categories);

        const currentCategory = categories.find((c) => c._id === categoryId);
        setCategory(currentCategory);

        if (currentCategory) {
          if (currentCategory.type === "super") {
            const subs = categories.filter(
              (c) => c.parent === categoryId || c.parent?._id === categoryId
            );
            setSubCategories(subs);
          } else {
            const productsRes = await axiosClient.get(`/api/products?category=${categoryId}`);
            const apiProducts = productsRes.data?.products || productsRes.data || [];
            const filteredProducts = apiProducts.filter(
              (product) =>
                product.status === "approved" && isProductInCategory(product, categoryId)
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

  // Get parent category
  const getParentCategory = useCallback(() => {
    if (category?.type === "sub" && category?.parent) {
      const parentId =
        typeof category.parent === "string" ? category.parent : category.parent._id;
      return allCategories.find((c) => c._id === parentId);
    }
    return null;
  }, [category, allCategories]);

  const parentCategory = getParentCategory();

  // Get sibling categories
  const getSiblingCategories = useCallback(() => {
    if (parentCategory) {
      return allCategories.filter(
        (c) =>
          (c.parent === parentCategory._id || c.parent?._id === parentCategory._id) &&
          c._id !== categoryId
      );
    }
    return [];
  }, [parentCategory, allCategories, categoryId]);

  const siblingCategories = getSiblingCategories();

  // Filter products
  const filteredProducts = products.filter((product) => {
    const price = product.finalPrice || product.sellingPrice;
    const rating = product.rating || 0;
    const selectedRange = PRICE_RANGES.find((r) => r.value === priceRange);

    // Price filter
    if (selectedRange && priceRange !== "all") {
      if (price < selectedRange.min || price > selectedRange.max) {
        return false;
      }
    }

    // Rating filter
    if (minRating > 0 && rating < minRating) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !product.name.toLowerCase().includes(search) &&
        !product.shortDescription?.toLowerCase().includes(search)
      ) {
        return false;
      }
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.finalPrice || a.sellingPrice) - (b.finalPrice || b.sellingPrice);
      case "price-high":
        return (b.finalPrice || b.sellingPrice) - (a.finalPrice || a.sellingPrice);
      case "name":
        return a.name.localeCompare(b.name);
      case "discount":
        const discountA =
          a.mrp > a.sellingPrice ? (a.mrp - a.sellingPrice) / a.mrp : 0;
        const discountB =
          b.mrp > b.sellingPrice ? (b.mrp - b.sellingPrice) / b.mrp : 0;
        return discountB - discountA;
      default:
        return 0;
    }
  });

  // Clear all filters
  const clearAllFilters = () => {
    setSortBy("default");
    setPriceRange("all");
    setMinRating(0);
    setSearchTerm("");
  };

  // Get active filters count
  const activeFiltersCount =
    (sortBy !== "default" ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (searchTerm ? 1 : 0);

  // Get price stats
  const priceStats = products.length > 0
    ? {
        min: Math.min(...products.map((p) => p.finalPrice || p.sellingPrice)),
        max: Math.max(...products.map((p) => p.finalPrice || p.sellingPrice)),
        avg: Math.round(
          products.reduce((sum, p) => sum + (p.finalPrice || p.sellingPrice), 0) /
            products.length
        ),
      }
    : { min: 0, max: 0, avg: 0 };

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
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex gap-6">
              <Skeleton className="w-24 h-24 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Skeleton */}
            <div className="flex-1">
              <div className="flex justify-between mb-6">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Not Found State ─── */
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-500 mb-8">
            The category you're looking for doesn't exist or has been removed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
            >
              Browse Categories
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
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
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {category.image && (
            <img
              src={category.image}
              alt=""
              className="w-full h-full object-cover opacity-[0.03]"
            />
          )}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <Link
              to="/"
              className="shrink-0 flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link
              to="/categories"
              className="shrink-0 text-gray-500 hover:text-emerald-600 transition-colors"
            >
              Categories
            </Link>
            {parentCategory && (
              <>
                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link
                  to={`/category/${parentCategory._id}`}
                  className="shrink-0 text-gray-500 hover:text-emerald-600 transition-colors"
                >
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
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Category Image */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {/* Type Badge */}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-lg px-2.5 py-1 shadow-lg border border-gray-100">
                <span
                  className={`text-xs font-bold ${
                    category.type === "super" ? "text-violet-600" : "text-emerald-600"
                  }`}
                >
                  {category.type === "super" ? "COLLECTION" : "CATEGORY"}
                </span>
              </div>
            </div>

            {/* Category Details */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>

              {category.description && (
                <p className="text-gray-500 text-sm sm:text-base mb-4 max-w-2xl line-clamp-2">
                  {category.description}
                </p>
              )}

              {/* Stats & Quick Links */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Products/Subcategories Count */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    {category.type === "super" ? (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-xl font-bold text-emerald-700">
                      {category.type === "super" ? subCategories.length : products.length}
                    </span>
                    <span className="text-emerald-600 text-sm ml-1">
                      {category.type === "super" ? "Subcategories" : "Products"}
                    </span>
                  </div>
                </div>

                {/* Price Range (for products) */}
                {category.type === "sub" && products.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      ₹{priceStats.min.toLocaleString()} - ₹{priceStats.max.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Parent Category Link */}
                {parentCategory && (
                  <Link
                    to={`/category/${parentCategory._id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-medium">{parentCategory.name}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sibling Categories Quick Links */}
          {siblingCategories.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Also in {parentCategory?.name}
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {siblingCategories.slice(0, 8).map((sibling) => (
                  <Link
                    key={sibling._id}
                    to={`/category/${sibling._id}`}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                  >
                    {sibling.image && (
                      <img
                        src={sibling.image}
                        alt=""
                        className="w-5 h-5 rounded-md object-cover"
                      />
                    )}
                    {sibling.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─────────────────────────────────────────────
            SUPER CATEGORY - Show Subcategories
        ───────────────────────────────────────────── */}
        {category.type === "super" && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Subcategories</h2>
                  <p className="text-sm text-gray-500">
                    {subCategories.length} categories to explore
                  </p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Subcategories Grid/List */}
            {subCategories.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

        {/* ─────────────────────────────────────────────
            SUB CATEGORY - Show Products with Filters
        ───────────────────────────────────────────── */}
        {category.type === "sub" && (
          <div className="flex gap-8">
            {/* ─── Sidebar Filters (Desktop) ─── */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Products
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
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

                {/* Price Range Filter */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Price Range
                  </h3>
                  <div className="space-y-2">
                    {PRICE_RANGES.map((range) => (
                      <label
                        key={range.value}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                          priceRange === range.value
                            ? "bg-emerald-50 border border-emerald-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.value}
                          checked={priceRange === range.value}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span
                          className={`text-sm ${
                            priceRange === range.value
                              ? "font-medium text-emerald-700"
                              : "text-gray-600"
                          }`}
                        >
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Customer Rating
                  </h3>
                  <div className="space-y-2">
                    {RATING_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                          minRating === option.value
                            ? "bg-emerald-50 border border-emerald-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={option.value}
                          checked={minRating === option.value}
                          onChange={(e) => setMinRating(Number(e.target.value))}
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span
                          className={`text-sm flex items-center gap-2 ${
                            minRating === option.value
                              ? "font-medium text-emerald-700"
                              : "text-gray-600"
                          }`}
                        >
                          {option.value > 0 && (
                            <span className="flex">
                              {[...Array(option.value)].map((_, i) => (
                                <svg
                                  key={i}
                                  className="w-4 h-4 text-amber-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </span>
                          )}
                          {option.label}
                        </span>
                      </label>
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
                    Clear Filters ({activeFiltersCount})
                  </button>
                )}
              </div>
            </aside>

            {/* ─── Main Content ─── */}
            <main className="flex-1 min-w-0" ref={contentRef}>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
                {/* Results Count */}
                <div className="flex items-center gap-4">
                  <p className="text-gray-600">
                    Showing{" "}
                    <span className="font-bold text-gray-900">{sortedProducts.length}</span>{" "}
                    {sortedProducts.length === 1 ? "product" : "products"}
                    {filteredProducts.length !== products.length && (
                      <span className="text-gray-400">
                        {" "}
                        of {products.length}
                      </span>
                    )}
                  </p>
                  {activeFiltersCount > 0 && (
                    <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} active
                    </span>
                  )}
                </div>

                {/* Controls */}
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

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          Sort: {option.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === "grid"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === "list"
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              {sortedProducts.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedProducts.map((product) => (
                      <ProductListCard key={product._id} product={product} />
                    ))}
                  </div>
                )
              ) : (
                <EmptyState
                  type="products"
                  categoryName={category.name}
                  hasFilters={activeFiltersCount > 0}
                  onClearFilters={clearAllFilters}
                />
              )}
            </main>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            RELATED SECTIONS
        ═══════════════════════════════════════════════════════════════ */}

        {/* Related Categories (for sub category) */}
        {category.type === "sub" && parentCategory && (
          <div className="mt-12">
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-3xl p-8 md:p-10 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="related-dots" patternUnits="userSpaceOnUse" width="20" height="20">
                      <circle cx="10" cy="10" r="1.5" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#related-dots)" />
                </svg>
              </div>

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Explore More in {parentCategory.name}
                  </h3>
                  <p className="text-emerald-100 max-w-md">
                    Discover more amazing products across all subcategories
                  </p>
                </div>
                <Link
                  to={`/category/${parentCategory._id}`}
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
                >
                  View All Subcategories
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/categories"
            className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-emerald-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  All Categories
                </h3>
                <p className="text-gray-500 text-sm">Browse our complete collection</p>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/products"
            className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-amber-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                  All Products
                </h3>
                <p className="text-gray-500 text-sm">Explore our entire inventory</p>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE FILTER DRAWER
      ═══════════════════════════════════════════════════════════════ */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        minRating={minRating}
        setMinRating={setMinRating}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearAllFilters={clearAllFilters}
        activeFiltersCount={activeFiltersCount}
        productsCount={sortedProducts.length}
        totalProducts={products.length}
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
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  searchTerm,
  setSearchTerm,
  clearAllFilters,
  activeFiltersCount,
  productsCount,
  totalProducts,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-hidden flex flex-col animate-slideInLeft">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white">Filters & Sort</h3>
              <p className="text-emerald-100 text-xs">
                {productsCount} of {totalProducts} products
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Search */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Search Products</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
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
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
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

          {/* Price Range */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Price Range</label>
            <div className="space-y-2">
              {PRICE_RANGES.map((range) => (
                <label
                  key={range.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    priceRange === range.value
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-gray-50 border border-transparent hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="mobilePriceRange"
                    value={range.value}
                    checked={priceRange === range.value}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span
                    className={`text-sm ${
                      priceRange === range.value ? "font-medium text-emerald-700" : "text-gray-600"
                    }`}
                  >
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Customer Rating</label>
            <div className="space-y-2">
              {RATING_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    minRating === option.value
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-gray-50 border border-transparent hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="mobileRating"
                    value={option.value}
                    checked={minRating === option.value}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="flex items-center gap-2">
                    {option.value > 0 && (
                      <span className="flex">
                        {[...Array(option.value)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </span>
                    )}
                    <span
                      className={`text-sm ${
                        minRating === option.value ? "font-medium text-emerald-700" : "text-gray-600"
                      }`}
                    >
                      {option.label}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-5 space-y-3 bg-gray-50">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
              Clear All Filters ({activeFiltersCount})
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
          >
            Show {productsCount} Products
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
   SUB CATEGORY CARD (Grid)
───────────────────────────────────────────────────────────── */
const SubCategoryCard = ({ category, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const colorScheme = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

  return (
    <Link
      to={`/category/${category._id}`}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}

          {category.image && !imageError ? (
            <img
              src={category.image}
              alt={category.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? "scale-110" : "scale-100"
              } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center`}>
              <svg
                className="w-12 h-12 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          )}

          {/* Index Badge */}
          <div className="absolute top-3 left-3">
            <div className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-xs">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-emerald-600/95 via-emerald-600/40 to-transparent flex items-end justify-center pb-4 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="bg-white text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
              View Products
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{category.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

/* ─────────────────────────────────────────────────────────────
   SUB CATEGORY CARD (List)
───────────────────────────────────────────────────────────── */
const SubCategoryListCard = ({ category, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const colorScheme = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

  return (
    <Link to={`/category/${category._id}`} className="group">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-5 p-5">
          {/* Image */}
          <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden">
            {!imageLoaded && !imageError && (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}

            {category.image && !imageError ? (
              <img
                src={category.image}
                alt={category.name}
                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center`}>
                <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
            </div>
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{category.description}</p>
            )}
          </div>

          {/* Arrow */}
          <div className="shrink-0 w-10 h-10 bg-gray-100 group-hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ─────────────────────────────────────────────────────────────
   PRODUCT CARD (Grid)
───────────────────────────────────────────────────────────── */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const canShowWishlist = !auth?.user || auth.user.role === "user";
  const wishlistActive = isWishlisted(product._id);

  const image = !imageError && product.images?.length > 0 ? product.images[0] : null;
  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;
  const price = product.finalPrice || product.sellingPrice;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
        )}

        <Link to={`/products/${product._id}`}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } ${isHovered ? "scale-110" : "scale-100"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
              NEW
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          {canShowWishlist && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!auth?.user) {
                  navigate('/login', { state: { from: window.location.pathname } });
                  return;
                }
                await toggleWishlist(product._id);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                wishlistActive ? "bg-red-50 text-red-500" : "bg-white text-gray-400 hover:text-red-500"
              }`}
            >
              <svg
                className={`w-5 h-5 ${wishlistActive ? "fill-current" : ""}`}
                fill={wishlistActive ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-400 hover:text-emerald-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        {/* Quick View Button */}
        <Link
          to={`/products/${product._id}`}
          className={`absolute bottom-3 left-3 right-3 bg-gray-900 hover:bg-emerald-600 text-white text-sm font-semibold py-3 rounded-xl text-center transition-all duration-300 shadow-lg ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Quick View
        </Link>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
          {product.category?.name || "General"}
        </p>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">
            {product.shortDescription}
          </p>
        )}

        {/* Rating */}
        <div className="mt-3">
          <StarRating rating={product.rating || 4} count={product.ratingCount || 0} />
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">₹{price?.toLocaleString()}</span>
          {product.mrp > product.sellingPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.mrp?.toLocaleString()}</span>
          )}
        </div>

        {/* Add to Cart */}
        <Link
          to={`/products/${product._id}`}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-emerald-500 text-gray-700 hover:text-white py-3 rounded-xl font-semibold transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </Link>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   PRODUCT CARD (List)
───────────────────────────────────────────────────────────── */
const ProductListCard = ({ product }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const canShowWishlist = !auth?.user || auth.user.role === "user";
  const wishlistActive = isWishlisted(product._id);

  const image = !imageError && product.images?.length > 0 ? product.images[0] : null;
  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;
  const price = product.finalPrice || product.sellingPrice;

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
        <div className="flex gap-5 p-5">
          {/* Image */}
          <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 relative">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}

            {image ? (
              <img
                src={image}
                alt={product.name}
                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
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
              <div className="absolute top-2 left-2">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  -{discount}%
                </span>
              </div>
            )}

            {canShowWishlist && (
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!auth?.user) {
                    navigate('/login', { state: { from: window.location.pathname } });
                    return;
                  }
                  await toggleWishlist(product._id);
                }}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-105"
              >
                <svg className={`h-4 w-4 ${wishlistActive ? 'fill-current text-red-500' : 'text-gray-400'}`} fill={wishlistActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
              {product.category?.name || "General"}
            </p>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {product.name}
            </h3>

            {product.shortDescription && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.shortDescription}</p>
            )}

            <div className="mt-2">
              <StarRating rating={product.rating || 4} count={product.ratingCount || 0} />
            </div>

            <div className="flex items-baseline gap-3 mt-2 flex-wrap">
              <span className="text-xl font-bold text-gray-900">₹{price?.toLocaleString()}</span>
              {product.mrp > product.sellingPrice && (
                <span className="text-sm text-gray-400 line-through">₹{product.mrp?.toLocaleString()}</span>
              )}
              {discount > 0 && (
                <span className="text-sm text-emerald-600 font-semibold">{discount}% off</span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="shrink-0 self-center w-10 h-10 bg-gray-100 group-hover:bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-300">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE COMPONENT
───────────────────────────────────────────────────────────── */
const EmptyState = ({ type, categoryName, hasFilters = false, onClearFilters }) => (
  <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
    <div className="max-w-md mx-auto">
      {/* Icon */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full animate-pulse" />
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
          {type === "products" ? (
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          )}
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {type === "products"
          ? hasFilters
            ? "No Products Match Your Filters"
            : "No Products Found"
          : "No Subcategories"}
      </h3>
      <p className="text-gray-500 mb-6">
        {type === "products"
          ? hasFilters
            ? "Try adjusting your filters to find what you're looking for."
            : `There are no products available in ${categoryName} yet.`
          : `${categoryName} doesn't have any subcategories.`}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        )}
        <Link
          to="/categories"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          </svg>
          Browse Categories
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          All Products
        </Link>
      </div>
    </div>
  </div>
);

export default CategoryPage;
