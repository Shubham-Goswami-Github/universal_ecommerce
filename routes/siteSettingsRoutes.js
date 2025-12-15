// routes/siteSettingsRoutes.js
const express = require('express');
const router = express.Router();

const settingsController = require('../controllers/siteSettingsController');
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');

// Public: read public settings
router.get('/public', settingsController.getPublicSettings);

// Admin: read full settings (protected)
router.get('/', requireLogin, allowRoles('admin'), settingsController.getAdminSettings);

// Admin: upsert *content* fields only (protected)
router.post('/', requireLogin, allowRoles('admin'), settingsController.upsertPublicSettingsByAdmin);

// Developer-only: upsert styling fields (authorized using X-DEV-KEY header)
router.post('/dev', settingsController.upsertDevSettings);

module.exports = router;
