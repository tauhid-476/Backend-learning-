//very usable code can be use in many projects
import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from "fs"


    // Configuration
    //it ggives permission to  upload file
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET

    })


const uploadOnCloudinary = async (localFilePath)=>{

  try {
    if(!localFilePath) return null

    //upload file on cloudinary
  
    const response = await cloudinary.uploader.
    upload(localFilePath,{
      resource_type:"auto"
    })
    // console.log("File is beem uploaded successfully",response.url);
    fs.unlinkSync(localFilePath)
    //unlick after been successfully uploaded
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath)
    //remove the locally saved temp file as upload opern got failed
    return null
  }

}

export {uploadOnCloudinary}