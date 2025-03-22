import User from "../models/users.js";
import transporter from "../services/nodemailer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Parent from "../models/parents.js";
import School from "../models/schools.js";
import Teacher from "../models/teacher.js";
import District from "../models/districts.js";
import config from "../config.js";
import dotenv from "dotenv";

dotenv.config();

const { jwt_secret } = config;

export const signup = async (req, res) => {
  try {
    const { username, password, retypedPassword, email } = req.body;
    if (password !== retypedPassword) {
      return res.status(400).json({
        status: "error",
        message: "Passwords do not match",
        data: null,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    return res.status(201).json({
      status: "success",
      message: "user created successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { loginType } = req.body;
    if (loginType === "admin") {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid username or password",
          data: null,
        });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid username or password",
          data: null,
        });
      }
      const token = jwt.sign({ role: "admin", id: user._id }, jwt_secret, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        status: "success",
        message: "user logged in successfully",
        data: token,
      });
    } else if (loginType === "parent") {
      const { email, dateOfBirth } = req.body;
      const user = await Parent.findOne({
        email: email,
        date_of_birth: dateOfBirth,
      });
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid email or date of birth",
          data: null,
        });
      }
      const token = jwt.sign({ role: "parent", id: user._id }, jwt_secret, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        status: "success",
        message: "user logged in successfully",
        data: token,
      });
    } else if (loginType === "teacher") {
      const { schoolId, email, password } = req.body;
      const user = await Teacher.findOne({ school_id: schoolId, email: email });
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid email or school ID",
          data: null,
        });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid password",
          data: null,
        });
      }
      const token = jwt.sign({ role: "teacher", id: user._id }, jwt_secret, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        status: "success",
        message: "user logged in successfully",
        data: token,
      });
    } else if (loginType === "school") {
      const { schoolId, email, password } = req.body;
      const user = await School.findOne({ school_id: schoolId, email: email });
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid school ID or email",
          data: null,
        });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid password",
          data: null,
        });
      }
      const token = jwt.sign({ role: "school", id: user._id }, jwt_secret, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        status: "success",
        message: "user logged in successfully",
        data: token,
      });
    } else if (loginType === "districthead") {
      const { districtId, email, password } = req.body;
      const user = await District.findOne({ district_id: districtId, email: email });
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid district ID or email",
          data: null,
        });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid password",
          data: null,
        });
      }
      const token = jwt.sign({ role: "districthead", id: user._id }, jwt_secret, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        status: "success",
        message: "user logged in successfully",
        data: token,
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Invalid login type",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Enter email" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `OTP for resetting password for your account is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Enter all fields" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = newHashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const verifyTokenStatus = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "Token is valid",
      data: {
        userId: req.user.id,
        role: req.user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null
    });
  }
};