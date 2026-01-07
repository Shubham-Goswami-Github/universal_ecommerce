exports.checkUserActive = (req, res, next) => {
  if (!req.user?.isActive) {
    return res.status(403).json({
      message: 'Your account is inactive',
    });
  }
  next();
};

exports.checkVendorActive = (req, res, next) => {
  if (
    req.user.role !== 'vendor' ||
    !req.user.vendorActive
  ) {
    return res.status(403).json({
      message: 'Vendor not approved or inactive',
    });
  }
  next();
};
