import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a product name"],
    trim: true,
    maxlength: [100, "Name can not be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [500, "Description can not be more than 500 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
    min: 0,
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    enum: ["Electronics", "Books", "Clothing", "Home", "Beauty", "Sports"],
  },
  stock: {
    type: Number,
    required: [true, "Please add stock quantity"],
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Product", ProductSchema);
