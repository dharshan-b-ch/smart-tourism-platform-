const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Tourist Registration
exports.registerTourist = async (req, res) => {
  try {
    const { name, email, password, phone, preferredLanguage } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'TOURIST',
      status: 'APPROVED',
      phone,
      preferredLanguage: preferredLanguage || 'English'
    });

    res.status(201).json({
      success: true,
      message: 'Tourist registration successful!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Guide Registration (Starts in PENDING state)
exports.registerGuide = async (req, res) => {
  try {
    const { name, email, password, phone, serviceLocation, languages, experience, description, profileImage } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'GUIDE',
      status: 'PENDING',
      phone,
      serviceLocation,
      languages: Array.isArray(languages) ? languages : (languages ? languages.split(',') : []),
      experience,
      description,
      profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
    });

    res.status(201).json({
      success: true,
      message: 'Your guide account registration has been submitted and is currently PENDING admin approval.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Photographer Registration (Starts in PENDING state)
exports.registerPhotographer = async (req, res) => {
  try {
    const { name, email, password, phone, serviceLocation, photographyType, experience, description, profileImage } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'PHOTOGRAPHER',
      status: 'PENDING',
      phone,
      serviceLocation,
      photographyType,
      experience,
      description,
      profileImage: profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
    });

    res.status(201).json({
      success: true,
      message: 'Your photographer account registration has been submitted and is currently PENDING admin approval.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Registration (Starts in PENDING state until approved by platform admin)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'ADMIN',
      status: 'PENDING',
      phone,
      description: department ? `Admin Department: ${department}` : 'Platform Administrator Candidate'
    });

    res.status(201).json({
      success: true,
      message: 'Admin registration submitted successfully! Your account is currently PENDING approval by an existing platform administrator.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// General Login Endpoint with Role Verification & Status Handling
exports.login = async (req, res) => {
  try {
    const { email, password, targetRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found. Please check your details or register.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    const userRole = user.role.toUpperCase();

    // Check Role match if targetRole is requested
    if (targetRole && targetRole.toUpperCase() !== userRole) {
      return res.status(403).json({ 
        success: false, 
        message: `This account is registered as a ${userRole}, not an ${targetRole.toUpperCase()}. Please use the correct login portal.` 
      });
    }

    // Check Account Status
    if (user.status === 'PENDING') {
      return res.status(403).json({ 
        success: false, 
        message: `Your ${userRole.toLowerCase()} account is waiting for admin verification by a platform administrator.` 
      });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({ 
        success: false, 
        message: `Your ${userRole.toLowerCase()} application was not approved.` 
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been suspended. Please contact the administrator.' 
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        status: user.status,
        phone: user.phone,
        serviceLocation: user.serviceLocation,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
