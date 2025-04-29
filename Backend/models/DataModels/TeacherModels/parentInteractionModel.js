import { Schema, model } from "mongoose";


const ParentInteractionSchema = new Schema({
    teacherId: { type: String, required: true },
    studentId: { type: String, required: true },
    interactionType: { type: String, enum: ['Email', 'Phone', 'Meeting', 'Message'], required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

export default model("ParentInteractionModel", ParentInteractionSchema);