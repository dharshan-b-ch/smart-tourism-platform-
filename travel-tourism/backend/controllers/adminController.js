const User = require('../models/User');

// Get all users with optional role filter
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role && role !== 'ALL') {
      filter.role = role.toUpperCase();
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get pending guide applications
exports.getPendingGuides = async (req, res) => {
  try {
    const pendingGuides = await User.find({ role: 'GUIDE', status: 'PENDING' }).select('-password');
    res.json({ success: true, count: pendingGuides.length, data: pendingGuides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get pending photographer applications
exports.getPendingPhotographers = async (req, res) => {
  try {
    const pendingPhotographers = await User.find({ role: 'PHOTOGRAPHER', status: 'PENDING' }).select('-password');
    res.json({ success: true, count: pendingPhotographers.length, data: pendingPhotographers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get pending admin applications
exports.getPendingAdmins = async (req, res) => {
  try {
    const pendingAdmins = await User.find({ role: 'ADMIN', status: 'PENDING' }).select('-password');
    res.json({ success: true, count: pendingAdmins.length, data: pendingAdmins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve Guide / User
exports.approveGuide = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'APPROVED' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Application approved successfully!', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject Guide / User
exports.rejectGuide = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'REJECTED' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Application rejected.', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve Photographer
exports.approvePhotographer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'APPROVED' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Photographer approved successfully!', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject Photographer
exports.rejectPhotographer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'REJECTED' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Photographer application rejected.', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Suspend User
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'SUSPENDED' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User suspended.', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Activate User
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'APPROVED' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User activated.', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
