import express from "express";
import {
  getAllTeachers,
  createTeacher,
  deleteTeacher,
  updateTeacher,
  getTeacherById,
  getTeacherName,
} from "../controllers/teachers.js";
import { isAdmin, isTeacher, verifyToken } from "../middleware/authenticator.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllTeachers);
router.post("/", verifyToken, isAdmin, createTeacher);
router.delete("/:id", verifyToken, isAdmin, deleteTeacher);
router.put("/:id", verifyToken, isAdmin, updateTeacher);
router.get("/:id", verifyToken, isAdmin, getTeacherById);
router.get("/details", verifyToken, isTeacher, getTeacherName);

export default router;
