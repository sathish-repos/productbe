import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import morgan from "morgan"; // For request logging (optional, can use custom logger)
import errorHandler from "./middlewares/error.js";
import logger from "./middlewares/logger.js"; // Custom logger

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(cors()); // Enable CORS for all routes
// app.use(morgan('dev')); // HTTP request logger middleware, uncomment to use instead of custom logger
app.use(logger); // Custom request logger

// Route files
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";
import purchaseRoutes from "./routes/purchase.js";

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/purchase", purchaseRoutes);

// Custom error handling middleware (must be last middleware)
app.use(errorHandler);

// const PORT = process.env.PORT || 4000;
const PORT = 4000;

const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
