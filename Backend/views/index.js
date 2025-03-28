import { rootController } from "../controllers/index.js";
import students from "./students.js";
import teachers from "./teachers.js";
import districts from "./districts.js";
import schools from "./schools.js";
import parents from "./parents.js";
import auth from "./auth.js";
import stats from "./stats.js";
import students_data from "./DataViews/student_data.js";
import express from "express";

const router = express.Router();

router.use("/students", students);
router.use("/students_data", students_data);
router.use("/teachers", teachers);
router.use("/districts", districts);
router.use("/schools", schools);
router.use("/parents", parents);
router.use("/auth", auth);
router.use("/stats", stats);
router.get("/", rootController);

export default router;
