// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    profilePic: { type: String }, 
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    isLocked: { type: Boolean, default: false },
    lockedCount: { type: Number, default: 0 },
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number, default: null },
    adminUnlockRequired: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }, 
  },
  { timestamps: true } 
);

// Prevent OverwriteModelError if model already exists
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
