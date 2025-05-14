import express from "express"
import { login,logout, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
// middlewar for cheking user is loggedIn or not (isAuthenticated)
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);
router.route("/logout").get(logout);


export default router;

