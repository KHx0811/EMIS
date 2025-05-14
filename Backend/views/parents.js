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
import { contactAdmin, getAllMessages, getAllSchoolEvents, getChildAttendance, getChildDetails, getChildEventRegistrations, getChildFeeDetails, getChildFeePayments, getChildFeeStructure, getChildMarks, getChildTeachers, getParentInteractions, getParentProfile, getUpcomingEvents } from "../controllers/DataController/parent_data.js";

const router = express.Router();

router.get("/details", verifyToken, isParent, getParentName);
router.get("/profile", verifyToken, isParent, getParentProfile);
router.get("/child-details", verifyToken, isParent, getChildDetails);
router.get("/child-attendance/:studentId", verifyToken, isParent, getChildAttendance);
router.get("/child-marks/:studentId", verifyToken, isParent, getChildMarks);
router.get("/child-teachers/:studentId", verifyToken, isParent, getChildTeachers);
router.get('/child-fee-structure/:studentId', verifyToken, isParent, getChildFeeStructure);
router.get('/child-fee-payments/:studentId', verifyToken, isParent, getChildFeePayments);
router.get('/child-fee-details/:studentId', verifyToken, isParent, getChildFeeDetails);

router.get('/school-events', verifyToken, isParent, getAllSchoolEvents);
router.get('/event-registrations', verifyToken, isParent, getChildEventRegistrations);
router.get('/event-registrations/:registrationId', verifyToken, isParent, getChildEventRegistrations);
router.get('/upcoming-events', verifyToken, isParent, getUpcomingEvents);
router.get('/interactions', verifyToken, isParent, getParentInteractions);

router.post("/contact-admin", verifyToken, isParent, contactAdmin);
router.get("/contact-admin/messages", verifyToken, isParent, getAllMessages);


router.get("/", verifyToken, isAdmin, getAllParents);
router.post("/", verifyToken, isAdmin, createParent);
router.delete("/:id", verifyToken, isAdmin, deleteParent);
router.put("/:id", verifyToken, isAdmin, updateParent);
router.get("/:id", verifyToken, isAdmin, getParentById);

export default router;
