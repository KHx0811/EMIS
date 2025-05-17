import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventModel',
      required: true
    },
    student_id: {
      type: String,
      required: true,
      trim: true
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassModel',
      required: true
    },
    teacher_id: {
      type: String,
      required: true,
      trim: true
    },
    participation_type: {
      type: String,
      required: true,
      trim: true
    },
    skill_group: {
      type: String,
      required: true,
      trim: true
    },
    registration_date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Registered', 'Withdrawn', 'Completed'],
      default: 'Registered'
    }
  },
  { timestamps: true }
);

export default mongoose.model("EventRegistration", eventRegistrationSchema);