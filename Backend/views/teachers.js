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
import { 
  getAllStudentsForTeacher, 
  searchStudentById, 
  uploadAttendance, 
  uploadMarks 
} from "../controllers/DataController/student_data.js";
import {
  classCheck, 
  createClass,
  teacherControllers
} from "../controllers/DataController/teacher_data.js";

const router = express.Router();

// Teacher profile and authentication
router.get("/details", verifyToken, isTeacher, getTeacherName);

// Student management
router.get("/all-students", verifyToken, isTeacher, getAllStudentsForTeacher);
router.post("/search-student/:studentId", verifyToken, isTeacher, searchStudentById);
router.post("/upload-marks", verifyToken, isTeacher, uploadMarks);
router.post("/upload-attendance", verifyToken, isTeacher, uploadAttendance);

// Class management
router.get("/classes", verifyToken, isTeacher, classCheck);
router.post("/create-class", verifyToken, isTeacher, createClass);

// Leave applications and parent interactions
router.post("/apply-leave", verifyToken, isTeacher, teacherControllers.applyLeave);
router.post("/parent-interaction", verifyToken, isTeacher, teacherControllers.recordParentInteraction);

// Admin routes for teacher management
router.get("/", verifyToken, isAdmin, getAllTeachers);
router.post("/", verifyToken, isAdmin, createTeacher);
router.delete("/:id", verifyToken, isAdmin, deleteTeacher);
router.put("/:id", verifyToken, isAdmin, updateTeacher);
router.get("/:id", verifyToken, isAdmin, getTeacherById);

export default router;