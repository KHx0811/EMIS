import { Schema, model } from "mongoose";


const LeaveApplicationSchema = new Schema({
    teacherId: { type: String, required: true },
    applicationId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    appliedDate: { type: Date, default: Date.now }
});

export default model("LeaveApplicationModel", LeaveApplicationSchema);