const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        price: Number,
        quantity: Number,
        boxSize: String,
        image: String
      }
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
      default: "Pending"
    },
    customerName: { type: String, default: "Customer" },
    customerEmail: { type: String, default: "" },
    shippingAddress: {
      address: String,
      city: String,
      phone: String
    },
    riderNotes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
