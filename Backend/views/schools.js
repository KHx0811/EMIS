import express from 'express';
import { 
    getAllSchools, 
    createSchool, 
    deleteSchool, 
    updateSchool, 
    getSchoolById, 
    getPrincipalName 
} from '../controllers/schools.js';
import { isAdmin, isSchool, verifyToken } from "../middleware/authenticator.js";
import { 
    contactAdmin,
    createEvent,
    createFees, 
    createMeeting, 
    deleteBudgetUsage, 
    deleteEvent, 
    deleteFee, 
    deleteMeeting, 
    getAllFees, 
    getBudgetStats, 
    getBudgetUsageHistory, 
    getFeeById, 
    getMeetingById, 
    getMeetings, 
    getPendingLeaveApplications, 
    getPrincipalMeetingsWithDistrict, 
    getPrincipalProfile, 
    getSchoolBudgets, 
    getSchoolEvents, 
    recordBudgetUsage, 
    searchStudent, 
    searchTeacher, 
    updateEvent, 
    updateFee, 
    updateLeaveStatus,
    updateMeeting
} from '../controllers/DataController/principal_data.js';

const router = express.Router();

// Principal routes
router.get("/details", verifyToken, isSchool, getPrincipalName);
router.get("/search-student/:student_id", verifyToken, isSchool, searchStudent);
router.get("/search-teacher/:teacher_id", verifyToken, isSchool, searchTeacher);
router.get("/profile", verifyToken, isSchool, getPrincipalProfile);
router.post("/contact-admin", verifyToken, isSchool, contactAdmin);

// Fees routes
router.post("/fees/create-fees", verifyToken, isSchool, createFees);
router.get("/fees", verifyToken, isSchool, getAllFees);
router.get("/fees/:fee_id", verifyToken, isSchool, getFeeById);
router.put("/fees/:fee_id", verifyToken, isSchool, updateFee);
router.delete("/fees/:fee_id", verifyToken, isSchool, deleteFee);

// Event Routes
router.post('/create-event', verifyToken, isSchool, createEvent);
router.get('/events', verifyToken, isSchool, getSchoolEvents);
router.put('/event/:eventId', verifyToken, isSchool, updateEvent);
router.delete('/event/:eventId', verifyToken, isSchool, deleteEvent);

// Leave Application Routes
router.get('/leave-applications', verifyToken, isSchool, getPendingLeaveApplications);
router.put('/leave-applications/:applicationId', verifyToken, isSchool, updateLeaveStatus);

// Budget Management Routes
router.get('/budgets', verifyToken, isSchool, getSchoolBudgets);
router.get('/budget-stats', verifyToken, isSchool, getBudgetStats);
router.post('/budgets/usage', verifyToken, isSchool, recordBudgetUsage);
router.get('/budgets/usage/:budget_id', verifyToken, isSchool, getBudgetUsageHistory);
router.delete('/budgets/usage/:usage_id', verifyToken, isSchool, deleteBudgetUsage);

// Meeting Routes
router.get("/meetings", verifyToken, isSchool, getMeetings );
router.post("/meetings", verifyToken, isSchool, createMeeting);
router.delete("/meetings/:meetingId", verifyToken, isSchool, deleteMeeting);
router.put("/meetings/:meetingId", verifyToken, isSchool, updateMeeting);
router.get("/meetings/:meetingId", verifyToken, isSchool, getMeetingById);
router.get("/districthead-meetings", verifyToken, isSchool, getPrincipalMeetingsWithDistrict);  


// Admin routes
router.get("/", verifyToken, isAdmin, getAllSchools);
router.post("/", verifyToken, isAdmin, createSchool);
router.delete("/:school_id", verifyToken, isAdmin, deleteSchool);
router.put("/:school_id", verifyToken, isAdmin, updateSchool);
router.get("/:school_id", verifyToken, isAdmin, getSchoolById);

export default router;