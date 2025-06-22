import User from "../models/User.js";
import ErrorResponse from "../utils/errorResponse.js";
import jwt from "jsonwebtoken"; // Import jwt here
import bcrypt from "bcryptjs"; // Import bcryptjs here

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const register = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  try {
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role, // Role can be 'user' or 'admin'. For signup, usually 'user' by default unless specific logic is added.
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select("+password"); // select password because it's set to select: false in model

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000 // Convert days to milliseconds
    ),
    httpOnly: true, // Prevent client-side JS from reading the cookie
  };

  // If in production, set secure cookie
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    // .cookie('token', token, options) // You can use cookies if preferred
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
};
