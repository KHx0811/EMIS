import { Schema, model } from "mongoose";
const schoolSchema = new Schema({
  school_name: {
    type: String,
    required: true,
  },
  school_id: {
    type: String,
    required: true,
  },
  district_id: {
    type: String,
    required: true,
  },
  principal_name: {
    type: String,
    required: true,
  },
  date_of_establishment: {
    type: Date,
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
});

export default model("schools", schoolSchema);
