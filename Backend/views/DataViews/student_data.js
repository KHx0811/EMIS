import express from "express";
import {uploadMarks,uploadAttendance,createAssignment,addActivity} from "../../controllers/DataController/student_data.js";
import { isTeacher } from "../../middleware/authenticator";

const router = express.Router();

router.post("/upload-marks", isTeacher, uploadMarks);
router.post("/upload-attendance", isTeacher, uploadAttendance);
router.post("/create-assignment", isTeacher, createAssignment);
router.post("/add-activity", isTeacher, addActivity);