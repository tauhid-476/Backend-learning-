import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    

    
    const {
        page = 1,
        limit = 10,
        query,
        sortBy,
        sortType,
        userId } = req.query
    //TODO: get all videos based on query, sort, pagination


    // page: The page number for pagination (defaults to 1).
    // limit: The number of items per page (defaults to 10).
    // query: A search term, likely used for filtering by title.
    // sortBy: The field to sort the results by (defaults to "createdAt").
    // sortType: The sort order, either "asc" (ascending) or "desc" (descending).

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const sortOrder = sortType === "asc" ? 1 : -1


    //searchQuery
    const searchQuery = []

    //if query exist , for example user is trying to fetch things using title or description
    //
    if (query) {
        searchQuery.push({
            $or: [
                //regex is basically the input from user. eg. he want to search video of a "cat"
                //options i is to ifnore case sensitivity
                { title: { $regex: query , $options: "i"} },
                { description: { $regex: query , $options: "i"} }
            ]
        })
    }

    // to get all videos of a speific user only
    // push a s owner
    if (userId) {
        searchQuery.push({
            owner: new mongoose.Types.ObjectId(userId)
        })
    }


    searchQuery.push({
        isPublished: true
    })

    //pipelines
    const aggregateQuery = [
        {
            $match: searchQuery.length > 0 ? { $and: searchQuery } : {}
        },
        {
            $sort: {
                [sortBy]: sortOrder
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user",
                pipeline: [

                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$user"
                }
            }
        },
        {

            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                owner: 1,
                duration: 1,
                views: 1,
                videoFile: 1
            }
        }
    ]


    const totalCount = await Video.countDocuments(
        searchQuery.length > 0 ? { $and: searchQuery } : {}
    )

    const videos = await Video.aggregate(aggregateQuery)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    videos,
                    pagination: {
                        page: pageNumber,
                        limit: limitNumber,
                        totalCount,
                        totalPages: Math.ceil(totalCount / limitNumber)
                    }
                },
                "Videos Fetched successfully"
            )
        )



})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title || title.length === 0) {

        throw new ApiError(400, "Title can't be empty")
    }

    if (!description || description.length === 0) {

        throw new ApiError(400, "Description can't be empty")
    }


    let thumbnailLocalPath = req.files?.thumbnail[0].path;
    let videoFileLocalPath;

    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {

        videoFileLocalPath = req.files.videoFile[0].path
    }


    if (!videoFileLocalPath) {
        throw new ApiError(400, "No video found")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "No thumbnail found")
    }

    const video = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)


    if (!video) {
        throw new ApiError(400, "Video is required")
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const uploadVideo = await Video.create({
        title: title,
        description: description,
        videoFile: video.url,
        thumbnail: thumbnail.url,
        duration: video.duration,
        owner: req.user._id,
        isPublished: true
    });

    if (!uploadVideo) {
        throw new ApiError(400, "Something went wrong while uploding video")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { uploadVideo },
                "Video uploaded successfully"
            )
        )


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id not found")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { video },
                "Video fetched successfully"
            )
        )


})

const updateVideoTitleAndDescription = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { oldTitle, oldDescription, newTitle, newDescription } = req.body
    //TODO: update video details like title, description, thumbnail

    //first title and description

    if (oldTitle.length === 0 || !oldTitle) {
        throw new ApiError(400, "Title doesnt exist");
    }

    if (oldDescription.length === 0 || !oldDescription) {
        throw new ApiError(400, "Description doesnt exist");
    }

    const video = await Video.findById(videoId);


    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "Only Owner can change details");
    }
    console.log(video.owner)
    console.log(req.user._id)

    const updateTitleAndDescription = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                oldTitle: newTitle,
                oldDescription: newDescription
            }
        },
        { new: true }
    )

    if (!updateTitleAndDescription) {
        throw new ApiError(400, "Something went wrong while updating details");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { updateTitleAndDescription },
                { newTitle, newDescription },
                "Title and Description updated successfully"
            )
        )
})

const updateVideoThumbnail = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thhumbnail file is missinhg")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id not found")
    }
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }


    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "Only Owner can change Thumbnail");
    }

    const oldThumbnailUrl = video?.thumbnail
    //file and not files cuz we only dealing with a single one

    //first delete the older one then upload the new one

    if (oldThumbnailUrl) {
        await deleteFromCloudinary(oldThumbnailUrl)
    }
    //now updating the new one

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
        throw new ApiError(400, "Thumbnail not found");
    }

    const updatedThumbnail = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url
            }
        },
        { new: true }
    )

    if (!updatedThumbnail) {

        throw new ApiError(400, "Something went wrong")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { updatedThumbnail },
                "Thumbnail updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video doesnt exist")
    }

    const video = await Video.findById(videoId)

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "Only owner of the video can delete the video")
    }


    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if (!deletedVideo) {
        throw new ApiError(400, "Something went wrong while deletiing the video")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { deletedVideo },
                "Video deleted successfully"
            )
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video doesnt exist")
    }

    const video = await Video.findById(videoId)


    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "Only owner of the video can delete the video")
    }

    const toggle = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                //toggle means the other way around
                isPublished: !video.isPublished
            }
        },
        { new: true }
    )

    if (!toggle) {
        throw new ApiError(400, "Something went wrong")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { toggle },
                "Publish Toggle success"
            )
        )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoTitleAndDescription,
    updateVideoThumbnail,
    deleteVideo,
    togglePublishStatus
}