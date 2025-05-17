import { model, Schema } from "mongoose";

const AttendanceSchema = new Schema({
    student_id: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent'], required: true }
});

export default model("AttendanceModel", AttendanceSchema);