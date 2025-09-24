import admin from "../firebase/admin.js";
import Role from "../models/Role.js";
import User from "../models/User.js";


// User signup -public
export const signupUser = async (req, res) => {
  try {
    const { uid, email, firstName, lastName, phone } = req.body;

    // 1️ Validate required fields
    if (!uid || !email || !firstName || !lastName || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 2️ Check if user already exists in MongoDB
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 3️ Get default role
    const defaultRole = await Role.findOne({ roleName: "user" });
    if (!defaultRole) {
      return res.status(500).json({ error: "Default role not found" });
    }

    // 4️ Save user in MongoDB
    const newUser = await User.create({
      uid,
      firstName,
      lastName,
      email,
      phone,
      role: defaultRole._id,
    });

    // 5️ Populate role and return
    const populatedUser = await User.findById(newUser._id).populate(
      "role",
      "roleName level permissions"
    );

    return res.status(201).json({
      message: "User signed up successfully",
      user: populatedUser,
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const {
      uid: providedUid,
      firstName,
      lastName,
      email,
      phone,
      roleName,
      profilePic,
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res
        .status(400)
        .json({ error: "First name, last name, and email are required" });
    }

    // Check duplicates
    const existingUser = await User.findOne({
      $or: [{ email }, { uid: providedUid }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email or UID" });
    }

    // Find target role
    const role = await Role.findOne({ roleName: roleName.toLowerCase().trim() });
    if (!role) {
      return res
        .status(400)
        .json({ error: `Role "${roleName}" does not exist.` });
    }

    // Get current logged-in user
    const currentUser = await User.findById(req.user._id).populate("role");
    if (!currentUser || !currentUser.role) {
      return res.status(403).json({ error: "Current user role not found" });
    }

    // Prevent assigning equal/higher roles
    if (role.level <= currentUser.role.level) {
      return res
        .status(403)
        .json({ error: "Cannot assign a role equal or higher than your level" });
    }

    //  Determine Firebase UID
    let uidToUse = providedUid;
    if (!uidToUse) {
      const createParams = {
        email,
        emailVerified: false,
        password:
          Math.random().toString(36).slice(-10) + "Aa1!", // random temp password
        displayName: `${firstName} ${lastName}`,
        disabled: false,
      };

      if (phone && /^\+\d{10,15}$/.test(phone)) {
        createParams.phoneNumber = phone;
      }
      if (profilePic && /^https?:\/\//i.test(profilePic)) {
        createParams.photoURL = profilePic;
      }

      const firebaseUser = await admin.auth().createUser(createParams);
      uidToUse = firebaseUser.uid;
    }

    // 💾 Save in MongoDB
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

    const populatedUser = await User.findById(newUser._id).populate(
      "role",
      "roleName permissions level"
    );

    // ✅ Return without generating custom token
    res.status(201).json({
      message: "User created successfully",
      user: populatedUser,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({
      error: err.message,
      code: err.code || "SERVER_ERROR",
    });
  }
};

// Get user by UID
export const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    // req.user is the logged-in user (from authMiddleware)
    // You can add role-based checks here if needed
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ uid }).populate("role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data (exclude sensitive info like password)
    const userData = {
      uid: user.uid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role ? {
        roleName: user.role.roleName,
        level: user.role.level,
        permissions: user.role.permissions,
      } : null,
      profilePic: user.profilePic || null,
    };

    res.status(200).json(userData);
  } catch (err) {
    console.error("Error fetching user by UID:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all users with role
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("role", "roleName permissions level");

    // Convert users to plain objects for response
    const usersList = users.map((user) => user.toObject());

    res.json(usersList);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
};

// // Get user by email
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).populate(
      "role",
      "roleName permissions"
    );

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

    // Find user
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Reset fields
    user.failedAttempts = 0;
    user.isLocked = false;
    user.lockUntil = null;
    user.adminUnlockRequired = false;

    await user.save();

    // Optionally, return updated user info
    const populatedUser = await User.findById(user._id).populate("role", "roleName level permissions");

    res.json({
      message: "Failed attempts reset successfully",
      user: populatedUser,
    });
  } catch (err) {
    console.error("Error resetting failed attempts:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update user based on roles [manage users]
export const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;

    // 1. Find the user to update
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Get current logged-in user
    const currentUser = await User.findById(req.user._id).populate("role");
    if (!currentUser || !currentUser.role) {
      return res.status(403).json({ error: "Current user role not found" });
    }

    // 3. Handle role updates (if provided)
    if (updates.roleName) {
      const roleNameNormalized = updates.roleName.toLowerCase().trim();
      const role = await Role.findOne({ roleName: roleNameNormalized });

      if (!role) {
        return res.status(400).json({ error: `Role "${roleNameNormalized}" does not exist.` });
      }

      // 4. Role-level enforcement
      // Current user cannot assign a role >= their own level
      if (role.level <= currentUser.role.level) {
        return res.status(403).json({
          error: "Cannot assign a role equal or higher than your level",
        });
      }

      updates.role = role._id;
      delete updates.roleName;
    }

    // 5. Whitelist allowed fields
    const allowedUpdates = [
      "firstName",
      "lastName",
      "phone",
      "profilePic",
      "role",
      "isLocked",
      "lockedCount",
      "failedAttempts",
      "lockUntil",
      "adminUnlockRequired",
    ];

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        user[key] = updates[key];
      }
    });

    await user.save();

    // 6. Populate role in response
    const updatedUser = await User.findById(user._id).populate(
      "role",
      "roleName permissions level"
    );

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res
      .status(500)
      .json({ error: err.message, code: err.code || "SERVER_ERROR" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;

    // ------------------------------
    // 1️ Find the user in MongoDB
    // ------------------------------
    const user = await User.findOne({ uid }).populate("role");
    if (!user) return res.status(404).json({ error: "User not found" });

    // ------------------------------
    // 2️ Get current logged-in user
    // ------------------------------
    const currentUser = await User.findById(req.user._id).populate("role");
    if (!currentUser || !currentUser.role) {
      return res.status(403).json({ error: "Current user role not found" });
    }

    // ------------------------------
    // 3️ Role-level enforcement
    // Cannot delete users with equal or higher role level
    // ------------------------------
    if (user.role.level <= currentUser.role.level) {
      return res.status(403).json({
        error: "Cannot delete a user with equal or higher role level",
      });
    }

    // ------------------------------
    // 4️ Delete user in Firebase
    // ------------------------------
    try {
      await admin.auth().deleteUser(uid);
      console.log("Firebase user deleted:", uid);
    } catch (firebaseErr) {
      console.error("Error deleting Firebase user:", firebaseErr);
      return res.status(500).json({
        error: "Failed to delete user in Firebase",
        details: firebaseErr.message,
      });
    }

    // ------------------------------
    // 5️ Delete user in MongoDB
    // ------------------------------
    await User.deleteOne({ uid });
    console.log("MongoDB user deleted:", uid);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: err.message, code: err.code || "SERVER_ERROR" });
  }
};

// Get manageable users based on role level
export const getManageableUsers = async (req, res) => {
  try {
    const currentUser = req.user; // set by authMiddleware
    if (!currentUser || !currentUser.role) {
      return res.status(403).json({ error: "Current user role not found" });
    }

    const currentLevel = currentUser.role.level;

    // Fetch users with role info
    const allUsers = await User.find().populate("role", "roleName permissions level");

    // Filter users based on level
    const manageableUsers = allUsers.filter(user => {
      return user.role && user.role.level > currentLevel;
    });

    res.json(manageableUsers);
  } catch (err) {
    console.error("Error fetching manageable users:", err);
    res.status(500).json({ error: err.message });
  }
};

//unlock or lock account
export const toggleAccountLock = async (req, res) => {
  const { uid } = req.params;
  const { lock } = req.body; // true = lock, false = unlock

  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (lock) {
      user.isLocked = true;
      user.adminUnlockRequired = true; // optional: require admin to unlock next time
    } else {
      user.isLocked = false;
      user.adminUnlockRequired = false;
      user.lockUntil = null;
      user.failedAttempts = 0;
      user.lockoutCount = 0;
    }

    await user.save();
    res.json({ message: lock ? "Account locked" : "Account unlocked", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update profile for currently logged-in user
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.uid; // get UID from URL
    const { firstName, lastName, phone, profilePic } = req.body;

    const user = await User.findOne({ uid: userId }).populate("role");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (profilePic) user.profilePic = profilePic;

    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: err.message });
  }
};


export const failedAttempt = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    let failedAttempts = (user.failedAttempts || 0) + 1;
    let update = { failedAttempts };

    const now = Date.now();

    if (failedAttempts >= 2) { // MAX_FAILED_ATTEMPTS
      update.isLocked = true;
      update.lockUntil = now + 1 * 60 * 1000; // 1 min
      update.failedAttempts = 0;
      update.lockoutCount = (user.lockoutCount || 0) + 1;

      if (update.lockoutCount >= 3) { // MAX_LOCKOUTS_PER_DAY
        update.adminUnlockRequired = true;
      }
    }

    await User.updateOne({ uid }, { $set: update });
    res.json({ success: true, update });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
