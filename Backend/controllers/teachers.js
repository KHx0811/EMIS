import Teacher from "../models/teacher.js";
import School from "../models/schools.js";
import bcrypt from "bcrypt";

export const getAllTeachers = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
      data: null,
    });
  }

  try {
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
    if (req.user.role === "admin") {
      const { name, gender, age, school_id, religion, date_of_birth, nationality, qualification, email, phonenumber, password } = req.body;

      const schoolExists = await School.findOne({ school_id });
      if (!schoolExists) {
        return res.status(404).json({
          status: "error",
          message: "School not found",
          code: "SCHOOL_NOT_FOUND",
          data: null,
        });
      }

      const randomNumber = Math.floor(100 + Math.random() * 900);
      const teacherId = `${school_id.slice(0,2)}${'0'}${name.slice(0, 2).toUpperCase()}${randomNumber}`;

      const existingTeacher = await Teacher.findOne({ teacher_id: teacherId });
      if (existingTeacher) {
        return res.status(400).json({
          status: "error",
          message: "Generated teacher ID already exists. Please try again.",
          data: null,
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const teacher = new Teacher({
        teacher_id: teacherId,
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
    if (req.user.role == "admin") {
      const teacherId = req.params.teacher_id;
      const teacher = await Teacher.findOne({teacher_id : teacherId});
      if (!teacher) {
        return res.status(404).json({
          status: "error",
          message: "Teacher not found",
          data: null,
        });
      }
      if (req.user.role == "school" && teacher.school_id != req.user._id) {
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
    if (req.user.role == "admin") {
      const teacherId = req.params.teacher_id;
      const teacher = await Teacher.findOne({teacher_id : teacherId});
      if (!teacher) {
        return res.status(404).json({
          status: "error",
          message: "Teacher not found",
          data: null,
        });
      }
      if (req.user.role == "school" && teacher.school_id != req.user._id) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized",
          data: null,
        });
      }
      await Teacher.findOneAndDelete({teacher_id : teacherId},req.body);
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
    const teacherId = req.params.teacher_id;
    
    if (!teacherId) {
      return res.status(400).json({
        status: "error",
        message: "Teacher ID is required",
        data: null,
      });
    }

    if (req.user.role !== "admin" && req.user.role !== "school") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }

    const teacher = await Teacher.findOne({ teacher_id: teacherId });
    
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
        data: null,
      });
    }

    if (req.user.role === "school" && teacher.school_id != req.user._id) {
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
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error.message,
    });
  }
};

export const getTeacherName = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }

    console.log('User from token:', req.user); 
    const teacherId = req.user.teacher_id;
    console.log('Teacher ID:', teacherId);
    const teacher = await Teacher.findOne({ teacher_id: teacherId }); // Extracted from the JWT token

    if (!teacher) {
      console.log('No teacher found for ID:', teacherId);
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Teacher name retrieved successfully",
      data: { name: teacher.name },
    });
  } catch (error) {
    console.error('Error in getTeacherName:', error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error.message,
    });
  }
};