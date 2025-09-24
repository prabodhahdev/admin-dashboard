import admin from "../firebase/admin.js";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const idToken = authHeader.split(" ")[1];

    // Verify ID token via Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Fetch user from MongoDB
    const user = await User.findOne({ uid: decodedToken.uid }).populate("role");
    if (!user) return res.status(401).json({ error: "Unauthorized: User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
