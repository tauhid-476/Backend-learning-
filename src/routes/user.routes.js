import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

//since ise call kiya he will say konse route pe konsa fn perform karna hai
router.route("/register").post(
  upload.fields([
        //avatar and cover image
        //add many fields as u want
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
      ]),
  registerUser)

  //router.router("/path").action(injectMiddleware,fn)


export default router