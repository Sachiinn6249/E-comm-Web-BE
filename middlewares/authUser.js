import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import asyncErrrorHandler from "./asyncErrrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const authUser = asyncErrrorHandler(async (req, res, next) => {
  const token = req.cookies.token;
  await jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return next(new ErrorHandler("Invalid JWT token", 401));
    }
    req.user = user;
    console.log("Token Validation Success");
    next();
  });
});

export default authUser;
