import express from "express";
import cors from "cors";

import authbuildingroutes from "../backend/routes/authbuildingRoutes.js";
import institutionbuildingroutes from "../backend/routes/InstitutionbuildingRoutes.js";
import scholarshiproutes from "../backend/routes/Scholarshiproutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/authbuild", authbuildingroutes);
app.use("/api/instituion", institutionbuildingroutes);
app.use("/api/scholarship", scholarshiproutes);
// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;

///api/authbuild/signup
