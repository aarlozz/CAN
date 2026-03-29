import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authroutes from "./routes/authRoutes.js";
import institutionroutes from "./routes/institutionRoutes.js";
import authbuildingroutes from "./routes/authbuildingRoutes.js";
import institutionbuildingroutes from "./routes/InstitutionbuildingRoutes.js";
import studentroutes from "./routes/studentRoutes.js"; // ✅ new

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authroutes);
app.use("/api/institution", institutionroutes);
app.use("/api/authbuild", authbuildingroutes);
app.use("/api/instituionall", institutionbuildingroutes);
app.use("/api/student", studentroutes); // ✅ new — GET /api/student/dashboard-student

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;