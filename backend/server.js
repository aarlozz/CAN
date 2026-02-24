// Server entry point


// server.js
const app = require("./app");
const connectionDM = require("./config/db");
const Institutional = require("./models/Instutional");
require("dotenv").config();


connectionDM();

const PORT = process.env.PORT ;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});