import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  maxMarks: { type: Number, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
});

const teacherNoteSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  type: { 
    type: String, 
    enum: ['Behavioral', 'Academic', 'Personal'], 
    required: true 
  },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  assignments: [assignmentSchema],
  teacherNotes: [teacherNoteSchema],
  
  parentInteractions: [{
    type: { 
      type: String, 
      enum: ['Email', 'Phone', 'Meeting', 'Message'], 
      required: true 
    },
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
  }]
}, { timestamps: true });

export default mongoose.model('StudentData', studentSchema);
