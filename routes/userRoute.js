import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  userRegister,
  Login,
  Logout,
  getUserProfile,
} from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.post("/register", userRegister);
userRoute.post("/login", Login);
userRoute.post("/logout", Logout);
userRoute.get("/profile", authUser, getUserProfile);

export default userRoute;
