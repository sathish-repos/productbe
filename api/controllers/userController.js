import User from "../models/User.js";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin or self
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`No user with the id of ${req.params.id}`, 404)
      );
    }

    // Allow user to get their own profile, or admin to get any
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return next(
        new ErrorResponse(`Not authorized to view this user's profile`, 403)
      );
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or self
export const updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`No user with the id of ${req.params.id}`, 404)
      );
    }

    // Check if user is owner or admin
    if (user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this user`,
          401
        )
      );
    }

    // Do not allow updating password through this route, use a separate 'change password' flow
    const { password, ...updateFields } = req.body;

    user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`No user with the id of ${req.params.id}`, 404)
      );
    }

    // Check if user is owner or admin (only admin can delete any user,
    // a user could technically delete themselves but it's usually managed by admin)
    if (req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this user`,
          401
        )
      );
    }

    await user.deleteOne(); // Use deleteOne() on the document

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
