import User from "../models/userModel.js";
import dotenv from "dotenv";
import asyncErrrorHandler from "../middlewares/asyncErrrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendMail.js";
dotenv.config();

// User Register
export const userRegister = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const isExist = await User.findOne({ email });
    if (isExist) return next(new ErrorHandler("User already exists", 409));

    const avatar = `https://api.dicebear.com/8.x/initials/svg?seed=${name}&radius=50&size=96&fontFamily=Helvetica&Weight=600`;
    const user = new User({
      name,
      email,
      avatarUrl: avatar,
    });
    user.save();

    //generate token
    await generateToken(res,email);
    //send mail
    const data = {
      from: `#grab. <${process.env.User_ID}>`,
      to: email,
      subject: "Welcome to #grab!",
      html: `<h1>Hello Sachin,Welcome To #grab. family</h1>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSyKgerCy4fQLONUV6BOH5VhoCr-KXvPKw0w&s">
            <p>Subject: Welcome to [Your E-Commerce Website Name]!
            Hi ${name},
            We're thrilled to have you join our community. As a token of our appreciation, here's a special welcome offer just for you: <span style="color:red">FLAT20<span/>.
            Explore our wide range of products and enjoy a seamless shopping experience. If you have any questions or need assistance, our support team is here to help.
            Thank you for choosing us, and happy shopping!
            Best regards,
            The #grab Team</p>`,
    };

    await sendEmail(data);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.log("Error in creating user");
    return next(new ErrorHandler(error.message, 500));
  }
});

//User Login
export const Login = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { email, userId } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler("User Not Found", 404));

    const isMatch = await User.findById({ _id: userId });
    if (!isMatch) return next(new ErrorHandler("Invalid Credentials", 401));

    //generate token
    await generateToken(res, email);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log("Error in Login");
    return next(new ErrorHandler(error.message, 500));
  }
});

//User Logout
export const Logout = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler("User Not Found", 404));

    await res.cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
    });
    res
      .status(200)
      .json({ success: true, message: "Logged Out Successfully!" });
  } catch (error) {
    console.log("Error in Logout");
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get User Profile
export const  getUserProfile = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler("User Not Found", 404));

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in Get User Profile");
    return next(new ErrorHandler(error.message, 500));
  }
});
