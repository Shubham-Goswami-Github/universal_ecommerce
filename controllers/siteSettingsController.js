// controllers/siteSettingsController.js
const SiteSettings = require('../models/siteSettingsModel');

/**
 * Helper: get or create single settings doc
 */
const getSettingsDoc = async () => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
};

/**
 * PUBLIC: frontend reads this
 */
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await getSettingsDoc();
    // choose which fields are public
    res.json({
      siteName: settings.siteName,
      logoUrl: settings.logoUrl,
      homepageTitle: settings.homepageTitle,
      homepageSubtitle: settings.homepageSubtitle,
      heroBannerImages: settings.heroBannerImages,
      featuredText: settings.featuredText,
      footerText: settings.footerText,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      socialLinks: settings.socialLinks,
      isMaintenanceMode: settings.isMaintenanceMode,
      // NOTE: styling fields intentionally omitted from public payload if you prefer.
      // If frontend needs fontColor etc for theme, include only those you want public.
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * ADMIN: get full settings for admin panel (read-only for styling)
 */
exports.getAdminSettings = async (req, res) => {
  try {
    const settings = await getSettingsDoc();
    res.json({ settings });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * ADMIN: upsert content fields only (admin cannot change styling)
 * allowedByAdmin = list of fields admin may change
 */
const allowedByAdmin = [
  'siteName',
  'logoUrl',
  'homepageTitle',
  'homepageSubtitle',
  'heroBannerImages',
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

    // Only apply allowed fields
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

/**
 * DEVELOPER: upsert styling fields (requires X-DEV-KEY header)
 * allowedDev = list of styling/design fields that only dev can change
 */
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
