import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"


const app = express();

//how to configure them (cookie parser and cors)?
//this happen after creation of app


//first cors cuz its easy
app.use(cors({
  //which origin will u allow
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({limit:"16kb"}))

//configuring the middleware to parse incoming JSON payloads with a size limit of 16 kilobytes.
// payload" refers to the data that is sent in the body of an HTTP request or response

//data coming from url
app.use(express.urlencoded({extended:true,limit:"16kb"}))
//to store images/pdf on our server
app.use(express.static("public"))

//to access the cookies of user's browser and to set them ===> use of cookie parser
app.use(cookieParser())


//bringing routes
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'

//routes declaration

app.use("/api/v1/users",userRouter)
app.use("/api/v1/video", videoRouter);
// route name and konsa route call karna/

// https:localhost:8000/users/register

export { app }