// app.js — Express application configuration

const express     = require('express');
const cors        = require('cors');
const authRoutes      = require('./routes/authRoutes');
const userRoutes      = require('./routes/userRoutes');
const locationRoutes  = require('./routes/locationRoutes');  // ✅ Step 4 — public location data
const collegeRoutes   = require('./routes/collegeRoutes');   // ✅ Step 5 — college profile
const studentRoutes   = require('./routes/studentRoutes');   // ✅ Step 6 — student profile + docs
const errorHandler    = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();

// ─────────────────────────────────────────
// CORS — only allow Vite frontend (dev) or production URL
// ─────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',          // Vite dev server
  process.env.FRONTEND_URL,         // production URL from .env
].filter(Boolean);                  // removes undefined if FRONTEND_URL not set

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin} not allowed`));
      }
    },
    credentials: true,              // allow Authorization header / cookies
  })
);

// ─────────────────────────────────────────
// Body Parsing
// ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────
app.use('/api/auth',          authRoutes);      // POST /api/auth/register/student|college, /login, /logout
app.use('/api/institutional', userRoutes);      // GET  /api/institutional/profile (placeholder)
app.use('/api/locations',     locationRoutes);  // GET  /api/locations/provinces|districts|municipalities
app.use('/api/college',       collegeRoutes);   // GET/PUT /api/college/profile, /list, /:id
app.use('/api/student',       studentRoutes);   // GET/PUT /api/student/profile, documents

// ─────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('✅ CAN API is running...');
});

// ─────────────────────────────────────────
// Global Error Handler — MUST be last
// Catches any error passed via next(err) or thrown inside asyncHandler
// ─────────────────────────────────────────
app.use(errorHandler);

module.exports = app;