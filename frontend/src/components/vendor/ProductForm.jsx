// src/components/vendor/ProductForm.jsx
import { useEffect, useState, useRef } from 'react';
import axiosClient from '../../api/axiosClient';

const normalizeCategoryId = (value) => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value._id?.toString() || '';
  }
  return value.toString();
};

const ProductForm = ({ token, product = null, onSaved, onCancel }) => {
  const [approvedCategories, setApprovedCategories] = useState([]);
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
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedProduct, setSavedProduct] = useState(null);

  // Ref for scroll
  const formContentRef = useRef(null);

  // Steps configuration
  const steps = [
    { id: 1, title: 'Basic Info', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { id: 2, title: 'Category', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { id: 3, title: 'Pricing', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 4, title: 'Stock', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 5, title: 'Description', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 6, title: 'Images', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 7, title: 'Policies', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )},
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
      setCurrentStep(1);
      setMaxUnlockedStep(steps.length);
      setCompletedSteps(steps.map((step) => step.id));
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
        setSuperCategory(normalizeCategoryId(product.category.parent));
        setSubCategory(normalizeCategoryId(product.category));
      } else if (product.category) {
        setSubCategory(normalizeCategoryId(product.category));
      }
    } else {
      setCurrentStep(1);
      setMaxUnlockedStep(1);
      setCompletedSteps([]);
      setExistingImages([]);
      setImages([]);
      setImagesToDelete([]);
    }
  }, [product]);

  /* FETCH CATEGORIES */
  useEffect(() => {
    axiosClient.get('/api/categories/public/hierarchy').then((res) => {
      setCategories(res.data.categories || []);
    });
  }, []);

