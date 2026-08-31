const express = require('express');
const { 
  uploadPhoto, 
  getTodayPhotos, 
  deletePhoto, 
  getMyPhotos, 
  getAllPhotosAdmin, 
  reportObservation, 
  getObservations,
  createGuideLocationUpdate,
  getAllGuideLocationUpdates,
  getMyGuideLocationUpdates,
  deleteGuideLocationUpdate
} = require('../controllers/intelligenceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/photo', protect, authorize('admin', 'guide', 'contributor', 'photographer'), uploadPhoto);
router.delete('/photo/:id', protect, deletePhoto);
router.get('/photos/manage/my', protect, getMyPhotos);
router.get('/photos/manage/all', protect, authorize('admin'), getAllPhotosAdmin);
router.get('/photos/:destinationId', getTodayPhotos);

router.post('/observation', protect, authorize('admin', 'guide', 'contributor', 'photographer'), reportObservation);
router.get('/observations/:destinationId', getObservations);

// Guide GPS Location Updates
router.post('/guide-location-update', protect, authorize('admin', 'guide'), createGuideLocationUpdate);
router.get('/guide-location-updates/all', protect, authorize('admin'), getAllGuideLocationUpdates);
router.get('/guide-location-updates/my', protect, authorize('admin', 'guide'), getMyGuideLocationUpdates);
router.delete('/guide-location-update/:id', protect, deleteGuideLocationUpdate);

module.exports = router;
