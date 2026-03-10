// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const { requireLogin } = require('../middleware/authMiddleware');

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = file.mimetype.startsWith('image/');
  
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif, svg)'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (fileBuffer, mimetype, folder = 'site-uploads') => {
  return new Promise((resolve, reject) => {
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;

    cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Single image upload to Cloudinary
router.post('/image', requireLogin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    console.log('Uploading to Cloudinary:', req.file.originalname);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer, 
      req.file.mimetype,
      'site-settings'
    );

    console.log('Cloudinary upload success:', result.secure_url);

    res.json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Multiple images upload to Cloudinary
router.post('/images', requireLogin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    console.log(`Uploading ${req.files.length} images to Cloudinary`);

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, file.mimetype, 'site-settings')
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map(result => ({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    }));

    res.json({
      success: true,
      message: `${images.length} images uploaded successfully`,
      images
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Delete image from Cloudinary
// Express 5/path-to-regexp v8 compatible wildcard syntax for slash-containing public IDs.
router.delete('/image/*public_id', requireLogin, async (req, res) => {
  try {
    const rawPublicId = req.params.public_id;
    const publicIdPath = Array.isArray(rawPublicId)
      ? rawPublicId.join('/')
      : rawPublicId;
    const public_id = publicIdPath ? decodeURIComponent(publicIdPath) : publicIdPath;
    
    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    console.log('Deleting from Cloudinary:', public_id);

    const result = await cloudinary.uploader.destroy(public_id);
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      result
    });

  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
});

// Product images upload (for vendor products)
router.post('/product-images', requireLogin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, file.mimetype, 'products')
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map(result => result.secure_url);

    res.json({
      success: true,
      message: `${images.length} product images uploaded`,
      images,
      urls: images // backward compatibility
    });

  } catch (error) {
    console.error('Product images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

module.exports = router;
