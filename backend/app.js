import express from "express";
import cors from "cors";

import dotenv from "dotenv";

import authbuildingroutes from "../backend/routes/authbuildingRoutes.js";
import institutionbuildingroutes from "../backend/routes/InstitutionbuildingRoutes.js";
import scholarshiproutes from "../backend/routes/Scholarshiproutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/authbuild", authbuildingroutes);
app.use("/api/institution", institutionbuildingroutes);
app.use("/api/scholarship", scholarshiproutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
