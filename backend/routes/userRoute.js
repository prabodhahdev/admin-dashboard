// backend/routes/userRoute.js
import express from "express";
import { createUser, getUsers, getUserByEmail, getUserByUid, resetFailedAttempts, updateUser, deleteUser, signupUser, getManageableUsers, toggleAccountLock } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddlware.js";

const router = express.Router();
router.post("/signup", signupUser);
router.post("/",authMiddleware,createUser);
router.get("/",getUsers);
router.get("/manage",authMiddleware, getManageableUsers); // get manageable roles
router.get("/email/:email", getUserByEmail); // this is for forgot password handle , getting email from params
router.put("/:uid/resetAttempts", authMiddleware,resetFailedAttempts);
router.get("/:uid",authMiddleware, getUserByUid);
router.put("/:uid", authMiddleware,updateUser);
router.delete("/:uid", authMiddleware,deleteUser);

router.put("/:uid/unlock", authMiddleware, toggleAccountLock);


export default router;
