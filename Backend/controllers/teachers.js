import Teacher from "../models/teacher.js";
import bcrypt from "bcrypt";

export const getAllTeachers = async (req, res) => {
  try {
    if (req.role !== "admin" && req.role !== "school" && req.role !== "districthead") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }
    const teachers = await Teacher.find({});
    return res.status(200).json({
      status: "success",
      message: "All teachers retrieved",
      data: teachers,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "could not retrieve teachers",
      data: error.message,
    });
  }
};

export const createTeacher = async (req, res) => {
  try {
    if (req.role == "admin" || req.body.school_id == req.user._id) {
      const { name, gender, age, school_id, religion, date_of_birth, nationality, qualification, email, phonenumber, password } = req.body;

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const teacher = new Teacher({
        name,
        gender,
        age,
        school_id,
        religion,
        date_of_birth,
        nationality,
        qualification,
        email,
        phonenumber,
        password: hashedPassword,
      });

      await teacher.save();
      return res.status(201).json({
        status: "success",
        message: "Teacher created successfully",
        data: teacher,
      });
    } else {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error.message,
    });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    if (req.role == "admin" || req.role == "school") {
      const teacherId = req.params.id;
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({
          status: "error",
          message: "Teacher not found",
          data: null,
        });
      }
      if (req.role == "school" && teacher.school_id != req.user._id) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized",
          data: null,
        });
      }
      await Teacher.findByIdAndUpdate(teacherId, req.body);
      return res.status(200).json({
        status: "success",
        message: "Teacher updated successfully",
        data: null,
      });
    } else {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error.message,
    });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    if (req.role == "admin" || req.role == "school") {
      const teacherId = req.params.id;
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({
          status: "error",
          message: "Teacher not found",
          data: null,
        });
      }
      if (req.role == "school" && teacher.school_id != req.user._id) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized",
          data: null,
        });
      }
      await Teacher.findByIdAndDelete(teacherId);
      return res.status(200).json({
        status: "success",
        message: "Teacher deleted successfully",
        data: null,
      });
    } else {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error.message,
    });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    if (req.role == "admin" || req.role == "school") {
      const teacherId = req.params.id;
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({
          status: "error",
          message: "Teacher not found",
          data: null,
        });
      }
      if (req.role == "school" && teacher.school_id != req.user._id) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized",
          data: null,
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Teacher retrieved successfully",
        data: teacher,
      });
    } else {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error.message,
    });
  }
};