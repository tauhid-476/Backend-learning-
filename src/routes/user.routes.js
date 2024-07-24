import {Router} from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {user, verifyJWT} from "../middlewares/auth.middleware.js"

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
  registerUser
)

router.route("/login").post(loginUser)

//the use of next
router.route("/logout").post(verifyJWT, logoutUser)

  //router.route("/path").action(injectMiddleware,fn)


export default router