import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id not found")
    }

    //check if video already liked byy finding the video and liked by
    const videoAlreadyLiked = await Like.findOne({
        $and: [{ video: videoId }, { likeBy: req.user._id }]
    })
    //already like to unlike by deleting the doc
    // else like by creating the document

    if (videoAlreadyLiked) {
        await Like.findByIdAndDelete(
            videoAlreadyLiked?._id
        )
    } else {
        await Like.create({
            video: videoId,
            likeBy: req.user?._id
        })
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Like toggled successfully")
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment id not found")
    }

    //check if comment already liked by finding the comment and liked by
    const commentAlreadyLiked = await Like.findOne({
        $and: [{ comment: commentId }, { likeBy: req.user._id }]
    })
    //already like to unlike by deleting the doc
    // else like by creating the document

    if (commentAlreadyLiked) {
        await Like.findByIdAndDelete(
            commentAlreadyLiked?._id
        )
    } else {
        await Like.create({
            comment: commentId,
            likeBy: req.user?._id
        })
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Like toggled successfully")
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id not found")
    }

    //check if tweet already liked by finding the tweet and liked by
    const tweetAlreadyLiked = await Like.findOne({
        $and: [{ tweet: tweetId }, { likeBy: req.user._id }]
    })
    //already like to unlike by deleting the doc
    // else like by creating the document

    if (tweetAlreadyLiked) {
        await Like.findByIdAndDelete(
            tweetAlreadyLiked?._id
        )
    } else {
        await Like.create({
            tweet: tweetId,
            likeBy: req.user?._id
        })
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Like toggled successfully")
        )
}
)

const checkVideoLiked = asyncHandler(async (req, res) => {
    //TODO: check if video is liked
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id not found")
    }   

    const videoLikeOrNot = await Like.findOne({
        $and: [{ video: videoId }, { likeBy: req.user._id }]
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, { videoLikeOrNot}, "Like checked successfully")
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

     const likedVideos = await Like.aggregate([
        {
            $match:{
                likeBy: req.user?._id
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideos"
            }
        },

        {
            $addFields: {
                totalLikedVideos:{
                    $size: "$likedVideos"
                }
            }
        },
        {
            $project:{
                likeBy:1,
                likedVideos:1,
                totalLikedVideos:1


                
            }
        }
     ])    
     if(!likedVideos||likedVideos.length===0){
        throw new ApiError(400,"Sometihng went wrong")
     }

     return res.status(200)
     .json(
        200,
        new ApiResponse(
            200,
            {likedVideos},
            "Liked Videos Fetcjed successfullly"
        )
     )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    checkVideoLiked,
    getLikedVideos
}