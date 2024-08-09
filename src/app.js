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
import tweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import commentRouter from './routes/comment.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'
import likeRouter from './routes/like.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import playlistRouter from './routes/playlist.routes.js'
//routes declaration

app.use("/api/v1/users",userRouter)
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/playlist", playlistRouter);




// route name and konsa route call karna/

// https:localhost:8000/users/register

export { app }