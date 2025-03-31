import express from 'express';
import { getAllSchools, createSchool, deleteSchool, updateSchool, getSchoolById, getPrincipalName } from '../controllers/schools.js';
import { isAdmin, isSchool, verifyToken } from "../middleware/authenticator.js";


const router = express.Router();

router.get("/details", verifyToken, isSchool, getPrincipalName);

router.get("/", verifyToken, isAdmin, getAllSchools);
router.post("/", verifyToken, isAdmin, createSchool);
router.delete("/:school_id", verifyToken, isAdmin, deleteSchool);
router.put("/:school_id", verifyToken, isAdmin, updateSchool);
router.get("/:school_id", verifyToken, isAdmin, getSchoolById);

export default router;