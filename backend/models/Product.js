const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    boxSize: { type: String, enum: ["5KG", "8KG", "10KG"], required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    variants: {
      type: [variantSchema],
      validate: { validator: (v) => v.length > 0, message: "At least one variant required" }
    },
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
