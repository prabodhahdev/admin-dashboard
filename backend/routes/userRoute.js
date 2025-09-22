// backend/routes/userRoute.js
import express from "express";
import { createUser, getUsers, getUserByEmail, getUserByUid, resetFailedAttempts, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/email/:email", getUserByEmail); // this is for forgot password handle , getting email from params
router.put("/:uid/resetAttempts", resetFailedAttempts);
router.get("/:uid", getUserByUid);
router.put("/:uid", updateUser);
router.delete("/:uid", deleteUser);


export default router;
