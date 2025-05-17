import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const districtSchema = new Schema({
  district_name: {
    type: String,
    required: true,
  },
  districthead_name: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  district_id: {
    type: String,
    required: true,
  },
});

export default model("District", districtSchema);