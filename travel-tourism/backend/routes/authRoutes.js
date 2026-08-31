const express = require('express');
const { registerTourist, registerGuide, registerPhotographer, registerAdmin, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register/tourist', registerTourist);
router.post('/register/guide', registerGuide);
router.post('/register/photographer', registerPhotographer);
router.post('/register/admin', registerAdmin);

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
