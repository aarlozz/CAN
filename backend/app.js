import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authroutes from "./routes/authRoutes.js";
import institutionroutes from "./routes/institutionRoutes.js";
import authbuildingroutes from "./routes/authbuildingRoutes.js";
import institutionbuildingroutes from "./routes/InstitutionbuildingRoutes.js";
import studentroutes from "./routes/studentRoutes.js";
import locationroutes from "./routes/locationRoutes.js";
import scholarshiproutes from "./routes/scholarshipRoutes.js";
import applicationroutes from "./routes/applicationRoutes.js";
import superadminroutes from "./routes/superAdminRoutes.js";
import provinceadminroutes from "./routes/provinceAdminRoutes.js";
import bookmarkroutes from "./routes/bookmarkRoutes.js";
import notificationroutes from "./routes/notificationRoutes.js";
import courseroutes from "./routes/courseRoutes.js";
import userroutes from "./routes/userRoutes.js"; // avatar endpoints
import programOfferingRoutes from "./routes/programOfferingRoutes.js"; // adjust path
import documentTypeRoutes from "./routes/documentTypes.js";
import studentDocumentRoutes from "./routes/studentDocuments.js";
import userRoutes from "./routes/userRoutes.js";




const app = express();

app.use(cors());
// 1. Serve uploaded files as static assets — this is what makes the
//    avatar URLs (e.g. http://localhost:5000/uploads/avatars/<id>/<file>)
//    actually load in the browser.
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 2. Mount the new route
app.use("/api/user", userRoutes);

/* =========================================================
   🔥 FIX: PayloadTooLargeError
   ---------------------------------------------------------
   Default Express limit is very small (~100kb - 1mb).
   If frontend sends large JSON (images, base64, forms),
   it crashes BEFORE reaching Multer.

   Solution: increase body size limit.
========================================================= */

// FIXED: Increased JSON payload limit
app.use(express.json({ limit: "10mb" }));

// FIXED: Increased URL-encoded payload limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================================================
   STATIC FILES — serves uploaded avatars/documents
   e.g. GET /uploads/avatars/<userId>/<file>
========================================================= */
app.use("/uploads", express.static("uploads"));

/* =========================================================
   ROUTES
========================================================= */

app.use("/api/auth", authroutes);
app.use("/api/institution", institutionroutes);
app.use("/api/authbuild", authbuildingroutes);
app.use("/api/instituionall", institutionbuildingroutes);
app.use("/api/student", studentroutes);
app.use("/api/location", locationroutes);

app.use("/api/scholarship", scholarshiproutes);
app.use("/api/application", applicationroutes);
app.use("/api/super-admin", superadminroutes);
app.use("/api/province-admin", provinceadminroutes);
app.use("/api/bookmarks", bookmarkroutes);
app.use("/api/notifications", notificationroutes);

app.use("/api/institution", courseroutes);
app.use("/api/user", userroutes); // avatar endpoints
app.use("/api/document-types", documentTypeRoutes);
app.use("/api/student/documents", studentDocumentRoutes);


app.use("/api/admin", programOfferingRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;