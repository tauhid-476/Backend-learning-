import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!name||name.trim().length===0){
        throw new ApiError(400,"Name is required")
    }

    if(!description||description.trim().length===0){
        throw new ApiError(400,"Description is required")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playlist){
        throw new ApiError(400,"Playlist not created")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            {playlist},
            "Playlist created successfully"
        )
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404,"User not found")
    }
    try {
        const userplaylists = await Playlist.find({ owner: userId })

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {userplaylists},
                "User playlist fetched successfully"
            )
        )
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){  
        throw new ApiError(404,"Playlist not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {playlist},
            "Playlist fetched successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate the playlist and video IDs
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if the current user is the owner of the playlist
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the owner can add a video to the playlist");
    }

    // Add the video to the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId }
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong while adding the video to the playlist");
    }

    // Return the updated playlist in the response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { updatedPlaylist },
                "Video added to playlist successfully"
            )
        );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    //get playlist and the video u want to deldte
    //pull the video and give the updated playlist in responese
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const playlist = await Playlist.findById(playlistId)
    if(playlist.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400,"Only owner can delete video from the playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiError(400,"Something went wrong while deleting the video from the playlist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {updatedPlaylist},
            "Video deleted from playlist successfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400,"Only owner can delete the playlist")
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
        throw new ApiError(400,"Something went wrong while deleting the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    if(!name || name.length ===0){
        throw new ApiError(400,"Name is required")
    }
    if(!description || description.length ===0){
        throw new ApiError(400,"Description is required")
    }
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400,"Only owner can update the playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        }, {new:true}
    )

    if(!updatedPlaylist){
        throw new ApiError(400,"Something went wrong while updating the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {updatedPlaylist},
            "Playlist updated successfully"
        )
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}