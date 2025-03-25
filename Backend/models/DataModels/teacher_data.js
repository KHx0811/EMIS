import mongoose from 'mongoose';


const leaveApplicationSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  }
});


const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String },
  subject: { type: String, required: true },
  leaveApplications: [{
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected'], 
      default: 'Pending' 
    },
    appliedDate: { type: Date, default: Date.now }
  }],
  assignedClasses: [{
    class: { type: String, required: true },
    section: { type: String, required: true }
  }],
  parentInteractions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { 
      type: String, 
      enum: ['Email', 'Phone', 'Meeting', 'Message'], 
      required: true 
    },
    date: { type: Date, default: Date.now },
    content: { type: String, required: true }
  }],
  teacherNotes: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { 
      type: String, 
      enum: ['Behavioral', 'Academic', 'Personal'], 
      required: true 
    },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('TeacherData', teacherSchema);

export const TeacherLeave = mongoose.model('TeacherLeave', leaveApplicationSchema);
