import express from "express";
import authAdmin from "../middlewares/authAdmin.js";
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  getAllUsers,
  getSingleUser,
  getAllSeller,
  getSingleSeller,
} from "../controllers/adminController.js";

const adminRoute = express.Router();
adminRoute.post("/login", adminLogin);
adminRoute.post("/logout", adminLogout);
adminRoute.get("/get-profile", authAdmin, getAdminProfile);
adminRoute.get("/user/:id", authAdmin, getSingleUser);
adminRoute.get("/users", authAdmin, getAllUsers);
adminRoute.get("/seller/:id", authAdmin, getSingleSeller);
adminRoute.get("/seller", authAdmin, getAllSeller);

export default adminRoute;
