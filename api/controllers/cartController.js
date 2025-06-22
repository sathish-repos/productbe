import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Purchase from "../models/Purchase.js";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "name price"
    );

    if (!cart) {
      return res
        .status(200)
        .json({ success: true, data: { items: [], totalAmount: 0 } });
    }

    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.priceAtTimeOfAddition,
      0
    );

    res
      .status(200)
      .json({ success: true, data: { ...cart.toObject(), totalAmount } });
  } catch (err) {
    next(err);
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private
export const addProductToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorResponse("Product not found", 404));
    }
    if (product.stock < quantity) {
      return next(
        new ErrorResponse("Not enough stock available for this product", 400)
      );
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create new cart if it doesn't exist for the user
      cart = await Cart.create({
        user: req.user.id,
        items: [
          {
            product: productId,
            quantity,
            priceAtTimeOfAddition: product.price,
          },
        ],
      });
    } else {
      // Check if product already in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].priceAtTimeOfAddition = product.price; // Update price in cart in case it changed
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          priceAtTimeOfAddition: product.price,
        });
      }
      await cart.save();
    }

    // Populate the product details for the response
    await cart.populate("items.product", "name price");
    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.priceAtTimeOfAddition,
      0
    );

    res
      .status(200)
      .json({ success: true, data: { ...cart.toObject(), totalAmount } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItemQuantity = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new ErrorResponse("Cart not found for this user", 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return next(new ErrorResponse("Product not found in cart", 404));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(
        new ErrorResponse("Product associated with cart item not found", 404)
      );
    }
    if (product.stock < quantity) {
      return next(
        new ErrorResponse("Not enough stock available for this product", 400)
      );
    }

    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].priceAtTimeOfAddition = product.price; // Update price in cart in case it changed
    }

    await cart.save();

    await cart.populate("items.product", "name price");
    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.priceAtTimeOfAddition,
      0
    );

    res
      .status(200)
      .json({ success: true, data: { ...cart.toObject(), totalAmount } });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeProductFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new ErrorResponse("Cart not found for this user", 404));
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();

    await cart.populate("items.product", "name price");
    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.priceAtTimeOfAddition,
      0
    );

    res
      .status(200)
      .json({ success: true, data: { ...cart.toObject(), totalAmount } });
  } catch (err) {
    next(err);
  }
};

// @desc    Checkout cart and create a purchase record
// @route   POST /api/cart/checkout
// @access  Private
export const checkout = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "name price stock"
    );

    if (!cart || cart.items.length === 0) {
      return next(new ErrorResponse("Your cart is empty", 400));
    }

    let totalAmount = 0;
    const purchasedItems = [];

    // Validate stock and prepare purchased items list
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (!product || product.stock < cartItem.quantity) {
        return next(
          new ErrorResponse(
            `Not enough stock for ${
              product ? product.name : "an unknown product"
            }`,
            400
          )
        );
      }

      // Deduct stock
      product.stock -= cartItem.quantity;
      await product.save();

      purchasedItems.push({
        product: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        price: product.price, // Use the price from the product at the time of purchase
      });
      totalAmount += cartItem.quantity * product.price; // Correct calculation here
    }

    // Create purchase record
    const purchase = await Purchase.create({
      user: req.user.id,
      items: purchasedItems,
      totalAmount: totalAmount,
      status: "completed", // For simplicity, mark as completed immediately
    });

    // Clear the cart after successful checkout
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Checkout successful and purchase recorded",
      data: purchase,
    });
  } catch (err) {
    next(err);
  }
};
