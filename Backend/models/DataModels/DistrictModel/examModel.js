import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    exam_id: {
      type: String,
      required: true,
      unique: true,
    },
    exam_name: {
      type: String,
      required: true,
    },
    exam_type: {
      type: String,
      required: true,
      enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Unit Test', 'Project'],
    },
    subject: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    registration_deadline: {
      type: Date,
      required: true,
    },
    centers: [{
      type: String, // school_id
      ref: 'School',
    }],
    eligible_grades: [{
      type: String,
    }],
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
      default: 'scheduled',
    },
    district_id: {
      type: String,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
    },
    max_score: {
      type: Number,
      default: 100,
    },
    passing_score: {
      type: Number,
      default: 40,
    },
    duration_minutes: {
      type: Number,
      default: 120,
    },
    instructions: {
      type: String,
    },
  },
  { timestamps: true }
);

examSchema.index({ district_id: 1, exam_id: 1 });

const Exam = mongoose.model('Exam', examSchema);

export default Exam;