import { Router } from 'express';
import {
    checkSubscriber,
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply// verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .post(toggleSubscription);

router.route("/c/:subscriberId").get(getSubscribedChannels)
    

router.route("/getchannel/sub/:channelId").get(getUserChannelSubscribers)

router.route("/checkSubscription/:channelId").get(checkSubscriber)

export default router