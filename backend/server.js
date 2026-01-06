// Server entry point


// server.js
const app = require("./app");
const connectionDM = require("./config/db");
const User = require("./models/User");
require("dotenv").config();


connectionDM();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});