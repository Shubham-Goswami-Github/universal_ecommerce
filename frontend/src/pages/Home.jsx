// src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

/* ─────────────────────────────────────────────────────────────
   STAR RATING HELPER
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
   SECTION HEADER
───────────────────────────────────────────────────────────── */
const SectionHeader = ({ title, viewAllLink, viewAllLabel = "View All" }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    {viewAllLink && (
      <Link
        to={viewAllLink}
        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
      >
        {viewAllLabel}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   HOME
───────────────────────────────────────────────────────── */
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

        console.log("Settings loaded:", settingsRes.data);
        setSettings(settingsRes.data || null);

        const approved =
          productsRes.data?.products?.filter((p) => p.status === "approved") || [];

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
    const superCat =
      p.category?.parent?.name || p.category?.name || "Others";
    if (!acc[superCat]) acc[superCat] = [];
    acc[superCat].push(p);
    return acc;
  }, {});

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* ── Announcement bar ── */}
      <div className="bg-emerald-600 text-white text-xs text-center py-2 px-4 font-medium tracking-wide flex items-center justify-center gap-4">
        <span>🎉 Get 50% Off on selected items!</span>
        <Link to="/products" className="underline font-semibold hover:text-emerald-100">
          Shop Now
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-6">
        {/* Hero Banner */}
        <HeroBanner settings={settings} />

        {/* Category Boxes */}
        {!loading && superCategories.length > 0 && (
          <section>
            <SectionHeader title="Shop Our Top Categories" viewAllLink="/categories" />
            <CategoryBoxes
              categories={superCategories}
              allCategories={categories}
            />
          </section>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        )}

        {/* Category product rows */}
        {!loading &&
          Object.keys(grouped).map((superCat) => (
            <CategoryRow
              key={superCat}
              title={superCat}
              products={grouped[superCat]}
            />
          ))}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm text-gray-500 font-medium">No products available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   HERO BANNER WITH SLIDESHOW
