import express from "express";
import {applyLeave,recordParentInteraction,addTeacherNote,getTeacherProfile} from "../../controllers/DataController/student_data.js";
import { isTeacher } from "../../middleware/authenticator";

const router = express.Router();

router.post("/apply-leave", isTeacher, applyLeave);
router.post("/record-parent-interaction", isTeacher, recordParentInteraction);
router.post("/add-teacher-note", isTeacher, addTeacherNote);
router.get("/get-teacher-profile", isTeacher, getTeacherProfile);