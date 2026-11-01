import express from "express";
import cors from "cors";
import path from "path";

// ── Route Imports ─────────────────────────────────────────────────────────────
import authroutes from "./routes/authRoutes.js";
import authbuildingroutes from "./routes/authbuildingRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import studentroutes from "./routes/studentRoutes.js";
import studentDocumentRoutes from "./routes/studentDocuments.js";

import institutionroutes from "./routes/institutionRoutes.js";
import institutionbuildingroutes from "./routes/InstitutionbuildingRoutes.js";
import courseroutes from "./routes/courseRoutes.js";

import scholarshiproutes from "./routes/scholarshipRoutes.js";
import applicationroutes from "./routes/applicationRoutes.js";

import superadminroutes from "./routes/superAdminRoutes.js";
import provinceadminroutes from "./routes/provinceAdminRoutes.js";
import programOfferingRoutes from "./routes/programOfferingRoutes.js";

import locationroutes from "./routes/locationRoutes.js";
import bookmarkroutes from "./routes/bookmarkRoutes.js";
import notificationroutes from "./routes/notificationRoutes.js";
import documentTypeRoutes from "./routes/documentTypes.js";

const app = express();

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors());

// Payload size limits for file uploads/base64 forms
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving for uploads (avatars, documents, logos)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── API Routes ────────────────────────────────────────────────────────────────

// Authentication
app.use("/api/auth", authroutes);
app.use("/api/authbuild", authbuildingroutes);

// User Profile & Avatars
app.use("/api/user", userRoutes);

// Students & Documents
app.use("/api/student", studentroutes);
app.use("/api/student/documents", studentDocumentRoutes);

// Institutions & Courses
app.use("/api/institution", institutionroutes);
app.use("/api/institution", courseroutes);
app.use("/api/instituionall", institutionbuildingroutes); // Legacy spelling for frontend compatibility
app.use("/api/institutionall", institutionbuildingroutes); // Corrected alias

// Scholarships & Applications
app.use("/api/scholarship", scholarshiproutes);
app.use("/api/application", applicationroutes);

// Governance & Administration
app.use("/api/super-admin", superadminroutes);
app.use("/api/province-admin", provinceadminroutes);
app.use("/api/admin", programOfferingRoutes);

// Auxiliary / Reference Data
app.use("/api/location", locationroutes);
app.use("/api/bookmarks", bookmarkroutes);
app.use("/api/notifications", notificationroutes);
app.use("/api/document-types", documentTypeRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;