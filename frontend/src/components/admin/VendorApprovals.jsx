import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function VendorApprovals({ token }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedSuperCats, setExpandedSuperCats] = useState({});

  useEffect(() => {
    fetchPendingVendors();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/api/categories/public/all');
      const allCategories = res.data?.categories || res.data || [];
      setCategories(allCategories);
    } catch (err) {
      console.log('Category fetch error', err);
      setCategories([]);
    }
  };

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const [vendorRes, categoryRequestRes] = await Promise.all([
        axiosClient.get('/api/admin/vendor-requests', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosClient.get('/api/admin/category-requests', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const vendorRequests = (vendorRes.data.vendors || []).map((vendor) => ({
        ...vendor,
        requestType: 'vendor',
        requestId: vendor._id,
        requestReason: '',
      }));

      const categoryRequests = (categoryRequestRes.data.requests || []).map((request) => ({
        ...request.vendor,
        requestType: 'category',
        requestId: request._id,
        requestReason: request.reason || '',
        requestCreatedAt: request.createdAt,
        vendorCategoriesRequested: request.categories || [],
        categoryRequest: request,
      }));

      setVendors([...categoryRequests, ...vendorRequests]);
    } catch (err) {
      console.error('fetchPendingVendors', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Get super categories
  const superCategories = categories.filter(cat => cat.type === 'super');

  const getRequestedCategoryIds = (requestedCats) => {
    if (!requestedCats) return [];

    if (requestedCats.allSelectedCategories) {
      return requestedCats.allSelectedCategories;
    }

    if (Array.isArray(requestedCats)) {
      return requestedCats.map((cat) => cat?._id || cat).filter(Boolean);
    }

    if (requestedCats.superCategories) {
      return [
        ...requestedCats.superCategories,
        ...Object.values(requestedCats.subCategories || {}).flat(),
      ].filter(Boolean);
    }

    return [];
  };

  // Get sub categories for a super category
  const getSubCategories = (superCatId, sourceCategories = categories) => {
    return sourceCategories.filter(cat =>
      cat.type === 'sub' &&
      (cat.parent === superCatId || cat.parent?._id === superCatId)
    );
  };

  const getVendorApprovalCategories = (vendor) => {
    const requestedIds = new Set(getRequestedCategoryIds(vendor?.vendorCategoriesRequested));
    if (requestedIds.size === 0) return [];

    const requestedMeta = categories.filter((cat) => requestedIds.has(cat._id));
    const parentIds = requestedMeta
      .filter((cat) => cat.type === 'sub')
      .map((cat) => cat.parent?._id || cat.parent)
      .filter(Boolean);

    const allowedIds = new Set([...requestedIds, ...parentIds]);
    return categories.filter((cat) => allowedIds.has(cat._id));
  };

  const getVendorSuperCategories = (vendor) => (
    getVendorApprovalCategories(vendor).filter((cat) => cat.type === 'super')
  );

  const getVendorSubCategories = (vendor, superCatId) => (
    getSubCategories(superCatId, getVendorApprovalCategories(vendor))
  );

  // Handle super category toggle for a vendor
  const handleSuperCategoryToggle = (vendorId, superCatId, subCats = [], requestedIds = []) => {
    const currentSelected = selectedCategories[vendorId] || [];
    const requestedIdSet = new Set(requestedIds);
    const selectableIds = [
      ...(requestedIdSet.has(superCatId) ? [superCatId] : []),
      ...subCats.map((subCat) => subCat._id).filter((id) => requestedIdSet.has(id)),
    ];

    if (selectableIds.length === 0) return;

    const allSelectableSelected = selectableIds.every((id) => currentSelected.includes(id));

    if (allSelectableSelected) {
      setSelectedCategories(prev => ({
        ...prev,
        [vendorId]: currentSelected.filter((id) => !selectableIds.includes(id))
      }));
    } else {
      setSelectedCategories(prev => ({
        ...prev,
        [vendorId]: [...new Set([...currentSelected, ...selectableIds])]
      }));
    }
  };

  // Handle sub category toggle
  const handleSubCategoryToggle = (vendorId, subCatId) => {
    setSelectedCategories(prev => {
      const existing = prev[vendorId] || [];
      const newSelected = existing.includes(subCatId)
        ? existing.filter(c => c !== subCatId)
        : [...existing, subCatId];

      return { ...prev, [vendorId]: newSelected };
    });
  };

  // Toggle super category expansion
  const toggleSuperCatExpand = (vendorId, superCatId) => {
    const key = `${vendorId}-${superCatId}`;
    setExpandedSuperCats(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Select all categories for vendor
  const selectAllCategories = (vendorId, requestedCats) => {
    const allCatIds = getRequestedCategoryIds(requestedCats);
    setSelectedCategories(prev => ({
      ...prev,
      [vendorId]: allCatIds
    }));
  };

  // Clear all selections for vendor
  const clearAllCategories = (vendorId) => {
    setSelectedCategories(prev => ({
      ...prev,
      [vendorId]: []
    }));
  };

  // Pre-select requested categories
  const preSelectRequested = (vendorId, requestedCats) => {
    if (!requestedCats) return;
    const catIds = getRequestedCategoryIds(requestedCats);

    setSelectedCategories(prev => ({
      ...prev,
      [vendorId]: catIds
    }));
  };

  const approveVendor = async (id) => {
    const selected = selectedCategories[id] || [];
    if (selected.length === 0) {
      alert('Please select at least one category to approve');
      return;
    }

    try {
      setActionLoading(id);
      const vendor = vendors.find((item) => item._id === id);
      if (!vendor) return;

      if (vendor.requestType === 'category') {
        await axiosClient.post(
          `/api/admin/category-requests/${vendor.requestId}/approve`,
          { response: 'Approved' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axiosClient.patch(
          `/api/admin/vendors/${id}/approve`,
          { vendorCategoriesApproved: selected },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchPendingVendors();
      setViewingVendor(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectVendor = async (id) => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      setActionLoading(id);
      const vendor = vendors.find((item) => item._id === id);
      if (!vendor) return;

      if (vendor.requestType === 'category') {
        await axiosClient.post(
          `/api/admin/category-requests/${vendor.requestId}/reject`,
          { reason: rejectReason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axiosClient.patch(
          `/api/admin/vendors/${id}/reject`,
          { reason: rejectReason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchPendingVendors();
      setRejectModal(null);
      setRejectReason('');
      setViewingVendor(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Get category name by ID
  const getCategoryName = (catId) => {
    const cat = categories.find(c => c._id === catId);
    return cat?.name || catId;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get requested categories display
  const getRequestedCategoriesDisplay = (vendor) => {
    const requested = vendor.vendorCategoriesRequested;
    if (!requested) return [];

    if (Array.isArray(requested)) {
      return requested.map(c => ({ id: c._id || c, name: c.name || getCategoryName(c._id || c) }));
    }

    if (requested.allSelectedCategories) {
      return requested.allSelectedCategories.map(id => ({ id, name: getCategoryName(id) }));
    }

    const all = [
      ...(requested.superCategories || []),
      ...Object.values(requested.subCategories || {}).flat()
    ];
    return all.map(id => ({ id, name: getCategoryName(id) }));
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading vendor requests...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (vendors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">All Caught Up!</h3>
        <p className="text-slate-500">No pending approval requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{vendors.length}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{superCategories.length}</p>
              <p className="text-xs text-slate-500">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor List */}
      <div className="space-y-4">
        {vendors.map((vendor) => {
          const isExpanded = expandedVendor === vendor._id;
          const requestedCats = getRequestedCategoriesDisplay(vendor);
          const vendorSuperCategories = getVendorSuperCategories(vendor);
          const vendorRequestedIds = getRequestedCategoryIds(vendor.vendorCategoriesRequested);
          const selectedCount = (selectedCategories[vendor._id] || []).length;

          return (
            <div
              key={vendor._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Vendor Header */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {vendor.name?.charAt(0).toUpperCase() || 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-800">{vendor.name}</h3>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          {vendor.requestType === 'category' ? 'Category Request' : 'Pending Approval'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{vendor.email}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {vendor.mobileNumber || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {vendor.requestType === 'category' ? 'Requested' : 'Applied'}: {formatDate(vendor.requestCreatedAt || vendor.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setViewingVendor(vendor);
                        preSelectRequested(vendor._id, vendor.vendorCategoriesRequested);
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Review
                    </button>
                    <button
                      onClick={() => setExpandedVendor(isExpanded ? null : vendor._id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Requested Categories Preview */}
                {requestedCats.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-2">Requested Categories:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {requestedCats.slice(0, 5).map((cat) => (
                        <span
                          key={cat.id}
                          className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg"
                        >
                          {cat.name}
                        </span>
                      ))}
                      {requestedCats.length > 5 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium">
                          +{requestedCats.length - 5} more
                        </span>
                      )}
                    </div>
                    {vendor.requestReason && (
                      <p className="mt-2 text-xs text-slate-600">
                        <span className="font-medium">Reason:</span> {vendor.requestReason}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vendor Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {vendor.requestType === 'category' ? 'Vendor Request Details' : 'Vendor Details'}
                      </h4>
                      <div className="bg-white rounded-xl p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Full Name</span>
                          <span className="font-medium text-slate-800">{vendor.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Email</span>
                          <span className="font-medium text-slate-800">{vendor.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Mobile</span>
                          <span className="font-medium text-slate-800">{vendor.mobileNumber || 'N/A'}</span>
                        </div>
                        {vendor.alternateMobileNumber && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Alt. Mobile</span>
                            <span className="font-medium text-slate-800">{vendor.alternateMobileNumber}</span>
                          </div>
                        )}
                        {vendor.businessName && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Business Name</span>
                            <span className="font-medium text-slate-800">{vendor.businessName}</span>
                          </div>
                        )}
                        {vendor.businessType && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Business Type</span>
                            <span className="font-medium text-slate-800">{vendor.businessType}</span>
                          </div>
                        )}
                        {vendor.requestReason && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-slate-500 text-sm">Request Reason</span>
                            <p className="font-medium text-slate-800 text-sm mt-1">{vendor.requestReason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Category Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Approve Categories
                        </h4>
                        {selectedCount > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            {selectedCount} selected
                          </span>
                        )}
                      </div>
                      <div className="bg-white rounded-xl p-3 max-h-48 overflow-y-auto">
                        {vendorSuperCategories.slice(0, 4).map((superCat) => {
                          const subCats = getVendorSubCategories(vendor, superCat._id);
                          const vendorSelected = selectedCategories[vendor._id] || [];
                          const selectableIds = [
                            ...(vendorRequestedIds.includes(superCat._id) ? [superCat._id] : []),
                            ...subCats.map((subCat) => subCat._id),
                          ];
                          const isSelected =
                            selectableIds.length > 0 &&
                            selectableIds.every((id) => vendorSelected.includes(id));

                          return (
                            <label
                              key={superCat._id}
                              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSuperCategoryToggle(vendor._id, superCat._id, subCats, vendorRequestedIds)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-700">{superCat.name}</span>
                              {subCats.length > 0 && (
                                <span className="text-xs text-slate-400">({subCats.length})</span>
                              )}
                            </label>
                          );
                        })}
                        {vendorSuperCategories.length > 4 && (
                          <button
                            onClick={() => {
                              setViewingVendor(vendor);
                              preSelectRequested(vendor._id, vendor.vendorCategoriesRequested);
                            }}
                            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                          >
                            View all categories →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setRejectModal(vendor)}
                      disabled={actionLoading === vendor._id}
                      className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {vendor.requestType === 'category' ? 'Reject Request' : 'Reject'}
                    </button>
                    <button
                      onClick={() => approveVendor(vendor._id)}
                      disabled={actionLoading === vendor._id || selectedCount === 0}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === vendor._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {vendor.requestType === 'category' ? `Approve Request (${selectedCount})` : `Approve (${selectedCount})`}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Review Modal */}
      {viewingVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                  {viewingVendor.name?.charAt(0).toUpperCase() || 'V'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{viewingVendor.name}</h2>
                  <p className="text-blue-100 text-sm">
                    {viewingVendor.requestType === 'category' ? 'Category Request Review' : 'Vendor Application Review'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingVendor(null)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Vendor Info */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-slate-50 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {viewingVendor.requestType === 'category' ? 'Vendor Information' : 'Personal Information'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">Full Name</span>
                        <span className="text-sm font-medium text-slate-800">{viewingVendor.name}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">Email</span>
                        <span className="text-sm font-medium text-slate-800">{viewingVendor.email}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">Mobile Number</span>
                        <span className="text-sm font-medium text-slate-800">{viewingVendor.mobileNumber || 'N/A'}</span>
                      </div>
                      {viewingVendor.alternateMobileNumber && (
                        <div className="flex items-center justify-between py-2 border-b border-slate-200">
                          <span className="text-sm text-slate-500">Alt. Mobile</span>
                          <span className="text-sm font-medium text-slate-800">{viewingVendor.alternateMobileNumber}</span>
                        </div>
                      )}
                      {viewingVendor.gender && (
                        <div className="flex items-center justify-between py-2 border-b border-slate-200">
                          <span className="text-sm text-slate-500">Gender</span>
                          <span className="text-sm font-medium text-slate-800 capitalize">{viewingVendor.gender}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-500">Applied On</span>
                        <span className="text-sm font-medium text-slate-800">{formatDate(viewingVendor.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  {(viewingVendor.businessName || viewingVendor.businessType) && (
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                      <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Business Information
                      </h3>
                      <div className="space-y-3">
                        {viewingVendor.businessName && (
                          <div className="flex items-center justify-between py-2 border-b border-amber-200">
                            <span className="text-sm text-amber-700">Business Name</span>
                            <span className="text-sm font-medium text-amber-900">{viewingVendor.businessName}</span>
                          </div>
                        )}
                        {viewingVendor.businessType && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-amber-700">Business Type</span>
                            <span className="text-sm font-medium text-amber-900">{viewingVendor.businessType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Requested Categories */}
                  {getRequestedCategoriesDisplay(viewingVendor).length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                      <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Requested Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {getRequestedCategoriesDisplay(viewingVendor).map((cat) => (
                          <span
                            key={cat.id}
                            className="px-3 py-1.5 bg-white text-purple-700 text-sm rounded-lg border border-purple-200"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      {viewingVendor.requestReason && (
                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <p className="text-sm font-medium text-purple-800">Reason</p>
                          <p className="text-sm text-purple-700 mt-1">{viewingVendor.requestReason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  {viewingVendor.addresses?.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-5">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Business Address
                      </h3>
                      {(() => {
                        const addr = viewingVendor.addresses[0];
                        return (
                          <div className="text-sm text-slate-600">
                            <p className="font-medium text-slate-800">{addr.fullName}</p>
                            <p className="mt-1">{addr.houseNo}, {addr.streetArea}</p>
                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                            {addr.mobileNumber && <p className="mt-1 text-slate-500">📱 {addr.mobileNumber}</p>}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Right Column - Category Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {viewingVendor.requestType === 'category' ? 'Approve Requested Categories' : 'Select Categories to Approve'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => preSelectRequested(viewingVendor._id, viewingVendor.vendorCategoriesRequested)}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Match Requested
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => selectAllCategories(viewingVendor._id, viewingVendor.vendorCategoriesRequested)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => clearAllCategories(viewingVendor._id)}
                        className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Selected Count */}
                  {(selectedCategories[viewingVendor._id] || []).length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700">
                        <strong>{(selectedCategories[viewingVendor._id] || []).length}</strong> categories selected for approval
                      </span>
                    </div>
                  )}

                  {/* Categories List */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 max-h-[400px] overflow-y-auto">
                    {getVendorSuperCategories(viewingVendor).length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <p>No categories available</p>
                      </div>
                    ) : (
                      getVendorSuperCategories(viewingVendor).map((superCat) => {
                        const subCats = getVendorSubCategories(viewingVendor, superCat._id);
                        const vendorSelected = selectedCategories[viewingVendor._id] || [];
                        const vendorRequestedIds = getRequestedCategoryIds(viewingVendor.vendorCategoriesRequested);
                        const selectableIds = [
                          ...(vendorRequestedIds.includes(superCat._id) ? [superCat._id] : []),
                          ...subCats.map((subCat) => subCat._id),
                        ];
                        const isSuperSelected =
                          selectableIds.length > 0 &&
                          selectableIds.every((id) => vendorSelected.includes(id));
                        const selectedSubsCount = subCats.filter(s => vendorSelected.includes(s._id)).length;
                        const expandKey = `${viewingVendor._id}-${superCat._id}`;
                        const isExpanded = expandedSuperCats[expandKey];

                        return (
                          <div key={superCat._id} className="border-b border-slate-200 last:border-0">
                            {/* Super Category Header */}
                            <div className={`flex items-center gap-3 p-3 ${isSuperSelected ? 'bg-blue-50' : 'bg-white'}`}>
                              <input
                                type="checkbox"
                                checked={isSuperSelected}
                                onChange={() => handleSuperCategoryToggle(viewingVendor._id, superCat._id, subCats, vendorRequestedIds)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                                {superCat.image ? (
                                  <img src={superCat.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-slate-800 text-sm">{superCat.name}</span>
                                {selectedSubsCount > 0 && (
                                  <span className="ml-2 text-xs text-blue-600">({selectedSubsCount} sub-categories)</span>
                                )}
                              </div>
                              {subCats.length > 0 && (
                                <button
                                  onClick={() => toggleSuperCatExpand(viewingVendor._id, superCat._id)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                >
                                  <svg
                                    className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                            {isExpanded && subCats.length > 0 && (
                              <div className="bg-slate-50 border-t border-slate-100 p-2 pl-10">
                                <div className="grid grid-cols-2 gap-1">
                                  {subCats.map((subCat) => {
                                    const isSubSelected = vendorSelected.includes(subCat._id);
                                    return (
                                      <label
                                        key={subCat._id}
                                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${isSubSelected ? 'bg-blue-100' : 'hover:bg-white'}`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSubSelected}
                                          onChange={() => handleSubCategoryToggle(viewingVendor._id, subCat._id)}
                                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className={`text-xs ${isSubSelected ? 'text-blue-800 font-medium' : 'text-slate-600'}`}>
                                          {subCat.name}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-slate-500">
                Vendor ID: <span className="font-mono">{viewingVendor._id}</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewingVendor(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setRejectModal(viewingVendor);
                  }}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {viewingVendor.requestType === 'category' ? 'Reject Request' : 'Reject'}
                </button>
                <button
                  onClick={() => approveVendor(viewingVendor._id)}
                  disabled={actionLoading === viewingVendor._id || (selectedCategories[viewingVendor._id] || []).length === 0}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === viewingVendor._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Approving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {viewingVendor.requestType === 'category'
                        ? `Approve Request (${(selectedCategories[viewingVendor._id] || []).length})`
                        : `Approve (${(selectedCategories[viewingVendor._id] || []).length})`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {rejectModal.requestType === 'category' ? 'Reject Category Request' : 'Reject Vendor Application'}
                </h3>
                <p className="text-red-100 text-xs">This action cannot be undone</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Vendor Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {rejectModal.name?.charAt(0).toUpperCase() || 'V'}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{rejectModal.name}</p>
                  <p className="text-xs text-slate-500">{rejectModal.email}</p>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none text-sm"
                />
              </div>

              {/* Quick Reasons */}
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Incomplete information',
                    'Invalid documents',
                    'Business verification failed',
                    'Duplicate application',
                    'Policy violation',
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setRejectReason(reason)}
                      className="px-2.5 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectVendor(rejectModal._id)}
                disabled={actionLoading === rejectModal._id || !rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === rejectModal._id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
