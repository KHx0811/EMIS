import jwt from "jsonwebtoken";
import User from "../models/users.js";
import config from "../config.js";
import Parent from "../models/parents.js";
import Teacher from "../models/teacher.js";
import School from "../models/schools.js";

const { jwt_secret } = config;

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
        data: null
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: "error",
        message: "Token format invalid",
        data: null
      });
    }

    const token = parts[1];

    jwt.verify(token, jwt_secret, (err, decoded) => {
      if (err) {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            status: "error",
            message: "Token expired",
            data: null
          });
        }
        return res.status(401).json({
          status: "error",
          message: "Invalid token",
          data: null
        });
      }
    }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null
    });
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

// Role-based middleware
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Admin role required.",
      data: null
    });
  }
  next();
};

export const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Teacher role required.",
      data: null
    });
  }
  next();
};

export const isSchool = (req, res, next) => {
  if (req.user.role !== 'school') {
    return res.status(403).json({
      status: "error",
      message: "Access denied. School role required.",
      data: null
    });
  }
  next();
};

export const isParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Parent role required.",
      data: null
    });
  }
  next();
};

export const isDistrictHead = (req, res, next) => {
  if (req.user.role !== 'districthead') {
    return res.status(403).json({
      status: "error",
      message: "Access denied. District Head role required.",
      data: null
    });
  }
  next();
};