const express = require('express');
const DestinationPhoto = require('../models/DestinationPhoto');
const LocalObservation = require('../models/LocalObservation');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  getAllUsers, 
  getPendingGuides, 
  getPendingPhotographers, 
  getPendingAdmins,
  approveGuide, 
  rejectGuide, 
  approvePhotographer, 
  rejectPhotographer, 
  suspendUser, 
  activateUser 
} = require('../controllers/adminController');

const router = express.Router();

// Enforce ADMIN role requirement for all admin routes
router.use(protect, authorize('ADMIN'));

// User Management
router.get('/users', getAllUsers);
router.get('/guides/pending', getPendingGuides);
router.get('/photographers/pending', getPendingPhotographers);
router.get('/admins/pending', getPendingAdmins);

// Guide / User Approval / Rejection
router.patch('/guides/:id/approve', approveGuide);
router.patch('/guides/:id/reject', rejectGuide);
router.patch('/users/:id/approve', approveGuide);
router.patch('/users/:id/reject', rejectGuide);

// Photographer Approval / Rejection
router.patch('/photographers/:id/approve', approvePhotographer);
router.patch('/photographers/:id/reject', rejectPhotographer);

// Suspend / Activate User
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/activate', activateUser);

// Legacy Photo / Observation Verification
router.get('/pending', async (req, res) => {
  try {
    const photos = await DestinationPhoto.find({ status: 'Pending Verification' }).populate('uploaderId destinationId');
    const observations = await LocalObservation.find({ status: 'Pending Verification' }).populate('reporterId destinationId');
    res.json({ success: true, data: { photos, observations } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/photo/:id/verify', async (req, res) => {
  try {
    await DestinationPhoto.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/observation/:id/verify', async (req, res) => {
  try {
    await LocalObservation.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
