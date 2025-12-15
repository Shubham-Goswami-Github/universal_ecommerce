const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'My Ecommerce Store' },
    logoUrl: { type: String, default: '' }, // can be a public URL or /uploads/..
    primaryColor: { type: String, default: '#0f172a' },
    secondaryColor: { type: String, default: '#1e293b' },
    homepageTitle: { type: String, default: 'Welcome to our store' },
    homepageSubtitle: { type: String, default: 'Your one-stop shop for everything' },
    heroBannerImages: [{ type: String }],
    featuredText: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    footerText: { type: String, default: '© ' + new Date().getFullYear() + ' My Ecommerce Store. All rights reserved.' },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      youtube: String
    },
    isMaintenanceMode: { type: Boolean, default: false },

    // --- Appearance customizations
    backgroundColor: { type: String, default: '#0b1220' },
    backgroundImage: { type: String, default: '' }, // /uploads/...
    backgroundRepeat: { type: String, enum: ['no-repeat','repeat','repeat-x','repeat-y'], default: 'no-repeat' },
    backgroundSize: { type: String, enum: ['cover','contain','auto'], default: 'cover' },

    fontFamily: { type: String, default: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' },
    fontColor: { type: String, default: '#e6eef7' },
    headingFontSize: { type: String, default: '1.875rem' }, // e.g. '30px' or '1.875rem'
    headingColor: { type: String, default: '#ffffff' },

    // vendor-specific UI choices can be added later
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
