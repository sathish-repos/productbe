import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.route("/").get(authorize("admin"), getUsers); // Only admin can get all users

router
  .route("/:id")
  .get(getUser) // A user can get their own profile, admin can get any
  .put(updateUser) // A user can update their own profile, admin can update any
  .delete(authorize("admin"), deleteUser); // Only admin can delete users

export default router;
