import { Schema, model } from "mongoose";
import ClassModel from "./classModel.js";
import mongoose from "mongoose";

const AssignmentSchema = new Schema({
    teacherId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassModel' }
});

export default model("AssignmentModel", AssignmentSchema);