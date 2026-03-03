// Server entry point

const app = require("./app");
const connectDB = require("./config/db");
require("dotenv").config();

// ─────────────────────────────────────────
// Connect to MongoDB then start server
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;   // fallback to 5000 if .env PORT is missing

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  });