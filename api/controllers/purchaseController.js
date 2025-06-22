import Purchase from "../models/Purchase.js";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Get all purchases for the authenticated user
// @route   GET /api/purchase
// @access  Private
export const getUserPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({ user: req.user.id }).populate(
      "items.product",
      "name"
    );

    if (!purchases) {
      return res.status(200).json({ success: true, data: [] });
    }

    res
      .status(200)
      .json({ success: true, count: purchases.length, data: purchases });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single purchase by ID for the authenticated user
// @route   GET /api/purchase/:id
// @access  Private
export const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("items.product", "name"); // Populate product name for items

    if (!purchase) {
      return next(
        new ErrorResponse(`Purchase not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ success: true, data: purchase });
  } catch (err) {
    next(err);
  }
};