const superCategories = categories
  .filter((c) => c.type === 'super')
  .map((superCat) => {
    const filteredSubs = superCat.subCategories.filter((sub) =>
      approvedCategories.includes(sub._id)
    );

    return {
      ...superCat,
      subCategories: filteredSubs,
    };
  })
  .filter((c) => c.subCategories.length > 0);
  const selectedSuperCategory = superCategories.find(
    (c) => normalizeCategoryId(c._id) === normalizeCategoryId(superCategory)
  );
  const subCategories = selectedSuperCategory?.subCategories || [];
  const selectedSubCategory = subCategories.find(
    (c) => normalizeCategoryId(c._id) === normalizeCategoryId(subCategory)
  );

  const filteredSuperCategories = superCategories.filter((c) =>
    c.name.toLowerCase().includes(superSearch.toLowerCase())
  );

  const filteredSubCategories = subCategories.filter((c) =>
    c.name.toLowerCase().includes(subSearch.toLowerCase())
  );
  useEffect(() => {
    if (!token) {
      setApprovedCategories([]);
      return;
    }

    const fetchVendor = async () => {
      try {
        const res = await axiosClient.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setApprovedCategories(res.data.user.vendorCategoriesApproved || []);
      } catch (err) {
        console.error('Vendor fetch error', err);
        setApprovedCategories([]);
      }
    };

    fetchVendor();
  }, [token]);
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

  // Scroll to form content
  const scrollToForm = () => {
    setTimeout(() => {
      formContentRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  // Go to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) =>
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      );
      if (currentStep < steps.length) {
        setMaxUnlockedStep((prev) => Math.max(prev, currentStep + 1));
        setCurrentStep(currentStep + 1);
        scrollToForm();
      }
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToForm();
    }
  };

  // Go to specific step
  const goToStep = (step) => {
    if (step <= maxUnlockedStep) {
      setCurrentStep(step);
      scrollToForm();
    }
  };

  const isStepUnlocked = (stepId) => stepId <= maxUnlockedStep;
  const isStepCompleted = (stepId) => completedSteps.includes(stepId);

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
    const cat = superCategories.find((c) => normalizeCategoryId(c._id) === normalizeCategoryId(superCategory));
    return cat ? cat.name : '';
  };

  const getSelectedSubCategoryName = () => {
    const cat = subCategories.find((c) => normalizeCategoryId(c._id) === normalizeCategoryId(subCategory));
    return cat ? cat.name : '';
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your product name"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Short Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Short Title
                <span className="text-slate-400 font-normal ml-2">(Display name)</span>
              </label>
              <input
                name="shortTitle"
                value={form.shortTitle}
                onChange={handleChange}
                placeholder="Short display title for listings"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Brand Name
                </label>
                <input
                  name="brandName"
                  value={form.brandName}
                  onChange={handleChange}
                  placeholder="e.g. Samsung, Nike, Apple"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* SKU - Auto Generated */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  SKU <span className="text-red-500">*</span>
                  <span className="text-green-600 font-normal ml-2 text-xs bg-green-100 px-2 py-0.5 rounded-full">Auto</span>
                </label>
                <div className="relative">
                  <input
                    name="sku"
                    value={form.sku}
                    readOnly
                    className={`w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none pr-12 font-mono text-sm ${
                      errors.sku ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={regenerateSKU}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Regenerate SKU"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Product Type
                </label>
                <select
                  name="productType"
                  value={form.productType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="physical">Physical Product</option>
                  <option value="digital">Digital Product</option>
                  <option value="service">Service</option>
                </select>
              </div>

              {/* Country of Origin */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Country of Origin
                </label>
                <input
                  name="countryOfOrigin"
                  value={form.countryOfOrigin}
                  onChange={handleChange}
                  placeholder="e.g. India"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* HSN Code - Auto Generated */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  HSN Code
                  <span className="text-green-600 font-normal ml-2 text-xs bg-green-100 px-2 py-0.5 rounded-full">Auto</span>
                </label>
                <div className="relative">
                  <input
                    name="hsnCode"
                    value={form.hsnCode}
                    readOnly
                    placeholder="Select category first"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none pr-12 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={regenerateHSN}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Regenerate HSN"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        if (approvedCategories.length === 0) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
      No approved categories. Contact admin.
    </div>
  );
}
        return (
          
          <div className="space-y-5">
            {errors.category && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.category}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              {/* Super Category - Searchable Dropdown */}
              <div ref={superDropdownRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Super Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setSuperDropdownOpen(!superDropdownOpen);
                      setSubDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-left flex items-center justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {selectedSuperCategory?.image ? (
                        <img
                          src={selectedSuperCategory.image}
                          alt={selectedSuperCategory.name}
                          className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      )}
                      <span className={`truncate text-sm ${superCategory ? 'text-slate-800' : 'text-slate-400'}`}>
                        {getSelectedSuperCategoryName() || 'Select Super Category'}
                      </span>
                    </div>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${superDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {superDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search..."
                            value={superSearch}
                            onChange={(e) => setSuperSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
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
                                setSubSearch('');
                              }}
                              className={`w-full px-3 py-2.5 text-left hover:bg-blue-50 transition flex items-center justify-between ${
                                normalizeCategoryId(superCategory) === normalizeCategoryId(cat._id) ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {cat.image ? (
                                  <img src={cat.image} alt={cat.name} className="h-8 w-8 rounded-lg object-cover border border-slate-200" />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                  </div>
                                )}
                                <span className="truncate text-sm">{cat.name}</span>
                              </div>
                              {normalizeCategoryId(superCategory) === normalizeCategoryId(cat._id) && (
                                <svg className="w-5 h-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-slate-500 text-sm">No categories found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub Category - Searchable Dropdown */}
              <div ref={subDropdownRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                    className={`w-full px-4 py-3 border rounded-xl outline-none transition text-left flex items-center justify-between ${
                      !superCategory
                        ? 'bg-slate-100 border-slate-200 cursor-not-allowed'
                        : 'bg-white border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {selectedSubCategory?.image ? (
                        <img src={selectedSubCategory.image} alt={selectedSubCategory.name} className="h-8 w-8 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                      )}
                      <span className={`truncate text-sm ${subCategory ? 'text-slate-800' : 'text-slate-400'}`}>
                        {getSelectedSubCategoryName() || (superCategory ? 'Select Sub Category' : 'Select super category first')}
                      </span>
                    </div>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${subDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {subDropdownOpen && superCategory && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search..."
                            value={subSearch}
                            onChange={(e) => setSubSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
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
                              className={`w-full px-3 py-2.5 text-left hover:bg-blue-50 transition flex items-center justify-between ${
                                normalizeCategoryId(subCategory) === normalizeCategoryId(cat._id) ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {cat.image ? (
                                  <img src={cat.image} alt={cat.name} className="h-8 w-8 rounded-lg object-cover border border-slate-200" />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                  </div>
                                )}
                                <span className="truncate text-sm">{cat.name}</span>
                              </div>
                              {normalizeCategoryId(subCategory) === normalizeCategoryId(cat._id) && (
                                <svg className="w-5 h-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-slate-500 text-sm">No sub categories found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Category Display */}
            {subCategory && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center -space-x-2">
                  {selectedSuperCategory?.image ? (
                    <img src={selectedSuperCategory.image} alt={selectedSuperCategory.name} className="h-10 w-10 rounded-full border-2 border-white object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                  {selectedSubCategory?.image ? (
                    <img src={selectedSubCategory.image} alt={selectedSubCategory.name} className="h-10 w-10 rounded-full border-2 border-white object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Selected Category</p>
                  <p className="font-medium text-slate-800 text-sm">
                    {getSelectedSuperCategoryName()} → {getSelectedSubCategoryName()}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            {/* Price Cards */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* MRP */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  MRP (Maximum Retail Price) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">₹</span>
                  <input
                    type="number"
                    name="mrp"
                    value={form.mrp}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xl font-semibold ${
                      errors.mrp ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                  />
                </div>
                {errors.mrp && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.mrp}
                  </p>
                )}
              </div>

              {/* Selling Price */}
              <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Selling Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-green-600">₹</span>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={form.sellingPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-xl font-semibold ${
                      errors.sellingPrice ? 'border-red-400 bg-red-50' : 'border-green-300 bg-white'
                    }`}
                  />
                </div>
                {errors.sellingPrice && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.sellingPrice}
                  </p>
                )}
                {calculateDiscountPercentage() > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                    {calculateDiscountPercentage()}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Additional Discount */}
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
              <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 bg-amber-200 rounded-lg flex items-center justify-center">🎁</span>
                Additional Discount (Optional)
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-white text-sm"
                  >
                    <option value="">No Additional Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                {form.discountType && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition pr-10 text-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                        {form.discountType === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GST Configuration */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-700 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 bg-blue-200 rounded-lg flex items-center justify-center">🧾</span>
                  GST Configuration
                </h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-slate-600">GST Applicable</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="gstApplicable"
                      checked={form.gstApplicable}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition ${form.gstApplicable ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.gstApplicable ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </div>
                </label>
              </div>

              {form.gstApplicable && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      GST Percentage
                    </label>
                    <select
                      name="gstPercentage"
                      value={form.gstPercentage}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Tax Type
                    </label>
                    <div className="flex gap-3">
                      <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer transition text-sm ${form.taxInclusive ? 'border-blue-500 bg-blue-100 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="taxInclusive"
                          checked={form.taxInclusive === true}
                          onChange={() => setForm((f) => ({ ...f, taxInclusive: true }))}
                          className="sr-only"
                        />
                        <span className="font-medium">Inclusive</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer transition text-sm ${!form.taxInclusive ? 'border-blue-500 bg-blue-100 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-xl text-white">
              <h4 className="font-medium mb-4 flex items-center gap-2 text-sm">
                <span>💵</span> Price Summary
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-blue-200 text-xs mb-1">MRP</p>
                  <p className="text-lg font-bold line-through opacity-75">₹{form.mrp || '0'}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-blue-200 text-xs mb-1">Discount</p>
                  <p className="text-lg font-bold">{calculateDiscountPercentage()}%</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-blue-200 text-xs mb-1">Final Price</p>
                  <p className="text-xl font-bold">₹{calculateFinalPrice()}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="grid md:grid-cols-3 gap-5">
              {/* Total Stock */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalStock"
                  value={form.totalStock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-center text-2xl font-bold"
                />
                <p className="text-slate-500 text-xs mt-1.5">units available</p>
              </div>

              {/* Low Stock Alert */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  name="lowStockAlertQty"
                  value={form.lowStockAlertQty}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-center text-2xl font-bold"
                />
                <p className="text-slate-500 text-xs mt-1.5">alert when below</p>
              </div>

              {/* Stock Status */}
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                  Stock Status
                </label>
                <select
                  name="stockStatus"
                  value={form.stockStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white font-medium text-center"
                >
                  <option value="in_stock">✅ In Stock</option>
                  <option value="out_of_stock">❌ Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Purchase Limits */}
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
              <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 bg-amber-200 rounded-lg flex items-center justify-center">🛒</span>
                Purchase Limits
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Qty</label>
                  <input
                    type="number"
                    name="minPurchaseQty"
                    value={form.minPurchaseQty}
                    onChange={handleChange}
                    placeholder="1"
                    min="1"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-center font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Qty</label>
                  <input
                    type="number"
                    name="maxPurchaseQty"
                    value={form.maxPurchaseQty}
                    onChange={handleChange}
                    placeholder="5"
                    min="1"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-center font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Availability</label>
                  <select
                    name="availabilityStatus"
                    value={form.availabilityStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-white text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Allow Backorders */}
            <div className={`p-5 rounded-xl border transition ${form.allowBackorders ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
              <label className="flex items-center gap-4 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="allowBackorders"
                    checked={form.allowBackorders}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition ${form.allowBackorders ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.allowBackorders ? 'translate-x-5' : ''}`}></div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-slate-700 text-sm">Allow Backorders</p>
                  <p className="text-xs text-slate-500">Allow customers to order even when out of stock</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Short Description
                <span className="text-slate-400 font-normal ml-2">(Max 200 characters)</span>
              </label>
              <textarea
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="Brief product description for listings and previews..."
                rows={2}
                maxLength={200}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${form.shortDescription.length > 180 ? 'text-orange-500' : 'text-slate-400'}`}>
                  {form.shortDescription.length}/200
                </span>
              </div>
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Description
              </label>
              <textarea
                name="fullDescription"
                value={form.fullDescription}
                onChange={handleChange}
                placeholder="Detailed product description with all features and specifications..."
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm"
              />
            </div>

            {/* Key Features */}
            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Key Features
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a key feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyFeature())}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
                <button
                  type="button"
                  onClick={addKeyFeature}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-sm"
                >
                  Add
                </button>
              </div>

              {form.keyFeatures.length > 0 && (
                <div className="space-y-2">
                  {form.keyFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-indigo-100 group"
                    >
                      <span className="flex items-center gap-2 text-slate-700 text-sm">
                        <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-semibold">
                          {index + 1}
                        </span>
                        {feature}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeKeyFeature(index)}
                        className="text-slate-400 hover:text-red-500 transition p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Usage Instructions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Usage Instructions
                </label>
                <textarea
                  name="usageInstructions"
                  value={form.usageInstructions}
                  onChange={handleChange}
                  placeholder="How to use this product..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm"
                />
              </div>

              {/* Care Instructions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Care Instructions
                </label>
                <textarea
                  name="careInstructions"
                  value={form.careInstructions}
                  onChange={handleChange}
                  placeholder="How to care for this product..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm"
                />
              </div>
            </div>

            {/* Box Contents */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                What's in the Box
              </label>
              <textarea
                name="boxContents"
                value={form.boxContents}
                onChange={handleChange}
                placeholder="List what's included in the package..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            {errors.images && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.images}
              </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer relative group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-slate-400 group-hover:text-blue-500 transition mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium text-slate-700 mb-1">
                Drop images here or click to upload
              </p>
              <p className="text-slate-500 text-sm">
                PNG, JPG, WEBP up to 5MB • Max 10 images
              </p>
            </div>

            {/* Image Count */}
            <div className="text-center">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${existingImages.length + images.length >= 10 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                {existingImages.length + images.length} / 10 images
              </span>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 mb-3 text-sm">Existing Images</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={img}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
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
                <h4 className="font-medium text-slate-700 mb-3 text-sm">New Images ({images.length})</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl border-2 border-green-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className="absolute bottom-1.5 left-1.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
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
          <div className="space-y-5">
            {/* Return Policy */}
            <div className={`p-5 rounded-xl border transition ${form.returnAvailable ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-700 flex items-center gap-2 text-sm">
                  <span className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">↩️</span>
                  Return Policy
                </h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-slate-600">Enable Returns</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="returnAvailable"
                      checked={form.returnAvailable}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition ${form.returnAvailable ? 'bg-teal-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.returnAvailable ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </div>
                </label>
              </div>

              {form.returnAvailable && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Return Window (Days)</label>
                    <input
                      type="number"
                      name="returnDays"
                      value={form.returnDays}
                      onChange={handleChange}
                      placeholder="e.g. 7, 15, 30"
                      min="0"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${form.replacementAvailable ? 'bg-teal-100 border-teal-400' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input
                        type="checkbox"
                        name="replacementAvailable"
                        checked={form.replacementAvailable}
                        onChange={handleChange}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Replacement Available</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Warranty */}
            <div className={`p-5 rounded-xl border transition ${form.warrantyAvailable ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-700 flex items-center gap-2 text-sm">
                  <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">🛡️</span>
                  Warranty
                </h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-slate-600">Enable Warranty</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="warrantyAvailable"
                      checked={form.warrantyAvailable}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition ${form.warrantyAvailable ? 'bg-blue-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.warrantyAvailable ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </div>
                </label>
              </div>

              {form.warrantyAvailable && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Warranty Period</label>
                    <input
                      type="text"
                      name="warrantyPeriod"
                      value={form.warrantyPeriod}
                      onChange={handleChange}
                      placeholder="e.g. 1 Year, 6 Months"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Warranty Type</label>
                    <select
                      name="warrantyType"
                      value={form.warrantyType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm"
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
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-5 rounded-xl text-white">
              <h4 className="font-medium mb-4 flex items-center gap-2 text-sm">
                <span>📋</span> Policy Summary
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className={`p-3 rounded-lg ${form.returnAvailable ? 'bg-green-500/20' : 'bg-slate-600/50'}`}>
                  <p className="text-2xl mb-1">{form.returnAvailable ? '✅' : '❌'}</p>
                  <p className="font-medium text-sm">Returns</p>
                  {form.returnAvailable && form.returnDays && (
                    <p className="text-xs text-slate-300">{form.returnDays} days</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${form.replacementAvailable ? 'bg-green-500/20' : 'bg-slate-600/50'}`}>
                  <p className="text-2xl mb-1">{form.replacementAvailable ? '✅' : '❌'}</p>
                  <p className="font-medium text-sm">Replacement</p>
                </div>
                <div className={`p-3 rounded-lg ${form.warrantyAvailable ? 'bg-green-500/20' : 'bg-slate-600/50'}`}>
                  <p className="text-2xl mb-1">{form.warrantyAvailable ? '✅' : '❌'}</p>
                  <p className="font-medium text-sm">Warranty</p>
                  {form.warrantyAvailable && form.warrantyPeriod && (
                    <p className="text-xs text-slate-300">{form.warrantyPeriod}</p>
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
    <div className="space-y-6" ref={formContentRef}>
      {/* Progress Steps - Horizontal Scroll on Mobile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => goToStep(step.id)}
                disabled={!isStepUnlocked(step.id)}
                className={`flex flex-col items-center gap-1.5 transition ${
                  isStepUnlocked(step.id)
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-40'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                    isStepCompleted(step.id)
                      ? 'bg-green-500 text-white'
                      : step.id === currentStep
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isStepCompleted(step.id) ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : !isStepUnlocked(step.id) ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V8a4 4 0 10-8 0v3m-2 0h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={`text-xs font-medium ${step.id === currentStep ? 'text-blue-600' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-1.5 rounded ${isStepCompleted(step.id) ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            currentStep === steps.length ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {steps[currentStep - 1].icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-slate-500">Step {currentStep} of {steps.length}</p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-slate-400">Jump to:</span>
          <div className="flex gap-1">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => isStepUnlocked(step.id) && goToStep(step.id)}
                disabled={!isStepUnlocked(step.id)}
                className={`w-6 h-6 rounded-md text-xs font-medium transition ${
                  step.id === currentStep
                    ? 'bg-blue-600 text-white'
                    : isStepCompleted(step.id)
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : isStepUnlocked(step.id)
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                }`}
              >
                {step.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!product && maxUnlockedStep < steps.length && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Complete the current section and click `Next` to unlock the next one.
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}
        </form>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2 ${
            currentStep === 1
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              {product ? 'Product Updated!' : 'Product Created!'}
            </h3>
            <p className="text-slate-500 text-sm mb-5">
              {product
                ? 'Your product has been updated successfully.'
                : 'Your product has been created and is pending approval.'}
            </p>
            {savedProduct && (
              <div className="bg-slate-50 rounded-xl p-3 mb-5 text-left">
                <p className="text-xs text-slate-500">Product Name</p>
                <p className="font-medium text-slate-800 text-sm truncate">{savedProduct.name}</p>
                <p className="text-xs text-slate-500 mt-2">SKU</p>
                <p className="font-mono text-slate-800 text-sm">{savedProduct.sku}</p>
              </div>
            )}
            <button
              onClick={handleSuccessClose}
              className="w-full py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
