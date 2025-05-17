import { Schema, model } from "mongoose";


const ClassSchema = new Schema({
    teacherId: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    students: [{ type: String }],
    class_code: { type: String, required: true, unique: true },
});

export default model("ClassModel", ClassSchema);