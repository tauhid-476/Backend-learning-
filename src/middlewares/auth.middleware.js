//will only verify if user is there or not

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async(req, res, next)=>{

  try {
    // to logout we will check thru tokens
    //sinnce we created cookies in user controller we will take it from there
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
  
    //user can send the token thru header section of postman where it is send in the format of 
    //Authorization : "Bearer <tokenString>"
    //replace "Bearer " (also see thereis a space) with an empty string since we are only interested in the token
    if(!token){
      throw new ApiError(401,"Unauthorized request")
    }
  
    //if this token exist ask jwt whetehr this tokens are legit or not
    //first token then the secret publickey which only server has the access to verify/decode
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id).select(
      " -password -refreshToken"
    )
    if(!user){
      //Discuss about frontend
      throw new ApiError(401,"Invalid access token")
    }
  
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token")
  }

})