import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  contact: { type: String },
  email: { type: String }
});

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., sports, cultural, academic
  description: { type: String },
  achievement: { type: String }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  student_id: { type: String, required: true, unique: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
  
  marks: [{
    subject: { type: String, required: true },
    value: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    color: { type: String, default: '#4cceac' }
  }],
  
  teachers: [teacherSchema],
  
  activities: [activitySchema],
  
  attendance: [{
    month: { type: String, required: true },
    totalDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    status: { type: String, required: true },
    value: { type: Number, required: true },
    color: { type: String, default: '#4cceac' }
  }],
  
  feeDues: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' }
  }],
  
  schoolEvents: [{
    title: { type: String, required: true },
    description: { type: String },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    location: { type: String }
  }],
  
  parentTeacherMeetings: [{
    title: { type: String, required: true },
    description: { type: String },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
  }]
}, { timestamps: true });

export default mongoose.model('Student_data', studentSchema);
