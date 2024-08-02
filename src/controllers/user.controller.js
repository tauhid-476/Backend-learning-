import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

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

 //if it exists then uska path leke cloudinary pe upload kardo

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
  console.log(email);
  //2
  if (!username && !email){
    throw new ApiError(400,"Username or email is required");
  }

  //3
 const user = await User.findOne({
    //mongodb operators
    $or:[{username},{email}]
  })
  if(!user){
    throw new ApiError(404,"User does not exist")
  }
  //remembr when used User , the method are been used which are provided by mongoose mongodb
  //when used user, the method which we have made in models are used.
  //4

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid password")
  }

  //5 many times used /***

  const{accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

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
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
        //here sending tokens again cuz if user tries to save tokrns on thier own
      },
      "User logged in successfully"
    )
  )


})

const logoutUser = asyncHandler(async(req, res)=>{

  //clear cookies cuz its only managed by server
  //i dont have access of user here thats why we creae a custom middleware

  //after getiing the user, bring the whole object of user and clear all the cookies
  // const user = await User.findById(userId)
  //better approach below 
  await User.findByIdAndUpdate(
    req.user._id,
  {
    //what to update 
    //use mongodb operators
    // $set: {
    //   refreshToken: undefined
    // }
    //better approach
    //unset things . Assign the flag 1 to which u want to unset
    $unset: {
      refreshToken: 1
    }

  },
  {
    new: true
    //new: true: This option ensures that the modified document is returned.
  }
)
//token is gone from db now clear the cookies
const options ={
  httpOnly : true,
  secure: true
}
  return res
  .status(201)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User logged out successfully")
  )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401,"Invalid refresh token");
    }
    //now there are two refresg tokens . One is the here and the one is saved in data base in user
  
    if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401,"Refresh token is expird or used")
    }
  
    //if they matches , generate and send tokens
    const options = {
      httpOnly:true,
      secure:true
    }
  
    const {accessToken , newRefreshToken}  = await generateAccessAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken:newRefreshToken
        },
        "Access token refreshed"
  
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message||"Invalid refresh token")
    
  }



})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
  const {oldPassword, newPassword} = req.body;

  const user = await User.findById(req.user?._id)
  //since isPasswordcorrect is a async function
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  //this will return true or false
  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid password")
  }

  user.password = newPassword;
  //we have set this value in this object.This needs to be saved too

   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(
    new ApiResponse(200,{},"Password changed successfully")
   )
})

//give current user in response using the middleware we created
const getCurrentUser = asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      req.user,
      "Current user fetched successfully"
    )
  )
})


//updating text based data
const updateAccountDetails = asyncHandler(async(req, res)=>{

  const {fullName, email} = req.body;
  if(!fullName || !email){
    throw new ApiError(201,"All Field required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      //mongodb opertors
      $set: {
        // fullName:fullName,
        // email:email
        fullName,
        email
      }
    },
    {new: true}
  //you get that info after updating
  ).select("-password")

  return res
  .status(200)
  .json( new ApiResponse(200,user,"Account details updated successfully"))



})

//updsting file based data
const updateUserAvatar = asyncHandler(async(req, res)=>{

  //files=> used when two images avatar and coverImage
  //file=> only avatar discussion is done here
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
  throw new ApiError(400,"Avatar file is missing")
  }
//TODO:delete old image
   const user = await User.findById(req.user._id)


  if (!user) {
    throw new ApiError(404, "User not found");
  }

   const oldAvatarUrl = user?.avatar
   
   if(oldAvatarUrl) {
    await deleteFromCloudinary(oldAvatarUrl); 
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
    
  if(!avatar.url){
    throw new ApiError(400,"Error while uploading on avatar")
  }

 const updatedUser = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
    avatar: avatar.url
    //avatar is the whole objet we get in response from cloudinary 
    //update only the url
    }
  },
  {new:true}
).select("-password")

    return res
    .status(200)    
    .json(
    new ApiResponse(200, updatedUser, "Avatar updated succesfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res)=>{

  const coverImageLocalPath = req.file?.path
  
  if(!coverImageLocalPath){
    throw new ApiError(400,"Cover image file is missing")
    }

    //TODO: delete old image
      const user = await User.findById(req.user._id)


      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const oldCoverImageUrl = user?.coverImage
      
      if(oldCoverImageUrl) {
        await deleteFromCloudinary(oldCoverImageUrl); 
      }
  
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
      
    if(!coverImage.url){
      throw new ApiError(400,"Error while uploading on avatar")
    }
  
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
        coverImage: coverImage.url
        //avatar is the whole objet we get in response from cloudinary 
        //update only the url
        }
      },
      {new:true}
    ).select("-password")
    return res
    .status(200)    
    .json(
    new ApiResponse(200, updatedUser, "Cover image updated succesfully")
    )
})

//
const getUserChannelProfile = asyncHandler(async(req,res)=>{
  
  //channel's info get accesss when we hit its url
  const {username} = req.params
  if(!username?.trim()){
    throw new ApiError(400,"Username not present")
  }

  // User.find({username})
  //no need to do this since we have match method in aggregation pipelinr
  const channel = await User.aggregate([

        {
          $match: {
            username: username?.toLowerCase()
          }
        },
        {
          //user's subscribers
          //susbcribers ke liye channel ka doc
          
          $lookup: {
            from: "subscriptions",
            //since we are writting aggregatipn piepline , all the field in database are converted 
            //into lowwercase and plural
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
          }
        },
        {
          //user's subscribed to
          //subscribed  ke liye same user(subscriber) ka doc
          $lookup: {
            from: "subscriptions",   
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"

          }
        },
        {
          
          //adding  more field to user object
          $addFields: {
            //basically counting all the document to get subscirbers count and subscirbed to
            subscribersCount: {
              $size: "$subscribers"
            },
            subscribedToCount: {
             $size: "$subscribedTo"
            },
            isSubscribed: {
              //check if in the subscibers document user is present or not . If yes display subscribed else no
               $cond: {
              //$in check both in arrays and objevts , first it taks
                if: {$in : [req.user?._id,"$subscribers.subscriber"]},
                then: true,
                else: false
               }
            }
          }
        },
        {
           //selected things only for further  operatio
          $project: {
            //assign all the field the valeu of 1 whichever u want to passs
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            subscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1,
          }
        }

  ])

  if (!channel?.length) {
    throw new ApiError(404,"Channel doesnt exist")
  }
  //This condition is true if channel is null, undefined, or an empty array (or string, depending on the context).

  return res
  .status(200)
  .json(
    new ApiResponse(200, channel[0],"User channel fetched successfully")
  )
})

const getWatchHistory = asyncHandler(async(req,res)=>{

  //req.user._id it gives a string in responsde not a unique id 
  // when we use mongoose and use methods like findBy id , mongoose automatically converts it into a mongoDb id

  const user = await User.aggregate([
    {
      $match: {
      _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
       from: "videos",
       localField: "watchHistory",
       foreignField: "_id",
       as: "watchHistory",
       //i aint getting the user . add apipelien which will look from users and get me the data
       pipeline:[
            {
              $lookup: {
                from:"users",
                localField: "owner",
                foreignField:"_id",
                as: "owner",
                //add one more pipeline to get relevent data only
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1
                    }
                  }
                ]
              }
            },
            {
              //The way we have written pipeliens it gives response in array at first position
              //its not a good approach
              //add a owner field here which
              $addFields: {
                owner: {
                  $first: "$owner"
                }
              }
            }
       ]
      }
    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "Watch history fetched succesfully")
  )
})



export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}