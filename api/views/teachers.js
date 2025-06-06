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
  assignAssignment,
  getAllStudentsForTeacher, 
  getAttendance, 
  getStudentAttendance, 
  getStudentsByClass, 
  searchStudentById, 
  updateStudentAttendance, 
  uploadAttendance, 
  uploadMarks 
} from "../controllers/DataController/student_data.js";
import {
  applyLeave,
  cancelEventRegistration,
  classCheck, 
  contactAdmin, 
  createClass,
  deleteClass,
  getAllMessages,
  getClassesForTeacher,
  getLeaveApplications,
  getSchoolEventsForTeacher,
  getStudentsInClass,
  getTeacherClasses,
  getTeacherEventRegistrations,
  recordParentInteraction,
  registerStudentForEvent,
  searchStudent,
} from "../controllers/DataController/teacher_data.js";
import { getSchoolEvents } from "../controllers/DataController/principal_data.js";

const router = express.Router();

// Teacher profile and authentication
router.get("/details", verifyToken, isTeacher, getTeacherName);

// Student management
router.get("/all-students", verifyToken, isTeacher, getAllStudentsForTeacher);
router.post("/upload-marks", verifyToken, isTeacher, uploadMarks);
router.get("/class-students/:classId", verifyToken, isTeacher, getStudentsByClass);
router.post("/assign-assignment", verifyToken, isTeacher, assignAssignment);
router.get("/search-student/:studentId", verifyToken, isTeacher, searchStudent)

router.post("/upload-attendance", verifyToken, isTeacher, uploadAttendance);
router.get('/get-attendance/:classId/:date', verifyToken, isTeacher, getAttendance);
router.get('/student-attendance/:studentId', verifyToken, isTeacher, getStudentAttendance);
router.post('/update-attendance', verifyToken, isTeacher, uploadAttendance); 
router.post('/update-student-attendance', verifyToken,isTeacher, updateStudentAttendance);

// Class management
router.get("/classes", verifyToken, isTeacher, classCheck);
router.post("/create-class", verifyToken, isTeacher, createClass);
router.delete("/delete-class/:classId", verifyToken, isTeacher, deleteClass);
router.get("/teacher-classes", verifyToken, isTeacher, getClassesForTeacher);

// Message and communication
router.post("/contact-admin", verifyToken, isTeacher, contactAdmin);
router.get("/contact-admin/messages", verifyToken, isTeacher, getAllMessages);

// Leave applications and parent interactions
router.post("/apply-leave", verifyToken, isTeacher, applyLeave);
router.get("/leave-applications", verifyToken, isTeacher, getLeaveApplications);
router.post("/parent-interaction", verifyToken, isTeacher, recordParentInteraction);

//event routes
router.get('/school-events', verifyToken, isTeacher, getSchoolEventsForTeacher);
router.get('/classes', verifyToken, isTeacher, getTeacherClasses);
router.get('/classes/:classId/students', verifyToken, isTeacher, getStudentsInClass);
router.post('/register-event', verifyToken, isTeacher, registerStudentForEvent);
router.get('/event-registrations', verifyToken, isTeacher, getTeacherEventRegistrations);
router.put('/event-registrations/:registrationId/cancel', verifyToken, isTeacher, cancelEventRegistration);

// Admin routes
router.get("/", verifyToken, isAdmin, getAllTeachers);
router.post("/", verifyToken, isAdmin, createTeacher);
router.delete("/:id", verifyToken, isAdmin, deleteTeacher);
router.put("/:id", verifyToken, isAdmin, updateTeacher);
router.get("/:id", verifyToken, isAdmin, getTeacherById);

export default router;