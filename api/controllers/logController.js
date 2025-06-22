import fs from "fs/promises"; // Use promise-based fs
import path from "path";
import ErrorResponse from "../utils/errorResponse.js";
import { logger } from "../config/logger.js"; // Import the main logger
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the log file path relative to the project root
// We assume LOG_FILE_PATH is set in .env relative to the project root (e.g., ./logs/app.log)
const getLogFilePath = () => {
  const projectRoot = path.resolve(__dirname, "../../"); // Go up two directories from controllers to project root

  return process.env.LOG_FILE_PATH
    ? path.join(projectRoot, process.env.LOG_FILE_PATH)
    : path.join(projectRoot, "api", "logs", "app.log");
};

// @desc    Get application logs
// @route   GET /api/logs
// @access  Private/Admin
export const getLogs = async (req, res, next) => {
  const logFilePath = getLogFilePath();
  try {
    const data = await fs.readFile(logFilePath, "utf8");
    logger.info(`Admin user ${req.user.id} accessed logs.`);
    res.status(200).set("Content-Type", "text/plain").send(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      logger.warn(`Log file not found at ${logFilePath}`);
      return next(new ErrorResponse("Log file not found", 404));
    }
    logger.error(
      `Error reading log file at ${logFilePath}: ${err.message}`,
      err
    );
    next(new ErrorResponse("Error reading log file", 500));
  }
};

// @desc    Delete (clear) application logs
// @route   DELETE /api/logs
// @access  Private/Admin
export const deleteLogs = async (req, res, next) => {
  const logFilePath = getLogFilePath();
  try {
    // Check if file exists before deleting to avoid ENOENT error
    await fs.access(logFilePath, fs.constants.F_OK);
    await fs.unlink(logFilePath); // Delete the file
    logger.info(
      `Log file at ${logFilePath} deleted by admin user ${req.user.id}.`
    );
    res
      .status(200)
      .json({ success: true, message: "Log file deleted successfully." });
  } catch (err) {
    if (err.code === "ENOENT") {
      logger.warn(
        `Attempted to delete non-existent log file at ${logFilePath}`
      );
      return next(new ErrorResponse("Log file not found to delete", 404));
    }
    logger.error(
      `Error deleting log file at ${logFilePath}: ${err.message}`,
      err
    );
    next(new ErrorResponse("Error deleting log file", 500));
  }
};
