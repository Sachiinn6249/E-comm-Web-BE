import express from "express";
import {
  getAllProducts,
  filteredProducts,
  getSingleProduct,
  addToFavorites,
  addToCart,
  getFavourite,
  getCartProducts,
  removeFromCart,
  updateCartQuantity,
} from "../controllers/productController.js";

const productRoute = express.Router();

productRoute.get("/list/all", getAllProducts);
productRoute.get("/list/search", filteredProducts);
productRoute.get("/list/:id", getSingleProduct);
productRoute.post("/favorite/add/:id", addToFavorites);
productRoute.get("/favorite/get:id", getFavourite);
productRoute.post("/cart/add/:id", addToCart);
productRoute.get("/cart/get/:id", getCartProducts);
productRoute.put("/cart/update/:id", updateCartQuantity);
productRoute.delete("/cart/remove/:id", removeFromCart);
export default productRoute;
