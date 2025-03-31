import mongoose from 'mongoose';

// Base schema for all teacher-related data
const teacherDataSchema = new mongoose.Schema({
  teacherId: { type: String, required: true },
  type: { type: String, required: true } // Discriminator key
}, { timestamps: true, discriminatorKey: 'type' });

// Create the base model
const TeacherData = mongoose.models.TeacherData || mongoose.model('TeacherData', teacherDataSchema);

// Class schema as a discriminator
const ClassModel = mongoose.models.Class || TeacherData.discriminator('Class', new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  students: [{ type: String }],
}));

// Assignment schema as a discriminator
const AssignmentModel = mongoose.models.Assignment || TeacherData.discriminator('Assignment', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherData' }
}));

// Leave application schema as a discriminator
const LeaveApplicationModel = mongoose.models.LeaveApplication || TeacherData.discriminator('LeaveApplication', new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  appliedDate: { type: Date, default: Date.now }
}));

// Parent interaction schema as a discriminator
const ParentInteractionModel = mongoose.models.ParentInteraction || TeacherData.discriminator('ParentInteraction', new mongoose.Schema({
  studentId: { type: String, required: true },
  interactionType: { type: String, enum: ['Email', 'Phone', 'Meeting', 'Message'], required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now }
}));

export { 
  TeacherData,
  ClassModel,
  AssignmentModel,
  LeaveApplicationModel,
  ParentInteractionModel
};