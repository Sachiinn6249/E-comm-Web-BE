import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import Seller from "../models/sellerModel.js";
import generateToken from "../utils/generateToken.js";
import asyncErrrorHandler from "../middlewares/asyncErrrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
import bcrypt, { hash } from "bcrypt";

//admin Login
export const adminLogin = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return next(new ErrorHandler("Account Not Found", 404));

    //check password
    const isMatch = await bcrypt.compareSync(password, admin.password);
    if (!isMatch) return next(new ErrorHandler("Invalid Passoword", 401));

    //generate token
    await generateToken(res, email);
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.log("Error in Seller Login");
    return next(new ErrorHandler(error.message, 500));
  }
});

//get admin profile
export const getAdminProfile = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: id });
    if (!admin) return next(new ErrorHandler("Admin Not Found", 404));
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.log("Error in getAdminProfile", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get single user
export const getSingleUser = asyncErrrorHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById({ _id: id });
    if (!user) return next(new ErrorHandler("User Not Found", 404));
    console.log("Hitted successfully");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log("Error in getSingleUser", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get all users
export const getAllUsers = asyncErrrorHandler(async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) return next(new ErrorHandler("Users Not Found", 404));

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log("Error in getAllUsers", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get single Seller
export const getSingleSeller = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findById({ _id: id });
    if (!seller) return next(new ErrorHandler("Seller not found", 404));

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.log("Error in getSingleSeller", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get all sellers
export const getAllSeller = asyncErrrorHandler(async (req, res, next) => {
  try {
    const sellers = await Seller.find();
    if (!sellers) return next(new ErrorHandler("Sellers not found", 404));

    res.status(200).json({ success: true, data: sellers });
  } catch (error) {
    console.log("Error in getAllSeller", error.message);
    res.status(500).json({ message: error.message });
  }
});
