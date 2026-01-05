const VendorSalesStats = require('../models/vendorSalesStatsModel');

exports.getMySalesStats = async (req, res) => {
  try {
    const vendorId = req.user?.userId;

    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const stats = await VendorSalesStats.findOne({ vendor: vendorId })
      .populate('productSales.product', 'name images');

    if (!stats) {
      return res.json({
        totalOrders: 0,
        totalProductsSold: 0,
        totalRevenue: 0,
        productSales: [],
      });
    }

    return res.json(stats);
  } catch (err) {
    console.error('Vendor sales stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
