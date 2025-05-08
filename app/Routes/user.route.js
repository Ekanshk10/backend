import { Router } from "express";
// import { homePage, logOut, registerUser } from "../Controller/user.controller.js";
import { authUser } from "../middleware/authUser.middleware.js";
import {homePage, logOut, registerUser , UserLogin } from "../Controller/user_t.controller.js";

const router = Router();

router.post("/register", registerUser);
// router.post("/login", UserLogin)
router.post("/login", UserLogin);
router.get("/home", authUser, homePage)
router.get("/logout", logOut );
export default router;