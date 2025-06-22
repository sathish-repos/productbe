import express from "express";
import { getLogs, deleteLogs } from "../controllers/logController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// All log routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getLogs).delete(deleteLogs);

export default router;
