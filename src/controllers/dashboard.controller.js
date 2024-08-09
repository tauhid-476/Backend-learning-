import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  
    const channelId = req.user._id;
  
    if (!channelId) {
      throw new ApiError(400, "Invalid channel ID");
    }
  
    try {
      const subscribers = await Subscription.aggregate([
        {
          $match: {
            channel: new mongoose.Types.ObjectId(channelId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "subscriber",
            foreignField: "_id",
            as: "subscriber",
          },
        },
        {
          $unwind: "$subscriber",
        },
        {
          $count: "subscriber",
        },
      ]);
  
      const videos = await Video.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(channelId),
          },
        },
        {
          $count: "videos",
        },
      ]);
  
      const likes = await Like.aggregate([
        {
          $match: {
            likeBy: new mongoose.Types.ObjectId(channelId),
          },
        },
        {
          $count: "likes",
        },
      ]);
  
      const views = await Video.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(channelId),
          },
        },
        {
          $count: "views",
        },
      ]);
  
      const subscribersCount = subscribers.length;
      const videosCount = videos[0].videos;
      const likesCount = likes[0].likes;
      const viewsCount = views[0].views;
  
      return res.status(200).json(
        new ApiResponse({
          subscribersCount,
          videosCount,
          likesCount,
          viewsCount,
        })
      );
    } catch (error) {
      throw new ApiError(
        500,
        "An error occurred while fetching the channel stats"
      );
    }
  });

  const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
  
    const channelId = req.user._id;
  
    if (!channelId) {
      throw new ApiError(400, "Invalid channel ID");
    }
  
    try {
      const videos = await Video.find({ owner: channelId });
      return res
        .status(200)
        .json(new ApiResponse(200, {videos}, "Videos fetched successfully"));
    } catch (error) {
      throw new ApiError(500, "An error occurred while fetching videos");
    }
  });

export {
    getChannelStats,
    getChannelVideos
}