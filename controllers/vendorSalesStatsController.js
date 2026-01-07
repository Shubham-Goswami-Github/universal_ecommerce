const VendorSalesStats = require('../models/vendorSalesStatsModel');
const Order = require('../models/orderModel');

exports.getMySalesStats = async (req, res) => {
  try {
    const vendorId = req.user?.userId;

    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const stats = await VendorSalesStats.findOne({ vendor: vendorId })
      .populate('productSales.product', 'name images');

    const lastOrder = await Order.findOne({ vendor: vendorId }).sort({ createdAt: -1 });

    if (!stats) {
      return res.json({
        totalOrders: 0,
        totalProductsSold: 0,
        totalRevenue: 0,
        productSales: [],
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
      });
    }

    return res.json({
      ...stats.toObject(),
      lastOrderDate: lastOrder ? lastOrder.createdAt : null,
    });
  } catch (err) {
    console.error('Vendor sales stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
