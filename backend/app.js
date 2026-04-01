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