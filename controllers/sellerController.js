import Seller from "../models/sellerModel.js";
import Product from "../models/productModel.js";
import dotenv from "dotenv";
import bcrypt, { hash } from "bcrypt";
import asyncErrrorHandler from "../middlewares/asyncErrrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendMail.js";
dotenv.config();

// Seller Register
export const sellerRegister = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { name, email, password, storeName, about } = req.body;

    const isExist = await Seller.findOne({ email });
    if (isExist) return next(new ErrorHandler("Seller already exists", 409));

    //hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hashSync(password, saltRounds);

    const avatar = `https://api.dicebear.com/8.x/initials/svg?seed=${storeName}&radius=50&size=96&fontFamily=Helvetica&Weight=600`;
    const seller = new Seller({
      name,
      email,
      password: hashedPassword,
      avatarUrl: avatar,
      storeName,
      about,
    });
    seller.save();
    //generate token
    await generateToken(res, email);
    //send mail
    const data = {
      from: `#grab. <${process.env.User_ID}>`,
      to: email,
      subject: "Welcome to #grab!",
      html: `<h1>Welcome To <span style="color: green;">#grab</span> family</h1>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSyKgerCy4fQLONUV6BOH5VhoCr-KXvPKw0w&s">
            <p style="font-size: 20px;color: #333;">
            Hello ${storeName},<br>
            We're thrilled to have you join our community. If you have any questions or need assistance, our support team is here to help.
            Thank you for choosing us, and happy selling!<br><br>
            Best regards,
            The #grab Team</p>`,
    };

    await sendEmail(data);
    res.status(201).json({ success: true, data: seller });
  } catch (error) {
    console.log("Error in creating Seller");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Seller Login
export const sellerLogin = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) return next(new ErrorHandler("User Not Found", 404));

    //check password
    const isMatch = await bcrypt.compareSync(password, seller.password);
    if (!isMatch) return next(new ErrorHandler("Invalid Passoword", 401));

    //generate token
    await generateToken(res, email);
    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.log("Error in Seller Login");
    return next(new ErrorHandler(error.message, 500));
  }
});

//Seller Logout
export const sellerLogout = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.body;

    const seller = await Seller.findOne({ id });
    console.log(seller);
    // if (!seller) return next(new ErrorHandler("User Not Found", 404));

    await res.cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
    });
    res
      .status(200)
      .json({ success: true, message: "Logged Out Successfully!" });
  } catch (error) {
    console.log("Error in Seller Logout");
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get Seller Profile
export const getProfile = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) return next(new ErrorHandler("User Not Found", 404));

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.log("Error in Get Seller Profile");
    return next(new ErrorHandler(error.message, 500));
  }
});

//add products
export const addProduct = asyncErrrorHandler(async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ErrorHandler("NO Files werer Uploaded", 404));
    }
    console.log("images uploaded");
    const imageData = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      cloudinaryUrl: file.path,
    }));
    console.log("Upload Successfully");

    const { id } = req.params;
    const {
      name,
      description,
      tags,
      specifications,
      price,
      brand,
      category,
      subcategory,
      gender,
      sizechart,
      stock,
    } = req.body;

    const seller = await Seller.findOne({ _id: id });
    if (!seller) return next(new ErrorHandler("Not Authenticated", 404));

    const product = new Product({
      name,
      description,
      tags,
      specifications,
      price,
      images: imageData,
      brand,
      category,
      subcategory,
      gender,
      sizechart,
      stock,
      seller: id,
    });

    const createdProduct = await product.save();

    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    console.log("Error in Add Product");
    return next(new ErrorHandler(error.message, 500));
  }
});

//update product

export const updateProduct = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      tags,
      specifications,
      price,
      brand,
      category,
      subcategory,
      gender,
      sizechart,
      stock,
      productId,
    } = req.body;

    const seller = await Seller.findOne({ _id: id });
    if (!seller) return next(new ErrorHandler("Not Authenticated", 404));

    if (!req.files || req.files.length === 0) {
      return next(new ErrorHandler("NO Files werer Uploaded", 404));
    }
    console.log("images uploaded");
    const imageData = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      cloudinaryUrl: file.path,
    }));
    console.log("Upload Successfully");

    const updateProducts = await Product.findOneAndUpdate(
      { _id: productId },
      {
        name,
        description,
        tags,
        specifications,
        price,
        images: imageData,
        brand,
        category,
        subcategory,
        gender,
        sizechart,
        stock,
        seller: id,
      }
    );
    if (!updateProducts)
      return next(new ErrorHandler("Product Updation Failed", 404));
    console.log("Product Updated Successfully");
    res.status(201).json({ success: true, product: updateProducts });
  } catch (error) {
    console.log("Error in Add Product");
    return next(new ErrorHandler(error.message, 500));
  }
});
