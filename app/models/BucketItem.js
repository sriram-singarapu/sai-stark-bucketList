import mongoose from "mongoose";

const BucketItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      default: "✨",
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subcategory: {
      type: String,
      default: "",
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    proofImage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    targetYear: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.BucketItem ||
  mongoose.model("BucketItem", BucketItemSchema);
