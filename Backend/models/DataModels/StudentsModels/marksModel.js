import { model, Model,Schema } from "mongoose";

const MarksSchema = new Schema({
    student_id: { type: String, required: true },
    subject: { type: String, required: true },
    value: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    examType: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Unit Test', 'Project'], required: true },
    date: { type: Date, default: Date.now }
});

export default model("MarksModel", MarksSchema);