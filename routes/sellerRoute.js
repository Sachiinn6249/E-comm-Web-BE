import express from "express";
import {
  sellerRegister,
  sellerLogin,
  sellerLogout,
  getProfile,
  addProduct,
} from "../controllers/sellerController.js";

import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/uploadFile.js";
const sellerRoute = express.Router();

sellerRoute.post("/register", sellerRegister);
sellerRoute.post("/login", sellerLogin);
sellerRoute.post("/logout", sellerLogout);
sellerRoute.get("/profile", authUser, getProfile);
sellerRoute.post(
  "/add-product/:id",
  authUser,
  upload.array("images", 10),
  addProduct
);
export default sellerRoute;
