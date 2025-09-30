// controllers/roleController.js
import Role from "../models/Role.js";

// Create Role
export const createRole = async (req, res) => {
  try {
    const { roleName, description, permissions, level } = req.body;

    if (!roleName || !roleName.trim()) {
      return res.status(400).json({ error: "Role name is required" });
    }

    const normalizedRoleName = roleName.trim().toLowerCase();

    // If creating SuperAdmin
    if (normalizedRoleName === "superadmin") {
      const superAdminExists = await Role.findOne({ roleName: "superadmin" });
      if (superAdminExists) {
        return res
          .status(400)
          .json({ error: "SuperAdmin role already exists" });
      }
    }

    // Validate level
    if (normalizedRoleName === "superadmin") {
      // SuperAdmin always level 0
      if (level !== undefined && level !== 0) {
        return res.status(400).json({ error: "SuperAdmin must have level 0" });
      }
    } else {
      // Other roles must have level >= 1
      if (level === undefined || level < 1) {
        return res
          .status(400)
          .json({ error: "Level is required and must be >= 1" });
      }
    }

    // Check duplicate roleName or level
    const existingRole = await Role.findOne({
      $or: [{ roleName: normalizedRoleName }, { level }],
    });
    if (existingRole) {
      return res
        .status(400)
        .json({ error: "Role name or level already exists" });
    }

    // Create role
    const role = await Role.create({
      roleName: normalizedRoleName,
      description: description || "",
      level: normalizedRoleName === "superadmin" ? 0 : level,
      permissions: {
        manageUsers: permissions?.manageUsers || false,
        manageRoles: permissions?.manageRoles || false,
      },
    });

    res.status(201).json(role);
  } catch (err) {
    console.error("Error creating role:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update Role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params; // role ID
    const { roleName, description, permissions, level } = req.body;

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ error: "Role not found" });

    // Protect SuperAdmin
    if (role.roleName === "superadmin") {
      if (
        (roleName && roleName.toLowerCase() !== "superadmin") ||
        level !== undefined
      ) {
        return res
          .status(400)
          .json({ error: "Cannot rename or change level of SuperAdmin" });
      }
    }

    // Check duplicate level if level is being updated
    if (level !== undefined && level !== role.level) {
      const existingLevel = await Role.findOne({ level });
      if (
        existingLevel &&
        existingLevel._id.toString() !== role._id.toString()
      ) {
        return res.status(400).json({ error: "Level already exists" });
      }
    }

    // Apply updates
    if (roleName) role.roleName = roleName;
    if (description) role.description = description;
    if (permissions) role.permissions = permissions;
    if (level !== undefined) role.level = level;
    role.updatedAt = Date.now();

    await role.save();

    res.json({ message: "Role updated successfully", role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all roles
export const getRoles = async (req, res) => {
  try {
    // Fetch all roles and sort by level ascending
    const roles = await Role.find().sort({ level: 1 });
    res.json(roles);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ error: "Role not found" });

    if (role.roleName === "superadmin") {
      return res.status(400).json({ error: "Cannot delete SuperAdmin" });
    }

    // Check if any user is assigned this role
    const usersWithRole = await User.find({ role: role._id, isDeleted: false });
    if (usersWithRole.length > 0) {
      return res.status(400).json({
        error: `Cannot delete this role. It is assigned to ${usersWithRole.length} user(s).`,
      });
    }

    // Safe to delete
    await Role.findByIdAndDelete(id);
    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

