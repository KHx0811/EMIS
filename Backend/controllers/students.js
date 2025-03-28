import Student from "../models/students.js";
import School from "../models/schools.js";

export const getAllStudents = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "school" && req.user.role !== "teacher" && req.user.role !== "parent" && req.user.role !== "districthead") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }
    
    const students = await Student.find({});
    return res.status(200).json({
      status: "success",
      message: "All students retrieved",
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "could not retrieve students",
      data: error.message,
    });
  }
};

export const createStudent = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const studentName = req.body.name || '';
      const schoolName = req.body.school || '';
      const schoolId = req.body.school_id;

      const existingSchool = await School.findOne({ school_id: schoolId });
      if (!existingSchool) {
        return res.status(404).json({
          status: "error",
          message: "School with the provided ID does not exist",
          data: null,
        });
      }

      const schoolPrefix = schoolName.substring(0, 2).toUpperCase();
      const studName = studentName.substring(0, 3).toUpperCase();

      let studentId;
      let parentId;
      let isUnique = false;

      while (!isUnique) {
        const randomNumber = Math.floor(10000 + Math.random() * 90000);
        studentId = `${schoolPrefix}${studName}${randomNumber}`;
        const existingStudent = await Student.findOne({ student_id: studentId });
        if (!existingStudent) {
          isUnique = true;
        }
      }

      // Generate parent_id
      const randomParentNumber = Math.floor(100 + Math.random() * 900);
      parentId = `${studName}0P${randomParentNumber}`;

      const studentData = {
        ...req.body,
        student_id: studentId,
        parent_id: parentId,
      };

      const student = new Student(studentData);
      await student.save();

      return res.status(201).json({
        status: "success",
        message: "Student created successfully",
        data: student,
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

export const deleteStudent = async (req, res) => {
  try {
    if (req.user.role === "admin" || req.user.role === "school") {
      const studentId = req.params.id;
      const student = await Student.findOne({ student_id: studentId });

      if (!student) {
        return res.status(404).json({
          status: "error",
          message: "student not found",
          data: null,
        });
      }

      if (req.user.role === "school" && student.school_id !== req.user._id) {
        return res.status(401).json({
          status: "error",
          message: "unauthorized",
          data: null,
        });
      }

      await Student.findOneAndDelete({ student_id: studentId });
      return res.status(200).json({
        status: "success",
        message: "student deleted successfully",
        data: null,
      });
    } else {
      return res.status(401).json({
        status: "error",
        message: "unauthorized",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "student cannot be deleted",
      data: error.message,
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    if (req.user.role === "admin" || req.user.role === "school") {
      const studentId = req.params.id;
      const student = await Student.findOne({ student_id: studentId });
      if (!student) {
        return res.status(404).json({
          status: "error",
          message: "student not found",
          data: null,
        });
      }
      if (req.user.role === "school" && student.school_id !== req.user._id) {
        return res.status(401).json({
          status: "error",
          message: "unauthorized",
          data: null,
        });
      }

      await Student.findOneAndUpdate({ student_id: studentId }, req.body);

      return res.status(200).json({
        status: "success",
        message: "student updated successfully",
        data: student,
      });
    } else {
      return res.status(401).json({
        status: "error",
        message: "unauthorized",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error.message,
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    if (req.user.role === "admin" || req.user.role === "school" || req.user.role === "parent" || req.user.role === "teacher") {
      const studentId = req.params.id;
      const student = await Student.findOne({ student_id: studentId });
      if (!student) {
        return res.status(404).json({
          status: "error",
          message: "student not found",
          data: null,
        });
      }
      if (
        (req.user.role === "school" && student.school_id !== req.user._id) ||
        (req.user.role === "parent" && student.parent_id !== req.user._id)
      ) {
        return res.status(401).json({
          status: "error",
          message: "unauthorized",
          data: null,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "student retrieved successfully",
        data: student,
      });
    } else {
      return res.status(401).json({
        status: "error",
        message: "unauthorized",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "internal server error",
      data: error.message,
    });
  }
};