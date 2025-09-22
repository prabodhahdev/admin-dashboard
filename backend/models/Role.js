// backend/models/Role.js
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true }, // e.g., superadmin, admin
  description: { type: String },
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageRoles: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Role", roleSchema);
