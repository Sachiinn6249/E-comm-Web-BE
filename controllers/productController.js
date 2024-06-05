import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import asyncErrrorHandler from "../middlewares/asyncErrrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";

//get all products
export const getAllProducts = asyncErrrorHandler(async (req, res, next) => {
  try {
    const products = await Product.find();
    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.log("Error in get Products", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get filtered product
export const filteredProducts = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { name, category, minPrice, maxPrice, tags } = req.query;

    let tagFilter = { $exists: true };
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      if (tagArray.length > 0) {
        tagFilter = { $in: tagArray };
      }
    }

    console.log("Tag Filter:", tagFilter);

    const pipeline = [
      // Search
      { $match: { name: { $regex: name || "", $options: "i" } } },

      // Filters
      {
        $match: {
          category: category
            ? { $regex: new RegExp(`^${category}$`, "i") }
            : { $exists: true },
          subcategory: subcategory
            ? { $regex: new RegExp(`^${subcategory}$`, "i") }
            : { $exists: true },
          gender: gender
            ? { $regex: new RegExp(`^${gender}$`, "i") }
            : { $exists: true },
          brand: brand
            ? { $regex: new RegExp(`^${brand}$`, "i") }
            : { $exists: true },
          size: sizechart
            ? {
                $in: sizechart.split(",").map((s) => new RegExp(s.trim(), "i")),
              }
            : { $exists: true },
          price: {
            $gte: minPrice ? Number(minPrice) : 0,
            $lte: maxPrice ? Number(maxPrice) : Infinity,
          },
          tags: tags
            ? { $in: tags.split(",").map((tag) => new RegExp(tag.trim(), "i")) }
            : { $exists: true },
        },
      },

      // Projection
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          price: 1,
          tags: 1,
        },
      },

      // Sorting
      { $sort: { price: 1 } },
    ];

    const products = await Product.aggregate(pipeline);
    console.log(products);
    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.log("Error in Filtered Products", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get single product
export const getSingleProduct = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log("Error in get Single Product", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

// add product to favorites
export const addToFavorites = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    const user = await User.findById({ id });
    if (!user) return next(new ErrorHandler("User not found", 404));

    const productIndex = user.favourites.findIndex((favourite) =>
      favourite.productId.equals(productId)
    );
    let action;

    if (productIndex === -1) {
      user.favourites.push({ productId }); 
      action = "added to";
    } else {
      user.favourites.splice(productIndex, 1);
      action = "removed from";
    }
    await user.save();
    res
      .status(200)
      .json({ message: `Product ${action} favorites`, data: user.favorites });
  } catch (error) {
    console.log("Error in Add to Favourites", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get favorite products
export const getFavourite = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    if (!user) return next(new ErrorHandler("User Not Found", 404));
    res.status(200).json({ success: true, data: user.favourites });
  } catch (error) {
    console.log("Error in get Favorites", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//add product to cart
export const addToCart = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) 
      return next(new ErrorHandler("Product Not Found", 404));
    

    let cart = await Cart.findOne({ user: id });
    if (!cart) {
      cart = await Cart.create({ user: id });
    }

    const existingProduct = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (existingProduct) {
      cart.products = cart.products.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      cart.products.push({ product: productId,price:product.price ,quantity: 1 });
    }

    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.quantity * product.price,
      0
    );

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.log("Error in Add to Cart", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get cart products
export const getCartProducts = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findOne({user:id});
    if (!user) return next(new ErrorHandler("User not found", 404));
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.log("Error in get Cart products", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//update cart quantity
export const updateCartQuantity = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId, quantity } = req.body;
    
    const cart = await Cart.findOne({user:id});
    if (!cart) return next(new ErrorHandler("Cart not found", 404));
    
    const cartItem = cart.products.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem)
      return next(new ErrorHandler("Product not found in cart", 404));
    
    cartItem.quantity = quantity;
    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    await cart.save();
    res
      .status(200)
      .json({ success: true, message: "Quantity Updated", data: cart });
  } catch (error) {
    console.log("Error in Update cart quantity");
    return next(new ErrorHandler(error.message, 500));
  }
});

//remove cart products
export const removeFromCart = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("User not found", 404));

    const productIndex = user.cart.findIndex((cart) =>
      cart.productId.equals(productId)
    );
    if (productIndex !== -1) {
      user.cart.splice(productIndex, 1);
    }
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Item Removed", data: user.cart });
  } catch (error) {
    console.log("Error in removeFromCart");
    return next(new ErrorHandler(error.message, 500));
  }
});
