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
import superadminroutes from "./routes/superAdminRoutes.js";
import provinceadminroutes from "./routes/provinceAdminRoutes.js";
import bookmarkroutes from "./routes/bookmarkRoutes.js";
import notificationroutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

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

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;