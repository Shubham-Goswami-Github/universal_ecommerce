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
      heroBannerFallbackColor: settings.heroBannerFallbackColor,
      heroBannerFallbackAccentPrimary: settings.heroBannerFallbackAccentPrimary || settings.homeAccentPrimary,
      heroBannerFallbackAccentSecondary: settings.heroBannerFallbackAccentSecondary || settings.homeAccentSecondary,
      heroBannerFallbackImage: settings.heroBannerFallbackImage,
      heroBannerFallbackRepeat: settings.heroBannerFallbackRepeat,
      heroBannerFallbackSize: settings.heroBannerFallbackSize,
      heroBannerFallbackFitScreen: settings.heroBannerFallbackFitScreen,
      homeHeroTagline: settings.homeHeroTagline,
      homeAccentPrimary: settings.homeAccentPrimary,
      homeAccentSecondary: settings.homeAccentSecondary,
      homeAnnouncementEnabled: settings.homeAnnouncementEnabled,
      homeAnnouncementText: settings.homeAnnouncementText,
      homeNewsletterEnabled: settings.homeNewsletterEnabled,
      homeNewsletterBadgeText: settings.homeNewsletterBadgeText,
      homeNewsletterTitle: settings.homeNewsletterTitle,
      homeNewsletterDescription: settings.homeNewsletterDescription,
      homeNewsletterInputPlaceholder: settings.homeNewsletterInputPlaceholder,
      homeNewsletterButtonLabel: settings.homeNewsletterButtonLabel,
      homeNewsletterButtonLink: settings.homeNewsletterButtonLink,
      homePromoBannerEnabled: settings.homePromoBannerEnabled,
      homePromoBannerBadgeText: settings.homePromoBannerBadgeText,
      homePromoBannerTitle: settings.homePromoBannerTitle,
      homePromoBannerDescription: settings.homePromoBannerDescription,
      homePromoBannerProductCount: settings.homePromoBannerProductCount,
      homePromoBannerProductIds: settings.homePromoBannerProductIds,
      homePromoBannerBackgroundMode: settings.homePromoBannerBackgroundMode,
      homePromoBannerBackgroundColor: settings.homePromoBannerBackgroundColor,
      homePromoBannerBackgroundAccentPrimary: settings.homePromoBannerBackgroundAccentPrimary,
      homePromoBannerBackgroundAccentSecondary: settings.homePromoBannerBackgroundAccentSecondary,
      homePromoBannerBackgroundImage: settings.homePromoBannerBackgroundImage,
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
      homeBackgroundColor: settings.homeBackgroundColor,
      homeBackgroundAccentPrimary: settings.homeBackgroundAccentPrimary || settings.homeAccentPrimary,
      homeBackgroundAccentSecondary: settings.homeBackgroundAccentSecondary || settings.homeAccentSecondary,
      homeBackgroundImage: settings.homeBackgroundImage,
      homeBackgroundRepeat: settings.homeBackgroundRepeat,
      homeBackgroundSize: settings.homeBackgroundSize,
      homeBackgroundOpacity: settings.homeBackgroundOpacity,
      homeBackgroundFitScreen: settings.homeBackgroundFitScreen,
      homeBackgroundWidth: settings.homeBackgroundWidth,
      homeBackgroundHeight: settings.homeBackgroundHeight,
      restBackgroundColor: settings.restBackgroundColor || settings.backgroundColor,
      restBackgroundAccentPrimary: settings.restBackgroundAccentPrimary || settings.homeAccentPrimary,
      restBackgroundAccentSecondary: settings.restBackgroundAccentSecondary || settings.homeAccentSecondary,
      restBackgroundImage: settings.restBackgroundImage || settings.backgroundImage,
      restBackgroundRepeat: settings.restBackgroundRepeat || settings.backgroundRepeat,
      restBackgroundSize: settings.restBackgroundSize || settings.backgroundSize,
      restBackgroundFitScreen: settings.restBackgroundFitScreen,
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
  'heroBannerFallbackColor',
  'heroBannerFallbackAccentPrimary',
  'heroBannerFallbackAccentSecondary',
  'heroBannerFallbackImage',
  'heroBannerFallbackRepeat',
  'heroBannerFallbackSize',
  'heroBannerFallbackFitScreen',
  'homeHeroTagline',
  'homeAccentPrimary',
  'homeAccentSecondary',
  'homeAnnouncementEnabled',
  'homeAnnouncementText',
  'homeNewsletterEnabled',
  'homeNewsletterBadgeText',
  'homeNewsletterTitle',
  'homeNewsletterDescription',
  'homeNewsletterInputPlaceholder',
  'homeNewsletterButtonLabel',
  'homeNewsletterButtonLink',
  'homePromoBannerEnabled',
  'homePromoBannerBadgeText',
  'homePromoBannerTitle',
  'homePromoBannerDescription',
  'homePromoBannerProductCount',
  'homePromoBannerProductIds',
  'homePromoBannerBackgroundMode',
  'homePromoBannerBackgroundColor',
  'homePromoBannerBackgroundAccentPrimary',
  'homePromoBannerBackgroundAccentSecondary',
  'homePromoBannerBackgroundImage',
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
  'isMaintenanceMode',
  'homeBackgroundColor',
  'homeBackgroundAccentPrimary',
  'homeBackgroundAccentSecondary',
  'homeBackgroundImage',
  'homeBackgroundRepeat',
  'homeBackgroundSize',
  'homeBackgroundOpacity',
  'homeBackgroundFitScreen',
  'homeBackgroundWidth',
  'homeBackgroundHeight',
  'restBackgroundColor',
  'restBackgroundAccentPrimary',
  'restBackgroundAccentSecondary',
  'restBackgroundImage',
  'restBackgroundRepeat',
  'restBackgroundSize',
  'restBackgroundFitScreen'
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
