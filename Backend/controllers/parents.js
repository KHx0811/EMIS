import Parent from "../models/parents.js";
import Student from "../models/students.js";

export const getAllParents = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }
    
    const parents = await Parent.find({});
    return res.status(200).json({
      status: "success",
      message: "All parents retrieved",
      data: parents,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Could not retrieve parents",
      data: error.message,
    });
  }
};

export const createParent = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const student = await Student.findOne({ student_id: req.body.student_id });
      if (!student) {
        return res.status(404).json({
          status: "error",
          message: "Student ID not found. Please check the student ID.",
          data: null,
        });
      }

      if (student.parent_id !== req.body.parent_id) {
        return res.status(400).json({
          status: "error",
          message: "Parent ID does not match the Parent ID assigned to this student.",
          data: null,
        });
      }
      
      const existingParent = await Parent.findOne({ parent_id: req.body.parent_id });
      if (existingParent) {
        return res.status(409).json({
          status: "error",
          message: "Parent ID already exists. Please use a different Parent ID.",
          data: null,
        });
      }
      
      const parent = new Parent(req.body);
      await parent.save();
      
      return res.status(201).json({
        status: "success",
        message: "Parent created successfully",
        data: parent,
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

export const deleteParent = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const parentId = req.params.id;
      const parent = await Parent.findOneAndDelete({ parent_id: parentId });
      if (!parent) {
        return res.status(404).json({
          status: "error",
          message: "Parent not found",
          data: null,
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Parent deleted successfully",
        data: parent,
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

export const updateParent = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const parentId = req.params.id;
      const parent = await Parent.findOne({ parent_id: parentId });
      if (!parent) {
        return res.status(404).json({
          status: "error",
          message: "Parent not found",
          data: null,
        });
      }
      
      const updatedParent = await Parent.findOneAndUpdate(
        { parent_id: parentId }, 
        req.body, 
        { new: true }
      );
      
      return res.status(200).json({
        status: "success",
        message: "Parent updated successfully",
        data: updatedParent,
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

export const getParentById = async (req, res) => {
  try {
    if (req.user.role === "admin" || req.user.role === "school") {
      const parentId = req.params.id;
      const parent = await Parent.findOne({ parent_id: parentId });
      if (!parent) {
        return res.status(404).json({
          status: "error",
          message: "Parent not found",
          data: null,
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Parent retrieved successfully",
        data: parent,
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