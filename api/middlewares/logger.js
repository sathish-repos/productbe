import { logger } from "../config/logger.js"; // Import the configured Winston logger

// Custom HTTP request logger middleware
const requestLogger = (req, res, next) => {
  logger.info(
    `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
  );
  next();
};

export default requestLogger;
