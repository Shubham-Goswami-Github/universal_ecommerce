// controllers/authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecretkey';

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    // addresses: string (from form-data) -> JSON
    if (req.body?.addresses && typeof req.body.addresses === 'string') {
      try {
        req.body.addresses = JSON.parse(req.body.addresses);
      } catch (e) {
        return res
          .status(400)
          .json({ message: 'Invalid addresses format' });
      }
    }

    const {
      name,
      email,
      mobileNumber,
      password,
      role,

      alternateMobileNumber,
      gender,
      dateOfBirth,
      addresses,
    } = req.body || {};

    if (!name || !email || !mobileNumber || !password) {
      return res.status(400).json({
        message: 'Name, email, mobile number and password are required',
      });
    }

    // check email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // check mobile
    const mobileExists = await User.findOne({ mobileNumber });
    if (mobileExists) {
      return res
        .status(400)
        .json({ message: 'Mobile number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      mobileNumber,
      alternateMobileNumber,

      password: hashedPassword,
      role: role || 'user',

      gender, // 'male' | 'female' | 'other'
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,

      profilePicture: req.file ? req.file.path : '',

      addresses: Array.isArray(addresses) ? addresses : [],
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        alternateMobileNumber: user.alternateMobileNumber,
        role: user.role,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture,
        addresses: user.addresses,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        lastOrderDate: user.lastOrderDate,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ================= LOGIN (EMAIL OR MOBILE) ================= */
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Email/Mobile and password are required',
      });
    }

    // EMAIL OR MOBILE LOGIN
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobileNumber: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // block / inactive check
    if (user.accountStatus === 'blocked' || user.isActive === false) {
      return res.status(403).json({
        message: 'Your account is blocked. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        alternateMobileNumber: user.alternateMobileNumber,

        role: user.role,
        accountStatus: user.accountStatus,
        isActive: user.isActive,

        profilePicture: user.profilePicture,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,

        addresses: user.addresses,

        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        lastOrderDate: user.lastOrderDate,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};