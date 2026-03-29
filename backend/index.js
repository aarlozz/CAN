
// esle .env ma vako environment variable lai load garna help garxa
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use.cors(cors())
app.use(express.json());
