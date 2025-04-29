import { 
  contactAdmin,
  createBudget,
  createDistrictMeeting,
  createExam,
  deleteBudget,
  deleteDistrictMeeting,
  getAllBudgets,
  getAllExams,
  getAllSchools,
  getBudgetById,
  getBudgetStats,
  getDistrictMeetingById,
  getDistrictMeetings,
  getDistrictMeetingsWithPrincipals,
  getDistrictProfile,
  getDistrictSchools,
  getExamById,
  getExamStats,
  searchSchool, 
  searchStudent, 
  searchTeacher, 
  updateBudget,
  updateDistrictMeeting,
  updateExam
} from "../controllers/DataController/district_data.js";
import {
  getAllDistricts,
  createDistrict,
  deleteDistrict,
  updateDistrict,
  getDistrictById,
  getDistrictName,
} from "../controllers/districts.js";
import { verifyToken, isAdmin, isDistrictHead } from "../middleware/authenticator.js";
import express from "express";


const router = express.Router();

router.get("/details", verifyToken, isDistrictHead, getDistrictName);
router.get("/profile", verifyToken, isDistrictHead, getDistrictProfile);
router.get("/search-school/:school_id", verifyToken, isDistrictHead, searchSchool);
router.get("/search-teacher/:teacher_id", verifyToken, isDistrictHead, searchTeacher);
router.get("/search-student/:student_id", verifyToken, isDistrictHead, searchStudent);
router.post("/contact-admin", verifyToken, isDistrictHead, contactAdmin);
router.get("/get-all-schools", verifyToken, isDistrictHead, getAllSchools);

// Budget routes for district head
router.get("/budgets", verifyToken, isDistrictHead, getAllBudgets);
router.get("/budgets/:budget_id", verifyToken, isDistrictHead, getBudgetById);
router.post("/budgets", verifyToken, isDistrictHead, createBudget);
router.put("/budgets/:budget_id", verifyToken, isDistrictHead, updateBudget);
router.delete("/budgets/:budget_id", verifyToken, isDistrictHead, deleteBudget);
router.get("/schools", verifyToken, isDistrictHead, getDistrictSchools);
router.get("/budget-stats", verifyToken, isDistrictHead, getBudgetStats);

// Meeting routes
router.get("/meetings", verifyToken, isDistrictHead, getDistrictMeetings);
router.get("/meetings/:meetingId", verifyToken, isDistrictHead, getDistrictMeetingById);
router.post("/meetings", verifyToken, isDistrictHead, createDistrictMeeting);
router.put("/meetings/:meetingId", verifyToken, isDistrictHead, updateDistrictMeeting);
router.delete("/meetings/:meetingId", verifyToken, isDistrictHead, deleteDistrictMeeting);
router.get("/principal-meetings", verifyToken, isDistrictHead, getDistrictMeetingsWithPrincipals);

//exam routes
router.get("/exams", verifyToken, isDistrictHead, getAllExams);
router.post("/exams", verifyToken, isDistrictHead, createExam);
router.get("/exams/:examId", verifyToken, isDistrictHead, getExamById);
router.put("/exams/:examId", verifyToken, isDistrictHead, updateExam);
router.delete("/exams/:examId", verifyToken, isDistrictHead, getExamStats);


router.get("/", verifyToken, isAdmin, getAllDistricts);
router.post("/", verifyToken, isAdmin, createDistrict);
router.delete("/:district_id", verifyToken, isAdmin, deleteDistrict);
router.put("/:district_id", verifyToken, isAdmin, updateDistrict);
router.get("/:district_id", verifyToken, isAdmin, getDistrictById);

export default router;
