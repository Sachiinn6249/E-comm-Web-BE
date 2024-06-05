import express from "express";
import {
  placeOrder,
  verifyOrder,
  notifySeller,
  getOrders,
  getSingleOrder,
} from "../controllers/orderController.js";
import authUser from "../middlewares/authUser.js";

const orderRoute = express.Router();

orderRoute.post("/place-order/:id", authUser, placeOrder);
orderRoute.post("/verify-order/:id", verifyOrder);
orderRoute.post("/notify-seller/:id", notifySeller);
orderRoute.get("/get-order", getOrders);
orderRoute.get("/get-order/:id", getSingleOrder);
export default orderRoute;
