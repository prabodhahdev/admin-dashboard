// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }, // reference Role
  isLocked: { type: Boolean, default: false },
  lockedCount: { type: Number, default: 0 },
  failedAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number, default: null }, // timestamp for auto unlock
  adminUnlockRequired: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
