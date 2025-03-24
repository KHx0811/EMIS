import { Schema, model } from "mongoose";
const parentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  parent_id:{
    type: String,
    required: true
  },
  student_id:{
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
  },
  relation:{
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
});
export default model("parents", parentSchema);
