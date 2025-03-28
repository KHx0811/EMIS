import express from "express";
import {uploadMarks,uploadAttendance,searchStudentById} from "../../controllers/DataController/student_data.js";
import { isTeacher } from "../../middleware/authenticator.js";

const router = express.Router();

router.post("/upload-marks", isTeacher, uploadMarks);
router.post("/upload-attendance", isTeacher, uploadAttendance);
router.post("/search-student/:studentId", isTeacher, searchStudentById);

export default router;