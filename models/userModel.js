const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'user'
  },
   isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
// controllers/adminController.js (add / merge these functions near your user functions)
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

// CREATE user (admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user', isActive = true } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    // check existing
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      isActive
    });

    // return without password
    const { password: _p, ...safe } = user.toObject();
    res.status(201).json({ message: 'User created', user: safe });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE user (admin) - edit name/email/password/role/isActive
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // check email conflict
      const other = await User.findOne({ email, _id: { $ne: userId } });
      if (other) return res.status(400).json({ message: 'Email already in use by another account' });
      user.email = email;
    }
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    const { password: _p, ...safe } = user.toObject();
    res.json({ message: 'User updated', user: safe });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
