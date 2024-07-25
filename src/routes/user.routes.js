import {Router} from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT} from "../middlewares/auth.middleware.js"

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
//secured router
//Secured routes in a backend application are essential to protect sensitive data and ensure that only authorized users can access certain resources
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refreshToken").post(refreshAccessToken)



//router.route("/path").action(injectMiddlewares(if any),fn)


export default router