// src/pages/Profile.jsx
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { useNavigate, Link } from 'react-router-dom';

const ALLOWED_ALL_KEYWORD = 'AllowedAll';

const normalizeCategoryId = (value) => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value._id?.toString() || '';
  }
  return value.toString();
};

/* ─────────────────────────────────────────────────────────────
   TAB CONFIGURATION
───────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'profile', label: 'Edit Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'addresses', label: 'Addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
];

const VENDOR_TABS = [
  ...TABS,
  { id: 'business', label: 'Business', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
];

const USER_TABS = [
  ...TABS,
  { id: 'vendor', label: 'Become Vendor', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const Profile = () => {
  const { auth, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const user = auth.user;
  const fileInputRef = useRef(null);

  // UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Form States
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    gender: '',
    dateOfBirth: '',
    businessName: '',
    businessType: '',
  });

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    mobileNumber: '',
    pincode: '',
    houseNo: '',
    streetArea: '',
    landmark: '',
    city: '',
    state: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [vendorForm, setVendorForm] = useState({
    wantToBeVendor: false,
    businessName: '',
    businessType: '',
  });

  // Category Request States
  const [allCategories, setAllCategories] = useState([]);
  const [categoryRequestForm, setCategoryRequestForm] = useState({
    showForm: false,
    selectedCategories: [],
    reason: '',
  });
  const [pendingCategoryRequests, setPendingCategoryRequests] = useState([]);

  // Loading States
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [vendorApplying, setVendorApplying] = useState(false);
  const [categoryRequestLoading, setCategoryRequestLoading] = useState(false);

  // Message States
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [vendorMsg, setVendorMsg] = useState('');
  const [vendorErr, setVendorErr] = useState('');
  const [categoryRequestMsg, setCategoryRequestMsg] = useState('');
  const [categoryRequestErr, setCategoryRequestErr] = useState('');

  // Initialize form data
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        alternateMobileNumber: user.alternateMobileNumber || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
        businessName: user.businessName || '',
        businessType: user.businessType || '',
      });

      if (user.addresses && user.addresses.length > 0) {
        const addr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setAddressForm({
          fullName: addr.fullName || '',
          mobileNumber: addr.mobileNumber || user.mobileNumber || '',
          pincode: addr.pincode || '',
          houseNo: addr.houseNo || '',
          streetArea: addr.streetArea || '',
          landmark: addr.landmark || '',
          city: addr.city || '',
          state: addr.state || '',
        });
      } else {
        setAddressForm({
          fullName: user.name || '',
          mobileNumber: user.mobileNumber || '',
          pincode: '',
          houseNo: '',
          streetArea: '',
          landmark: '',
          city: '',
          state: '',
        });
      }

      if (user.businessName || user.businessType) {
        setVendorForm({
          wantToBeVendor: false,
          businessName: user.businessName || '',
          businessType: user.businessType || '',
        });
      }

      if (user.role === 'vendor') {
        fetchCategories();
        fetchPendingCategoryRequests();
      }
    }
  }, [user]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await axiosClient.get('/api/categories/public/hierarchy');
      const flattenedCategories = Array.isArray(data.categories)
        ? data.categories.flatMap((superCategory) => {
            const parentEntry = {
              _id: String(superCategory._id),
              name: superCategory.name,
              type: superCategory.type,
              parent: null,
            };
            const subEntries = Array.isArray(superCategory.subCategories)
              ? superCategory.subCategories.map((subCategory) => ({
                  _id: String(subCategory._id),
                  name: subCategory.name,
                  type: subCategory.type,
                  parent: {
                    _id: String(superCategory._id),
                    name: superCategory.name,
                  },
                }))
              : [];
            return [parentEntry, ...subEntries];
          })
        : [];
      setAllCategories(flattenedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setAllCategories([]);
    }
  };

  // Fetch pending category requests
  const fetchPendingCategoryRequests = async () => {
    try {
      const { data } = await axiosClient.get('/api/vendors/my-category-requests');
      setPendingCategoryRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch category requests:', error);
    }
  };

  // Helper functions
  const formatDate = (value) => {
    if (!value) return 'Not set';
    try {
      return new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Not set';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '👑', label: 'Administrator' },
      vendor: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '🏪', label: 'Vendor' },
      user: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '👤', label: 'Customer' },
    };
    return badges[role] || badges.user;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✅' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: '❌' },
    };
    return badges[status] || null;
  };

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((f) => ({ ...f, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((f) => ({ ...f, [name]: value }));
  };

  const handleVendorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVendorForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setCategoryRequestForm((f) => {
      const isSelected = f.selectedCategories.includes(categoryId);
      return {
        ...f,
        selectedCategories: isSelected
          ? f.selectedCategories.filter((id) => id !== categoryId)
          : [...f.selectedCategories, categoryId],
      };
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    if (!form.mobileNumber) {
      setErr('Mobile number is required');
      return;
    }

    const anyPasswordEntered =
      passwordForm.currentPassword ||
      passwordForm.newPassword ||
      passwordForm.confirmNewPassword;

    if (anyPasswordEntered) {
      if (!passwordForm.currentPassword) {
        setErr('Current password is required to change password');
        return;
      }
      if (!passwordForm.newPassword || !passwordForm.confirmNewPassword) {
        setErr('Please enter and confirm new password');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
        setErr('New passwords do not match');
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        setErr('New password should be at least 6 characters');
        return;
      }
    }

    const anyAddressField =
      addressForm.fullName ||
      addressForm.mobileNumber ||
      addressForm.pincode ||
      addressForm.houseNo ||
      addressForm.streetArea ||
      addressForm.city ||
      addressForm.state ||
      addressForm.landmark;

    let addressesPayload = [];

    if (anyAddressField) {
      if (
        !addressForm.pincode ||
        !addressForm.houseNo ||
        !addressForm.city ||
        !addressForm.state
      ) {
        setErr('Please fill required address fields (House, City, State, Pincode)');
        return;
      }

      addressesPayload = [
        {
          fullName: addressForm.fullName || form.name,
          mobileNumber: addressForm.mobileNumber || form.mobileNumber,
          pincode: addressForm.pincode,
          houseNo: addressForm.houseNo,
          streetArea: addressForm.streetArea,
          landmark: addressForm.landmark,
          city: addressForm.city,
          state: addressForm.state,
          country: 'India',
          addressType: 'home',
          isDefault: true,
        },
      ];
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('mobileNumber', form.mobileNumber);
      if (form.alternateMobileNumber) fd.append('alternateMobileNumber', form.alternateMobileNumber);
      if (form.gender) fd.append('gender', form.gender);
      if (form.dateOfBirth) fd.append('dateOfBirth', form.dateOfBirth);
      if (user.role === 'vendor') {
        fd.append('businessName', form.businessName || '');
        fd.append('businessType', form.businessType || '');
      }
      if (addressesPayload.length > 0) {
        fd.append('addresses', JSON.stringify(addressesPayload));
      }
      if (profilePicFile) fd.append('profilePicture', profilePicFile);
      if (anyPasswordEntered) {
        fd.append('currentPassword', passwordForm.currentPassword);
        fd.append('newPassword', passwordForm.newPassword);
      }

      const { data } = await axiosClient.patch('/api/users/me', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.user) {
        updateUser(data.user);
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setImagePreview(null);
      setProfilePicFile(null);
      setMsg('Profile updated successfully');
      
      setTimeout(() => setMsg(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setErr(error.response?.data?.message || 'Failed to update profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // Vendor application
  const handleVendorApply = async (e) => {
    e.preventDefault();
    setVendorMsg('');
    setVendorErr('');

    if (!vendorForm.businessName.trim()) {
      setVendorErr('Business/Store Name is required');
      return;
    }
    if (!vendorForm.businessType.trim()) {
      setVendorErr('Business Type is required');
      return;
    }

    try {
      setVendorApplying(true);
      const { data } = await axiosClient.post('/api/users/apply-vendor', {
        businessName: vendorForm.businessName.trim(),
        businessType: vendorForm.businessType.trim(),
      });

      if (data.user) {
        updateUser(data.user);
      }

      setVendorMsg('Vendor application submitted successfully! Admin will review your request.');
      setVendorForm((f) => ({ ...f, wantToBeVendor: false }));
    } catch (error) {
      console.error('Vendor application error:', error);
      setVendorErr(error.response?.data?.message || 'Failed to submit application. Try again.');
    } finally {
      setVendorApplying(false);
    }
  };

  // Category request
  const handleCategoryRequestSubmit = async (e) => {
    e.preventDefault();
    setCategoryRequestMsg('');
    setCategoryRequestErr('');

    if (categoryRequestForm.selectedCategories.length === 0) {
      setCategoryRequestErr('Please select at least one category');
      return;
    }
    if (!categoryRequestForm.reason.trim()) {
      setCategoryRequestErr('Please provide a reason for your request');
      return;
    }

    try {
      setCategoryRequestLoading(true);
      const { data } = await axiosClient.post('/api/vendors/request-categories', {
        categories: categoryRequestForm.selectedCategories,
        reason: categoryRequestForm.reason.trim(),
      });

      if (data.request) {
        setPendingCategoryRequests((prev) => [data.request, ...prev]);
      }

      setCategoryRequestMsg('Category request submitted successfully!');
      setCategoryRequestForm({
        showForm: false,
        selectedCategories: [],
        reason: '',
      });
      fetchPendingCategoryRequests();
    } catch (error) {
      console.error('Category request error:', error);
      setCategoryRequestErr(error.response?.data?.message || 'Failed to submit request. Try again.');
    } finally {
      setCategoryRequestLoading(false);
    }
  };

  // Category helpers
  const approvedRawCategories = Array.isArray(user?.vendorCategoriesApproved)
    ? user.vendorCategoriesApproved
    : Array.isArray(user?.approvedCategories)
    ? user.approvedCategories
    : [];

  const vendorHasAllCategoryAccess =
    user?.vendorCategoryAccessType === 'all' ||
    approvedRawCategories.some(
      (category) => normalizeCategoryId(category) === ALLOWED_ALL_KEYWORD
    );

  const getCategoryLabel = (value) => {
    const id = normalizeCategoryId(value);
    if (!id) return '';
    if (id === ALLOWED_ALL_KEYWORD) return 'All Categories';
    const matchedCategory = allCategories.find(
      (category) => normalizeCategoryId(category._id) === id
    );
    if (matchedCategory) {
      return matchedCategory.parent?.name
        ? `${matchedCategory.parent.name} → ${matchedCategory.name}`
        : matchedCategory.name;
    }
    if (typeof value === 'object' && value?.name) {
      return value.parent?.name ? `${value.parent.name} → ${value.name}` : value.name;
    }
    return id;
  };

  const approvedCategories = vendorHasAllCategoryAccess
    ? [{ id: ALLOWED_ALL_KEYWORD, label: 'All Categories' }]
    : approvedRawCategories
        .map((category) => ({
          id: normalizeCategoryId(category),
          label: getCategoryLabel(category),
        }))
        .filter((category) => category.id && category.label);

  const approvedCategoryIds = new Set(approvedCategories.map((category) => category.id));
  const pendingCategoryIds = new Set(
    pendingCategoryRequests
      .filter((request) => request.status === 'pending')
      .flatMap((request) =>
        (request.categories || []).map((category) => normalizeCategoryId(category))
      )
  );
  const availableCategories = allCategories.filter(
    (category) =>
      !vendorHasAllCategoryAccess &&
      !approvedCategoryIds.has(normalizeCategoryId(category)) &&
      !pendingCategoryIds.has(normalizeCategoryId(category))
  );

  const canApplyForVendor = () => {
    if (user?.role !== 'user') return false;
    if (user?.vendorApplicationStatus === 'pending') return false;
    if (user?.vendorApplicationStatus === 'approved') return false;
    return true;
  };

  // Get tabs based on role
  const getTabs = () => {
    if (user?.role === 'vendor') return VENDOR_TABS;
    if (user?.role === 'user') return USER_TABS;
    return TABS;
  };

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Logged In</h2>
          <p className="text-gray-500 mb-6">Please login to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user.role);
  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══════════════════════════════════════════════════════════════
          PROFILE HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Section */}
          <div className="py-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl ring-4 ring-white">
                  {imagePreview || user.profilePicture ? (
                    <img
                      src={imagePreview || user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                      {getInitials(user.name)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:scale-110 transition-all border border-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {user.name}
                      </h1>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${roleBadge.bg} ${roleBadge.text}`}>
                        <span>{roleBadge.icon}</span>
                        {roleBadge.label}
                      </span>
                      {user.vendorApplicationStatus && user.role === 'user' && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.vendorApplicationStatus)?.bg} ${getStatusBadge(user.vendorApplicationStatus)?.text}`}>
                          {getStatusBadge(user.vendorApplicationStatus)?.icon} Application {user.vendorApplicationStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 mt-1">{user.email}</p>
                    {user.mobileNumber && (
                      <p className="text-gray-500 text-sm mt-0.5">📱 {user.mobileNumber}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Joined {formatDate(user.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    {user.role === 'vendor' && (
                      <Link
                        to="/vendor/dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="hidden sm:inline">Dashboard</span>
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/25"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hidden sm:inline">Admin Panel</span>
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="hidden sm:inline">Orders</span>
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{user.totalOrders ?? 0}</p>
                  <p className="text-xs text-gray-500">Total Orders</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">₹{(user.totalSpent ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{formatDate(user.lastOrderDate)}</p>
                  <p className="text-xs text-gray-500">Last Order</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{user.addresses?.length ?? 0}</p>
                  <p className="text-xs text-gray-500">Addresses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-t border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-xl transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-emerald-600 bg-emerald-50 border-b-2 border-emerald-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {(msg || err) && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            msg ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={msg ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
            <p className="flex-1">{msg || err}</p>
            <button onClick={() => { setMsg(''); setErr(''); }} className="hover:opacity-70">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB: OVERVIEW
        ───────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Info Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  Edit
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <InfoField label="Full Name" value={user.name} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  <InfoField label="Email Address" value={user.email} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  <InfoField label="Mobile Number" value={user.mobileNumber || 'Not set'} icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  <InfoField label="Gender" value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not set'} icon="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <InfoField label="Date of Birth" value={formatDate(user.dateOfBirth)} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  <InfoField label="Account Type" value={roleBadge.label} icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </div>
              </div>
            </div>

            {/* Default Address Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Default Address
                </h3>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Manage
                </button>
              </div>
              <div className="p-6">
                {user.addresses && user.addresses.length > 0 ? (
                  (() => {
                    const addr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
                    return (
                      <div className="space-y-3">
                        <p className="font-semibold text-gray-900">{addr.fullName}</p>
                        <p className="text-sm text-gray-600">
                          {addr.houseNo}, {addr.streetArea}
                          {addr.landmark && <>, {addr.landmark}</>}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <div className="pt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {addr.mobileNumber}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">No address saved yet</p>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
                    >
                      + Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Info Card (for vendors) */}
            {user.role === 'vendor' && (
              <div className="lg:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-emerald-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Business Information
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('business')}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Business Name</p>
                      <p className="font-semibold text-gray-900">{user.businessName || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Business Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{user.businessType || 'Not set'}</p>
                    </div>
                  </div>
                  
                  {/* Approved Categories */}
                  {approvedCategories.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-emerald-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Approved Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {approvedCategories.map((cat) => (
                          <span
                            key={cat.id}
                            className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium"
                          >
                            ✓ {cat.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <Link
                      to="/vendor/dashboard"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Go to Dashboard
                    </Link>
                    <Link
                      to="/vendor/products"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Manage Products
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Card */}
            <div className={`${user.role === 'vendor' ? '' : 'lg:col-span-2'} bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden`}>
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <QuickActionCard
                  icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  label="My Orders"
                  to="/orders"
                  color="blue"
                />
                <QuickActionCard
                  icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  label="Wishlist"
                  to="/wishlist"
                  color="rose"
                />
                <QuickActionCard
                  icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  label="Cart"
                  to="/cart"
                  color="emerald"
                />
                <QuickActionCard
                  icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  label="Addresses"
                  onClick={() => setActiveTab('addresses')}
                  color="amber"
                />
                <QuickActionCard
                  icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  label="Security"
                  onClick={() => setActiveTab('security')}
                  color="purple"
                />
                <QuickActionCard
                  icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  label="Help"
                  to="/help"
                  color="gray"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB: EDIT PROFILE
        ───────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Edit Profile Information</h3>
                <p className="text-sm text-gray-500 mt-1">Update your personal details</p>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500">
                      {imagePreview || user.profilePicture ? (
                        <img
                          src={imagePreview || user.profilePicture}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                          {getInitials(user.name)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Change Photo
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                  <FormInput
                    label="Email Address"
                    name="email"
                    value={form.email}
                    disabled
                    hint="Email cannot be changed"
                  />
                  <FormInput
                    label="Mobile Number"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    required
                  />
                  <FormInput
                    label="Alternate Mobile"
                    name="alternateMobileNumber"
                    value={form.alternateMobileNumber}
                    onChange={handleChange}
                    placeholder="Enter alternate number"
                  />
                  <FormSelect
                    label="Gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Gender' },
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                  <FormInput
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB: SECURITY
        ───────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your password and security preferences</p>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-6">
                {/* Password Change Section */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                  </h4>
                  <div className="space-y-4">
                    <FormInput
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormInput
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        hint="Minimum 6 characters"
                      />
                      <FormInput
                        label="Confirm New Password"
                        name="confirmNewPassword"
                        type="password"
                        value={passwordForm.confirmNewPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4">Account Security</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Email Verified</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg">
                        Verified
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add extra security to your account</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB: ADDRESSES
        ───────────────────────────────────────────── */}
        {activeTab === 'addresses' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Manage Addresses</h3>
                <p className="text-sm text-gray-500 mt-1">Add or edit your delivery addresses</p>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormInput
                    label="Full Name"
                    name="fullName"
                    value={addressForm.fullName}
                    onChange={handleAddressChange}
                    placeholder="Enter full name"
                  />
                  <FormInput
                    label="Mobile Number"
                    name="mobileNumber"
                    value={addressForm.mobileNumber}
                    onChange={handleAddressChange}
                    placeholder="Enter mobile number"
                  />
                  <FormInput
                    label="House / Flat No"
                    name="houseNo"
                    value={addressForm.houseNo}
                    onChange={handleAddressChange}
                    placeholder="Enter house/flat number"
                    required
                  />
                  <FormInput
                    label="Street / Area"
                    name="streetArea"
                    value={addressForm.streetArea}
                    onChange={handleAddressChange}
                    placeholder="Enter street/area"
                  />
                  <FormInput
                    label="Landmark"
                    name="landmark"
                    value={addressForm.landmark}
                    onChange={handleAddressChange}
                    placeholder="Near landmark"
                  />
                  <FormInput
                    label="Pincode"
                    name="pincode"
                    value={addressForm.pincode}
                    onChange={handleAddressChange}
                    placeholder="Enter pincode"
                    required
                  />
                  <FormInput
                    label="City"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressChange}
                    placeholder="Enter city"
                    required
                  />
                  <FormInput
                    label="State"
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressChange}
                    placeholder="Enter state"
                    required
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB: BUSINESS (Vendor Only)
        ───────────────────────────────────────────── */}
        {activeTab === 'business' && user.role === 'vendor' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Business Information</h3>
                <p className="text-sm text-gray-500 mt-1">Update your business details</p>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormInput
                    label="Business Name"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="Enter business name"
                  />
                  <FormSelect
                    label="Business Type"
                    name="businessType"
                    value={form.businessType}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Type' },
                      { value: 'electronics', label: 'Electronics' },
                      { value: 'fashion', label: 'Fashion & Clothing' },
                      { value: 'home', label: 'Home & Kitchen' },
                      { value: 'beauty', label: 'Beauty & Personal Care' },
                      { value: 'sports', label: 'Sports & Fitness' },
                      { value: 'books', label: 'Books & Stationery' },
                      { value: 'grocery', label: 'Grocery & Food' },
                      { value: 'health', label: 'Health & Wellness' },
                      { value: 'toys', label: 'Toys & Games' },
                      { value: 'automotive', label: 'Automotive' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB: CATEGORIES (Vendor Only)
        ───────────────────────────────────────────── */}
        {activeTab === 'categories' && user.role === 'vendor' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Approved Categories */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approved Categories
                </h3>
              </div>
              <div className="p-6">
                {approvedCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {approvedCategories.map((cat) => (
                      <span
                        key={cat.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {cat.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No approved categories yet</p>
                )}
              </div>
            </div>

            {/* Pending Requests */}
            {pendingCategoryRequests.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Pending Requests</h3>
                </div>
                <div className="p-6 space-y-4">
                  {pendingCategoryRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {req.categories?.map((cat) => (
                              <span
                                key={cat._id || cat}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
                              >
                                {typeof cat === 'string' ? cat : cat.name}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reason:</span> {req.reason}
                          </p>
                          {req.adminResponse && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Admin Response:</span> {req.adminResponse}
                            </p>
                          )}
                        </div>
                        <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status === 'pending' && '⏳'} 
                          {req.status === 'approved' && '✅'} 
                          {req.status === 'rejected' && '❌'} 
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request New Categories */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Request New Categories</h3>
                <p className="text-sm text-gray-500 mt-1">Request access to sell in additional categories</p>
              </div>
              <div className="p-6">
                {/* Alerts */}
                {categoryRequestErr && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {categoryRequestErr}
                  </div>
                )}
                {categoryRequestMsg && (
                  <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                    {categoryRequestMsg}
                  </div>
                )}

                {vendorHasAllCategoryAccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">You have access to all categories!</p>
                  </div>
                ) : availableCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">All available categories are either approved or pending.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCategoryRequestSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Categories
                      </label>
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                        {availableCategories.map((cat) => {
                          const categoryId = normalizeCategoryId(cat._id);
                          const isSelected = categoryRequestForm.selectedCategories.includes(categoryId);
                          return (
                            <label
                              key={categoryId}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCategorySelect(categoryId)}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">
                                {cat.parent?.name ? `${cat.parent.name} → ` : ''}
                                {cat.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {categoryRequestForm.selectedCategories.length > 0 && (
                        <p className="text-sm text-purple-600 mt-2">
                          {categoryRequestForm.selectedCategories.length} category(ies) selected
                        </p>
                      )}
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Request
                      </label>
                      <textarea
                        value={categoryRequestForm.reason}
                        onChange={(e) => setCategoryRequestForm((f) => ({ ...f, reason: e.target.value }))}
                        placeholder="Explain why you want to sell in these categories..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={categoryRequestLoading || categoryRequestForm.selectedCategories.length === 0}
                      className="w-full py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {categoryRequestLoading && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      {categoryRequestLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            TAB: BECOME VENDOR (User Only)
        ───────────────────────────────────────────── */}
        {activeTab === 'vendor' && user.role === 'user' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Become a Vendor
                </h3>
                <p className="text-sm text-gray-500 mt-1">Start selling your products on our platform</p>
              </div>
              <div className="p-6">
                {/* Status Messages */}
                {user.vendorApplicationStatus === 'pending' && (
                  <div className="mb-6 p-4 bg-amber-100 border border-amber-300 rounded-xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⏳</span>
                      <div>
                        <p className="font-semibold text-amber-800">Application Under Review</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Your vendor application is being reviewed by our admin team. You will be notified once it's approved.
                        </p>
                        {user.businessName && (
                          <p className="text-sm text-amber-700 mt-2">
                            <span className="font-medium">Business:</span> {user.businessName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {user.vendorApplicationStatus === 'rejected' && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">❌</span>
                      <div>
                        <p className="font-semibold text-red-800">Application Rejected</p>
                        <p className="text-sm text-red-700 mt-1">
                          Your previous application was rejected.
                          {user.vendorRejectionReason && (
                            <span> Reason: <b>{user.vendorRejectionReason}</b></span>
                          )}
                        </p>
                        <p className="text-sm text-red-700 mt-1">You can re-apply with updated information.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {vendorErr && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {vendorErr}
                  </div>
                )}
                {vendorMsg && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                    {vendorMsg}
                  </div>
                )}

                {/* Benefits Section */}
                {canApplyForVendor() && !vendorForm.wantToBeVendor && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Why become a vendor?</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: '💰', title: 'Earn Money', desc: 'Start your business and earn profits' },
                        { icon: '🌐', title: 'Wide Reach', desc: 'Access thousands of customers' },
                        { icon: '📊', title: 'Analytics', desc: 'Track your sales and performance' },
                        { icon: '🛡️', title: 'Secure Payments', desc: 'Guaranteed and timely payments' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-amber-100">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setVendorForm((f) => ({ ...f, wantToBeVendor: true }))}
                      className="mt-6 w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Start Application
                    </button>
                  </div>
                )}

                {/* Application Form */}
                {(vendorForm.wantToBeVendor || user.vendorApplicationStatus === 'rejected') && canApplyForVendor() && (
                  <form onSubmit={handleVendorApply} className="space-y-6">
                    <div className="p-4 bg-amber-100 border border-amber-300 rounded-xl text-sm text-amber-800">
                      <p className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Your application will be reviewed by admin. You'll remain a regular user until approval.
                      </p>
                    </div>

                    <FormInput
                      label="Business / Store Name"
                      name="businessName"
                      value={vendorForm.businessName}
                      onChange={handleVendorChange}
                      placeholder="e.g., Krishna Electronics, Fashion Hub"
                      required
                    />

                    <FormSelect
                      label="Business Type"
                      name="businessType"
                      value={vendorForm.businessType}
                      onChange={handleVendorChange}
                      required
                      options={[
                        { value: '', label: 'Select Business Type' },
                        { value: 'electronics', label: 'Electronics' },
                        { value: 'fashion', label: 'Fashion & Clothing' },
                        { value: 'home', label: 'Home & Kitchen' },
                        { value: 'beauty', label: 'Beauty & Personal Care' },
                        { value: 'sports', label: 'Sports & Fitness' },
                        { value: 'books', label: 'Books & Stationery' },
                        { value: 'grocery', label: 'Grocery & Food' },
                        { value: 'health', label: 'Health & Wellness' },
                        { value: 'toys', label: 'Toys & Games' },
                        { value: 'automotive', label: 'Automotive' },
                        { value: 'other', label: 'Other' },
                      ]}
                    />

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setVendorForm((f) => ({ ...f, wantToBeVendor: false }))}
                        className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={vendorApplying}
                        className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {vendorApplying && (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                        {vendorApplying ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollbar hide styles */}
      <style>{`
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
   HELPER COMPONENTS
───────────────────────────────────────────────────────────── */

const InfoField = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="font-medium text-gray-900">{value || 'Not set'}</p>
    </div>
  </div>
);

const QuickActionCard = ({ icon, label, to, onClick, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    gray: 'bg-gray-100 text-gray-600 group-hover:bg-gray-200',
  };

  const Component = to ? Link : 'button';
  const props = to ? { to } : { onClick };

  return (
    <Component
      {...props}
      className="group flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${colorClasses[color]}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Component>
  );
};

const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, disabled, required, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={`w-full px-4 py-3 border rounded-xl text-sm transition-all ${
        disabled
          ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
          : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
      }`}
    />
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

const FormSelect = ({ label, name, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.75rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default Profile;