import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// const createTweet = asyncHandler(async (req, res) => {
//     //TODO: create tweet
//     //get content and user
//     //create object and give response
//     const {content} = req.body
    
//     if(!content||content.trim().length===0){
//         throw new ApiError("Content is required", 400)
//     }

//     const user = await User.findById(req.user?._id)
//     if(!user){
//         throw new ApiError("User not found", 404)
//     }

//     const tweet = await Tweet.create({
//         content,
//         owner: user
//     })

//     if(!tweet){
//         throw new ApiError("Failed to create tweet", 500)
//     }

//     return res
//     .status(201)
//     .json(
//         new ApiResponse(
//             201,
//             {tweet},
//             "Tweet created successfully"
//         )
//     )


// })

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //get content and user
    //create object and give response
    const {content} = req.body
    if(!content||content.trim().length===0){
        throw new ApiError("Content is required", 400)
    }

    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError("User not found", 404)
    }

    const tweet = await Tweet.create({
        content,
        owner: user
    })

    if(!tweet){
        throw new ApiError("Failed to create tweet", 500)
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {tweet},
            "Tweet created successfully"
        )
    )


})


const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const userId = req.params.userId
    if(!isValidObjectId(userId)){
        throw new ApiError("Invalid user id", 400)

    }

    const user = await User.findById(userId)

    if(!user){
        throw new ApiError("User not found", 404)
    }
 
    //based on userId find all the tweets
    // and give response
    const allTweets = await Tweet.find({
        owner: userId
    })
    if(!allTweets){
        throw new ApiError("No tweets found", 404)
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {allTweets},
            "User Tweets fetched successfully"
        )
    )


})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    //from params get id and of the tweet u want to ypdate
    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError("Invalid tweet id", 400)

    }   

    if(!content && content.trim().length===0){
        throw new ApiError("Content is required", 400)  
    }

    const newTweet = await Tweet.findById(tweetId)
    if(!newTweet){
        throw new ApiError("Tweet not found", 404)
    }

    if(newTweet?.owner.toString()!==req.user?._id.toString()){
        throw new ApiError("Only owner can update the tweet", 400)
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content:content
            }
        },
        {new: true}
    )

    if(!updatedTweet){
        throw new ApiError("Failed to update tweet", 500)
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {updatedTweet},
            "Tweet updated successfully"
        )
    )




})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    // get the tweet u want to delte by findByIdAndDelete

    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError("Invalid tweet id", 400)
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {deleteTweet},
            "Tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}