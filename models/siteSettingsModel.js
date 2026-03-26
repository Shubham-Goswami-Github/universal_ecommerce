// models/siteSettingsModel.js
const mongoose = require('mongoose');

const contentItemSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'sparkles' },
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const statItemSchema = new mongoose.Schema(
  {
    value: { type: String, default: '' },
    label: { type: String, default: '' }
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'My Ecommerce Store' },
    logoUrl: { type: String, default: '' },
    tabName: { type: String, default: 'My Ecommerce Store' },
    tabIconUrl: { type: String, default: '' },
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
      borderWidth: { type: Number, default: 0 },
      overlayColor: { type: String, default: '#0f172a' },
      overlayOpacity: { type: Number, default: 35 }
    },

    homeHeroTagline: { type: String, default: 'New Collection 2024' },
    homeAccentPrimary: { type: String, default: '#0056b3' },
    homeAccentSecondary: { type: String, default: '#00a0ff' },
    homeHeroStats: {
      type: [statItemSchema],
      default: [
        { value: '50K+', label: 'Happy Customers' },
        { value: '1000+', label: 'Products' },
        { value: '99%', label: 'Satisfaction' }
      ]
    },
    homeHeroHighlights: {
      type: [contentItemSchema],
      default: [
        { icon: 'shipping', title: 'Free Shipping', description: 'On orders over Rs499' },
        { icon: 'star', title: 'Top Rated', description: '4.9 Average' }
      ]
    },
    homeTrustBadges: {
      type: [contentItemSchema],
      default: [
        { icon: 'shipping', title: 'Free Shipping', description: 'On orders over Rs499' },
        { icon: 'shield', title: 'Secure Payment', description: '100% Protected' },
        { icon: 'returns', title: 'Easy Returns', description: '7-Day Returns' },
        { icon: 'support', title: '24/7 Support', description: 'Dedicated Help' }
      ]
    },
    homeFeatureItems: {
      type: [contentItemSchema],
      default: [
        { icon: 'shield', title: 'Secure Payment', description: 'Multiple secure payment options including cards, UPI, and wallets.' },
        { icon: 'shipping-box', title: 'Fast Delivery', description: 'Quick and reliable shipping to your doorstep within 2-5 days.' },
        { icon: 'returns', title: 'Easy Returns', description: 'Hassle-free 7-day return policy with full refund guarantee.' },
        { icon: 'support', title: '24/7 Support', description: 'Round-the-clock customer support for all your queries.' }
      ]
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

    homeBackgroundColor: { type: String, default: '#f8fafc' },
    homeBackgroundAccentPrimary: { type: String, default: '#0056b3' },
    homeBackgroundAccentSecondary: { type: String, default: '#00a0ff' },
    homeBackgroundImage: { type: String, default: '' },
    homeBackgroundRepeat: { type: String, enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'], default: 'no-repeat' },
    homeBackgroundSize: { type: String, enum: ['cover', 'contain', 'auto', 'custom'], default: 'cover' },
    homeBackgroundOpacity: { type: Number, default: 100 },
    homeBackgroundFitScreen: { type: Boolean, default: false },
    homeBackgroundWidth: { type: String, default: 'auto' },
    homeBackgroundHeight: { type: String, default: 'auto' },

    restBackgroundColor: { type: String, default: '#ffffff' },
    restBackgroundAccentPrimary: { type: String, default: '#0056b3' },
    restBackgroundAccentSecondary: { type: String, default: '#00a0ff' },
    restBackgroundImage: { type: String, default: '' },
    restBackgroundRepeat: { type: String, enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'], default: 'no-repeat' },
    restBackgroundSize: { type: String, enum: ['cover', 'contain', 'auto'], default: 'cover' },
    restBackgroundFitScreen: { type: Boolean, default: false },

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
