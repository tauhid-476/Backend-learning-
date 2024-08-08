import mongoose,{isValidObjectId} from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    let pageNumber = parseInt(page,1);
    let limitNumber = parseInt(limit,10);

    if(isNaN(pageNumber) || pageNumber<1){
        pageNumber = 1;
    }

    if(isNaN(limitNumber) || limitNumber<1){
        limitNumber = 10;
    }

    if(!isValidObjectId(videoId)||!videoId){
        throw new ApiError(400, "Video id not found")
    }

    try {

        const comments = await Comment
        //find karo usi video ke liye
        .find({video: videoId})
        //sort karo as latest comments -1==>latest first
        .sort({createdAt: -1})
        //skip to the page number which user provides
        .skip((pageNumber-1)*limitNumber)
        .limit(limitNumber)
        .populate("owner", "username avatar")

        //populate owner ki field mai usuall userId hoti hai. populate senpoora doc aajayega
        // usmai bhi bas username aur avatar hi consider karo
        //.populate(field to populate, fields to show)

        const numberOfComments = await Comment.countDocuments({video: videoId})

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    comments,
                    pagination: {
                        page: pageNumber,
                        limit: limitNumber,
                        totalCount: numberOfComments,
                        totalPages: Math.ceil(numberOfComments/limitNumber)
                    }
                },
                "Comments fetched successfully"
            )
        )
        
    } catch (error) {
        throw new ApiError(500, "Server error")
    }
   
})


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    //find video jispe comment karna hai
    //create an object and send response
    const { videoId } = req.params;
    const { content } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id
    })
    if (!comment) {
        throw new ApiError(400, "Something went wrong")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { comment },
                "Comment created successfully"
            )
        )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { newComment } = req.body

    if(newComment.trim().length===0||!newComment){
        throw new ApiError(400, "Comment cannot be empty")
    }

    const verifyComment = await Comment.findById(commentId)
    if(!verifyComment){
        throw new ApiError(400, "Comment not found")
    }

    if(verifyComment?.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400, "Only owner can update the comment")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:newComment
            }
        },
        { new: true }
    )
    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { comment },
                "Comment Updated successfully"
            )
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    const verifyComment = await Comment.findById(commentId)
    if(!verifyComment){
        throw new ApiError(400, "Comment not found")
    }

    if(verifyComment?.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400, "Only owner can delete the comment")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { comment },
                "Comment deleted successfully"
            )
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}