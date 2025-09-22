// controllers/roleController.js
import Role from "../models/Role.js";

// // Create Role
// export const createRole = async (req, res) => {
//   try {
//     const { roleName, description, permissions } = req.body;
//     const role = new Role({ roleName, description, permissions });
//     await role.save();
//     res.status(201).json(role);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// POST /roles

export const createRole = async (req, res) => {
  try {
    const { roleName, description, permissions } = req.body;

    // Validate roleName
    if (!roleName || !roleName.trim()) {
      return res.status(400).json({ error: "Role name is required" });
    }

    const normalizedRoleName = roleName.trim().toLowerCase();

    // Check if role already exists
    const existingRole = await Role.findOne({ roleName: normalizedRoleName });
    if (existingRole) {
      return res.status(400).json({ error: "Role already exists" });
    }

    // Create role with defaults if permissions are not provided
    const role = await Role.create({
      roleName: normalizedRoleName,
      description: description || "",
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



// Get all roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update Role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params; // role ID
    const { roleName, description, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ error: "Role not found" });

    role.roleName = roleName || role.roleName;
    role.description = description || role.description;
    role.permissions = permissions || role.permissions;

    await role.save();
    res.json({ message: "Role updated successfully", role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params; 

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ error: "Role not found" });

    await Role.findByIdAndDelete(id);
    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};