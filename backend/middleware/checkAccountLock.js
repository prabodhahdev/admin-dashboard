// backend/middleware/checkLock.js
export const checkLock = (req, res, next) => {
  const user = req.user; 
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (user.isLocked) {
    return res.status(403).json({ error: "Account locked. Please contact admin." });
  }

  next();
};
