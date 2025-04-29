import express from "express";
import {
  getAllParents,
  createParent,
  deleteParent,
  updateParent,
  getParentById,
  getParentName,
} from "../controllers/parents.js";
import { verifyToken, isAdmin, isParent} from "../middleware/authenticator.js";
import { getChildAttendance, getChildDetails, getChildMarks, getParentProfile } from "../controllers/DataController/parent_data.js";

const router = express.Router();

router.get("/details", verifyToken, isParent, getParentName);
router.get("/profile", verifyToken, isParent, getParentProfile);
router.get("/child-details", verifyToken, isParent, getChildDetails);
router.get("/child-attendance/:studentId", verifyToken, isParent, getChildAttendance);
router.get("/child-marks/:studentId", verifyToken, isParent, getChildMarks);

router.get("/", verifyToken, isAdmin, getAllParents);
router.post("/", verifyToken, isAdmin, createParent);
router.delete("/:id", verifyToken, isAdmin, deleteParent);
router.put("/:id", verifyToken, isAdmin, updateParent);
router.get("/:id", verifyToken, isAdmin, getParentById);

export default router;
