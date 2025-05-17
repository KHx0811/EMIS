import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    unique: true, 
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  education_level: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  date_of_admission: {
    type: Date,
    required: true,
  },
  class: {
    type: String,
    required: function() {
      return this.education_level === 'secondary';
    },
  },
  year: {
    type: String,
    required: function() {
      return this.education_level !== 'secondary';
    },
  },
  degree: {
    type: String,
    required: function() {
      return this.education_level === 'graduation';
    },
  },
  specialization: {
    type: String,
    required: function() {
      return this.education_level === 'graduation';
    },
  },
  religion: {
    type: String,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  parent_id: {
    type: String,
    required: true,
  },
  school_id: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Student', studentSchema);