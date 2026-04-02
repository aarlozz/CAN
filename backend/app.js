import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authroutes from "./routes/authRoutes.js";
import institutionroutes from "./routes/institutionRoutes.js";
import authbuildingroutes from "./routes/authbuildingRoutes.js";
import institutionbuildingroutes from "./routes/InstitutionbuildingRoutes.js";
import studentroutes from "./routes/studentRoutes.js";
import locationroutes from "./routes/locationRoutes.js";
import scholarshiproutes from "./routes/scholarshipRoutes.js";
import applicationroutes from "./routes/applicationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

<<<<<<< HEAD
// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────
app.use('/api/auth',          authRoutes);      // POST /api/auth/register/student|college, /login, /logout
app.use('/api/locations',     locationRoutes);  // GET  /api/locations/provinces|districts|municipalities
app.use('/api/college',       collegeRoutes);   // GET/PUT /api/college/profile, /list, /:id
app.use('/api/student',       studentRoutes);   // GET/PUT /api/student/profile, documents
app.use('/api/scholarships',  scholarshipRoutes); // GET /api/scholarships, POST, PUT, DELETE
app.use('/api/applications',  applicationRoutes); // POST /api/applications, GET /my, PUT /:id/review
app.use('/api/admin',         adminRoutes);       // GET /api/admin/colleges/pending, stats
app.use('/api/notifications', notificationRoutes); // GET /api/notifications, PUT /read-all, /:id/read

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
=======
app.use("/api/auth", authroutes);
app.use("/api/institution", institutionroutes);
app.use("/api/authbuild", authbuildingroutes);
app.use("/api/instituionall", institutionbuildingroutes);
app.use("/api/student", studentroutes);
app.use("/api/location", locationroutes);

// FIX: was "/api/scholarships" (plural) — every single frontend call and every
// controller comment uses "/api/scholarship" (singular). This one typo caused
// ALL scholarship API calls across the entire app to return 404, breaking:
//   - scholarshipList page ("Failed to load scholarships")
//   - institution dashboard ("Failed to load dashboard" via Promise.all crash)
//   - student dashboard (empty scholarships tab)
//   - scholarship detail page (blank on load)
//   - apply form (all submissions failed)
app.use("/api/scholarship", scholarshiproutes);

app.use("/api/application", applicationroutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
>>>>>>> e1fa25b551d5fdef7fb993a20ed4a57e87c8f083
