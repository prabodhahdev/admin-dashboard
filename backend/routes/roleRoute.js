// routes/roleRoutes.js
import express from "express";
import { createRole, deleteRole, getRoles, updateRole } from "../controllers/roleController.js";

const router = express.Router();

router.post("/", createRole);
router.get("/", getRoles);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
