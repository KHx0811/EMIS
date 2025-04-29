import { model } from 'mongoose';
import { Schema } from 'mongoose';

const schoolFeesSchema = new Schema({
  school_id: {
    type: String,
    required: true,
    index: true
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  academicYear: {
    type: String,
    required: true
  },
  feeType: {
    type: String,
    required: true,
    enum: ['Tuition', 'Transportation', 'Examination', 'Laboratory', 'Library', 'Sports', 'Annual', 'Development', 'Other']
  },
  feesAmount: {
    type: Number,
    required: true
  },
  installments: {
    type: Number,
    default: 1,
    min: 1
  },
  dueDate: {
    type: Date
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// schoolFeesSchema.index({ school_id: 1, grade: 1, feeType: 1, academicYear: 1 }, { unique: true });


export default model('SchoolFeesModel', schoolFeesSchema);