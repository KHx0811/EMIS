import mongoose from "mongoose";

const schoolEventSchema = new mongoose.Schema(
  {
    school_id: {
      type: String,
      required: true,
      trim: true
    },
    eventName: {
      type: String,
      required: true,
      trim: true
    },
    eventDescription: {
      type: String,
      required: true,
      trim: true
    },
    eventDate: {
      type: Date,
      required: true
    },
    eventTime: {
      type: String,
      default: ''
    },
    eventLocation: {
      type: String,
      required: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true,
      enum: ['Academic', 'Cultural', 'Sports', 'Festival', 'Competition', 'Workshop', 'Parent-Teacher Meeting', 'Other']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'schools',
      required: true
    },
    attendees: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("EventModel", schoolEventSchema);