import {
  getAllDistricts,
  createDistrict,
  deleteDistrict,
  updateDistrict,
  getDistrictById,
} from "../controllers/districts.js";
import { verifyToken, isAdmin } from "../middleware/authenticator.js";
import express from "express";


const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllDistricts);
router.post("/", verifyToken, isAdmin, createDistrict);
router.delete("/:district_id", verifyToken, isAdmin, deleteDistrict);
router.put("/:district_id", verifyToken, isAdmin, updateDistrict);
router.get("/:district_id", verifyToken, isAdmin, getDistrictById);

export default router;
