// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  bio: { type: String, default: "" },
  instagram: { type: String, default: "" },
  whatsapp: { type: String, default: "" },
  avatar: { type: String, default: "" }, // URL of profile image
  gallery: { type: [String], default: [] },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
