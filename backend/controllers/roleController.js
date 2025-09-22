// controllers/roleController.js
import Role from "../models/Role.js";

// Create Role
export const createRole = async (req, res) => {
  try {
    const { roleName, description, permissions } = req.body;
    const role = new Role({ roleName, description, permissions });
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
