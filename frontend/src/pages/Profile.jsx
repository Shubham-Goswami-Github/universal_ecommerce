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
        dateOfBirth: user.dateOfBirth
          ? user.dateOfBirth.slice(0, 10)
          : '',
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
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen.flex items-center justify-center bg-slate-50">
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
        updateUser(data.user); // Auth context & localStorage update
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
        error.response?.data?.message ||
          'Failed to update profile. Try again.'
      );
    } finally {
      setSaving(false);
    }
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
                <p className="text-[11px] uppercase text-blue-600 mt-1">
                  {user.role}
                </p>
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
              <div className="text-xs text-slate-500 mb-1 uppercase">
                Spent
              </div>
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
                  <p className="text-sm text-slate-500">
                    No address saved yet.
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