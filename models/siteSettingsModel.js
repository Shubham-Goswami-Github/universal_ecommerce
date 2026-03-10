// models/siteSettingsModel.js
const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'My Ecommerce Store' },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#0f172a' },
    secondaryColor: { type: String, default: '#1e293b' },
    homepageTitle: { type: String, default: 'Welcome to our store' },
    homepageSubtitle: { type: String, default: 'Your one-stop shop for everything' },
    
    // Hero banner with object structure
    heroBannerImages: [{
      url: { type: String, required: true },
      link: { type: String, default: '' }
    }],
    
    // Hero banner settings
    heroBannerSettings: {
      autoSlide: { type: Boolean, default: true },
      slideSpeed: { type: Number, default: 3000 },
      slideDirection: { type: String, enum: ['left', 'right'], default: 'left' },
      imageSize: { type: String, enum: ['cover', 'contain', 'auto'], default: 'cover' },
      borderColor: { type: String, default: 'transparent' },
      borderWidth: { type: Number, default: 0 }
    },
    
    featuredText: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    footerText: { type: String, default: '© ' + new Date().getFullYear() + ' My Ecommerce Store. All rights reserved.' },
    
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' }
    },
    
    isMaintenanceMode: { type: Boolean, default: false },

    // Appearance customizations
    backgroundColor: { type: String, default: '#0b1220' },
    backgroundImage: { type: String, default: '' },
    backgroundRepeat: { type: String, enum: ['no-repeat','repeat','repeat-x','repeat-y'], default: 'no-repeat' },
    backgroundSize: { type: String, enum: ['cover','contain','auto'], default: 'cover' },

    fontFamily: { type: String, default: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' },
    fontColor: { type: String, default: '#e6eef7' },
    headingFontSize: { type: String, default: '1.875rem' },
    headingColor: { type: String, default: '#ffffff' },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);