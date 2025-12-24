const Address = require('../models/addressModel');

/* ===============================
   GET MY ADDRESSES
================================ */
exports.getMyAddresses = async (req, res) => {
  const addresses = await Address.find({ user: req.user.userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
  res.json({ addresses });
};

/* ===============================
   ADD NEW ADDRESS
================================ */
exports.addAddress = async (req, res) => {
  const userId = req.user.userId;

  if (req.body.isDefault) {
    await Address.updateMany(
      { user: userId },
      { isDefault: false }
    );
  }

  const address = await Address.create({
    ...req.body,
    user: userId,
  });

  res.status(201).json({ message: 'Address saved', address });
};

/* ===============================
   SET DEFAULT ADDRESS
================================ */
exports.setDefaultAddress = async (req, res) => {
  const userId = req.user.userId;

  await Address.updateMany(
    { user: userId },
    { isDefault: false }
  );

  await Address.findOneAndUpdate(
    { _id: req.params.id, user: userId },
    { isDefault: true }
  );

  res.json({ message: 'Default address updated' });
};

/* ===============================
   DELETE ADDRESS
================================ */
exports.deleteAddress = async (req, res) => {
  await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user.userId,
  });

  res.json({ message: 'Address removed' });
};
