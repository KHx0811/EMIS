import Student from '../../models/students.js';
import StudentData from '../../models/DataModels/student_data.js';
import mongoose from 'mongoose';

export const uploadMarks = async (req, res) => {
  try {
    const { studentId, subject, value, maxMarks, type } = req.body;

    // Search for student in the Student database
    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentData = await StudentData.findById(student._id);
    if (!studentData) {
      return res.status(404).json({ message: 'Student data not found' });
    }

    studentData.marks.push({
      subject,
      value,
      maxMarks,
      type: type || 'Monthly',
      date: new Date()
    });

    await studentData.save();

    res.status(200).json({
      message: 'Marks uploaded successfully',
      data: studentData.marks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const uploadAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentData = await StudentData.findById(student._id);
    if (!studentData) {
      return res.status(404).json({ message: 'Student data not found' });
    }

    studentData.attendance.push({
      date: new Date(date),
      status
    });

    await studentData.save();

    res.status(200).json({
      message: 'Attendance uploaded successfully',
      data: studentData.attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const searchStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('Searching for student:', studentId); // Add logging

    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentData = await StudentData.findById(student._id);
    if (!studentData) {
      return res.status(404).json({ message: 'Student data not found' });
    }

    res.status(200).json({
      message: 'Student retrieved successfully',
      data: studentData
    });
  } catch (error) {
    console.error('Error in searchStudentById:', error); // Add detailed logging
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};