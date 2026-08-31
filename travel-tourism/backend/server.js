const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
console.log('API KEY PRESENT?', !!process.env.AI_API_KEY);

const app = express();

// Middleware
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : [];

const defaultLocalOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'https://goldenarrowtourism.com',
  'http://goldenarrowtourism.com',
];

const allowedOrigins = process.env.CLIENT_URL
  ? Array.from(new Set([...configuredOrigins, ...defaultLocalOrigins]))
  : '*';

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins === '*' || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

const path = require('path');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/intelligence', require('./routes/intelligenceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => {
  res.send({ status: 'ok', message: 'AI Tourism API is running' });
});

// Serve static frontend build assets
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('AI Tourism API is running. (Frontend dist index.html not found)');
    }
  });
});

const http = require('http');
const https = require('https');
const fs = require('fs');

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih_travel_tourism';

const startHttpServer = (targetPort) => {
  const server = http.createServer(app);
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
      console.log(`HTTP Port ${targetPort} in use/restricted, trying port ${targetPort + 1}...`);
      startHttpServer(targetPort + 1);
    } else {
      console.error('HTTP Server error:', err);
    }
  });
  server.listen(targetPort, () => {
    console.log(`HTTP Server running on port ${targetPort}`);
  });
};

const startHttpsServer = (targetPort) => {
  const keyPath = path.join(__dirname, 'key.pem');
  const certPath = path.join(__dirname, 'cert.pem');
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    const server = https.createServer(options, app);
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        console.log(`HTTPS Port ${targetPort} in use/restricted, trying port ${targetPort + 1}...`);
        startHttpsServer(targetPort + 1);
      } else {
        console.error('HTTPS Server error:', err);
      }
    });
    server.listen(targetPort, () => {
      console.log(`HTTPS Server running on https://localhost:${targetPort}`);
    });
  }
};

const ensureAdminExists = async () => {
  try {
    const User = require('./models/User');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@test.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: 'Platform Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN',
        status: 'APPROVED',
        phone: '+91 9876543210'
      });
      await admin.save();
    } else {
      admin.password = adminPassword;
      admin.role = 'ADMIN';
      admin.status = 'APPROVED';
      await admin.save();
    }
    console.log(`Admin account verified: ${adminEmail}`);
  } catch (err) {
    console.error('ensureAdminExists Error:', err.message);
  }
};

// Start HTTP Server immediately so Render health check always passes
startHttpServer(Number(PORT));
startHttpsServer(Number(HTTPS_PORT));

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connection successful');
    await ensureAdminExists();
  })
  .catch((error) => {
    console.log('MongoDB connection warning:', error.message);
    console.log('Server is running HTTP port cleanly.');
  });
