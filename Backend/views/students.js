import {
  getAllStudents,
  createStudent,
  deleteStudent,
  updateStudent,
  getStudentById,
} from "../controllers/students.js";
import { verifyToken,isAdmin,isTeacher } from "../middleware/authenticator.js";
import express from "express";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllStudents);
router.post("/", verifyToken,isAdmin, createStudent);
router.delete("/:id", verifyToken,isAdmin, deleteStudent);
router.put("/:id", verifyToken,isAdmin, updateStudent);
router.get("/:id", verifyToken,isAdmin, getStudentById);

export default router;
