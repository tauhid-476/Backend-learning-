import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js"
import {verifyjwt} from "../middlewares/auth.middleware.js"


const router = Router();

router.use(verifyjwt)
//apply this middle ware to all the routes in this file


router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router