───────────────────────────────────────────────────────── */
const HeroBanner = ({ settings }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});
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

  const bannerImages =
    settings?.heroBannerImages
      ?.map((img) => {
        if (typeof img === "object" && img.url) return { ...img, url: normalizeBannerUrl(img.url) };
        if (typeof img === "string") return { url: normalizeBannerUrl(img), link: "" };
        return null;
      })
      .filter(Boolean) || [];

  const bannerSettings = settings?.heroBannerSettings || {
    autoSlide: true,
    slideSpeed: 3000,
    slideDirection: "left",
    imageSize: "cover",
    borderColor: "transparent",
    borderWidth: 0,
  };

  const hasImages = bannerImages.length > 0;
  const hasMultipleImages = bannerImages.length > 1;

  useEffect(() => {
    if (hasMultipleImages && bannerSettings.autoSlide) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide((prev) => {
          if (bannerSettings.slideDirection === "left") return (prev + 1) % bannerImages.length;
          return prev === 0 ? bannerImages.length - 1 : prev - 1;
        });
      }, bannerSettings.slideSpeed);
    }
    return () => { if (slideInterval.current) clearInterval(slideInterval.current); };
  }, [hasMultipleImages, bannerSettings.autoSlide, bannerSettings.slideSpeed, bannerSettings.slideDirection, bannerImages.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = useCallback(() => setCurrentSlide((prev) => (prev + 1) % bannerImages.length), [bannerImages.length]);
  const prevSlide = useCallback(() => setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1)), [bannerImages.length]);

  const handleImageClick = (link) => {
    if (link) {
      if (link.startsWith("http")) window.open(link, "_blank");
      else navigate(link);
    }
  };

  const handleImageLoad = (index) => setImageLoaded((prev) => ({ ...prev, [index]: true }));

  /* ── Fallback hero (no images configured) ── */
  if (!hasImages) {
    return (
      <section className="rounded-2xl overflow-hidden bg-amber-50 border border-amber-100">
        <div className="flex flex-col md:flex-row min-h-[280px] md:min-h-[320px]">
          {/* Text side */}
          <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 z-10">
            <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-4 w-fit">
              🛒 New Arrivals
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {settings?.homepageTitle || (
                <>Shopping And<br />Department Store.</>
              )}
            </h1>
            <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-md leading-relaxed">
              {settings?.homepageSubtitle ||
                "Shopping is a bit of a relaxing hobby for me, which is sometimes troubling for the bank balance."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-md"
              >
                Learn More
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
              >
                Browse Categories
              </Link>
            </div>
          </div>
          {/* Decorative right side */}
          <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-50 relative p-6">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 80%, #fbbf24 0%, transparent 50%), radial-gradient(circle at 80% 20%, #34d399 0%, transparent 50%)`,
              }}
            />
            <div className="grid grid-cols-3 gap-3 opacity-40">
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`w-14 h-14 rounded-xl ${["bg-amber-300","bg-emerald-300","bg-sky-300","bg-rose-300","bg-violet-300","bg-orange-300","bg-teal-300","bg-pink-300","bg-indigo-300"][i]}`} />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-32 h-32 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── Slideshow hero ── */
  return (
    <section
      className="relative rounded-2xl overflow-hidden shadow-md"
      style={{
        borderWidth: bannerSettings.borderWidth ? `${bannerSettings.borderWidth}px` : "0",
        borderStyle: "solid",
        borderColor: bannerSettings.borderColor || "transparent",
      }}
    >
      <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[460px]">
        {bannerImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"} ${img.link ? "cursor-pointer" : ""}`}
            onClick={() => handleImageClick(img.link)}
          >
            {!imageLoaded[index] && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 animate-pulse" />
            )}
            <img
              src={img.url}
              alt={`Banner ${index + 1}`}
              className={`w-full h-full transition-opacity duration-500 ${imageLoaded[index] ? "opacity-100" : "opacity-0"}`}
              style={{ objectFit: bannerSettings.imageSize || "cover" }}
              onLoad={() => handleImageLoad(index)}
              onError={(e) => { e.target.src = "https://via.placeholder.com/1920x600?text=Banner+Image"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent">
              <div className="h-full flex flex-col justify-center px-8 sm:px-14 max-w-2xl">
                <span className="inline-block text-xs font-semibold text-emerald-300 bg-emerald-900/40 px-3 py-1 rounded-full mb-3 w-fit">
                  🛒 New Arrivals
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">
                  {settings?.homepageTitle || "Shopping And\nDepartment Store."}
                </h1>
                <p className="mt-3 text-white/80 text-sm sm:text-base max-w-md leading-relaxed">
                  {settings?.homepageSubtitle || "Shopping is a bit of a relaxing hobby for me, which is sometimes troubling for the bank balance."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-700 transition shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Learn More
                  </Link>
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/30 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Categories
                  </Link>
                </div>
              </div>
            </div>
            {img.link && (
              <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2 shadow-lg z-20">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {hasMultipleImages && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:scale-110 transition-all">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:scale-110 transition-all">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {bannerImages.map((_, index) => (
              <button key={index} onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-6" : "bg-white/50 hover:bg-white/80 w-2"}`}
              />
            ))}
          </div>
        )}
        {hasMultipleImages && (
          <div className="absolute top-4 left-4 z-20 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            {currentSlide + 1} / {bannerImages.length}
          </div>
        )}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   CATEGORY BOXES — horizontal scroll row
───────────────────────────────────────────────────────── */
const CategoryBoxes = ({ categories, allCategories }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const getSubCategoryCount = (categoryId) =>
    allCategories.filter((c) => c.parent === categoryId || c.parent?._id === categoryId).length;

  const BOX_COLORS = [
    { bg: "bg-sky-100",    text: "text-sky-800",    icon: "bg-sky-200"    },
    { bg: "bg-amber-100",  text: "text-amber-800",  icon: "bg-amber-200"  },
    { bg: "bg-rose-100",   text: "text-rose-800",   icon: "bg-rose-200"   },
    { bg: "bg-emerald-100",text: "text-emerald-800",icon: "bg-emerald-200"},
    { bg: "bg-violet-100", text: "text-violet-800", icon: "bg-violet-200" },
    { bg: "bg-orange-100", text: "text-orange-800", icon: "bg-orange-200" },
    { bg: "bg-teal-100",   text: "text-teal-800",   icon: "bg-teal-200"   },
    { bg: "bg-pink-100",   text: "text-pink-800",   icon: "bg-pink-200"   },
  ];

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
  }, [categories]);

  const scroll = (dir) =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-md rounded-full w-9 h-9 flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all ${showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 pt-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category, index) => {
          const colors = BOX_COLORS[index % BOX_COLORS.length];
          return (
            <Link
              key={category._id}
              to={`/category/${category._id}`}
              className="flex-shrink-0 group"
            >
              <div className={`w-32 sm:w-36 rounded-xl ${colors.bg} overflow-hidden border border-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                {/* Image area */}
                <div className="h-24 sm:h-28 relative overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full ${colors.icon} flex items-center justify-center`}>
                      <svg className={`w-10 h-10 ${colors.text} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                  {getSubCategoryCount(category._id) > 0 && (
                    <div className="absolute top-1.5 right-1.5 bg-white/90 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      {getSubCategoryCount(category._id)}
                    </div>
                  )}
                </div>
                {/* Name */}
                <div className="px-2 py-2 text-center">
                  <p className={`text-xs font-bold ${colors.text} truncate group-hover:underline`}>{category.name}</p>
                  {category.description && (
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{category.description}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-md rounded-full w-9 h-9 flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all ${showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CATEGORY ROW — horizontal product scroll
───────────────────────────────────────────────────────── */
const CategoryRow = ({ title, products }) => {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
    <section>
      <SectionHeader
        title={title}
        viewAllLink={`/products?category=${encodeURIComponent(title)}`}
      />
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-md rounded-full w-9 h-9 flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all ${showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
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

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 shadow-md rounded-full w-9 h-9 flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all ${showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   PRODUCT CARD — Shopcart style
───────────────────────────────────────────────────────── */
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
    <div className="min-w-[200px] max-w-[200px] bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col">
      {/* Image */}
      <div className="relative h-40 bg-gray-50 overflow-hidden">
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
          <StarRating rating={product.rating || 4} count={product.ratingCount || 121} />
        </div>

        {/* Price row */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-base font-extrabold text-gray-900">
              ₹{price.toLocaleString()}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-[11px] text-gray-400 line-through ml-1">
                ₹{product.mrp.toLocaleString()}
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

export default Home;
