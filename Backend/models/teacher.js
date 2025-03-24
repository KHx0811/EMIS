import { Schema, model } from "mongoose";

const teacherSchema = new Schema({
  teacher_id:{
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  school_id: {
    type: String,
    required: true,
  },
  religion: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phonenumber: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default model("teachers", teacherSchema);
