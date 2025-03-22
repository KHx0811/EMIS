import { login, resetPassword, sendResetOtp, signup, verifyTokenStatus } from "../controllers/auth.js";
import express from "express";
import { verifyToken } from "../middleware/authenticator.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);
router.get("/verify",verifyToken, verifyTokenStatus);

export default router;
