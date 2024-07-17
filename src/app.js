import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
//Cookies are small pieces of data that are stored on a user's device (computer, smartphone, etc.) by a web browser while browsing a website
// Parsing is the process of analyzing structured data according to a defined syntax or grammar, typically to extract meaningful information or to transform it into a usable format.

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

//data coming from url
app.use(express.urlencoded({extended:true,limit:"16kb"}))
//to store images/pdf on our server
app.use(express.static("public"))

//to access the cookies of user's browser and to set them ===> use of cookie parser
app.use(cookieParser())


export { app }