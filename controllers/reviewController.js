import Review from "../models/reviewModel.js";
import User from "../models/userModel.js";
import asyncErrrorHandler from "../middlewares/asyncErrrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";

//Add Review

export const addReview = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId, rating, comment } = req.body;
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("User Not Found", 404));

    const review = await new Review({
      name: user.name,
      rating,
      comment,
      userId: user._id,
      product: productId,
      date: Date.now(),
    });
    await review.save();
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.log("Error in Add Review", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});
