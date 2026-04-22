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

  // Multi-edit states - Track all pending changes
  const [editedCategories, setEditedCategories] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});

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

  // Upload category image using the shared Cloudinary upload endpoint.
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
      showNotification('error', err.response?.data?.message || 'Image upload failed. Please try again.');
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

  // Handle category image upload in edit mode
  const handleCategoryImageUpload = async (categoryId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImages(prev => ({ ...prev, [categoryId]: true }));
    const url = await uploadImage(file);
    if (url) {
      updateEditedCategory(categoryId, 'image', url);
      showNotification('success', 'Image uploaded! Click "Save All Changes" to apply.');
    }
    setUploadingImages(prev => ({ ...prev, [categoryId]: false }));
  };

  // Update edited category data
  const updateEditedCategory = (categoryId, field, value) => {
    setEditedCategories(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value
      }
    }));
  };

  // Start editing a category
  const startEditCategory = (category) => {
    if (!editedCategories[category._id]) {
      setEditedCategories(prev => ({
        ...prev,
        [category._id]: {
          name: category.name,
          description: category.description || '',
          image: category.image || ''
        }
      }));
    }
  };

  // Cancel editing a specific category
  const cancelCategoryEdit = (categoryId) => {
    const updated = { ...editedCategories };
    delete updated[categoryId];
    setEditedCategories(updated);
  };

  // Cancel all edits
  const cancelAllEdits = () => {
    if (Object.keys(editedCategories).length > 0) {
      if (window.confirm('Discard all unsaved changes?')) {
        setEditedCategories({});
      }
    }
  };

  // Save all edited categories
  const saveAllChanges = async () => {
    const categoryIds = Object.keys(editedCategories);

    if (categoryIds.length === 0) {
      showNotification('error', 'No changes to save');
      return;
    }

    try {
      setSubmitting(true);
      let successCount = 0;
      let errorCount = 0;

      for (const categoryId of categoryIds) {
        const data = editedCategories[categoryId];

        if (!data.name.trim()) {
          errorCount++;
          continue;
        }

        try {
          await axiosClient.put(
            `/api/categories/${categoryId}`,
            {
              name: data.name.trim(),
              description: data.description.trim(),
              image: data.image
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          successCount++;
        } catch (err) {
          console.error(`Error updating category ${categoryId}:`, err);
          errorCount++;
        }
      }

      setEditedCategories({});
      fetchCategories();

      if (errorCount === 0) {
        showNotification('success', `Successfully updated ${successCount} ${successCount === 1 ? 'category' : 'categories'}!`);
      } else {
        showNotification('error', `Updated ${successCount} categories, ${errorCount} failed`);
      }
    } catch (err) {
      console.error('Save all error:', err);
      showNotification('error', 'Failed to save changes');
    } finally {
      setSubmitting(false);
    }
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

  // Create Multiple Sub Categories
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

      // Remove from edited categories if it was being edited
      const updated = { ...editedCategories };
      delete updated[deleteModal.category._id];
      setEditedCategories(updated);

      fetchCategories();
      showNotification('success', 'Category deleted successfully!');
    } catch (err) {
      console.error('delete category error', err);
      showNotification('error', err.response?.data?.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
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

  // Get sub category count
  const getSubCategoryCount = (parentId) => {
    return getSubCategories(parentId).length;
  };

  // Quick add sub-categories
  const quickAddSubCategories = (parentId) => {
    setSelectedParent(parentId);
    setSubCategoryInputs([{ name: '', description: '', image: '' }]);
    setCreateMode('sub');
    setActiveTab('create');
  };

  // Check if category is being edited
  const isEditing = (categoryId) => {
    return editedCategories.hasOwnProperty(categoryId);
  };

  // Get edited or original value
  const getEditValue = (category, field) => {
    if (isEditing(category._id)) {
      return editedCategories[category._id][field];
    }
    return category[field] || '';
  };

  // Enhanced Image Upload Component
  const ImageUploader = ({ image, onUpload, uploading, onRemove, label = "Image" }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        {label}
        <span className="text-gray-400 font-normal text-xs">(Optional, Max 5MB)</span>
      </label>

      <div className="relative">
        {image ? (
          <div className="relative group">
            <div
              className="w-full h-40 rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-indigo-400 transition-colors"
              onClick={() => setImagePreviewModal({ show: true, image, title: label })}
            >
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-xl transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                <button type="button" onClick={() => setImagePreviewModal({ show: true, image, title: label })} className="p-2.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <button type="button" onClick={onRemove} className="p-2.5 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label className={`relative flex flex-col items-center justify-center w-full h-40 border border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
            {uploading ? (
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                <span className="text-sm font-medium text-indigo-600 mt-3">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                <span className="text-xs text-gray-500 mt-0.5">PNG, JPG, GIF up to 5MB</span>
              </div>
            )}
          </label>
        )}
      </div>
    </div>
  );

  // Compact Image Uploader
  const CompactImageUploader = ({ image, onUpload, uploading, onRemove, index }) => (
    <div className="flex items-center gap-2">
      <label className={`relative flex items-center justify-center w-16 h-16 border border-dashed rounded-lg cursor-pointer transition-all ${uploading ? 'border-indigo-400 bg-indigo-50' : image ? 'border-gray-300 bg-white' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onUpload(e, index)}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <svg className="w-6 h-6 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : image ? (
          <img src={image} alt="Preview" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </label>
      {image && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );

  const pendingChangesCount = Object.keys(editedCategories).length;

  return (
    <div className="min-h-screen bg-white -m-8 p-4 sm:p-8">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl transform transition-all duration-500 animate-slide-in max-w-md ${notification.type === 'success'
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
          }`}>
          <div className="flex-shrink-0">
            {notification.type === 'success' ? (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          <span className="font-semibold flex-1">{notification.message}</span>
          <button
            onClick={() => setNotification({ show: false, type: '', message: '' })}
            className="flex-shrink-0 ml-2 hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Floating Save All Button */}
      {pendingChangesCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-scale-in">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 p-4 max-w-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-900">Unsaved Changes</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {pendingChangesCount} {pendingChangesCount === 1 ? 'category' : 'categories'} edited
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={cancelAllEdits}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={saveAllChanges}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreviewModal.show && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setImagePreviewModal({ show: false, image: '', title: '' })}
        >
          <div className="relative max-w-7xl max-h-[90vh] animate-scale-in" onClick={e => e.stopPropagation()}>
            <img
              src={imagePreviewModal.image}
              alt={imagePreviewModal.title}
              className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl"
            />
            <button
              onClick={() => setImagePreviewModal({ show: false, image: '', title: '' })}
              className="absolute -top-4 -right-4 w-12 h-12 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-2xl hover:bg-slate-100 transition-all hover:rotate-90 duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-3xl">
              <h3 className="text-white font-bold text-xl">{imagePreviewModal.title}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
            <div className="text-center">
              {deleteModal.category?.image ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 border-4 border-red-100 shadow-lg">
                  <img src={deleteModal.category.image} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              )}

              <h3 className="text-2xl font-black text-slate-900 mb-3">Delete Category?</h3>
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete
              </p>
              <p className="text-lg font-bold text-slate-900 mb-4">"{deleteModal.category?.name}"</p>

              {deleteModal.category?.type === 'super' && getSubCategoryCount(deleteModal.category?._id) > 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-amber-900 font-bold text-sm mb-1">Warning!</p>
                      <p className="text-amber-700 text-sm">
                        This will also delete <strong>{getSubCategoryCount(deleteModal.category?._id)} sub-categories</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, category: null })}
                  className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Forever</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-2">
                Category Management
              </h1>
              <p className="text-slate-600 font-medium flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Edit multiple categories, then save all at once
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[140px] bg-white rounded-2xl px-6 py-4 shadow-lg border-2 border-indigo-100 flex items-center gap-4 hover:shadow-xl hover:scale-105 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{superCategories.length}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Categories</div>
                </div>
              </div>
              <div className="flex-1 min-w-[140px] bg-white rounded-2xl px-6 py-4 shadow-lg border-2 border-purple-100 flex items-center gap-4 hover:shadow-xl hover:scale-105 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">
                    {categories.filter(c => c.type === 'sub').length}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sub-categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 mb-8 p-2 border-2 border-white/50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 min-w-[140px] sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'list'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                  : 'text-slate-600 hover:bg-slate-100 hover:scale-105'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>All Categories</span>
              {pendingChangesCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-black">
                  {pendingChangesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('create'); setCreateMode('super'); }}
              className={`flex-1 min-w-[140px] sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'create' && createMode === 'super'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'text-slate-600 hover:bg-slate-100 hover:scale-105'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Category</span>
            </button>
            <button
              onClick={() => { setActiveTab('create'); setCreateMode('sub'); }}
              className={`flex-1 min-w-[140px] sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'create' && createMode === 'sub'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'text-slate-600 hover:bg-slate-100 hover:scale-105'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Bulk Add Sub</span>
              <span className="sm:hidden">Bulk Sub</span>
            </button>
          </div>
        </div>

        {/* Create Forms - Same as before */}
        {activeTab === 'create' && createMode === 'super' && (
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border-2 border-slate-100 overflow-hidden animate-fade-in mb-8">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Create Super Category</h2>
                  <p className="text-emerald-100 text-sm mt-1">Main category that can contain multiple sub-categories</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateSuperCategory} className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      Category Name
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={superCategoryName}
                      onChange={(e) => setSuperCategoryName(e.target.value)}
                      placeholder="e.g., Electronics, Clothing, Books..."
                      className="w-full rounded-2xl border-2 border-slate-300 px-5 py-4 text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                      <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                    </label>
                    <textarea
                      value={superCategoryDescription}
                      onChange={(e) => setSuperCategoryDescription(e.target.value)}
                      placeholder="Brief description of this category..."
                      rows={5}
                      className="w-full rounded-2xl border-2 border-slate-300 px-5 py-4 text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 resize-none font-medium"
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

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="sm:w-auto px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingSuperImage}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Creating Category...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Bulk Add Sub Categories - Same as before but with CompactImageUploader */}
        {activeTab === 'create' && createMode === 'sub' && (
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border-2 border-slate-100 overflow-hidden animate-fade-in mb-8">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Bulk Add Sub-Categories</h2>
                  <p className="text-purple-100 text-sm mt-1">Add multiple sub-categories at once with images</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateSubCategories} className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Select Parent Category
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-300 px-5 py-4 text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 font-medium bg-white"
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Sub-Categories
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-black">
                      {subCategoryInputs.filter(s => s.name.trim()).length} added
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={addSubCategoryInput}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-200 transition-all hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add More
                  </button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {subCategoryInputs.map((input, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-4 p-5 bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-2xl border-2 border-slate-200 group hover:border-purple-300 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-center sm:items-start sm:justify-center w-full sm:w-10 h-10 bg-purple-100 text-purple-600 rounded-xl font-black text-base flex-shrink-0">
                        {index + 1}
                      </div>

                      <div className="flex justify-center sm:justify-start">
                        <CompactImageUploader
                          image={input.image}
                          onUpload={handleSubCategoryImageUpload}
                          uploading={uploadingSubImage[index]}
                          onRemove={() => updateSubCategoryInput(index, 'image', '')}
                          index={index}
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        <input
                          value={input.name}
                          onChange={(e) => updateSubCategoryInput(index, 'name', e.target.value)}
                          placeholder="Sub-category name (e.g., Smartphones, T-Shirts)"
                          className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200 font-medium"
                        />
                        <input
                          value={input.description}
                          onChange={(e) => updateSubCategoryInput(index, 'description', e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-purple-400 transition-all duration-200"
                        />
                      </div>

                      {subCategoryInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubCategoryInput(index)}
                          className="flex-shrink-0 w-full sm:w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubCategoryInputs([...subCategoryInputs, ...Array(3).fill(null).map(() => ({ name: '', description: '', image: '' }))])}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all hover:scale-105"
                  >
                    + Add 3 More
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategoryInputs([...subCategoryInputs, ...Array(5).fill(null).map(() => ({ name: '', description: '', image: '' }))])}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all hover:scale-105"
                  >
                    + Add 5 More
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategoryInputs([{ name: '', description: '', image: '' }])}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all hover:scale-105"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="sm:w-auto px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || superCategories.length === 0 || !selectedParent || Object.values(uploadingSubImage).some(v => v)}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Categories List with Multi-Edit */}
        {activeTab === 'list' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search & View Toggle */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-2">
                <div className="relative">
                  <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 rounded-xl border-0 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 font-medium"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-100 p-2 flex gap-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-5 py-3 rounded-xl font-bold transition-all ${viewMode === 'tree' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  title="Tree View"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-5 py-3 rounded-xl font-bold transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  title="Grid View"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-16">
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-200 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                  </div>
                  <p className="text-slate-600 font-semibold text-lg">Loading categories...</p>
                </div>
              </div>
            ) : filteredSuperCategories.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-16">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-indigo-100 rounded-3xl mx-auto mb-8 flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">
                    {searchTerm ? 'No categories found' : 'No categories yet'}
                  </h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    {searchTerm ? `No categories match "${searchTerm}"` : 'Create your first category to get started organizing your products'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => { setActiveTab('create'); setCreateMode('super'); }}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create First Category
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View with Editable Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuperCategories.map((superCat) => {
                  const subCategories = getSubCategories(superCat._id);
                  const editing = isEditing(superCat._id);

                  return (
                    <div
                      key={superCat._id}
                      className={`bg-white rounded-3xl shadow-lg border-2 overflow-hidden hover:shadow-2xl transition-all duration-300 group ${editing ? 'border-amber-500 ring-4 ring-amber-200' : 'border-slate-100'
                        }`}
                    >
                      {/* Category Image Header */}
                      <div className="relative h-48 overflow-hidden">
                        {getEditValue(superCat, 'image') ? (
                          <img
                            src={getEditValue(superCat, 'image')}
                            alt={getEditValue(superCat, 'name')}
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500"
                            onClick={() => setImagePreviewModal({ show: true, image: getEditValue(superCat, 'image'), title: getEditValue(superCat, 'name') })}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                        {editing && (
                          <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-500 text-white rounded-full text-xs font-black flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editing
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          {editing ? (
                            <input
                              value={getEditValue(superCat, 'name')}
                              onChange={(e) => updateEditedCategory(superCat._id, 'name', e.target.value)}
                              className="w-full bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-slate-900 font-bold text-lg focus:ring-2 focus:ring-amber-500"
                              placeholder="Category name"
                            />
                          ) : (
                            <>
                              <h3 className="text-2xl font-black text-white mb-1">{superCat.name}</h3>
                              {superCat.description && (
                                <p className="text-white/90 text-sm line-clamp-2">{superCat.description}</p>
                              )}
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          {editing ? (
                            <>
                              <label className="p-3 bg-white/95 hover:bg-white rounded-xl shadow-lg transition-all hover:scale-110 cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleCategoryImageUpload(superCat._id, e)}
                                  className="hidden"
                                  disabled={uploadingImages[superCat._id]}
                                />
                                {uploadingImages[superCat._id] ? (
                                  <svg className="w-5 h-5 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </label>
                              <button
                                onClick={() => cancelCategoryEdit(superCat._id)}
                                className="p-3 bg-white/95 hover:bg-red-50 rounded-xl shadow-lg transition-all hover:scale-110"
                              >
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditCategory(superCat)}
                                className="p-3 bg-white/95 hover:bg-white rounded-xl shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                              >
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteModal({ show: true, category: superCat })}
                                className="p-3 bg-white/95 hover:bg-red-50 rounded-xl shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                              >
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        {editing && (
                          <textarea
                            value={getEditValue(superCat, 'description')}
                            onChange={(e) => updateEditedCategory(superCat._id, 'description', e.target.value)}
                            className="w-full mb-4 px-4 py-2 rounded-xl border-2 border-amber-400 focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                            rows={2}
                            placeholder="Description (optional)"
                          />
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {subCategories.length} Sub-categories
                          </span>
                          <button
                            onClick={() => quickAddSubCategories(superCat._id)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center gap-1 hover:scale-110 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                          </button>
                        </div>

                        {subCategories.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {subCategories.slice(0, 6).map((sub) => {
                              const subEditing = isEditing(sub._id);
                              return (
                                <div
                                  key={sub._id}
                                  onClick={() => !subEditing && startEditCategory(sub)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl group/sub transition-all cursor-pointer ${subEditing
                                      ? 'bg-amber-100 border-2 border-amber-500'
                                      : 'bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-200 hover:border-purple-300 hover:shadow-md'
                                    }`}
                                >
                                  {sub.image && !subEditing && (
                                    <img src={sub.image} alt="" className="w-6 h-6 rounded-lg object-cover" />
                                  )}
                                  <span className="text-xs text-slate-700 font-semibold">{sub.name}</span>
                                  {subEditing && (
                                    <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  )}
                                </div>
                              );
                            })}
                            {subCategories.length > 6 && (
                              <span className="px-3 py-2 bg-purple-100 text-purple-700 text-xs font-black rounded-xl">
                                +{subCategories.length - 6} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm italic">No sub-categories yet</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Tree View with Inline Editing - I'll continue in next response due to length */
              <div className="space-y-6">
                {filteredSuperCategories.map((superCat) => {
                  const subCategories = getSubCategories(superCat._id);
                  const isExpanded = expandedCategories[superCat._id];
                  const editing = isEditing(superCat._id);

                  return (
                    <div
                      key={superCat._id}
                      className={`bg-white rounded-3xl shadow-lg border-2 overflow-hidden hover:shadow-2xl transition-all duration-300 ${editing ? 'border-amber-500 ring-4 ring-amber-200' : 'border-slate-100'
                        }`}
                    >
                      {/* Category Header */}
                      <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 border-b-2 border-slate-100">
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() => toggleExpand(superCat._id)}
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                          >
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>

                          {getEditValue(superCat, 'image') ? (
                            <div
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden cursor-pointer border-2 border-indigo-200 hover:border-indigo-400 hover:scale-110 transition-all shadow-lg flex-shrink-0 relative group"
                              onClick={() => setImagePreviewModal({ show: true, image: getEditValue(superCat, 'image'), title: getEditValue(superCat, 'name') })}
                            >
                              <img src={getEditValue(superCat, 'image')} alt={getEditValue(superCat, 'name')} className="w-full h-full object-cover" />
                              {editing && (
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleCategoryImageUpload(superCat._id, e)}
                                    className="hidden"
                                    disabled={uploadingImages[superCat._id]}
                                  />
                                  {uploadingImages[superCat._id] ? (
                                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </label>
                              )}
                            </div>
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-2">
                            {editing ? (
                              <>
                                <input
                                  value={getEditValue(superCat, 'name')}
                                  onChange={(e) => updateEditedCategory(superCat._id, 'name', e.target.value)}
                                  className="w-full px-4 py-2 rounded-xl border-2 border-amber-400 focus:ring-2 focus:ring-amber-500 font-bold text-lg"
                                  placeholder="Category name"
                                />
                                <textarea
                                  value={getEditValue(superCat, 'description')}
                                  onChange={(e) => updateEditedCategory(superCat._id, 'description', e.target.value)}
                                  className="w-full px-4 py-2 rounded-xl border-2 border-amber-400 focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                                  rows={2}
                                  placeholder="Description (optional)"
                                />
                              </>
                            ) : (
                              <>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                                  {superCat.name}
                                </h3>
                                {superCat.description && (
                                  <p className="text-sm text-slate-600 line-clamp-2">{superCat.description}</p>
                                )}
                              </>
                            )}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {subCategories.length} Sub-categories
                              </span>
                              {editing && (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-black rounded-full">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Editing
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                            {editing ? (
                              <button
                                onClick={() => cancelCategoryEdit(superCat._id)}
                                className="flex items-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition-all"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => quickAddSubCategories(superCat._id)}
                                  className="flex items-center gap-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-200 transition-all hover:scale-105 whitespace-nowrap"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  <span className="hidden sm:inline">Add Sub</span>
                                </button>
                                <button
                                  onClick={() => startEditCategory(superCat)}
                                  className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hover:scale-110"
                                >
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setDeleteModal({ show: true, category: superCat })}
                                  className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                                >
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sub Categories */}
                      {isExpanded && (
                        <div className="p-6 bg-gradient-to-b from-slate-50/50 to-white">
                          {subCategories.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {subCategories.map((subCat) => {
                                const subEditing = isEditing(subCat._id);

                                return (
                                  <div
                                    key={subCat._id}
                                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 group ${subEditing
                                        ? 'border-amber-400 bg-amber-50 shadow-lg'
                                        : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-xl'
                                      }`}
                                  >
                                    {subEditing ? (
                                      /* Edit Mode */
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                          <label className="relative w-16 h-16 border-2 border-dashed border-amber-400 rounded-xl cursor-pointer flex items-center justify-center group/upload">
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleCategoryImageUpload(subCat._id, e)}
                                              className="hidden"
                                              disabled={uploadingImages[subCat._id]}
                                            />
                                            {uploadingImages[subCat._id] ? (
                                              <svg className="w-6 h-6 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                              </svg>
                                            ) : getEditValue(subCat, 'image') ? (
                                              <img src={getEditValue(subCat, 'image')} alt="" className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                            )}
                                          </label>

                                          <input
                                            value={getEditValue(subCat, 'name')}
                                            onChange={(e) => updateEditedCategory(subCat._id, 'name', e.target.value)}
                                            className="flex-1 rounded-xl border-2 border-amber-300 px-3 py-2 text-sm text-slate-700 focus:border-amber-500 font-semibold"
                                            placeholder="Sub-category name"
                                          />
                                        </div>
                                        <input
                                          value={getEditValue(subCat, 'description')}
                                          onChange={(e) => updateEditedCategory(subCat._id, 'description', e.target.value)}
                                          className="w-full rounded-xl border border-amber-300 px-3 py-2 text-xs text-slate-700"
                                          placeholder="Description"
                                        />

                                        <div className="flex gap-2 pt-2">
                                          <button
                                            onClick={() => cancelCategoryEdit(subCat._id)}
                                            className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* View Mode */
                                      <>
                                        <div className="flex items-start gap-4">
                                          {subCat.image ? (
                                            <div
                                              className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 border-purple-200 hover:border-purple-400 transition-all shadow-md flex-shrink-0"
                                              onClick={() => setImagePreviewModal({ show: true, image: subCat.image, title: subCat.name })}
                                            >
                                              <img src={subCat.image} alt={subCat.name} className="w-full h-full object-cover" />
                                            </div>
                                          ) : (
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                              </svg>
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-900 truncate text-base">{subCat.name}</h4>
                                            {subCat.description && (
                                              <p className="text-xs text-slate-500 mt-1 line-clamp-3">{subCat.description}</p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => startEditCategory(subCat)}
                                            className="p-2 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-lg transition-all hover:scale-110"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => setDeleteModal({ show: true, category: subCat })}
                                            className="p-2 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shadow-lg transition-all hover:scale-110"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <div className="text-center py-12">
                              <div className="w-20 h-20 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                              </div>
                              <p className="text-slate-500 text-sm mb-4 font-medium">No sub-categories yet</p>
                              <button
                                onClick={() => quickAddSubCategories(superCat._id)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Animations */}
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
        }
      `}</style>
    </div>
  );
}
