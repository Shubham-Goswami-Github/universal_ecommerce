// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();

const { requireLogin, allowRoles } = require('../middleware/authMiddleware');
const controller = require('../controllers/categoryController');

// ==================== PUBLIC ROUTES ====================
router.get('/public/all', controller.getPublicCategories);
router.get('/public/hierarchy', controller.getCategoriesHierarchy);

// ==================== ADMIN ROUTES ====================
router.post('/', requireLogin, allowRoles('admin'), controller.createCategory);
router.post('/bulk', requireLogin, allowRoles('admin'), controller.createBulkSubCategories);
router.get('/', requireLogin, allowRoles('admin'), controller.getAllCategories);
router.get('/:id', requireLogin, allowRoles('admin'), controller.getCategoryById);
router.put('/:id', requireLogin, allowRoles('admin'), controller.updateCategory);
router.delete('/:id', requireLogin, allowRoles('admin'), controller.deleteCategory);

module.exports = router;