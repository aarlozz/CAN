import express from "express";
import cors from "cors";

import authroutes from "../backend/routes/authRoutes.js";
import institutionroutes from "../backend/routes/institutionRoutes.js";
import authbuildingroutes from "../backend/routes/authbuildingRoutes.js"
import institutionbuildingroutes from "../backend/routes/InstitutionbuildingRoutes.js"

import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use("/api/auth", authroutes);
app.use("/api/institution", institutionroutes);
app.use("/api/authbuild", authbuildingroutes)
app.use("/api/instituionall", institutionbuildingroutes) 

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
