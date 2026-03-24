// controllers/siteSettingsController.js
const SiteSettings = require('../models/siteSettingsModel');

const getSettingsDoc = async () => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
};

exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await getSettingsDoc();
    res.json({
      siteName: settings.siteName,
      logoUrl: settings.logoUrl,
      tabName: settings.tabName,
      tabIconUrl: settings.tabIconUrl,
      homepageTitle: settings.homepageTitle,
      homepageSubtitle: settings.homepageSubtitle,
      heroBannerImages: settings.heroBannerImages,
      heroBannerSettings: settings.heroBannerSettings,
      homeHeroTagline: settings.homeHeroTagline,
      homeHeroStats: settings.homeHeroStats,
      homeHeroHighlights: settings.homeHeroHighlights,
      homeTrustBadges: settings.homeTrustBadges,
      homeFeatureItems: settings.homeFeatureItems,
      featuredText: settings.featuredText,
      footerText: settings.footerText,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      socialLinks: settings.socialLinks,
      isMaintenanceMode: settings.isMaintenanceMode,
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAdminSettings = async (req, res) => {
  try {
    const settings = await getSettingsDoc();
    res.json({ settings });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const allowedByAdmin = [
  'siteName',
  'logoUrl',
  'tabName',
  'tabIconUrl',
  'homepageTitle',
  'homepageSubtitle',
  'heroBannerImages',
  'heroBannerSettings',
  'homeHeroTagline',
  'homeHeroStats',
  'homeHeroHighlights',
  'homeTrustBadges',
  'homeFeatureItems',
  'featuredText',
  'footerText',
  'contactEmail',
  'contactPhone',
  'address',
  'socialLinks',
  'isMaintenanceMode'
];

exports.upsertPublicSettingsByAdmin = async (req, res) => {
  try {
    const payload = req.body || {};
    const settings = await getSettingsDoc();

    for (const key of allowedByAdmin) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        settings[key] = payload[key];
      }
    }

    await settings.save();
    res.json({ message: 'Settings updated (admin)', settings });
  } catch (error) {
    console.error('Upsert settings error (admin):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const allowedDev = [
  'backgroundColor',
  'backgroundImage',
  'backgroundRepeat',
  'backgroundSize',
  'fontFamily',
  'fontColor',
  'headingFontSize',
  'headingColor',
  'primaryColor',
  'secondaryColor'
];

exports.upsertDevSettings = async (req, res) => {
  try {
    const devKey = req.headers['x-dev-key'];
    if (!devKey || devKey !== process.env.DEV_KEY) {
      return res.status(403).json({ message: 'Developer key missing or invalid' });
    }

    const payload = req.body || {};
    const settings = await getSettingsDoc();

    for (const key of allowedDev) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        settings[key] = payload[key];
      }
    }

    await settings.save();
    res.json({ message: 'Developer settings updated', settings });
  } catch (error) {
    console.error('Upsert settings error (dev):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
