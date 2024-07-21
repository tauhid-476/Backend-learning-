import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
// asyncHandler: This utility wraps the async function, automatically catching any errors that might occur and passing them to the next middleware. This is typically used to avoid repetitive try-catch blocks in each route handler.



//***
const registerUser = asyncHandler( async(req, res)=>{
  //first identify the steps

  //1)get users details from frontend
  //which details is to be taken is decided by the data models


  //2)validation if detials are in correct form or not or not empty

  //3)check if users already exists(using email,username)

  //4)Check for images and avatar

  //5)Upload them to cloudinary,check for avatar whether multer did the job correctly or not


  //6)create user object - create entry in db
  // cuz in nosql mainly objects are made and uploaded

  //7)Remove passsword and ref token field from response

  //8) Check for user creation 

  //9)return res

  //1 data mainly comes from req.body
  const {fullname, username, email, password} = req.body
  console.log("email :",email)

  //2
  /*
  if(fullname === ""){
    throw new ApiError(400,"fullname is required")
  }
  in this way u can check for every field using multiple if conditions
  better practice below
  */
 if( 
  [fullname, username, email, password].some((field)=>field?.trim() === "")
  //.some==> if anyone field success the fn it return true
  // here if anyone of the field is empty it return true and follwing condition is executed
  ){
    throw new ApiError(400,"All fields are required")
  }


  //3 
 // find wrt both username and email
 const existedUser = User.findOne({
    $or: [{ username }, { email }]
  })

  if(existedUser){
    throw new ApiError(409,"User already exists with following username or email")
  }

  //4  
  //optional chaining to safely access the path of the first uploaded file.
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
  }

  //5

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  //since avatar is a required true field
  if(!avatar){
    throw new ApiError(400,"Avatar file is required")
  }

  //6
  //user can talk to db
  //main 2 points while talking to db
  // try catch and async await
  //try cath is already caught up using asyncHandler
    const user =  await User.create({
        fullname,
        avatar: avatar.url,//db mai only url store karo
        coverImage: coverImage?.url || "",
        //since we didnt checked for it existence also it is not required true
        email,
        password,
        username: username.toLowerCase()
        //after creating this object always check the data model ki every field is been considered or not
      })

      //check if user exists or not
      //the data creatded in this object is not this much only.Mongodb always add a "_id" field with all entries
      //7
      const createdUser = await User.findById(user._id).select(
        //select things which u want and put - for which u do not want
        "-password -refreshToken"
      )
      //8
      if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user")
      }

      //9

      return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
      )


} )

//this method should run when a url is hit

export { 
  registerUser,
}