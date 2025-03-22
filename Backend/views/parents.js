import express from "express";
import {
  getAllParents,
  createParent,
  deleteParent,
  updateParent,
  getParentById,
} from "../controllers/parents.js";
import { verifyToken, isAdmin} from "../middleware/authenticator.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllParents);
router.post("/", verifyToken, isAdmin, createParent);
router.delete("/:id", verifyToken, isAdmin, deleteParent);
router.put("/:id", verifyToken, isAdmin, updateParent);
router.get("/:id", verifyToken, isAdmin, getParentById);

export default router;
