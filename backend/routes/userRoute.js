// backend/routes/userRoute.js
import express from "express";
import { createUser, getUsers, getUserByEmail, getUserByUid, resetFailedAttempts, updateUser, deleteUser, signupUser, getManageableUsers, toggleAccountLock, updateProfile, failedAttempt } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddlware.js";
import { checkLock } from "../middleware/checkAccountLock.js";

const router = express.Router();
router.post("/signup", signupUser);
router.post("/",authMiddleware,checkLock,createUser);
router.get("/",getUsers);
router.get("/manage",authMiddleware,checkLock, getManageableUsers); // get manageable roles
router.get("/email/:email", getUserByEmail); // this is for forgot password handle , getting email from params
router.put("/:uid/resetAttempts", authMiddleware,checkLock,resetFailedAttempts);
router.get("/:uid",authMiddleware,checkLock, getUserByUid);
router.put("/:uid", authMiddleware,checkLock,updateUser);
router.delete("/:uid", authMiddleware,checkLock,deleteUser);

router.put("/:uid/unlock", authMiddleware, checkLock,toggleAccountLock);
router.put("/profile/:uid", authMiddleware, checkLock,updateProfile);

router.put("/:uid/failedAttempt", failedAttempt);


export default router;
