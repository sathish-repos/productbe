import express from "express";
import {
  getUserPurchases,
  getPurchaseById,
} from "../controllers/purchaseController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// All purchase routes require authentication
router.use(protect);

router.get("/", getUserPurchases);
router.get("/:id", getPurchaseById);

export default router;
