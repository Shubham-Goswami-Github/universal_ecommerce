const express = require('express');
const router = express.Router();

const { requireLogin, allowRoles } = require('../middleware/authMiddleware');
const controller = require('../controllers/categoryController');

// admin
router.post('/', requireLogin, allowRoles('admin'), controller.createCategory);
router.get('/', requireLogin, allowRoles('admin'), controller.getAllCategories);

// public (vendor dropdown)
router.get('/public', controller.getPublicCategories);

module.exports = router;
