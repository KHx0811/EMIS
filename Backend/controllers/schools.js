import School from "../models/schools.js";
import District from "../models/districts.js"; // Import District model
import bcrypt from "bcrypt";

export const getAllSchools = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }
    const schools = await School.find({});
    return res.status(200).json({
      status: "success",
      message: "All schools retrieved",
      data: schools,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "could not retrieve schools",
      data: error.message,
    });
  }
};

export const createSchool = async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const { school_name, district_id, principal_name, date_of_establishment, email, password } = req.body;

      const districtExists = await District.findOne({ district_id });
      if (!districtExists) {
        return res.status(404).json({
          status: "error",
          message: "District not found",
          code: "DISTRICT_NOT_FOUND",
          data: null,
        });
      }


      const randomNumber = Math.floor(100 + Math.random() * 900); // Generate a 4-digit random number
      const schoolId = `${school_name.slice(0, 4).toUpperCase()}${'0'}${district_id.slice(0,1)}${'0'}${randomNumber}`;
      

      const existingSchool = await School.findOne({ school_id: schoolId });
      if (existingSchool) {
        return res.status(400).json({
          status: "error",
          message: "Generated school ID already exists. Please try again.",
          data: null,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const school = new School({
        school_name,
        school_id: schoolId,
        district_id,
        principal_name,
        date_of_establishment,
        email,
        password: hashedPassword,
      });

      await school.save();
      return res.status(201).json({
        status: "success",
        message: "School created successfully",
        data: school,
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

export const deleteSchool = async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const schoolId = req.params.school_id;
      const school = await School.findOne({ school_id: schoolId });
      if (!school) {
        return res.status(404).json({
          status: "error",
          message: "School not found",
          data: null,
        });
      }
      await School.findOneAndDelete({ school_id: schoolId });
      return res.status(200).json({
        status: "success",
        message: "School deleted successfully",
        data: school,
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

export const updateSchool = async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const schoolId = req.params.school_id;
      const school = await School.findOne({ school_id: schoolId });
      if (!school) {
        return res.status(404).json({
          status: "error",
          message: "School not found",
          data: null,
        });
      }
      await School.findOneAndUpdate({ school_id: schoolId }, req.body);
      return res.status(200).json({
        status: "success",
        message: "School updated successfully",
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

export const getSchoolById = async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const schoolId = req.params.school_id;
      const school = await School.findOne({ school_id: schoolId });
      if (!school) {
        return res.status(404).json({
          status: "error",
          message: "School not found",
          data: null,
        });
      }
      return res.status(200).json({
        status: "success",
        message: "School retrieved successfully",
        data: school,
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

export const getPrincipalName = async (req, res) => {
  try {
    if (req.user.role !== "school") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }

    const schoolId = req.user.id;
    const principal = await School.findById(schoolId); // Extracted from the JWT token

    if (!principal) {
      return res.status(404).json({
        status: "error",
        message: "Principal not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Principal name retrieved successfully",
      data: principal.principal_name,
    });
  } catch (error) {
    console.error('Error in getPrincipalName:', error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error.message,
    });
  }
};