const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: "", trim: true },
    icon: {
      type: String,
      enum: ["leaf", "sparkles", "crown", "gift"],
      default: "leaf"
    },
    image: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
