import Parent from "../models/parents.js";

export const getAllParents = async (req, res) => {
  try {
    if (req.role !== "admin" || req.role !== "school" || req.role !== "teacher" || req.role !== "districthead") {
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
      message: "could not retrieve parents",
      data: error.message,
    });
  }
};
export const createParent = async (req, res) => {
  try {
    if (req.role == "admin" || req.role == "school") {
      const parent = new Parent(req.body);
      await parent.save();
      return res.status(201).json({
        status: "success",
        message: "parent created successfully",
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
      message: " internal sever error",
      data: error.message,
    });
  }
};
export const deleteParent = async (req, res) => {
  try {
    if (req.role == "admin" || req.role == "school") {
      const parentId = req.params.id;
      const parent = await Parent.findById(parentId);
      if (!parent) {
        return res.status(404).json({
          status: "error",
          message: "parent not found",
          data: null,
        });
      }
      await Parent.findByIdAndDelete(parentId);
      return res.status(200).json({
        status: "success",
        message: "parent deleted successfully",
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
    if (req.role == "admin" || req.role == "school") {
      const parentId = req.params.id;
      const parent = await Parent.findById(parentId);
      if (!parent) {
        return res.status(404).json({
          status: "error",
          message: "parent not found",
          data: null,
        });
      }
      await Parent.findByIdAndUpdate(parentId, req.body);
      return res.status(200).json({
        status: "success",
        message: "parent updated successfully",
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
export const getParentById = async (req, res) => {
  try {
    if (req.role == "admin" || req.role == "school") {
      const parentId = req.params.id;
      const parent = await Parent.findById(parentId);
      if (!parent) {
        return res.status(404).json({
          status: "error",
          message: "parent not found",
          data: null,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "parent retrieved successfully",
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
