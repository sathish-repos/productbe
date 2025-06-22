import express from "express";
import {
  getCart,
  addProductToCart,
  updateCartItemQuantity,
  removeProductFromCart,
  checkout,
} from "../controllers/cartController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get("/", getCart);
router.post("/add", addProductToCart);
router.put("/update", updateCartItemQuantity);
router.delete("/remove/:productId", removeProductFromCart);
router.post("/checkout", checkout);

export default router;
