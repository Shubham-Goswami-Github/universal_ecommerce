const express = require('express');
const router = express.Router();
const { getMySalesStats } = require('../controllers/vendorSalesStatsController');
const { requireLogin } = require('../middleware/authMiddleware');

router.get('/sales-stats', requireLogin, getMySalesStats);

module.exports = router;
