// src/components/admin/AdminCategories.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AdminCategories({ token }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states for Super Category
  const [superCategoryName, setSuperCategoryName] = useState('');
  const [superCategoryDescription, setSuperCategoryDescription] = useState('');
  const [superCategoryImage, setSuperCategoryImage] = useState('');
  const [uploadingSuperImage, setUploadingSuperImage] = useState(false);
  
  // Form states for Sub Categories (bulk add)
  const [selectedParent, setSelectedParent] = useState('');
  const [subCategoryInputs, setSubCategoryInputs] = useState([{ name: '', description: '', image: '' }]);
  const [uploadingSubImage, setUploadingSubImage] = useState({});
  
  // Edit states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  
  // UI states
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, category: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeTab, setActiveTab] = useState('list');
  const [createMode, setCreateMode] = useState('super');
  const [viewMode, setViewMode] = useState('tree');
  const [imagePreviewModal, setImagePreviewModal] = useState({ show: false, image: '', title: '' });

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
  };

  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    if (!file) return null;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Image size must be less than 5MB');
      return null;
    }

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please upload an image file');
      return null;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axiosClient.post('/api/upload/image', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });

      if (res.data.success) {
        return res.data.url;
      }
      return null;
    } catch (err) {
      console.error('Upload error:', err);
      showNotification('error', err.response?.data?.message || 'Image upload failed');
      return null;
    }
  };

  // Handle super category image upload
  const handleSuperCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingSuperImage(true);
    const url = await uploadImage(file);
    if (url) {
      setSuperCategoryImage(url);
      showNotification('success', 'Image uploaded successfully!');
    }
    setUploadingSuperImage(false);
  };

  // Handle sub-category image upload
  const handleSubCategoryImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingSubImage(prev => ({ ...prev, [index]: true }));
    const url = await uploadImage(file);
    if (url) {
      updateSubCategoryInput(index, 'image', url);
      showNotification('success', 'Image uploaded successfully!');
    }
    setUploadingSubImage(prev => ({ ...prev, [index]: false }));
  };

  // Handle edit image upload
  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingEditImage(true);
    const url = await uploadImage(file);
    if (url) {
      setEditImage(url);
      showNotification('success', 'Image uploaded successfully!');
    }
    setUploadingEditImage(false);
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.categories || []);
      
      const expanded = {};
      (res.data.categories || []).forEach(c => {
        if (c.type === 'super') {
          expanded[c._id] = true;
        }
      });
      setExpandedCategories(expanded);
    } catch (err) {
      console.error('fetchCategories error', err);
      showNotification('error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  // Create Super Category
  const handleCreateSuperCategory = async (e) => {
    e.preventDefault();
    
    if (!superCategoryName.trim()) {
      showNotification('error', 'Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      await axiosClient.post(
        '/api/categories',
        {
          name: superCategoryName.trim(),
          type: 'super',
          parent: null,
          description: superCategoryDescription.trim(),
          image: superCategoryImage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuperCategoryName('');
      setSuperCategoryDescription('');
      setSuperCategoryImage('');
      fetchCategories();
      showNotification('success', 'Super category created successfully!');
      setActiveTab('list');
    } catch (err) {
      console.error('create category error', err);
      showNotification('error', err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Multiple Sub Categories using bulk endpoint
  const handleCreateSubCategories = async (e) => {
    e.preventDefault();
    
    if (!selectedParent) {
      showNotification('error', 'Please select a parent category');
      return;
    }

    const validSubCategories = subCategoryInputs.filter(sub => sub.name.trim());
    
    if (validSubCategories.length === 0) {
      showNotification('error', 'Please add at least one sub-category');
      return;
    }

    try {
      setSubmitting(true);
      
      const res = await axiosClient.post(
        '/api/categories/bulk',
        {
          parent: selectedParent,
          subCategories: validSubCategories.map(sub => ({
            name: sub.name.trim(),
            description: sub.description.trim(),
            image: sub.image
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedParent('');
      setSubCategoryInputs([{ name: '', description: '', image: '' }]);
      fetchCategories();
      showNotification('success', res.data.message || 'Sub-categories created successfully!');
      setActiveTab('list');
    } catch (err) {
      console.error('create sub-categories error', err);
      showNotification('error', err.response?.data?.message || 'Failed to create sub-categories');
    } finally {
      setSubmitting(false);
    }
  };

  // Add more sub-category input
  const addSubCategoryInput = () => {
    setSubCategoryInputs([...subCategoryInputs, { name: '', description: '', image: '' }]);
  };

  // Remove sub-category input
  const removeSubCategoryInput = (index) => {
    if (subCategoryInputs.length === 1) return;
    setSubCategoryInputs(subCategoryInputs.filter((_, i) => i !== index));
  };

  // Update sub-category input
  const updateSubCategoryInput = (index, field, value) => {
    const updated = [...subCategoryInputs];
    updated[index][field] = value;
    setSubCategoryInputs(updated);
  };

  // Update category
  const handleUpdate = async (categoryId) => {
    if (!editName.trim()) {
      showNotification('error', 'Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      await axiosClient.put(
        `/api/categories/${categoryId}`,
        {
          name: editName.trim(),
          description: editDescription.trim(),
          image: editImage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingCategory(null);
      setEditName('');
      setEditDescription('');
      setEditImage('');
      fetchCategories();
      showNotification('success', 'Category updated successfully!');
    } catch (err) {
      console.error('update category error', err);
      showNotification('error', err.response?.data?.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = async () => {
    if (!deleteModal.category) return;

    try {
      setSubmitting(true);
      await axiosClient.delete(
        `/api/categories/${deleteModal.category._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDeleteModal({ show: false, category: null });
      fetchCategories();
      showNotification('success', 'Category deleted successfully!');
    } catch (err) {
      console.error('delete category error', err);
      showNotification('error', err.response?.data?.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing
  const startEdit = (category, e) => {
    e?.stopPropagation();
    setEditingCategory(category._id);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setEditImage(category.image || '');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditDescription('');
    setEditImage('');
  };

  // Toggle category expansion
  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Filter categories
  const superCategories = categories.filter(c => c.type === 'super');
  const filteredSuperCategories = superCategories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get sub categories for a parent
  const getSubCategories = (parentId) => {
    return categories.filter(c => c.parent === parentId || c.parent?._id === parentId);
  };

  // Count sub categories
  const getSubCategoryCount = (parentId) => {
    return getSubCategories(parentId).length;
  };

  // Quick add sub-categories to a specific parent
  const quickAddSubCategories = (parentId) => {
    setSelectedParent(parentId);
    setSubCategoryInputs([{ name: '', description: '', image: '' }]);
    setCreateMode('sub');
    setActiveTab('create');
  };

  // Image Upload Component
  const ImageUploader = ({ image, onUpload, uploading, onRemove, label = "Image" }) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {label}
        <span className="text-slate-400 font-normal text-xs">(Optional)</span>
      </label>
      
      <div className="flex items-start gap-4">
        {/* Upload Area */}
        <div className="flex-1">
          <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
            uploading 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/50'
          }`}>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-purple-600 mt-2">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-slate-500 mt-2">Click to upload</span>
                <span className="text-xs text-slate-400">PNG, JPG up to 5MB</span>
              </div>
            )}
          </label>
        </div>
        
        {/* Preview */}
        {image && (
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-xl border-2 border-slate-200 overflow-hidden cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => setImagePreviewModal({ show: true, image, title: label })}
            >
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Compact Image Uploader for Sub Categories
  const CompactImageUploader = ({ image, onUpload, uploading, onRemove, index }) => (
    <div className="flex items-center gap-2">
      <label className={`relative flex items-center justify-center w-16 h-16 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
        uploading 
          ? 'border-purple-400 bg-purple-50' 
          : image 
            ? 'border-green-400 bg-green-50' 
            : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/50'
      }`}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onUpload(e, index)}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <svg className="w-5 h-5 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : image ? (
          <img src={image} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </label>
      {image && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-500 animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification({ show: false, type: '', message: '' })} className="ml-2 hover:opacity-80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreviewModal.show && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setImagePreviewModal({ show: false, image: '', title: '' })}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img 
              src={imagePreviewModal.image} 
              alt={imagePreviewModal.title}
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setImagePreviewModal({ show: false, image: '', title: '' })}
              className="absolute -top-3 -right-3 w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
              {imagePreviewModal.title}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-bounce-in">
            <div className="text-center">
              {/* Category Image Preview */}
              {deleteModal.category?.image && (
                <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto mb-4 border-2 border-red-200">
                  <img src={deleteModal.category.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              {!deleteModal.category?.image && (
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Category?</h3>
              <p className="text-slate-500 text-sm mb-2">
                Are you sure you want to delete <strong className="text-slate-700">"{deleteModal.category?.name}"</strong>?
              </p>
              {deleteModal.category?.type === 'super' && getSubCategoryCount(deleteModal.category?._id) > 0 && (
                <p className="text-amber-600 text-sm bg-amber-50 rounded-lg p-2 mb-4">
                  ⚠️ This will also delete {getSubCategoryCount(deleteModal.category?._id)} sub-categories!
                </p>
              )}
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteModal({ show: false, category: null })}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Category Management
              </h1>
              <p className="mt-2 text-slate-500">
                Organize your products with categories and sub-categories
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-white rounded-2xl px-5 py-4 shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{superCategories.length}</div>
                  <div className="text-xs text-slate-500">Categories</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl px-5 py-4 shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    {categories.filter(c => c.type === 'sub').length}
                  </div>
                  <div className="text-xs text-slate-500">Sub-categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 mb-6 p-2 border border-white/50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>All Categories</span>
            </button>
            <button
              onClick={() => { setActiveTab('create'); setCreateMode('super'); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'create' && createMode === 'super'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Category</span>
            </button>
            <button
              onClick={() => { setActiveTab('create'); setCreateMode('sub'); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'create' && createMode === 'sub'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              <span>Bulk Add Sub-Categories</span>
            </button>
          </div>
        </div>

        {/* Create Super Category Form */}
        {activeTab === 'create' && createMode === 'super' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in mb-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                Create Super Category
              </h2>
              <p className="text-emerald-100 text-sm mt-1 ml-13">Main category that can contain sub-categories</p>
            </div>
            
            <form onSubmit={handleCreateSuperCategory} className="p-6 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      Category Name
                    </label>
                    <input
                      value={superCategoryName}
                      onChange={(e) => setSuperCategoryName(e.target.value)}
                      placeholder="e.g., Electronics, Clothing, Books..."
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      Description
                      <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <textarea
                      value={superCategoryDescription}
                      onChange={(e) => setSuperCategoryDescription(e.target.value)}
                      placeholder="Brief description of this category..."
                      rows={4}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                <div>
                  <ImageUploader
                    image={superCategoryImage}
                    onUpload={handleSuperCategoryImageUpload}
                    uploading={uploadingSuperImage}
                    onRemove={() => setSuperCategoryImage('')}
                    label="Category Image"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingSuperImage}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Add Sub Categories Form */}
        {activeTab === 'create' && createMode === 'sub' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                </div>
                Bulk Add Sub-Categories
              </h2>
              <p className="text-purple-100 text-sm mt-1 ml-13">Add multiple sub-categories at once with images</p>
            </div>
            
            <form onSubmit={handleCreateSubCategories} className="p-6 space-y-6">
              {/* Parent Category Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Select Parent Category
                </label>
                <select
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200"
                  required
                >
                  <option value="">Choose a super category...</option>
                  {superCategories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({getSubCategoryCount(c._id)} sub-categories)
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Categories Inputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Sub-Categories ({subCategoryInputs.filter(s => s.name.trim()).length} added)
                  </label>
                  <button
                    type="button"
                    onClick={addSubCategoryInput}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add More
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {subCategoryInputs.map((input, index) => (
                    <div 
                      key={index} 
                      className="flex gap-3 p-4 bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-xl border border-slate-200 group hover:border-purple-300 transition-colors"
                    >
                      {/* Number Badge */}
                      <div className="flex items-start justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-lg font-semibold text-sm flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      
                      {/* Image Upload */}
                      <CompactImageUploader
                        image={input.image}
                        onUpload={handleSubCategoryImageUpload}
                        uploading={uploadingSubImage[index]}
                        onRemove={() => updateSubCategoryInput(index, 'image', '')}
                        index={index}
                      />
                      
                      {/* Name & Description */}
                      <div className="flex-1 space-y-2">
                        <input
                          value={input.name}
                          onChange={(e) => updateSubCategoryInput(index, 'name', e.target.value)}
                          placeholder="Sub-category name (e.g., Smartphones, T-Shirts)"
                          className="w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 text-slate-700 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200"
                        />
                        <input
                          value={input.description}
                          onChange={(e) => updateSubCategoryInput(index, 'description', e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-purple-400 transition-all duration-200"
                        />
                      </div>
                      
                      {/* Remove Button */}
                      {subCategoryInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubCategoryInput(index)}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Add Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubCategoryInputs([...subCategoryInputs, ...Array(3).fill(null).map(() => ({ name: '', description: '', image: '' }))])}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    + Add 3 More
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategoryInputs([...subCategoryInputs, ...Array(5).fill(null).map(() => ({ name: '', description: '', image: '' }))])}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    + Add 5 More
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategoryInputs([{ name: '', description: '', image: '' }])}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || superCategories.length === 0 || !selectedParent || Object.values(uploadingSubImage).some(v => v)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Create {subCategoryInputs.filter(s => s.name.trim()).length || 0} Sub-Categories</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        {activeTab === 'list' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-0 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* View Toggle */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex gap-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    viewMode === 'tree' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Tree View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Grid View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500">Loading categories...</p>
                </div>
              </div>
            ) : filteredSuperCategories.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm ? 'No categories found' : 'No categories yet'}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    {searchTerm ? `No categories match "${searchTerm}"` : 'Create your first category to get started'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => { setActiveTab('create'); setCreateMode('super'); }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create First Category
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuperCategories.map((superCat) => {
                  const subCategories = getSubCategories(superCat._id);
                  
                  return (
                    <div key={superCat._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      {/* Category Image or Gradient Header */}
                      <div className="relative h-32">
                        {superCat.image ? (
                          <img 
                            src={superCat.image} 
                            alt={superCat.name} 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setImagePreviewModal({ show: true, image: superCat.image, title: superCat.name })}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-lg font-bold text-white">{superCat.name}</h3>
                          {superCat.description && (
                            <p className="text-white/80 text-sm mt-0.5 line-clamp-1">{superCat.description}</p>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => startEdit(superCat, e)}
                            className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow transition-colors"
                          >
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteModal({ show: true, category: superCat })}
                            className="p-1.5 bg-white/90 hover:bg-red-50 rounded-lg shadow transition-colors"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-slate-600">
                            {subCategories.length} Sub-categories
                          </span>
                          <button
                            onClick={() => quickAddSubCategories(superCat._id)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                          </button>
                        </div>
                        
                        {subCategories.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {subCategories.slice(0, 4).map((sub) => (
                              <div
                                key={sub._id}
                                className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg group/sub"
                              >
                                {sub.image && (
                                  <img src={sub.image} alt="" className="w-4 h-4 rounded object-cover" />
                                )}
                                <span className="text-xs text-slate-700 font-medium">{sub.name}</span>
                              </div>
                            ))}
                            {subCategories.length > 4 && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg">
                                +{subCategories.length - 4} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">No sub-categories yet</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Tree View */
              <div className="space-y-4">
                {filteredSuperCategories.map((superCat) => {
                  const subCategories = getSubCategories(superCat._id);
                  const isExpanded = expandedCategories[superCat._id];
                  const isEditing = editingCategory === superCat._id;

                  return (
                    <div key={superCat._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
                      {/* Super Category Header */}
                      <div className="p-5 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border-b border-slate-100">
                        {isEditing ? (
                          /* Edit Mode */
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full rounded-xl border-2 border-blue-400 px-4 py-2.5 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                  placeholder="Category name"
                                  autoFocus
                                />
                                <textarea
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-slate-700 text-sm resize-none"
                                  placeholder="Description (optional)"
                                  rows={3}
                                />
                              </div>
                              <div>
                                <ImageUploader
                                  image={editImage}
                                  onUpload={handleEditImageUpload}
                                  uploading={uploadingEditImage}
                                  onRemove={() => setEditImage('')}
                                  label="Update Image"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdate(superCat._id)}
                                disabled={submitting || uploadingEditImage}
                                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleExpand(superCat._id)}
                              className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center transition-all duration-300 hover:bg-slate-200 ${isExpanded ? 'rotate-90' : ''}`}
                            >
                              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            
                            {/* Category Image or Icon */}
                            {superCat.image ? (
                              <div 
                                className="w-14 h-14 rounded-2xl overflow-hidden cursor-pointer border-2 border-slate-200 hover:border-blue-400 transition-colors"
                                onClick={() => setImagePreviewModal({ show: true, image: superCat.image, title: superCat.name })}
                              >
                                <img src={superCat.image} alt={superCat.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                            )}
                            
                            <div className="flex-1" onClick={() => toggleExpand(superCat._id)}>
                              <h3 className="text-xl font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors">
                                {superCat.name}
                              </h3>
                              {superCat.description && (
                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{superCat.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                  {subCategories.length} Sub-categories
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => quickAddSubCategories(superCat._id)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-200 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Sub
                              </button>
                              <button
                                onClick={(e) => startEdit(superCat, e)}
                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteModal({ show: true, category: superCat })}
                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sub Categories */}
                      {isExpanded && (
                        <div className="p-4 bg-gradient-to-b from-slate-50/50 to-white">
                          {subCategories.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {subCategories.map((subCat) => {
                                const isSubEditing = editingCategory === subCat._id;

                                return (
                                  <div
                                    key={subCat._id}
                                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 group ${
                                      isSubEditing 
                                        ? 'border-blue-400 bg-blue-50' 
                                        : 'border-slate-100 bg-white hover:border-purple-200 hover:shadow-md'
                                    }`}
                                  >
                                    {isSubEditing ? (
                                      /* Edit Mode */
                                      <div className="space-y-2">
                                        <input
                                          value={editName}
                                          onChange={(e) => setEditName(e.target.value)}
                                          className="w-full rounded-lg border-2 border-blue-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500"
                                          placeholder="Sub-category name"
                                          autoFocus
                                        />
                                        <input
                                          value={editDescription}
                                          onChange={(e) => setEditDescription(e.target.value)}
                                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
                                          placeholder="Description"
                                        />
                                        
                                        {/* Image upload for edit */}
                                        <div className="flex items-center gap-2">
                                          <label className={`flex items-center justify-center w-12 h-12 border-2 border-dashed rounded-lg cursor-pointer ${
                                            uploadingEditImage ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-purple-400'
                                          }`}>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={handleEditImageUpload}
                                              className="hidden"
                                              disabled={uploadingEditImage}
                                            />
                                            {uploadingEditImage ? (
                                              <svg className="w-5 h-5 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                              </svg>
                                            ) : editImage ? (
                                              <img src={editImage} alt="" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                            )}
                                          </label>
                                          {editImage && (
                                            <button
                                              type="button"
                                              onClick={() => setEditImage('')}
                                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                        
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleUpdate(subCat._id)}
                                            disabled={submitting}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={cancelEdit}
                                            className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* View Mode */
                                      <>
                                        <div className="flex items-start gap-3">
                                          {subCat.image ? (
                                            <div 
                                              className="w-12 h-12 rounded-xl overflow-hidden cursor-pointer border border-slate-200 hover:border-purple-400 transition-colors flex-shrink-0"
                                              onClick={() => setImagePreviewModal({ show: true, image: subCat.image, title: subCat.name })}
                                            >
                                              <img src={subCat.image} alt={subCat.name} className="w-full h-full object-cover" />
                                            </div>
                                          ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                              </svg>
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-800 truncate">{subCat.name}</h4>
                                            {subCat.description && (
                                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{subCat.description}</p>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Action buttons on hover */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={(e) => startEdit(subCat, e)}
                                            className="p-1.5 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm transition-colors"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => setDeleteModal({ show: true, category: subCat })}
                                            className="p-1.5 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shadow-sm transition-colors"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                              </div>
                              <p className="text-slate-500 text-sm mb-3">No sub-categories yet</p>
                              <button
                                onClick={() => quickAddSubCategories(superCat._id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Sub-Categories
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}