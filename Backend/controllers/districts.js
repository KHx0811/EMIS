import District from "../models/districts.js";
import bcrypt from "bcrypt";

export const getAllDistricts = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }
    const districts = await District.find({});
    return res.status(200).json({
      status: "success",
      message: "All districts retrieved",
      data: districts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "could not retrieve districts",
      data: error.message,
    });
  }
};

export const createDistrict = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const { district_name, state, email, password } = req.body;

      const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
      const districtId = `${district_name.slice(0, 4).toUpperCase()}${randomNumber}`;

      const existingDistrict = await District.findOne({ district_id: districtId });
      if (existingDistrict) {
        return res.status(400).json({
          status: "error",
          message: "Generated district ID already exists. Please try again.",
          data: null,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const district = new District({
        district_name,
        state,
        email,
        password: hashedPassword,
        district_id: districtId,
      });

      await district.save();
      return res.status(201).json({
        status: "success",
        message: "District created successfully",
        data: district,
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

export const deleteDistrict = async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const districtId = req.params.district_id;
      const district = await District.findOne({ district_id: districtId });
      if (!district) {
        return res.status(404).json({
          status: "error",
          message: "district not found",
          data: null,
        });
      }
      await District.findOneAndDelete({ district_id: districtId });
      return res.status(200).json({
        status: "success",
        message: "district deleted successfully",
        data: district,
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

export const updateDistrict = async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const districtId = req.params.district_id;
      const district = await District.findOne({ district_id: districtId });
      if (!district) {
        return res.status(404).json({
          status: "error",
          message: "district not found",
          data: null,
        });
      }
      await District.findOneAndUpdate({ district_id: districtId }, req.body);
      return res.status(200).json({
        status: "success",
        message: "district updated successfully",
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

export const getDistrictById = async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const districtId = req.params.district_id;
      const district = await District.findOne({ district_id: districtId });
      if (!district) {
        return res.status(404).json({
          status: "error",
          message: "district not found",
          data: null,
        });
      }
      return res.status(200).json({
        status: "success",
        message: "district retrieved successfully",
        data: district,
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

export const getDistrictName = async (req, res) => {
  try {
    if (req.user.role !== "districthead") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        data: null,
      });
    }

    const districtId = req.user.id;
    const district = await District.findById(districtId); // Extracted from the JWT token

    if (!district) {
      return res.status(404).json({
        status: "error",
        message: "DistrictHead not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "District name retrieved successfully",
      data: district.district_name,
    });
  } catch (error) {
    console.error('Error in getDistrictName:', error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error.message,
    });
  }
};