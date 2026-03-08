
import dotenv from "dotenv"
dotenv.config()

import app from "../backend/app.js"
import connectionDM from "../backend/config/db.js"


const PORT = process.env.PORT||5000

connectionDM();

app.listen(PORT, ()=> 
  
    {
  console.log(`server running on ${PORT}`)})





