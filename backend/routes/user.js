const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Get current user profile
// @route   GET /api/user/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user.id).populate('bookmarks').populate('likes');
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user profile (name/email)
// @route   PUT /api/user/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;

    // If email is being changed, it needs verification again
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      user.email = email;
      user.isVerified = false;
      const verificationToken = crypto.randomBytes(20).toString('hex');
      user.verificationToken = verificationToken;

      const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
      await sendEmail({
        email,
        subject: 'Email Change Verification',
        message: `Please verify your new email: \n\n ${verifyUrl}`
      });
    }

    await user.save();
    res.status(200).json({ 
      success: true, 
      message: email && email !== req.user.email ? 'Profile updated. Please verify your new email.' : 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Update password
// @route   PUT /api/user/password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
