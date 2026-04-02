
// esle .env ma vako environment variable lai load garna help garxa
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());           
app.use(express.json());