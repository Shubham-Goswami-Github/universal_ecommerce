// src/components/vendor/ProductForm.jsx
import { useEffect, useState, useRef } from 'react';
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

  // Dropdown states
  const [superDropdownOpen, setSuperDropdownOpen] = useState(false);
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);
  const [superSearch, setSuperSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const superDropdownRef = useRef(null);
  const subDropdownRef = useRef(null);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedProduct, setSavedProduct] = useState(null);

  // Steps configuration
  const steps = [
    { id: 1, title: 'Basic Info', subtitle: 'Product identity', icon: '📦' },
    { id: 2, title: 'Category', subtitle: 'Classification', icon: '📁' },
    { id: 3, title: 'Pricing', subtitle: 'Price & Tax', icon: '💰' },
    { id: 4, title: 'Stock', subtitle: 'Inventory', icon: '📊' },
    { id: 5, title: 'Description', subtitle: 'Details', icon: '📝' },
    { id: 6, title: 'Images', subtitle: 'Media', icon: '🖼️' },
    { id: 7, title: 'Policies', subtitle: 'Returns & Warranty', icon: '🔄' },
  ];

  // Generate SKU
  const generateSKU = () => {
    const prefix = form.brandName ? form.brandName.substring(0, 3).toUpperCase() : 'PRD';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  // Generate HSN Code
  const generateHSNCode = () => {
    const categoryBasedCode = subCategory ? subCategory.substring(0, 4) : '9999';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${categoryBasedCode}${random}`.substring(0, 8);
  };

  // Auto-generate SKU and HSN when relevant fields change
  useEffect(() => {
    if (!product && !form.sku) {
      setForm(f => ({ ...f, sku: generateSKU() }));
    }
  }, [form.brandName, form.name]);

  useEffect(() => {
    if (!product && !form.hsnCode && subCategory) {
      setForm(f => ({ ...f, hsnCode: generateHSNCode() }));
    }
  }, [subCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (superDropdownRef.current && !superDropdownRef.current.contains(event.target)) {
        setSuperDropdownOpen(false);
      }
      if (subDropdownRef.current && !subDropdownRef.current.contains(event.target)) {
        setSubDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const superCategories = categories.filter((c) => c.type === 'super');
  const subCategories = categories.filter((c) => c.type === 'sub' && c.parent === superCategory);

  const filteredSuperCategories = superCategories.filter((c) =>
    c.name.toLowerCase().includes(superSearch.toLowerCase())
  );

  const filteredSubCategories = subCategories.filter((c) =>
    c.name.toLowerCase().includes(subSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((e) => ({ ...e, [name]: null }));
    }
  };

  // Regenerate SKU manually
  const regenerateSKU = () => {
    setForm(f => ({ ...f, sku: generateSKU() }));
  };

  // Regenerate HSN manually
  const regenerateHSN = () => {
    setForm(f => ({ ...f, hsnCode: generateHSNCode() }));
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

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!form.name.trim()) newErrors.name = 'Product name is required';
        if (!form.sku.trim()) newErrors.sku = 'SKU is required';
        break;
      case 2:
        if (!subCategory) newErrors.category = 'Category is required';
        break;
      case 3:
        if (!form.mrp || parseFloat(form.mrp) <= 0) newErrors.mrp = 'Valid MRP is required';
        if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) newErrors.sellingPrice = 'Valid selling price is required';
        if (parseFloat(form.sellingPrice) > parseFloat(form.mrp)) newErrors.sellingPrice = 'Selling price cannot exceed MRP';
        break;
      case 4:
        if (form.totalStock < 0) newErrors.totalStock = 'Stock cannot be negative';
        break;
      case 6:
        if (images.length === 0 && existingImages.length === 0) newErrors.images = 'At least one image is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Go to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Go to specific step
  const goToStep = (step) => {
    // Only allow going back or to already validated steps
    if (step < currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e?.preventDefault();

    // Validate all steps
    let hasErrors = false;
    for (let i = 1; i <= steps.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        hasErrors = true;
        break;
      }
    }

    if (hasErrors) return;

    try {
      setSubmitting(true);
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === 'keyFeatures') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      formData.append('category', subCategory);
      formData.append('finalPrice', calculateFinalPrice());

      images.forEach((img) => {
        formData.append('images', img);
      });

      formData.append('existingImages', JSON.stringify(existingImages));
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

      setSavedProduct(res.data.product);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onSaved(savedProduct);
  };

  // Get selected category names
  const getSelectedSuperCategoryName = () => {
    const cat = superCategories.find(c => c._id === superCategory);
    return cat ? cat.name : '';
  };

  const getSelectedSubCategoryName = () => {
    const cat = subCategories.find(c => c._id === subCategory);
    return cat ? cat.name : '';
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your product name"
                className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Short Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Title
                <span className="text-gray-400 font-normal ml-2">(Display name)</span>
              </label>
              <input
                name="shortTitle"
                value={form.shortTitle}
                onChange={handleChange}
                placeholder="Short display title for listings"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  name="brandName"
                  value={form.brandName}
                  onChange={handleChange}
                  placeholder="e.g. Samsung, Nike, Apple"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* SKU - Auto Generated */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SKU <span className="text-red-500">*</span>
                  <span className="text-green-600 font-normal ml-2 text-xs bg-green-100 px-2 py-0.5 rounded-full">Auto Generated</span>
                </label>
                <div className="relative">
                  <input
                    name="sku"
                    value={form.sku}
                    readOnly
                    className={`w-full px-4 py-3.5 border-2 rounded-xl bg-gray-50 outline-none pr-12 font-mono ${
                      errors.sku ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={regenerateSKU}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Regenerate SKU"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Product Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Type
                </label>
                <select
                  name="productType"
                  value={form.productType}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="physical">Physical Product</option>
                  <option value="digital">Digital Product</option>
                  <option value="service">Service</option>
                </select>
              </div>

              {/* Country of Origin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country of Origin
                </label>
                <input
                  name="countryOfOrigin"
                  value={form.countryOfOrigin}
                  onChange={handleChange}
                  placeholder="e.g. India"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* HSN Code - Auto Generated */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  HSN Code
                  <span className="text-green-600 font-normal ml-2 text-xs bg-green-100 px-2 py-0.5 rounded-full">Auto Generated</span>
                </label>
                <div className="relative">
                  <input
                    name="hsnCode"
                    value={form.hsnCode}
                    readOnly
                    placeholder="Select category first"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 outline-none pr-12 font-mono"
                  />
                  <button
                    type="button"
                    onClick={regenerateHSN}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Regenerate HSN"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {errors.category && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.category}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Super Category - Searchable Dropdown */}
              <div ref={superDropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Super Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setSuperDropdownOpen(!superDropdownOpen);
                      setSubDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white text-left flex items-center justify-between"
                  >
                    <span className={superCategory ? 'text-gray-900' : 'text-gray-400'}>
                      {getSelectedSuperCategoryName() || 'Select Super Category'}
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${superDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {superDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={superSearch}
                            onChange={(e) => setSuperSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredSuperCategories.length > 0 ? (
                          filteredSuperCategories.map((cat) => (
                            <button
                              key={cat._id}
                              type="button"
                              onClick={() => {
                                setSuperCategory(cat._id);
                                setSubCategory('');
                                setSuperDropdownOpen(false);
                                setSuperSearch('');
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition flex items-center justify-between ${
                                superCategory === cat._id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                              }`}
                            >
                              <span>{cat.name}</span>
                              {superCategory === cat._id && (
                                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500">
                            No categories found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub Category - Searchable Dropdown */}
              <div ref={subDropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (superCategory) {
                        setSubDropdownOpen(!subDropdownOpen);
                        setSuperDropdownOpen(false);
                      }
                    }}
                    disabled={!superCategory}
                    className={`w-full px-4 py-3.5 border-2 rounded-xl outline-none transition text-left flex items-center justify-between ${
                      !superCategory
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                        : 'bg-white border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  >
                    <span className={subCategory ? 'text-gray-900' : 'text-gray-400'}>
                      {getSelectedSubCategoryName() || (superCategory ? 'Select Sub Category' : 'Select super category first')}
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${subDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {subDropdownOpen && superCategory && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search sub categories..."
                            value={subSearch}
                            onChange={(e) => setSubSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredSubCategories.length > 0 ? (
                          filteredSubCategories.map((cat) => (
                            <button
                              key={cat._id}
                              type="button"
                              onClick={() => {
                                setSubCategory(cat._id);
                                setSubDropdownOpen(false);
                                setSubSearch('');
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition flex items-center justify-between ${
                                subCategory === cat._id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                              }`}
                            >
                              <span>{cat.name}</span>
                              {subCategory === cat._id && (
                                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500">
                            No sub categories found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Category Display */}
            {subCategory && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Selected Category</p>
                  <p className="font-semibold text-gray-800">
                    {getSelectedSuperCategoryName()} → {getSelectedSubCategoryName()}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Price Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* MRP */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  MRP (Maximum Retail Price) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">₹</span>
                  <input
                    type="number"
                    name="mrp"
                    value={form.mrp}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-2xl font-semibold ${
                      errors.mrp ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  />
                </div>
                {errors.mrp && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.mrp}
                  </p>
                )}
              </div>

              {/* Selling Price */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Selling Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-green-600">₹</span>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={form.sellingPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-2xl font-semibold ${
                      errors.sellingPrice ? 'border-red-400 bg-red-50' : 'border-green-300 bg-white'
                    }`}
                  />
                </div>
                {errors.sellingPrice && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.sellingPrice}
                  </p>
                )}
                {calculateDiscountPercentage() > 0 && (
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                    <span>🏷️</span>
                    {calculateDiscountPercentage()}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Additional Discount */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
              <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-xl">🎁</span> Additional Discount (Optional)
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-white"
                  >
                    <option value="">No Additional Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                {form.discountType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        {form.discountType === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GST Configuration */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <span className="text-xl">🧾</span> GST Configuration
                </h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">GST Applicable</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="gstApplicable"
                      checked={form.gstApplicable}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-14 h-7 rounded-full transition ${form.gstApplicable ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.gstApplicable ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </div>
                </label>
              </div>

              {form.gstApplicable && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Percentage
                    </label>
                    <select
                      name="gstPercentage"
                      value={form.gstPercentage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Type
                    </label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${form.taxInclusive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="taxInclusive"
                          checked={form.taxInclusive === true}
                          onChange={() => setForm((f) => ({ ...f, taxInclusive: true }))}
                          className="sr-only"
                        />
                        <span className="font-medium">Inclusive</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${!form.taxInclusive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="taxInclusive"
                          checked={form.taxInclusive === false}
                          onChange={() => setForm((f) => ({ ...f, taxInclusive: false }))}
                          className="sr-only"
                        />
                        <span className="font-medium">Exclusive</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-2xl text-white">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span>💵</span> Price Summary
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-green-200 text-sm mb-1">MRP</p>
                  <p className="text-2xl font-bold line-through opacity-75">₹{form.mrp || '0'}</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm mb-1">Discount</p>
                  <p className="text-2xl font-bold">{calculateDiscountPercentage()}%</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm mb-1">Final Price</p>
                  <p className="text-3xl font-bold">₹{calculateFinalPrice()}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Total Stock */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Total Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalStock"
                  value={form.totalStock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-center text-2xl font-bold"
                />
                <p className="text-center text-gray-500 text-sm mt-2">units available</p>
              </div>

              {/* Low Stock Alert */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  name="lowStockAlertQty"
                  value={form.lowStockAlertQty}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-center text-2xl font-bold"
                />
                <p className="text-center text-gray-500 text-sm mt-2">alert when below</p>
              </div>

              {/* Stock Status */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Stock Status
                </label>
                <select
                  name="stockStatus"
                  value={form.stockStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white font-semibold text-center"
                >
                  <option value="in_stock">✅ In Stock</option>
                  <option value="out_of_stock">❌ Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Purchase Limits */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200">
              <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-xl">🛒</span> Purchase Limits
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Purchase Qty
                  </label>
                  <input
                    type="number"
                    name="minPurchaseQty"
                    value={form.minPurchaseQty}
                    onChange={handleChange}
                    placeholder="1"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-center font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Purchase Qty
                  </label>
                  <input
                    type="number"
                    name="maxPurchaseQty"
                    value={form.maxPurchaseQty}
                    onChange={handleChange}
                    placeholder="5"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-center font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    name="availabilityStatus"
                    value={form.availabilityStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white"
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Allow Backorders */}
            <div className={`p-6 rounded-2xl border-2 transition ${form.allowBackorders ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
              <label className="flex items-center gap-4 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="allowBackorders"
                    checked={form.allowBackorders}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-14 h-7 rounded-full transition ${form.allowBackorders ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.allowBackorders ? 'translate-x-7' : ''}`}></div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Allow Backorders</p>
                  <p className="text-sm text-gray-500">Allow customers to order even when out of stock</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Short Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description
                <span className="text-gray-400 font-normal ml-2">(Max 200 characters)</span>
              </label>
              <textarea
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="Brief product description for listings and previews..."
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-sm ${form.shortDescription.length > 180 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {form.shortDescription.length}/200
                </span>
              </div>
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                name="fullDescription"
                value={form.fullDescription}
                onChange={handleChange}
                placeholder="Detailed product description with all features and specifications..."
                rows={8}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
            </div>

            {/* Key Features */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Key Features
              </label>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a key feature and press Enter..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyFeature())}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={addKeyFeature}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
                >
                  + Add
                </button>
              </div>

              {form.keyFeatures.length > 0 && (
                <div className="space-y-2">
                  {form.keyFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-200 group"
                    >
                      <span className="flex items-center gap-3 text-gray-700">
                        <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-semibold">
                          {index + 1}
                        </span>
                        {feature}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeKeyFeature(index)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Usage Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Usage Instructions
                </label>
                <textarea
                  name="usageInstructions"
                  value={form.usageInstructions}
                  onChange={handleChange}
                  placeholder="How to use this product..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                />
              </div>

              {/* Care Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Care Instructions
                </label>
                <textarea
                  name="careInstructions"
                  value={form.careInstructions}
                  onChange={handleChange}
                  placeholder="How to care for this product..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Box Contents */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's in the Box
              </label>
              <textarea
                name="boxContents"
                value={form.boxContents}
                onChange={handleChange}
                placeholder="List what's included in the package..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {errors.images && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.images}
              </div>
            )}

            {/* Upload Area */}
            <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-pink-500 hover:bg-pink-50 transition cursor-pointer relative group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-gray-400 group-hover:text-pink-500 transition mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Drop images here or click to upload
              </p>
              <p className="text-gray-500">
                PNG, JPG, WEBP up to 5MB each • Maximum 10 images
              </p>
            </div>

            {/* Image Count */}
            <div className="flex items-center justify-center gap-2">
              <div className={`text-lg font-semibold ${existingImages.length + images.length >= 10 ? 'text-red-500' : 'text-gray-600'}`}>
                {existingImages.length + images.length} / 10 images uploaded
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-4">Existing Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={img}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg font-semibold">
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
              <div>
                <h4 className="font-semibold text-gray-700 mb-4">
                  New Images ({images.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-cover rounded-xl border-2 border-green-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-lg font-semibold">
                        New
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            {/* Return Policy */}
            <div className={`p-6 rounded-2xl border-2 transition ${form.returnAvailable ? 'bg-teal-50 border-teal-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-3">
                  <span className="text-2xl">↩️</span>
                  <span>Return Policy</span>
                </h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">Enable Returns</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="returnAvailable"
                      checked={form.returnAvailable}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-14 h-7 rounded-full transition ${form.returnAvailable ? 'bg-teal-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.returnAvailable ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </div>
                </label>
              </div>

              {form.returnAvailable && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Window (Days)
                    </label>
                    <input
                      type="number"
                      name="returnDays"
                      value={form.returnDays}
                      onChange={handleChange}
                      placeholder="e.g. 7, 15, 30"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${form.replacementAvailable ? 'bg-teal-100 border-teal-400' : 'border-gray-200 hover:border-gray-300'}`}>
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
            <div className={`p-6 rounded-2xl border-2 transition ${form.warrantyAvailable ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700 flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <span>Warranty</span>
                </h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">Enable Warranty</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="warrantyAvailable"
                      checked={form.warrantyAvailable}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-14 h-7 rounded-full transition ${form.warrantyAvailable ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.warrantyAvailable ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </div>
                </label>
              </div>

              {form.warrantyAvailable && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Period
                    </label>
                    <input
                      type="text"
                      name="warrantyPeriod"
                      value={form.warrantyPeriod}
                      onChange={handleChange}
                      placeholder="e.g. 1 Year, 6 Months"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Type
                    </label>
                    <select
                      name="warrantyType"
                      value={form.warrantyType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                    >
                      <option value="">Select Type</option>
                      <option value="brand">Brand Warranty</option>
                      <option value="seller">Seller Warranty</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Policy Summary */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-2xl text-white">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span>📋</span> Policy Summary
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className={`p-4 rounded-xl ${form.returnAvailable ? 'bg-green-500/20' : 'bg-gray-600/50'}`}>
                  <p className="text-3xl mb-2">{form.returnAvailable ? '✅' : '❌'}</p>
                  <p className="font-medium">Returns</p>
                  {form.returnAvailable && form.returnDays && (
                    <p className="text-sm text-gray-300">{form.returnDays} days</p>
                  )}
                </div>
                <div className={`p-4 rounded-xl ${form.replacementAvailable ? 'bg-green-500/20' : 'bg-gray-600/50'}`}>
                  <p className="text-3xl mb-2">{form.replacementAvailable ? '✅' : '❌'}</p>
                  <p className="font-medium">Replacement</p>
                </div>
                <div className={`p-4 rounded-xl ${form.warrantyAvailable ? 'bg-green-500/20' : 'bg-gray-600/50'}`}>
                  <p className="text-3xl mb-2">{form.warrantyAvailable ? '✅' : '❌'}</p>
                  <p className="font-medium">Warranty</p>
                  {form.warrantyAvailable && form.warrantyPeriod && (
                    <p className="text-sm text-gray-300">{form.warrantyPeriod}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {product ? 'Edit Product' : 'Add New Product'}
                </h1>
                <p className="text-sm text-gray-500">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b sticky top-[72px] z-20 overflow-x-auto">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between min-w-max">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center gap-2 transition ${
                    step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${
                      step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : step.id === currentStep
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className={`text-sm font-medium ${step.id === currentStep ? 'text-blue-600' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                  </div>
                </button>

                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-1 mx-2 rounded ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">{steps[currentStep - 1].icon}</span>
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-500 mt-1">{steps[currentStep - 1].subtitle}</p>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-100">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                Next
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
            )}
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-bounce-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {product ? 'Product Updated!' : 'Product Created!'}
            </h3>
            <p className="text-gray-500 mb-6">
              {product
                ? 'Your product has been updated successfully.'
                : 'Your product has been created and is now live.'}
            </p>
            {savedProduct && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-gray-500">Product Name</p>
                <p className="font-semibold text-gray-800">{savedProduct.name}</p>
                <p className="text-sm text-gray-500 mt-2">SKU</p>
                <p className="font-mono text-gray-800">{savedProduct.sku}</p>
              </div>
            )}
            <button
              onClick={handleSuccessClose}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductForm;