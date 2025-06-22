import mongoose from "mongoose";

const PurchasedItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String, // Store product name at time of purchase
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    // Price at the time of purchase
    type: Number,
    required: true,
  },
});

const PurchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  items: [PurchasedItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "completed", // For simplicity, instantly completed after checkout
  },
});

export default mongoose.model("Purchase", PurchaseSchema);
