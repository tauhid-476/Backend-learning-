// require('dotenv').config({path: './env'})
import dotenv from "dotenv"


import connectDB from "./db/index.js";

dotenv.config({
  path: './env'
})

const port = process.env.PORT || 8000;
//async function returns a promise
connectDB()
  .then(() => {
//our application mongo db ka use karke listen karna start nahi kiya tha jo ki ab hoga
    app.on("error", (error) => {
      console.log("ERROR", error)
      throw error
    })

    app.listen(port, () => {
      console.log(`App is listening at port : ${port}`);
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