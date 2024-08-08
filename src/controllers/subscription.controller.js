import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//
const checkSubscriber = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    //check if user is subscriber or not
    const userId = req.user?._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel id not found")
    }

    try {
        const subscribedChannel = await Subscription.findOne({
           subscriber: userId,
           channel: channelId
        })

        if(!subscribedChannel){
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        subscribed: false,
                        message:`${userId} is not subscribed to ${channelId}`
                    },
                    
                )
            )
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    subscribed: true,
                    message: `${userId} is subscribed to ${channelId}`,
                    subscribedChannel
                }
            )
        )

    } catch (error) {
        throw new ApiError(500, "Server error")
    }

})


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription


    const userId = req.user?._id
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel id not found")
    }

    ///find the document where for a specific channel a specific user is subscribed
    const subscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    //agar subscribe hai to unsubscribe karo by deleteing the old document
    //agar unsubscribe hai to subscribe karo by creating the new document

    if(subscription){
        await Subscription.findByIdAndDelete(subscription._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {subscription:null},
                "User unsubscribe successfully"
            )
        )
    }else{

        const newSubscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })

        return res
        .status(200)
        .json(
           new ApiResponse(
            200,
            {newSubscription},
            "User subscribe successfuly"
           )
        )


    }


})

// controller to return subscriber list of a channel

//to get subscribers count the number of documents of same channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    console.log("channelId:", channelId);

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel id not found")
    }

    //TODO: get subscribers count
    try {
        const subscribers = await Subscription.aggregate([
            {
                //match the same channel
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                //for lookup always see the datamodelling chart u will get more clearrity
                $lookup: {
                    from: "users",
                    localField:"subscriber",
                    foreignField:"_id",
                    as: "subscribersCount"
                    
                }
            },
            {
                $addFields: {
                    //subs naam ki field add karo jiska size subscribersCountarray ke length hai
                    subs: {
                        $size: "$subscribersCount"
                    }
                }
            },
            {
                $project: {
                    subs: 1,
                    subscribersCount: {
                        _id: 1,
                        fullName: 1,
                        username: 1
                    }
                    
                }
            }

        ])

         //if it doesnt exist or length is zero means zero subscribers
         if(!subscribers || subscribers.length===0){
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {subscribers},
                    {
                        numberOfSubscribers: 0,
                        message: "0 subscribers"
                    }
                )
            )
         }

         return res
         .status(200)
         .json(
            new ApiResponse(
                200,
                {subscribers},
                "Subscribers fetched successfully"
            )
         )
        
        
    } catch (error) {
        throw new ApiError(500, "Server error")
        
    }
})

// controller to return channel list to which user has subscribed
//to get subscribed channels find the number of socuments of same user
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    //find the documents containing same user

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Subscriber id not found")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField:"channel",
                foreignField:"_id",
                as: "subscribed"
            }
        },
    //     {
    //         $addFields: {
    //             //subs naam ki field add karo jiska size subscribersCountarray ke length hai
    //             subscribed: {
    //                 $first: "$subscribed"
    //             }
    //         }
    //     },
    //    {
    //     $addFields: {
    //         totalSubscribedChannels: {
    //             $size: "$subscribed"
    //         }
    //     }

    //    },
    {
        $addFields: {
          totalSubscribedChannels: { $size: "$subscribed" }, // Count number of subscribed channels
          subscribed: { $arrayElemAt: ["$subscribed", 0] }   // Get the first element in the subscribed array
        }
      },
       {
        $project: {
            totalSubscribedChannels: 1,
            subscribed: {
                username: 1,
                fullName: 1
            }
        }
       }
    ])

    if (!subscribedChannels || Object.entries(subscribedChannels).length === 0) {
        throw new ApiError(404, "No channel subscribed");
      }

      return res.status(200).json(
        new ApiResponse(200, "All subscribed channel fetched successfully", {
            subscribedChannels,
        }),
      );
    
})

export {
    checkSubscriber,
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}