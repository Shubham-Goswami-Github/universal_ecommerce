// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { auth, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const user = auth.user;

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    gender: '',
    dateOfBirth: '',
  });

  // Primary address form
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

  // Password section
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // ⭐ NEW: Vendor Application Form
  const [vendorForm, setVendorForm] = useState({
    wantToBeVendor: false,
    businessName: '',
    businessType: '',
  });
  const [vendorApplying, setVendorApplying] = useState(false);
  const [vendorMsg, setVendorMsg] = useState('');
  const [vendorErr, setVendorErr] = useState('');

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        alternateMobileNumber: user.alternateMobileNumber || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      });

      // Load primary / default address into form
      if (user.addresses && user.addresses.length > 0) {
        const addr =
          user.addresses.find((a) => a.isDefault) || user.addresses[0];

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

      // ⭐ Load existing vendor application data if any
      if (user.businessName || user.businessType) {
        setVendorForm({
          wantToBeVendor: false,
          businessName: user.businessName || '',
          businessType: user.businessType || '',
        });
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <p className="mb-3 text-slate-700">You are not logged in.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (value) => {
    if (!value) return 'Not set';
    try {
      return new Date(value).toLocaleDateString();
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

  // ⭐ NEW: Handle vendor form changes
  const handleVendorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVendorForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    // Basic validation
    if (!form.mobileNumber) {
      setErr('Mobile number is required');
      return;
    }

    // Password validation (optional change)
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

    // Address validation
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
        setErr(
          'Please fill required address fields (House, City, State, Pincode)'
        );
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
      if (form.alternateMobileNumber)
        fd.append('alternateMobileNumber', form.alternateMobileNumber);
      if (form.gender) fd.append('gender', form.gender);
      if (form.dateOfBirth) fd.append('dateOfBirth', form.dateOfBirth);

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

      // Reset password fields
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });

      setMsg('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      setErr(
        error.response?.data?.message || 'Failed to update profile. Try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ⭐ NEW: Handle vendor application submission
  const handleVendorApply = async (e) => {
    e.preventDefault();
    setVendorMsg('');
    setVendorErr('');

    // Validation
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

      setVendorMsg(
        'Vendor application submitted successfully! Admin will review your request.'
      );
      setVendorForm((f) => ({ ...f, wantToBeVendor: false }));
    } catch (error) {
      console.error('Vendor application error:', error);
      setVendorErr(
        error.response?.data?.message || 'Failed to submit application. Try again.'
      );
    } finally {
      setVendorApplying(false);
    }
  };

  // ⭐ Helper to get application status badge
  const getApplicationStatusBadge = () => {
    const status = user.vendorApplicationStatus;

    if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          ⏳ Application Pending
        </span>
      );
    }

    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ❌ Application Rejected
        </span>
      );
    }

    if (status === 'approved' || user.role === 'vendor') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          ✅ Vendor Approved
        </span>
      );
    }

    return null;
  };

  // ⭐ Check if user can apply for vendor
  const canApplyForVendor = () => {
    // Only regular users can apply
    if (user.role !== 'user') return false;

    // If already pending, can't apply again
    if (user.vendorApplicationStatus === 'pending') return false;

    // If already approved (shouldn't happen if role check is done), can't apply
    if (user.vendorApplicationStatus === 'approved') return false;

    return true;
  };

  // ⭐ Check if user has pending or rejected application
  const hasExistingApplication = () => {
    return (
      user.vendorApplicationStatus === 'pending' ||
      user.vendorApplicationStatus === 'rejected'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xl font-semibold text-blue-700">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || 'Profile'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(user.name)}</span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {user.name}
                </h1>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[11px] uppercase text-blue-600 font-medium">
                    {user.role}
                  </p>
                  {getApplicationStatusBadge()}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate('/orders')}
                className="px-3 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                View Orders
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-3 py-2 rounded-md border border-red-500 text-sm text-red-500 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Alerts */}
          {err && (
            <div className="mb-3 text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md">
              {err}
            </div>
          )}
          {msg && (
            <div className="mb-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-md">
              {msg}
            </div>
          )}

          {/* Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500 mb-1 uppercase">
                Orders
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {user.totalOrders ?? 0}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500 mb-1 uppercase">Spent</div>
              <div className="text-xl font-bold text-emerald-600">
                ₹{user.totalSpent ?? 0}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500 mb-1 uppercase">
                Last Order
              </div>
              <div className="text-sm font-medium text-slate-800">
                {formatDate(user.lastOrderDate)}
              </div>
            </div>
          </div>

          {/* ⭐ NEW: Vendor Application Section - Only for Users */}
          {user.role === 'user' && (
            <div className="mb-6 border border-orange-200 rounded-xl p-4 bg-orange-50/50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700 uppercase flex items-center gap-2">
                  🏪 Become a Vendor
                </h2>
                {getApplicationStatusBadge()}
              </div>

              {/* Show status message for pending application */}
              {user.vendorApplicationStatus === 'pending' && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                  <p className="font-medium">Application Under Review</p>
                  <p className="text-xs mt-1">
                    Your vendor application is being reviewed by admin. You will
                    be notified once it's approved.
                  </p>
                  {user.businessName && (
                    <p className="text-xs mt-2">
                      <span className="font-medium">Business Name:</span>{' '}
                      {user.businessName}
                    </p>
                  )}
                  {user.businessType && (
                    <p className="text-xs">
                      <span className="font-medium">Business Type:</span>{' '}
                      {user.businessType}
                    </p>
                  )}
                </div>
              )}

              {/* Show rejection message */}
              {user.vendorApplicationStatus === 'rejected' && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-800 mb-3">
                  <p className="font-medium">Application Rejected</p>
                  <p className="text-xs mt-1">
                    Your previous vendor application was rejected.
                    {user.vendorRejectionReason && (
                      <span>
                        {' '}
                        Reason: <b>{user.vendorRejectionReason}</b>
                      </span>
                    )}
                  </p>
                  <p className="text-xs mt-1">
                    You can re-apply with updated information below.
                  </p>
                </div>
              )}

              {/* Vendor alerts */}
              {vendorErr && (
                <div className="mb-3 text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md">
                  {vendorErr}
                </div>
              )}
              {vendorMsg && (
                <div className="mb-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-md">
                  {vendorMsg}
                </div>
              )}

              {/* Application Form - Show only if can apply */}
              {canApplyForVendor() && (
                <>
                  <div className="mb-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="wantToBeVendor"
                        checked={vendorForm.wantToBeVendor}
                        onChange={handleVendorChange}
                        className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span>I want to become a Vendor and sell products</span>
                    </label>
                  </div>

                  {/* Vendor fields - Show only when checkbox is checked */}
                  {vendorForm.wantToBeVendor && (
                    <form onSubmit={handleVendorApply} className="space-y-3">
                      <div className="bg-white border border-orange-200 rounded-lg p-4 space-y-3">
                        <p className="text-xs text-orange-700">
                          ⚠️ Your vendor application will be reviewed by admin.
                          You'll remain a regular user until approval.
                        </p>

                        <div>
                          <label className="block text-xs text-slate-500 mb-1">
                            Business / Store Name *
                          </label>
                          <input
                            name="businessName"
                            value={vendorForm.businessName}
                            onChange={handleVendorChange}
                            placeholder="e.g., Krishna Electronics, Fashion Hub"
                            className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 mb-1">
                            Business Type *
                          </label>
                          <select
                            name="businessType"
                            value={vendorForm.businessType}
                            onChange={handleVendorChange}
                            className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                          >
                            <option value="">Select Business Type</option>
                            <option value="electronics">Electronics</option>
                            <option value="fashion">Fashion & Clothing</option>
                            <option value="home">Home & Kitchen</option>
                            <option value="beauty">Beauty & Personal Care</option>
                            <option value="sports">Sports & Fitness</option>
                            <option value="books">Books & Stationery</option>
                            <option value="grocery">Grocery & Food</option>
                            <option value="health">Health & Wellness</option>
                            <option value="toys">Toys & Games</option>
                            <option value="automotive">Automotive</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={vendorApplying}
                          className="w-full px-4 py-2 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
                        >
                          {vendorApplying
                            ? 'Submitting Application...'
                            : 'Submit Vendor Application'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* Re-apply button for rejected applications */}
              {user.vendorApplicationStatus === 'rejected' &&
                !vendorForm.wantToBeVendor && (
                  <button
                    onClick={() =>
                      setVendorForm((f) => ({ ...f, wantToBeVendor: true }))
                    }
                    className="mt-2 px-4 py-2 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
                  >
                    Re-apply as Vendor
                  </button>
                )}
            </div>
          )}

          {/* ⭐ Show Vendor Info if already a vendor */}
          {user.role === 'vendor' && (
            <div className="mb-6 border border-emerald-200 rounded-xl p-4 bg-emerald-50/50">
              <h2 className="text-sm font-semibold text-slate-700 uppercase mb-2 flex items-center gap-2">
                🏪 Vendor Information
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Verified
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Business Name</p>
                  <p className="text-sm font-medium text-slate-800">
                    {user.businessName || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Business Type</p>
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {user.businessType || 'Not set'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/vendor/dashboard')}
                className="mt-3 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Go to Vendor Dashboard →
              </button>
            </div>
          )}

          {/* Form + Details */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Editable form */}
            <form
              onSubmit={handleSave}
              className="md:col-span-2 space-y-4 border rounded-xl p-4"
            >
              <h2 className="text-sm font-semibold text-slate-700 uppercase mb-1">
                Edit Profile
              </h2>

              {/* Basic info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Email (read-only)
                  </label>
                  <input
                    value={form.email}
                    disabled
                    className="w-full px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Mobile Number
                  </label>
                  <input
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Alternate Mobile
                  </label>
                  <input
                    name="alternateMobileNumber"
                    value={form.alternateMobileNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Profile picture */}
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePicFile(e.target.files[0])}
                  className="text-xs text-slate-600"
                />
              </div>

              {/* Address section */}
              <div className="border-t border-slate-200 pt-4 mt-2">
                <h3 className="text-xs font-semibold text-slate-700 uppercase mb-2">
                  Primary Address
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      value={addressForm.fullName}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Mobile Number
                    </label>
                    <input
                      name="mobileNumber"
                      value={addressForm.mobileNumber}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      House / Flat No
                    </label>
                    <input
                      name="houseNo"
                      value={addressForm.houseNo}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Street / Area
                    </label>
                    <input
                      name="streetArea"
                      value={addressForm.streetArea}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Landmark
                    </label>
                    <input
                      name="landmark"
                      value={addressForm.landmark}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Pincode
                    </label>
                    <input
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      City
                    </label>
                    <input
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      State
                    </label>
                    <input
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password section */}
              <div className="border-t border-slate-200 pt-4 mt-2">
                <h3 className="text-xs font-semibold text-slate-700 uppercase mb-2">
                  Change Password
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={passwordForm.confirmNewPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Read-only details */}
            <div className="space-y-4">
              <div className="border rounded-xl p-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase mb-2">
                  Contact Info
                </h2>
                <p className="text-sm text-slate-700">
                  <span className="text-slate-500">Email: </span>
                  {user.email || 'Not set'}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="text-slate-500">Mobile: </span>
                  {user.mobileNumber || 'Not set'}
                </p>
                {user.alternateMobileNumber && (
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Alternate: </span>
                    {user.alternateMobileNumber}
                  </p>
                )}
              </div>

              <div className="border rounded-xl p-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase mb-2">
                  Default Address
                </h2>
                {user.addresses && user.addresses.length > 0 ? (
                  (() => {
                    const addr =
                      user.addresses.find((a) => a.isDefault) ||
                      user.addresses[0];
                    return (
                      <div className="text-sm text-slate-700">
                        <p className="font-semibold">{addr.fullName}</p>
                        <p>
                          {addr.houseNo}, {addr.streetArea}
                        </p>
                        <p>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-slate-500 mt-1">
                          Mobile: {addr.mobileNumber}
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-sm text-slate-500">No address saved yet.</p>
                )}
              </div>

              {/* Account Type Info */}
              <div className="border rounded-xl p-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase mb-2">
                  Account Type
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'vendor'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role === 'admin' && '👑 '}
                    {user.role === 'vendor' && '🏪 '}
                    {user.role === 'user' && '👤 '}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
                {user.role === 'user' &&
                  user.vendorApplicationStatus === 'pending' && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Vendor application pending approval
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;