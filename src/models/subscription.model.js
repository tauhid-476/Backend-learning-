import mongoose, { Schema } from "mongoose";


const subscriptionSchema = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId, //one who is subscribing
    ref: "User"
  },
  channel: {
    type: Schema.Types.ObjectId, //the one who is running the channel is also a user
    ref: "User"
  }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)
////