import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import morgan from "morgan"; // For request logging (optional, can use custom logger)
import errorHandler from "./middlewares/error.js";
import { logger } from "./config/logger.js"; // Import the Winston logger
import requestLogger from "./middlewares/logger.js"; // Custom request logger middleware

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(cors()); // Enable CORS for all routes
// app.use(morgan('dev')); // HTTP request logger middleware, uncomment to use instead of custom requestLogger
app.use(requestLogger); // Custom request logger middleware using Winston

// Route files
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";
import purchaseRoutes from "./routes/purchase.js";
import logRoutes from "./routes/log.js"; // New: Log management routes

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/logs", logRoutes); // New: Mount log management routes

app.get("/", (req, res) => res.send(`<h1>welcome to productBE!`));

// Custom error handling middleware (must be last middleware)
app.use(errorHandler);

const PORT = 4000;

const server = app.listen(
  PORT,
  () => logger.info(`Server running on port http://localhost:${PORT}`) // Use logger here
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  logger.error(`Error: ${err.message}`, err); // Use logger for errors
  // Close server & exit process
  server.close(() => process.exit(1));
});
