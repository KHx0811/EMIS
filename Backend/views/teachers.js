import express from "express";
import {
  getAllTeachers,
  createTeacher,
  deleteTeacher,
  updateTeacher,
  getTeacherById,
} from "../controllers/teachers.js";
import { isAdmin, verifyToken } from "../middleware/authenticator.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllTeachers);
router.post("/", verifyToken, isAdmin, createTeacher);
router.delete("/:id", verifyToken, isAdmin, deleteTeacher);
router.put("/:id", verifyToken, isAdmin, updateTeacher);
router.get("/:id", verifyToken, isAdmin, getTeacherById);

export default router;
