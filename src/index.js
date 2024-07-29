// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";


//as early as possible import and configure dotenv
dotenv.config({
  path: './env'
})


//async function returns a promise
connectDB()
  .then(() => {
//our application mongo db ka use karke listen karna start nahi kiya tha jo ki ab hoga
   
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is listening at port : ${process.env.PORT || 8000} `);
    })
  })
  .catch((err) => {
    console.log("MONGODB CONNECTION FAILED!!", err);
  })












/*
import express from "express"

const app = express();
//iife
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

    This line attaches an event listener to the Express application instance app
    app.on("error", (error) => {
      console.log("ERROR", error)
      throw error
    })

    app.listen(process.env.PORT,()=>{
      console.log(`App is listening at port ${process.env.PORT}`);
    })

  } catch (error) {
    console.error("ERROR: ", error)
    throw err
  }
})()
  */