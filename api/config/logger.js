import { createLogger, format, transports } from "winston";
// import "winston-daily-rotate-file"; // For daily log rotation (optional but good practice)
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDirPath = path.join(__dirname, "../logs"); // Path to logs directory

// Create logs directory if it doesn't exist
import fs from "fs";
if (!fs.existsSync(logDirPath)) {
  fs.mkdirSync(logDirPath);
}

// Define the custom format for logs
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }), // Include stack trace for errors
  format.splat(), // Handles string interpolation
  format.json() // Output logs in JSON format
);

// Configure the Winston logger
export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  defaultMeta: { service: "product-be" },
  transports: [
    // Console log for development
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    // File log for all levels
    new transports.File({
      filename: process.env.LOG_FILE_PATH || path.join(logDirPath, "app.log"),
      level: "info", // Log info and above to file
      maxsize: "20m", // 20MB
      maxFiles: "14d", // Keep logs for 14 days
      tailable: true, // Allow tailing the file
    }),
    // Optional: daily rotate file transport for larger applications
    // new transports.DailyRotateFile({
    //   filename: path.join(logDirPath, 'application-%DATE%.log'),
    //   datePattern: 'YYYY-MM-DD',
    //   zippedArchive: true,
    //   maxSize: '20m',
    //   maxFiles: '14d',
    // }),
    // Dedicated error log file
    new transports.File({
      filename: path.join(logDirPath, "error.log"),
      level: "error", // Only log errors to this file
      maxsize: "10m", // 10MB
      maxFiles: "7d", // Keep errors for 7 days
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDirPath, "exceptions.log") }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDirPath, "rejections.log") }),
  ],
});

// For HTTP request logging, we'll use a separate middleware (middlewares/logger.js)
