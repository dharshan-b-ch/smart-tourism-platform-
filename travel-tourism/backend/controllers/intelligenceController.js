const DestinationPhoto = require('../models/DestinationPhoto');
const LocalObservation = require('../models/LocalObservation');
const GuideLocationUpdate = require('../models/GuideLocationUpdate');

// POST /api/intelligence/photo
exports.uploadPhoto = async (req, res) => {
  try {
    const { destinationId, imageUrl, description, location } = req.body;
    
    const photo = await DestinationPhoto.create({
      destinationId,
      uploaderId: req.user._id,
      uploaderRole: req.user.role || 'Contributor',
      imageUrl,
      description,
      location,
      status: 'Verified'
    });

    res.status(201).json({ success: true, data: photo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/intelligence/photos/:destinationId
exports.getTodayPhotos = async (req, res) => {
  try {
    const photos = await DestinationPhoto.find({
      destinationId: req.params.destinationId,
      status: { $ne: 'Rejected' }
    }).populate('uploaderId', 'name').sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/intelligence/photo/:id
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await DestinationPhoto.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const isOwner = photo.uploaderId.toString() === req.user._id.toString();
    const isAdmin = req.user.role && req.user.role.toUpperCase() === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this photo' });
    }

    await DestinationPhoto.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Photo successfully deleted/discarded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/intelligence/photos/manage/my
exports.getMyPhotos = async (req, res) => {
  try {
    const photos = await DestinationPhoto.find({ uploaderId: req.user._id })
      .populate('destinationId', 'name state')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/intelligence/photos/manage/all
exports.getAllPhotosAdmin = async (req, res) => {
  try {
    const photos = await DestinationPhoto.find()
      .populate('destinationId', 'name state')
      .populate('uploaderId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/intelligence/observation
exports.reportObservation = async (req, res) => {
  try {
    const { destinationId, category, location, description } = req.body;
    
    const obs = await LocalObservation.create({
      destinationId,
      reporterId: req.user._id,
      reporterRole: req.user.role || 'Guide',
      category,
      location,
      description,
      status: 'Verified'
    });

    res.status(201).json({ success: true, data: obs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/intelligence/observations/:destinationId
exports.getObservations = async (req, res) => {
  try {
    const obs = await LocalObservation.find({
      destinationId: req.params.destinationId,
      status: { $ne: 'Rejected' }
    }).populate('reporterId', 'name').sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: obs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GUIDE GPS PHOTO PROOF UPDATES ====================

// POST /api/intelligence/guide-location-update
exports.createGuideLocationUpdate = async (req, res) => {
  try {
    const { imageUrl, latitude, longitude, placeName, destinationId } = req.body;

    if (!imageUrl || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Photo image, latitude, and longitude are required.' });
    }

    const update = await GuideLocationUpdate.create({
      guideId: req.user._id,
      guideName: req.user.name,
      imageUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      placeName: placeName || 'Verified Guide Location',
      destinationId: destinationId || null,
      timestamp: new Date(),
      status: 'Verified'
    });

    res.status(201).json({ success: true, data: update });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/intelligence/guide-location-updates/all
exports.getAllGuideLocationUpdates = async (req, res) => {
  try {
    const updates = await GuideLocationUpdate.find()
      .populate('guideId', 'name email phone serviceLocation')
      .populate('destinationId', 'name state')
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/intelligence/guide-location-updates/my
exports.getMyGuideLocationUpdates = async (req, res) => {
  try {
    const updates = await GuideLocationUpdate.find({ guideId: req.user._id })
      .populate('destinationId', 'name state')
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/intelligence/guide-location-update/:id
exports.deleteGuideLocationUpdate = async (req, res) => {
  try {
    const item = await GuideLocationUpdate.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const isOwner = item.guideId.toString() === req.user._id.toString();
    const isAdmin = req.user.role && req.user.role.toUpperCase() === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this update' });
    }

    await GuideLocationUpdate.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'GPS location proof update deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
