import Role from "../models/Role.js";
import User from "../models/User.js";
import admin from "../firebase/admin.js";

// Create User
export const createUser = async (req, res) => {
  try {
    const { uid: providedUid, firstName, lastName, email, phone, roleName, profilePic } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "First name, last name, and email are required" });
    }

    //  Check duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { uid: providedUid }] });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email or UID" });
    }

    //  Find or create role
    let role = await Role.findOne({ roleName: roleName.toLowerCase().trim() });
    if (!role) {
      role = new Role({
        roleName: roleName.toLowerCase().trim(),
        permissions: { manageUsers: false, manageRoles: false },
      });
      await role.save();
    }

    //  Determine Firebase UID
    let uidToUse = providedUid;
    if (!uidToUse) {
      const createParams = {
        email,
        emailVerified: false,
        password: Math.random().toString(36).slice(-10) + "Aa1!",
        displayName: `${firstName} ${lastName}`,
        disabled: false,
      };

      if (phone && /^\+\d{10,15}$/.test(phone)) createParams.phoneNumber = phone;
      if (profilePic && /^https?:\/\//i.test(profilePic)) createParams.photoURL = profilePic;

      const firebaseUser = await admin.auth().createUser(createParams);
      uidToUse = firebaseUser.uid;
    } else {
      try {
        const existing = await admin.auth().getUser(uidToUse);
        if (existing.email && existing.email.toLowerCase() !== email.toLowerCase()) {
          return res.status(400).json({ error: "Provided UID does not match email" });
        }
      } catch {
        return res.status(400).json({ error: "Invalid provided UID" });
      }
    }

    //  Save user in MongoDB
    const newUser = new User({
      uid: uidToUse,
      firstName,
      lastName,
      email,
      phone,
      profilePic,
      role: role._id,
    });

    await newUser.save();
    const populatedUser = await User.findById(newUser._id).populate("role", "roleName permissions");

    res.status(201).json({ message: "User created successfully", user: populatedUser });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: err.message, code: err.code || "SERVER_ERROR" });
  }
};


// Get user by UID
export const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    console.log("Fetching user with UID:", uid);

    const user = await User.findOne({ uid }).populate("role");
    console.log("Found user:", user);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching user by UID:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all users with role
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("role", "roleName permissions");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get user by email
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).populate("role", "roleName permissions");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching user by email:", err);
    res.status(500).json({ error: err.message });
  }
};

// Reset failed attempts
export const resetFailedAttempts = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.failedAttempts = 0;
    user.isLocked = false;
    user.lockUntil = null;
    user.adminUnlockRequired = false;

    await user.save();
    res.json({ message: "Failed attempts reset successfully" });
  } catch (err) {
    console.error("Error resetting failed attempts:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    //  Update role if provided
    if (updates.roleName) {
      const roleNameNormalized = updates.roleName.toLowerCase().trim();
      let role = await Role.findOne({ roleName: roleNameNormalized });

      if (!role) {
        role = new Role({
          roleName: roleNameNormalized,
          permissions: { manageUsers: false, manageRoles: false },
        });
        await role.save();
        console.log("Created new role during update:", role);
      }

      updates.role = role._id;
      delete updates.roleName;
    }

    //  Whitelist allowed fields to prevent unsafe updates
    const allowedUpdates = ["firstName", "lastName", "phone", "profilePic", "role"];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        user[key] = updates[key];
      }
    });

    await user.save();

    const updatedUser = await User.findById(user._id).populate("role", "roleName permissions");
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: err.message, code: err.code || "SERVER_ERROR" });
  }
};


// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;

    // 1️ Find the user in MongoDB
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2️ Delete user in Firebase
    try {
      await admin.auth().deleteUser(uid);
      console.log("Firebase user deleted:", uid);
    } catch (firebaseErr) {
      console.error("Error deleting Firebase user:", firebaseErr);
      // Optionally, continue deleting in MongoDB even if Firebase fails
      return res.status(500).json({ error: "Failed to delete user in Firebase", details: firebaseErr.message });
    }

    // 3️ Delete user in MongoDB
    await User.deleteOne({ uid });
    console.log("MongoDB user deleted:", uid);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: err.message, code: err.code || "SERVER_ERROR" });
  }
};
