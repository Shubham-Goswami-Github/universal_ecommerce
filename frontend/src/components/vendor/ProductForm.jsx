// src/components/vendor/ProductForm.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const ProductForm = ({ token, product = null, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    // BASIC INFO
    name: '',
    shortTitle: '',
    brandName: '',
    sku: '',
    productType: 'physical',
    countryOfOrigin: 'India',
    hsnCode: '',

    // PRICING
    mrp: '',
    sellingPrice: '',
    discountType: '',
    discountValue: '',
    gstApplicable: false,
    gstPercentage: 0,
    taxInclusive: true,

    // STOCK
    totalStock: 0,
    lowStockAlertQty: 5,
    stockStatus: 'in_stock',
    allowBackorders: false,
    maxPurchaseQty: 5,
    minPurchaseQty: 1,
    availabilityStatus: 'available',

    // DESCRIPTIONS
    shortDescription: '',
    fullDescription: '',
    keyFeatures: [],
    usageInstructions: '',
    careInstructions: '',
    boxContents: '',

    // RETURNS & WARRANTY
    returnAvailable: false,
    returnDays: '',
    replacementAvailable: false,
    warrantyAvailable: false,
    warrantyPeriod: '',
    warrantyType: '',
  });

  // Images
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Key Features
  const [newFeature, setNewFeature] = useState('');

  // Category
  const [categories, setCategories] = useState([]);
  const [superCategory, setSuperCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [superSearch, setSuperSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [errors, setErrors] = useState({});

  // Calculate Final Price
  const calculateFinalPrice = () => {
    const mrp = parseFloat(form.mrp) || 0;
    const sellingPrice = parseFloat(form.sellingPrice) || 0;
    let finalPrice = sellingPrice || mrp;

    if (form.discountType === 'percentage' && form.discountValue) {
      finalPrice = sellingPrice - (sellingPrice * parseFloat(form.discountValue)) / 100;
    } else if (form.discountType === 'flat' && form.discountValue) {
      finalPrice = sellingPrice - parseFloat(form.discountValue);
    }

    return Math.max(0, finalPrice).toFixed(2);
  };

  // Calculate Discount Percentage
  const calculateDiscountPercentage = () => {
    const mrp = parseFloat(form.mrp) || 0;
    const sellingPrice = parseFloat(form.sellingPrice) || 0;
    if (mrp > 0 && sellingPrice > 0 && mrp > sellingPrice) {
      return Math.round(((mrp - sellingPrice) / mrp) * 100);
    }
    return 0;
  };

  /* LOAD PRODUCT (EDIT MODE) */
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        shortTitle: product.shortTitle || '',
        brandName: product.brandName || '',
        sku: product.sku || '',
        productType: product.productType || 'physical',
        countryOfOrigin: product.countryOfOrigin || 'India',
        hsnCode: product.hsnCode || '',

        mrp: product.mrp || '',
        sellingPrice: product.sellingPrice || '',
        discountType: product.discountType || '',
        discountValue: product.discountValue || '',
        gstApplicable: product.gstApplicable || false,
        gstPercentage: product.gstPercentage || 0,
        taxInclusive: product.taxInclusive ?? true,

        totalStock: product.totalStock || 0,
        lowStockAlertQty: product.lowStockAlertQty || 5,
        stockStatus: product.stockStatus || 'in_stock',
        allowBackorders: product.allowBackorders || false,
        maxPurchaseQty: product.maxPurchaseQty || 5,
        minPurchaseQty: product.minPurchaseQty || 1,
        availabilityStatus: product.availabilityStatus || 'available',

        shortDescription: product.shortDescription || '',
        fullDescription: product.fullDescription || '',
        keyFeatures: product.keyFeatures || [],
        usageInstructions: product.usageInstructions || '',
        careInstructions: product.careInstructions || '',
        boxContents: product.boxContents || '',

        returnAvailable: product.returnAvailable || false,
        returnDays: product.returnDays || '',
        replacementAvailable: product.replacementAvailable || false,
        warrantyAvailable: product.warrantyAvailable || false,
        warrantyPeriod: product.warrantyPeriod || '',
        warrantyType: product.warrantyType || '',
      });

      setExistingImages(product.images || []);

      if (product.category?.parent) {
        setSuperCategory(product.category.parent._id || product.category.parent);
        setSubCategory(product.category._id);
      } else if (product.category) {
        setSubCategory(product.category._id || product.category);
      }
    }
  }, [product]);

  /* FETCH CATEGORIES */
  useEffect(() => {
    axiosClient.get('/api/categories/public').then((res) => {
      setCategories(res.data.categories || []);
    });
  }, []);

  const superCategories = categories.filter(
    (c) =>
      c.type === 'super' &&
      c.name.toLowerCase().includes(superSearch.toLowerCase())
  );

  const subCategories = categories.filter(
    (c) =>
      c.type === 'sub' &&
      c.parent === superCategory &&
      c.name.toLowerCase().includes(subSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error
    if (errors[name]) {
      setErrors((e) => ({ ...e, [name]: null }));
    }
  };

  // Add Key Feature
  const addKeyFeature = () => {
    if (newFeature.trim()) {
      setForm((f) => ({
        ...f,
        keyFeatures: [...f.keyFeatures, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  // Remove Key Feature
  const removeKeyFeature = (index) => {
    setForm((f) => ({
      ...f,
      keyFeatures: f.keyFeatures.filter((_, i) => i !== index),
    }));
  };

  // Add Image
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length + existingImages.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  // Remove New Image
  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove Existing Image
  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setImagesToDelete((prev) => [...prev, url]);
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.sku.trim()) newErrors.sku = 'SKU is required';
    if (!subCategory) newErrors.category = 'Category is required';
    if (!form.mrp || parseFloat(form.mrp) <= 0) newErrors.mrp = 'Valid MRP is required';
    if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) newErrors.sellingPrice = 'Valid selling price is required';
    if (parseFloat(form.sellingPrice) > parseFloat(form.mrp)) newErrors.sellingPrice = 'Selling price cannot exceed MRP';
    if (form.totalStock < 0) newErrors.totalStock = 'Stock cannot be negative';
    if (images.length === 0 && existingImages.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorSection = Object.keys(errors)[0];
      if (firstErrorSection) {
        document.querySelector(`[name="${firstErrorSection}"]`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      // Add all form fields
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'keyFeatures') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Add category
      formData.append('category', subCategory);

      // Add final price
      formData.append('finalPrice', calculateFinalPrice());

      // Add new images
      images.forEach((img) => {
        formData.append('images', img);
      });

      // Add existing images to keep
      formData.append('existingImages', JSON.stringify(existingImages));

      // Add images to delete
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const res = product?._id
        ? await axiosClient.put(`/api/products/${product._id}`, formData, config)
        : await axiosClient.post('/api/products', formData, config);

      onSaved(res.data.product);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // Section Navigation
  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📦' },
    { id: 'category', label: 'Category', icon: '📁' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'stock', label: 'Stock', icon: '📊' },
    { id: 'description', label: 'Description', icon: '📝' },
    { id: 'media', label: 'Images', icon: '🖼️' },
    { id: 'returns', label: 'Returns & Warranty', icon: '🔄' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {product ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-sm text-gray-500">
                Fill in all the required details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {product ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">Sections</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(section.id);
                      document.getElementById(section.id)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="text-sm">{section.label}</span>
                  </button>
                ))}
              </nav>

              {/* Price Preview */}
              <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Price Preview</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">MRP:</span>
                    <span className="text-gray-400 line-through">₹{form.mrp || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Selling:</span>
                    <span className="text-gray-700">₹{form.sellingPrice || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount:</span>
                    <span className="text-green-600 font-medium">{calculateDiscountPercentage()}% off</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Final:</span>
                    <span className="font-bold text-green-600 text-lg">₹{calculateFinalPrice()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3 space-y-6">
            <form onSubmit={handleSubmit}>
              
              {/* ==================== BASIC INFO ==================== */}
              <section id="basic" className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📦</span> Basic Information
                  </h2>
                  <p className="text-blue-100 text-sm">Product identity and core details</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Short Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Title
                      <span className="text-gray-400 font-normal ml-1">(Display name)</span>
                    </label>
                    <input
                      name="shortTitle"
                      value={form.shortTitle}
                      onChange={handleChange}
                      placeholder="Short display title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Brand Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand Name
                      </label>
                      <input
                        name="brandName"
                        value={form.brandName}
                        onChange={handleChange}
                        placeholder="e.g. Samsung, Apple"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    {/* SKU */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        placeholder="Unique product SKU"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                          errors.sku ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.sku && (
                        <p className="mt-1 text-sm text-red-500">{errors.sku}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Product Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Type
                      </label>
                      <select
                        name="productType"
                        value={form.productType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                      >
                        <option value="physical">Physical Product</option>
                        <option value="digital">Digital Product</option>
                        <option value="service">Service</option>
                      </select>
                    </div>

                    {/* Country of Origin */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country of Origin
                      </label>
                      <input
                        name="countryOfOrigin"
                        value={form.countryOfOrigin}
                        onChange={handleChange}
                        placeholder="e.g. India"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    {/* HSN Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HSN Code
                      </label>
                      <input
                        name="hsnCode"
                        value={form.hsnCode}
                        onChange={handleChange}
                        placeholder="HSN/SAC code"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================== CATEGORY ==================== */}
              <section id="category" className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📁</span> Category
                  </h2>
                  <p className="text-purple-100 text-sm">Select product category</p>
                </div>

                <div className="p-6 space-y-4">
                  {errors.category && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {errors.category}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Super Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Super Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        placeholder="🔍 Search super category..."
                        value={superSearch}
                        onChange={(e) => setSuperSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition mb-2"
                      />
                      <select
                        value={superCategory}
                        onChange={(e) => {
                          setSuperCategory(e.target.value);
                          setSubCategory('');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                      >
                        <option value="">Select Super Category</option>
                        {superCategories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        placeholder="🔍 Search sub category..."
                        value={subSearch}
                        onChange={(e) => setSubSearch(e.target.value)}
                        disabled={!superCategory}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition mb-2 disabled:bg-gray-100"
                      />
                      <select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        disabled={!superCategory}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100"
                      >
                        <option value="">Select Sub Category</option>
                        {subCategories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Category Display */}
                  {subCategory && (
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-purple-600">✓</span>
                      <span className="text-sm text-purple-700">
                        Selected: {superCategories.find((c) => c._id === superCategory)?.name} →{' '}
                        {subCategories.find((c) => c._id === subCategory)?.name}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* ==================== PRICING ==================== */}
              <section id="pricing" className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>💰</span> Pricing & Tax
                  </h2>
                  <p className="text-green-100 text-sm">Set product price, discounts and tax</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* MRP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MRP (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          name="mrp"
                          value={form.mrp}
                          onChange={handleChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                            errors.mrp ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.mrp && (
                        <p className="mt-1 text-sm text-red-500">{errors.mrp}</p>
                      )}
                    </div>

                    {/* Selling Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selling Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          name="sellingPrice"
                          value={form.sellingPrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                            errors.sellingPrice ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.sellingPrice && (
                        <p className="mt-1 text-sm text-red-500">{errors.sellingPrice}</p>
                      )}
                    </div>
                  </div>

                  {/* Discount Section */}
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span>🏷️</span> Additional Discount (Optional)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Type
                        </label>
                        <select
                          name="discountType"
                          value={form.discountType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition bg-white"
                        >
                          <option value="">No Additional Discount</option>
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>

                      {form.discountType && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Discount Value
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="discountValue"
                              value={form.discountValue}
                              onChange={handleChange}
                              placeholder={form.discountType === 'percentage' ? '10' : '100'}
                              min="0"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {form.discountType === 'percentage' ? '%' : '₹'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GST Section */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <span>🧾</span> GST Configuration
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="gstApplicable"
                          checked={form.gstApplicable}
                          onChange={handleChange}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">GST Applicable</span>
                      </label>
                    </div>

                    {form.gstApplicable && (
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            GST Percentage
                          </label>
                          <select
                            name="gstPercentage"
                            value={form.gstPercentage}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                          >
                            <option value={0}>0% (Exempt)</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tax Inclusion
                          </label>
                          <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="taxInclusive"
                                checked={form.taxInclusive === true}
                                onChange={() => setForm((f) => ({ ...f, taxInclusive: true }))}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">Tax Inclusive</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="taxInclusive"
                                checked={form.taxInclusive === false}
                                onChange={() => setForm((f) => ({ ...f, taxInclusive: false }))}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">Tax Exclusive</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ==================== STOCK ==================== */}
              <section id="stock" className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📊</span> Inventory & Stock
                  </h2>
                  <p className="text-orange-100 text-sm">Manage stock and availability</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Total Stock */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="totalStock"
                        value={form.totalStock}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition ${
                          errors.totalStock ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>

                    {/* Low Stock Alert */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Alert Qty
                      </label>
                      <input
                        type="number"
                        name="lowStockAlertQty"
                        value={form.lowStockAlertQty}
                        onChange={handleChange}
                        placeholder="5"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    {/* Stock Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Status
                      </label>
                      <select
                        name="stockStatus"
                        value={form.stockStatus}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Min Purchase Qty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Purchase Qty
                      </label>
                      <input
                        type="number"
                        name="minPurchaseQty"
                        value={form.minPurchaseQty}
                        onChange={handleChange}
                        placeholder="1"
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    {/* Max Purchase Qty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Purchase Qty
                      </label>
                      <input
                        type="number"
                        name="maxPurchaseQty"
                        value={form.maxPurchaseQty}
                        onChange={handleChange}
                        placeholder="5"
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    {/* Availability Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability Status
                      </label>
                      <select
                        name="availabilityStatus"
                        value={form.availabilityStatus}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                      >
                        <option value="available">Available</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="coming_soon">Coming Soon</option>
                      </select>
                    </div>
                  </div>

                  {/* Allow Backorders */}
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <input
                      type="checkbox"
                      name="allowBackorders"
                      checked={form.allowBackorders}
                      onChange={handleChange}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <div>
                      <p className="font-medium text-gray-700">Allow Backorders</p>
                      <p className="text-sm text-gray-500">Allow customers to order even when out of stock</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================== DESCRIPTIONS ==================== */}
              <section id="description" className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📝</span> Descriptions & Features
                  </h2>
                  <p className="text-indigo-100 text-sm">Product details and specifications</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                      <span className="text-gray-400 font-normal ml-1">(Max 200 characters)</span>
                    </label>
                    <textarea
                      name="shortDescription"
                      value={form.shortDescription}
                      onChange={handleChange}
                      placeholder="Brief product description for listings..."
                      rows={2}
                      maxLength={200}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                    />
                    <p className="text-right text-xs text-gray-400 mt-1">
                      {form.shortDescription.length}/200
                    </p>
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Description
                      <span className="text-gray-400 font-normal ml-1">(HTML supported)</span>
                    </label>
                    <textarea
                      name="fullDescription"
                      value={form.fullDescription}
                      onChange={handleChange}
                      placeholder="Detailed product description..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                    />
                  </div>

                  {/* Key Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Features
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add a key feature..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyFeature())}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={addKeyFeature}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                      >
                        + Add
                      </button>
                    </div>

                    {form.keyFeatures.length > 0 && (
                      <div className="space-y-2">
                        {form.keyFeatures.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200"
                          >
                            <span className="flex items-center gap-2 text-sm">
                              <span className="text-indigo-600">✓</span>
                              {feature}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeKeyFeature(index)}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Usage Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usage Instructions
                      </label>
                      <textarea
                        name="usageInstructions"
                        value={form.usageInstructions}
                        onChange={handleChange}
                        placeholder="How to use this product..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                      />
                    </div>

                    {/* Care Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Care Instructions
                      </label>
                      <textarea
                        name="careInstructions"
                        value={form.careInstructions}
                        onChange={handleChange}
                        placeholder="How to care for this product..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                      />
                    </div>
                  </div>

                  {/* Box Contents */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Box Contents / What's Included
                    </label>
                    <textarea
                      name="boxContents"
                      value={form.boxContents}
                      onChange={handleChange}
                      placeholder="List what's included in the box..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* ==================== IMAGES ==================== */}
              <section id="media" className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-pink-600 to-pink-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🖼️</span> Product Images
                  </h2>
                  <p className="text-pink-100 text-sm">Upload high-quality product images (Max 10)</p>
                </div>

                <div className="p-6">
                  {errors.images && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {errors.images}
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-500 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-gray-400 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium mb-1">
                      Click or drag images to upload
                    </p>
                    <p className="text-gray-400 text-sm">
                      PNG, JPG, WEBP up to 5MB each
                    </p>
                  </div>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-3">Existing Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {existingImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                            >
                              ×
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                                Main
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Preview */}
                  {images.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-3">
                        New Images ({images.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`New ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                            >
                              ×
                            </button>
                            <p className="text-xs text-center text-gray-500 mt-1 truncate">
                              {img.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Count */}
                  <div className="mt-4 text-center">
                    <span className={`text-sm ${
                      existingImages.length + images.length > 10 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {existingImages.length + images.length} / 10 images
                    </span>
                  </div>
                </div>
              </section>

              {/* ==================== RETURNS & WARRANTY ==================== */}
              <section id="returns" className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🔄</span> Returns & Warranty
                  </h2>
                  <p className="text-teal-100 text-sm">Configure return policy and warranty</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Return Policy */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <span>↩️</span> Return Policy
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="returnAvailable"
                          checked={form.returnAvailable}
                          onChange={handleChange}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Return Available</span>
                      </label>
                    </div>

                    {form.returnAvailable && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Return Days
                          </label>
                          <input
                            type="number"
                            name="returnDays"
                            value={form.returnDays}
                            onChange={handleChange}
                            placeholder="e.g. 7"
                            min="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center gap-3 cursor-pointer p-3 bg-teal-50 rounded-lg border border-teal-200 w-full">
                            <input
                              type="checkbox"
                              name="replacementAvailable"
                              checked={form.replacementAvailable}
                              onChange={handleChange}
                              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                            <div>
                              <p className="font-medium text-gray-700">Replacement Available</p>
                              <p className="text-xs text-gray-500">Allow product replacement</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Warranty */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <span>🛡️</span> Warranty
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="warrantyAvailable"
                          checked={form.warrantyAvailable}
                          onChange={handleChange}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Warranty Available</span>
                      </label>
                    </div>

                    {form.warrantyAvailable && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Warranty Period
                          </label>
                          <input
                            type="text"
                            name="warrantyPeriod"
                            value={form.warrantyPeriod}
                            onChange={handleChange}
                            placeholder="e.g. 1 Year, 6 Months"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Warranty Type
                          </label>
                          <select
                            name="warrantyType"
                            value={form.warrantyType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white"
                          >
                            <option value="">Select Warranty Type</option>
                            <option value="brand">Brand Warranty</option>
                            <option value="seller">Seller Warranty</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <h4 className="font-medium text-gray-700 mb-2">Policy Summary</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${form.returnAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                        {form.returnAvailable ? '✓' : '✗'} Returns {form.returnAvailable && form.returnDays ? `(${form.returnDays} days)` : ''}
                      </span>
                      <span className={`flex items-center gap-1 ${form.replacementAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                        {form.replacementAvailable ? '✓' : '✗'} Replacement
                      </span>
                      <span className={`flex items-center gap-1 ${form.warrantyAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                        {form.warrantyAvailable ? '✓' : '✗'} Warranty {form.warrantyAvailable && form.warrantyPeriod ? `(${form.warrantyPeriod})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================== SUBMIT BUTTONS (Mobile) ==================== */}
              <div className="lg:hidden mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    product ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Final Price</p>
            <p className="text-xl font-bold text-green-600">₹{calculateFinalPrice()}</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : product ? 'Update' : 'Create'}
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="lg:hidden h-24"></div>
    </div>
  );
};

export default ProductForm;