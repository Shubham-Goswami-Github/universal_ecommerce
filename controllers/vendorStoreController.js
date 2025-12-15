const VendorStore = require('../models/vendorStoreModel');
const Product = require('../models/productModel');

// Helper
const getOrCreateVendorStore = async (vendorId) => {
  let store = await VendorStore.findOne({ vendor: vendorId });
  if (!store) {
    store = await VendorStore.create({
      vendor: vendorId,
      storeName: 'My Store'
    });
  }
  return store;
};

// Vendor: get my store
exports.getMyStore = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const store = await getOrCreateVendorStore(vendorId);

    res.json({ store });
  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Vendor: update my store
exports.updateMyStore = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    let store = await getOrCreateVendorStore(vendorId);

    const {
      storeName,
      logoUrl,
      bannerImages,
      description,
      contactEmail,
      contactPhone,
      address,
      socialLinks,
      isActive
    } = req.body;

    if (storeName !== undefined) store.storeName = storeName;
    if (logoUrl !== undefined) store.logoUrl = logoUrl;
    if (bannerImages !== undefined) store.bannerImages = bannerImages;
    if (description !== undefined) store.description = description;
    if (contactEmail !== undefined) store.contactEmail = contactEmail;
    if (contactPhone !== undefined) store.contactPhone = contactPhone;
    if (address !== undefined) store.address = address;
    if (socialLinks !== undefined) store.socialLinks = socialLinks;
    if (isActive !== undefined) store.isActive = isActive;

    await store.save();

    res.json({
      message: 'Store updated successfully',
      store
    });
  } catch (error) {
    console.error('Update my store error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUBLIC: get vendor store by vendorId (and products)
exports.getStoreByVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    const store = await VendorStore.findOne({ vendor: vendorId, isActive: true })
      .populate('vendor', 'name email');

    if (!store) {
      return res.status(404).json({ message: 'Store not found or inactive' });
    }

    const products = await Product.find({
      vendor: vendorId,
      isActive: true
    });

    res.json({
      store,
      products
    });
  } catch (error) {
    console.error('Get store by vendor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: get all stores
exports.getAllStoresAdmin = async (req, res) => {
  try {
    const stores = await VendorStore.find()
      .populate('vendor', 'name email role');

    res.json({ stores });
  } catch (error) {
    console.error('Get all stores admin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
