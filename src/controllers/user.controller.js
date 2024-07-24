import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
// asyncHandler: This utility wraps the async function, automatically catching any errors that might occur and passing them to the next middleware. This is typically used to avoid repetitive try-catch blocks in each route handler.



//no async handler since its not a web request
const generateAccessAndRefreshTokens = async(userId)=>{
  try {
   const user =  await User.findById(userId)
   const accessToken = user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()

   //store the refresh token in database
   user.refreshToken = refreshToken
   //save the user 
  //  user.save()
   //since many fields are required  true, therefore it will give error
   await user.save({ validateBeforeSave : false })
   
   return {
    accessToken,
    refreshToken
   }



  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token")
  }
}
//this fn will grant the tokens to the user when the userId is passed

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
  const {fullName, email, username, password} = req.body
  console.log("email :",email)

  //2
  /*
  if(fullName === ""){
    throw new ApiError(400,"fullName is required")
  }
  in this way u can check for every field using multiple if conditions
  better practice below
  */

  //.some==> if anyone field success the fn in it, it returns true
  // here if anyone of the field is empty it return true and follwing condition is executed
 if( 
  [fullName, email, username, password].some((field)=>field?.trim() === "")
  
  ){
    throw new ApiError(400,"All fields are required")
  }


  //3 
 // find wrt both username and email
 //
 const existedUser = await User.findOne({
  //if anyone (username or email) is found throw error
    $or: [{ username }, { email }]
  })
 

  if(existedUser){
    throw new ApiError(409,"User already exists with following username or email")
  }

  //4  
  //optional chaining to safely access the path of the first uploaded file.
  // console.log(req.files);
  //it is an array of object containinf information about the image at index 0
  const avatarLocalPath = req.files?.avatar[0]?.path;
  
  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  //at line 72 , we know its an array . Check if the same array exist or not for the coverimage
  let coverImageLocalPath;
  // Array.isArray method is used to determine whether a given value is an array. 
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){

    coverImageLocalPath = req.files.coverImage[0].path
  }

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
        fullName,
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


const loginUser = asyncHandler ( async(req,res)=>{

  //take all data from req,body
  // see username or email
  //check if user exists or not
  //check password
  //generate access and refresh token
  //send these tokens iin  form of cookies(secure cookies)

  //1
  const {email,username,password} = req.body;
  //2
  if (!username || !email){
    throw new ApiError(400,"Username and email is required");
  }

  //3
 const user = await User.findOne({
    //mongodb operators
    $or:[{username,email}]
  })
  if(!user){
    throw new ApiError(404,"User does not exist")
  }
  //remembr when used User , the method are been used which are provided by mongoose mongodb
  //when used user, the method which we have made are used
  //4

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid password")
  }

  //5 many times used

  const{accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

  //6
  //since the current user's info can b accessible take the logged in user
  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken")

  //now send cookies . Done thru some options
  const options = {
    httpOnly : true,
    secure: true,
    //can only me modifiable by server
  }

  //The .cookie() method in Express is a powerful way to set cookies with various properties and options to ensure secure and appropriate cookie handling in your web application. 
  //login => store the data
  return res
  .status(200)
  .cookie("accesToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
        //here sending tokens again cuz if user tries to save cookie on thier own
      },
      "User logged in successfully"
    )
  )


})

const logoutUser = asyncHandler(async(req, res)=>{

  //clear cookies cuz its only managed by server
  //i dont have access of user here thats why we creae a custom middleware
  const userId = req.user._id
  //after getiing the user, bring the whole object of user and clear all the cookies
  // const user = await User.findById(userId)
  //better approach below
  await User.findByIdAndUpdate(
    req.user._id,
  {
    //what to update 
    //use mongodb operators
    $set: {
      refreshToken: undefined
    }

  }
)
//token is gone from db now clear he cookies
const options ={
  httpOnly : true,
  secure: true
}
  return res
  .status(201)
  .clearCookies("accessToken",options)
  .clearCookies("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User logged out successfully")
  )
})

export { 
  registerUser,
  loginUser,
  logoutUser
}