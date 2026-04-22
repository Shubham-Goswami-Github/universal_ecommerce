import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const Register = () => {
  const { register, auth } = useAuth();
  const navigate = useNavigate();
  const addressInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    gender: '',
    dateOfBirth: '',
    fullName: '',
    pincode: '',
    houseNo: '',
    streetArea: '',
    city: '',
    state: '',
    businessName: '',
    businessType: '',
    acceptTerms: false,
  });

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [siteName, setSiteName] = useState('ShopEase');
  const [logoUrl, setLogoUrl] = useState(null);
  
  // Category States - Improved
  const [categories, setCategories] = useState([]);
  const [selectedSuperCategories, setSelectedSuperCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState({});
  const [expandedSuperCategories, setExpandedSuperCategories] = useState([]);

  const normalizeLogoUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    const cloudinaryMatch = trimmed.match(/https?:\/\/res\.cloudinary\.com\/.+/i);
    if (cloudinaryMatch) return cloudinaryMatch[0];

    if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) {
      return trimmed;
    }

    const apiBaseUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');
    return `${apiBaseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  };

  useEffect(() => {
    let mounted = true;
    const fetchBranding = async () => {
      try {
        const res = await axiosClient.get('/api/settings/public');
        if (!mounted) return;
        const data = res.data || {};
        setSiteName(data.siteName || 'ShopEase');
        setLogoUrl(normalizeLogoUrl(data.logoUrl || ''));
      } catch {
        // keep defaults
      }
    };

    fetchBranding();
    const onSettingsUpdated = () => fetchBranding();
    window.addEventListener('settings:updated', onSettingsUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('settings:updated', onSettingsUpdated);
    };
  }, []);

  // Fetch categories with hierarchy
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/api/categories/public/all');
        const allCategories = res.data?.categories || res.data || [];
        setCategories(allCategories);
      } catch (err) {
        console.log('Category fetch error', err);
      }
    };

    fetchCategories();
  }, []);

  // Get super categories
  const superCategories = categories.filter(cat => cat.type === 'super');

  // Get sub categories for a super category
  const getSubCategories = (superCatId) => {
    return categories.filter(cat => 
      cat.type === 'sub' && 
      (cat.parent === superCatId || cat.parent?._id === superCatId)
    );
  };

  // Handle super category selection
  const handleSuperCategoryToggle = (superCatId) => {
    setSelectedSuperCategories(prev => {
      if (prev.includes(superCatId)) {
        // Remove super category and its sub categories
        setSelectedSubCategories(prevSub => {
          const newSub = { ...prevSub };
          delete newSub[superCatId];
          return newSub;
        });
        setExpandedSuperCategories(prevExp => prevExp.filter(id => id !== superCatId));
        return prev.filter(id => id !== superCatId);
      } else {
        // Add super category and expand it
        setExpandedSuperCategories(prevExp => [...prevExp, superCatId]);
        return [...prev, superCatId];
      }
    });
  };

  // Handle sub category selection
  const handleSubCategoryToggle = (superCatId, subCatId) => {
    setSelectedSubCategories(prev => {
      const currentSubs = prev[superCatId] || [];
      if (currentSubs.includes(subCatId)) {
        return {
          ...prev,
          [superCatId]: currentSubs.filter(id => id !== subCatId)
        };
      } else {
        return {
          ...prev,
          [superCatId]: [...currentSubs, subCatId]
        };
      }
    });
  };

  // Toggle expand/collapse for super category
  const toggleExpandSuperCategory = (superCatId) => {
    setExpandedSuperCategories(prev => {
      if (prev.includes(superCatId)) {
        return prev.filter(id => id !== superCatId);
      } else {
        return [...prev, superCatId];
      }
    });
  };

  // Select all sub categories of a super category
  const selectAllSubCategories = (superCatId) => {
    const subCats = getSubCategories(superCatId);
    setSelectedSubCategories(prev => ({
      ...prev,
      [superCatId]: subCats.map(cat => cat._id)
    }));
  };

  // Deselect all sub categories of a super category
  const deselectAllSubCategories = (superCatId) => {
    setSelectedSubCategories(prev => ({
      ...prev,
      [superCatId]: []
    }));
  };

  // Get total selected categories count
  const getTotalSelectedCount = () => {
    let count = selectedSuperCategories.length;
    Object.values(selectedSubCategories).forEach(subs => {
      count += subs.length;
    });
    return count;
  };

  // Indian States List
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Fetch City and State from Pincode
  const fetchAddressByPincode = async (pincode) => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setForm(f => ({
            ...f,
            city: postOffice.District || postOffice.Division,
            state: postOffice.State
          }));

          const suggestions = data[0].PostOffice.map(po => ({
            name: po.Name,
            district: po.District,
            state: po.State,
            pincode: po.Pincode
          }));
          setAddressSuggestions(suggestions);
        } else {
          setAddressSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching pincode data:', error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  useEffect(() => {
    if (form.pincode.length === 6) {
      fetchAddressByPincode(form.pincode);
    } else {
      setAddressSuggestions([]);
    }
  }, [form.pincode]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const selectAddressSuggestion = (suggestion) => {
    setForm(f => ({
      ...f,
      streetArea: suggestion.name,
      city: suggestion.district,
      state: suggestion.state
    }));
    setShowSuggestions(false);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!form.name.trim()) {
          setError('Full name is required');
          return false;
        }
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
          setError('Valid email is required');
          return false;
        }
        if (!form.mobileNumber || !/^\d{10}$/.test(form.mobileNumber)) {
          setError('Valid 10-digit mobile number is required');
          return false;
        }
        return true;
      case 2:
        if (!form.password || form.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        if (form.password !== form.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!form.acceptTerms) {
      setError('Please accept Terms & Conditions');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!form.mobileNumber) {
      setError('Mobile number is required');
      return;
    }

    const anyAddressFilled =
      form.houseNo ||
      form.streetArea ||
      form.city ||
      form.state ||
      form.pincode;

    if (anyAddressFilled && !form.pincode) {
      setError('Please enter pincode for the address');
      return;
    }

    const addresses = anyAddressFilled
      ? [
          {
            fullName: form.fullName || form.name,
            mobileNumber: form.mobileNumber,
            pincode: form.pincode,
            houseNo: form.houseNo,
            streetArea: form.streetArea,
            city: form.city,
            state: form.state,
            country: 'India',
            addressType: 'home',
            isDefault: true,
          },
        ]
      : [];

    // Prepare vendor categories data
    const vendorCategoriesData = {
      superCategories: selectedSuperCategories,
      subCategories: selectedSubCategories,
      // Flat array of all selected category IDs for backward compatibility
      allSelectedCategories: [
        ...selectedSuperCategories,
        ...Object.values(selectedSubCategories).flat()
      ]
    };

    const extraPayload = {
      mobileNumber: form.mobileNumber,
      alternateMobileNumber: form.alternateMobileNumber,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      addresses,
      businessName: form.businessName,
      businessType: form.businessType,
      vendorCategoriesRequested: vendorCategoriesData,
    };

    const res = await register(
      form.name,
      form.email,
      form.password,
      form.role,
      extraPayload,
      profilePic
    );

    if (!res.success) {
      setError(res.message || 'Registration failed');
      return;
    }

    setShowSuccessModal(true);

    if (form.role === 'vendor') {
      setSuccessMsg(
        'Vendor application submitted! Admin approval is required before you can sell.'
      );
    } else {
      setSuccessMsg('Registration successful! Redirecting to login...');
    }

    setTimeout(() => {
      setShowSuccessModal(false);
      navigate('/login');
    }, 3000);
  };

  // Success Modal Component
  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform animate-scaleIn">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🎉 Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            {form.role === 'vendor'
              ? 'Your vendor application has been submitted. Admin approval is required before you can start selling.'
              : 'Welcome aboard! Your account has been created successfully.'}
          </p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" />
              ) : (
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {form.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{form.name}</p>
                <p className="text-sm text-gray-500">{form.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${form.role === 'vendor' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                {form.role === 'vendor' ? '🏪 Vendor' : '👤 Customer'}
              </span>
              {form.role === 'vendor' && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  ⏳ Pending Approval
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Redirecting to login page...</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Step Indicator Component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${currentStep >= step ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
              }`}
          >
            {currentStep > step ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step
            )}
          </div>
          {index < 2 && (
            <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
          )}
        </div>
      ))}
    </div>
  );

  // Vendor Category Selection Component
  const VendorCategorySelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Select Categories to Sell In
        </label>
        {getTotalSelectedCount() > 0 && (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {getTotalSelectedCount()} selected
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Select one or more main categories, then choose specific sub-categories within each
      </p>

      {/* Super Categories Grid */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {superCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm">Loading categories...</p>
          </div>
        ) : (
          superCategories.map((superCat) => {
            const subCats = getSubCategories(superCat._id);
            const isSelected = selectedSuperCategories.includes(superCat._id);
            const isExpanded = expandedSuperCategories.includes(superCat._id);
            const selectedSubsCount = (selectedSubCategories[superCat._id] || []).length;

            return (
              <div
                key={superCat._id}
                className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${isSelected
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                {/* Super Category Header */}
                <div
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                    }`}
                >
                  {/* Checkbox */}
                  <div
                    onClick={() => handleSuperCategoryToggle(superCat._id)}
                    className="flex-shrink-0"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 hover:border-blue-400'
                      }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Category Image */}
                  <div
                    onClick={() => handleSuperCategoryToggle(superCat._id)}
                    className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0"
                  >
                    {superCat.image ? (
                      <img src={superCat.image} alt={superCat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div
                    onClick={() => handleSuperCategoryToggle(superCat._id)}
                    className="flex-1 min-w-0"
                  >
                    <h4 className="font-medium text-gray-800 truncate">{superCat.name}</h4>
                    <p className="text-xs text-gray-500">
                      {subCats.length} sub-categories
                      {selectedSubsCount > 0 && (
                        <span className="text-blue-600 ml-1">• {selectedSubsCount} selected</span>
                      )}
                    </p>
                  </div>

                  {/* Expand Button */}
                  {isSelected && subCats.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandSuperCategory(superCat._id);
                      }}
                      className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Sub Categories */}
                {isSelected && isExpanded && subCats.length > 0 && (
                  <div className="border-t border-blue-200 bg-white p-3">
                    {/* Select All / Deselect All */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      <span className="text-xs font-medium text-gray-600">Sub-categories</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectAllSubCategories(superCat._id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Select All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => deselectAllSubCategories(superCat._id)}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Sub Categories Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {subCats.map((subCat) => {
                        const isSubSelected = (selectedSubCategories[superCat._id] || []).includes(subCat._id);

                        return (
                          <label
                            key={subCat._id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${isSubSelected
                                ? 'bg-blue-100 border border-blue-300'
                                : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSubSelected}
                              onChange={() => handleSubCategoryToggle(superCat._id, subCat._id)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${isSubSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300'
                              }`}>
                              {isSubSelected && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            {/* Sub Category Image */}
                            <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                              {subCat.image ? (
                                <img src={subCat.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                              )}
                            </div>

                            <span className={`text-xs truncate ${isSubSelected ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                              {subCat.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No sub-categories message */}
                {isSelected && isExpanded && subCats.length === 0 && (
                  <div className="border-t border-blue-200 bg-white p-4 text-center">
                    <p className="text-xs text-gray-500">No sub-categories available</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected Summary */}
      {selectedSuperCategories.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Categories Selected</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedSuperCategories.map(catId => {
                  const cat = superCategories.find(c => c._id === catId);
                  const subCount = (selectedSubCategories[catId] || []).length;
                  return (
                    <span
                      key={catId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-green-300 rounded-lg text-xs text-green-700"
                    >
                      {cat?.name}
                      {subCount > 0 && (
                        <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                          +{subCount}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSuperCategoryToggle(catId)}
                        className="ml-0.5 hover:text-red-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );

  const stepLabels = ['Basic Info', 'Security', 'Address & Profile'];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        html.dark .register-page {
          background: linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%);
        }
        html.dark .register-page [class*="bg-white"] {
          background-color: #0f172a !important;
        }
        html.dark .register-page [class*="bg-gray-50"] {
          background-color: #111827 !important;
        }
        html.dark .register-page [class*="bg-gray-100"] {
          background-color: #1f2937 !important;
        }
        html.dark .register-page [class*="border-gray-100"],
        html.dark .register-page [class*="border-gray-200"],
        html.dark .register-page [class*="border-gray-300"],
        html.dark .register-page [class*="border-blue-100"] {
          border-color: #334155 !important;
        }
        html.dark .register-page [class*="text-gray-800"],
        html.dark .register-page [class*="text-gray-700"] {
          color: #f8fafc !important;
        }
        html.dark .register-page [class*="text-gray-600"],
        html.dark .register-page [class*="text-gray-500"],
        html.dark .register-page [class*="text-gray-400"] {
          color: #94a3b8 !important;
        }
        html.dark .register-page input,
        html.dark .register-page select,
        html.dark .register-page textarea,
        html.dark .register-page button[type="button"][class*="bg-gray-50"] {
          background-color: #111827 !important;
          border-color: #334155 !important;
          color: #f8fafc !important;
        }
        html.dark .register-page input::placeholder,
        html.dark .register-page textarea::placeholder {
          color: #64748b !important;
        }
      `}</style>

      {showSuccessModal && <SuccessModal />}

      <div className="register-page min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-slideUp">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white border border-blue-100">
                {logoUrl ? (
                  <img src={logoUrl} alt={siteName} className="h-full w-full object-contain p-1" />
                ) : (
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )}
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {siteName}
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h1>
            <p className="text-gray-500">Join thousands of happy customers today</p>
          </div>

          <StepIndicator />

          <div className="flex justify-center mb-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Step {currentStep}: {stepLabels[currentStep - 1]}
            </span>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-blue-100 overflow-hidden animate-slideUp">
            {error && (
              <div className="mx-6 mt-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fadeIn">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      I want to register as
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${form.role === 'user'
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                        }`}>
                        <input
                          type="radio"
                          name="role"
                          value="user"
                          checked={form.role === 'user'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${form.role === 'user' ? 'bg-blue-500' : 'bg-gray-200'
                          }`}>
                          <svg className={`w-7 h-7 ${form.role === 'user' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className={`font-semibold ${form.role === 'user' ? 'text-blue-700' : 'text-gray-600'}`}>Customer</span>
                        <span className="text-xs text-gray-500 mt-1">Shop products</span>
                        {form.role === 'user' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>

                      <label className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${form.role === 'vendor'
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                        }`}>
                        <input
                          type="radio"
                          name="role"
                          value="vendor"
                          checked={form.role === 'vendor'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${form.role === 'vendor' ? 'bg-blue-500' : 'bg-gray-200'
                          }`}>
                          <svg className={`w-7 h-7 ${form.role === 'vendor' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className={`font-semibold ${form.role === 'vendor' ? 'text-blue-700' : 'text-gray-600'}`}>Vendor</span>
                        <span className="text-xs text-gray-500 mt-1">Sell products</span>
                        {form.role === 'vendor' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Vendor Notice */}
                  {form.role === 'vendor' && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fadeIn">
                      <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-amber-800">Vendor Account</p>
                        <p className="text-sm text-amber-700">Requires admin approval. You'll be notified once approved to start selling.</p>
                      </div>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Mobile Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-medium">+91</span>
                        </div>
                        <input
                          name="mobileNumber"
                          placeholder="9876543210"
                          maxLength={10}
                          value={form.mobileNumber}
                          onChange={handleChange}
                          className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alternate Mobile
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-medium">+91</span>
                        </div>
                        <input
                          name="alternateMobileNumber"
                          placeholder="Optional"
                          maxLength={10}
                          value={form.alternateMobileNumber}
                          onChange={handleChange}
                          className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vendor Extra Fields */}
                  {form.role === 'vendor' && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-fadeIn">
                      <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Business Information
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business / Store Name</label>
                        <input
                          name="businessName"
                          placeholder="Your store name"
                          value={form.businessName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                        <select
                          name="businessType"
                          value={form.businessType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select business type</option>
                          <option value="Individual">Individual / Sole Proprietor</option>
                          <option value="Partnership">Partnership</option>
                          <option value="LLP">LLP</option>
                          <option value="Private Limited">Private Limited</option>
                          <option value="Public Limited">Public Limited</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Vendor Categories Selection - Improved */}
                      <VendorCategorySelection />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Security */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Create a strong password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {form.password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full ${form.password.length >= level * 3
                                  ? form.password.length >= 12
                                    ? 'bg-green-500'
                                    : form.password.length >= 8
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  : 'bg-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs mt-1 text-gray-500">
                          {form.password.length < 6 && 'Password too short'}
                          {form.password.length >= 6 && form.password.length < 8 && 'Weak password'}
                          {form.password.length >= 8 && form.password.length < 12 && 'Good password'}
                          {form.password.length >= 12 && 'Strong password'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 ${form.confirmPassword && form.password !== form.confirmPassword
                            ? 'border-red-300 bg-red-50'
                            : form.confirmPassword && form.password === form.confirmPassword
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-200'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <p className="text-xs mt-1 text-green-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Passwords match
                      </p>
                    )}
                  </div>

                  {/* Security Tips */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Password Tips
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${form.password.length >= 8 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {form.password.length >= 8 ? '✓' : '•'}
                        </span>
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${/[A-Z]/.test(form.password) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {/[A-Z]/.test(form.password) ? '✓' : '•'}
                        </span>
                        One uppercase letter
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${/[0-9]/.test(form.password) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {/[0-9]/.test(form.password) ? '✓' : '•'}
                        </span>
                        One number
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 3: Address & Profile */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="relative">
                      {profilePicPreview ? (
                        <img
                          src={profilePicPreview}
                          alt="Profile Preview"
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                          {form.name ? form.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePicChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Profile Photo</h4>
                      <p className="text-sm text-gray-500">Upload a photo (optional)</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  {/* Gender & DOB */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="border-t border-gray-200 pt-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delivery Address (Optional)
                    </h3>

                    {/* Pincode with Auto-fetch */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                      <div className="relative">
                        <input
                          name="pincode"
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                          value={form.pincode}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                        />
                        {pincodeLoading && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        {form.pincode.length === 6 && !pincodeLoading && form.city && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {form.pincode.length === 6 && form.city && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {form.city}, {form.state}
                        </p>
                      )}
                    </div>

                    {/* Address Suggestions */}
                    {addressSuggestions.length > 0 && form.pincode.length === 6 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Area (Auto-complete)
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-left text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 flex items-center justify-between"
                          >
                            <span>{form.streetArea || 'Select your area'}</span>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showSuggestions && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                              {addressSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => selectAddressSuggestion(suggestion)}
                                  className="w-full px-4 py-3 text-left hover:bg-blue-50 text-sm border-b border-gray-100 last:border-0 transition-colors"
                                >
                                  <span className="font-medium text-gray-800">{suggestion.name}</span>
                                  <span className="text-gray-500 block text-xs">{suggestion.district}, {suggestion.state}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* House No */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">House / Flat / Building No.</label>
                      <input
                        name="houseNo"
                        placeholder="e.g., Flat 101, Tower A"
                        value={form.houseNo}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                      />
                    </div>

                    {/* Street / Area */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Street / Area / Locality</label>
                      <input
                        ref={addressInputRef}
                        name="streetArea"
                        placeholder="e.g., MG Road, Koramangala"
                        value={form.streetArea}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                      />
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                        <input
                          name="city"
                          placeholder="City"
                          value={form.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                        <select
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                        >
                          <option value="">Select State</option>
                          {indianStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="pt-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          checked={form.acceptTerms}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${form.acceptTerms
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                          {form.acceptTerms && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link to="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all duration-200"
                  >
                    Continue
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={auth.loading || !form.acceptTerms}
                    className={`flex items-center gap-2 px-8 py-3 font-semibold rounded-xl shadow-lg transition-all duration-200 ${auth.loading || !form.acceptTerms
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-200'
                      }`}
                  >
                    {auth.loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6 animate-slideUp">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Encrypted
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Trusted
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
