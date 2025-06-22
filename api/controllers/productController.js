import Product from "../models/Product.js";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`No product with the id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    // Add user (admin) to req.body
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`No product with the id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is product owner (optional, if products are tied to specific admin users)
    // if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return next(
    //     new ErrorResponse(
    //       `User ${req.user.id} is not authorized to update this product`,
    //       401
    //     )
    //   );
    // }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`No product with the id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is product owner (optional, if products are tied to specific admin users)
    // if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return next(
    //     new ErrorResponse(
    //       `User ${req.user.id} is not authorized to delete this product`,
    //       401
    //     )
    //   );
    // }

    await product.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
