import Student from '../../models/students.js';
import StudentData from '../../models/DataModels/student_data.js';
import mongoose from 'mongoose';
import teacher from '../../models/teacher.js';

export const getAllStudentsForTeacher = async (req, res) => {
  try {
    if(req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }
    console.log('Request user:', req.user);
    const teacherObjectId = req.user.id;
    // console.log('Teacher ID:', teacherObjectId);

    const findTeacherId = await teacher.findById(teacherObjectId);
    if (!findTeacherId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    // console.log('Teacher found:', findTeacherId);
    // console.log('teahcer original id:', findTeacherId.teacher_id);
    const teacherId = findTeacherId.teacher_id;
    const schoolId = findTeacherId.school_id;
    console.log('School ID:', schoolId);
    

    const students = await Student.find({ school_id: schoolId });
    // console.log('Students found:', students);
    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found for this teacher' });
    }

    res.status(200).json({
      message: 'Students retrieved successfully',
      data: students
    });
  } catch (error) {
    console.error('Error in getAllStudentsForTeacher:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const uploadMarks = async (req, res) => {
  try {
    const { studentId, subject, value, maxMarks, type } = req.body;

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
    console.log("Attendance data:", req.body);

    const student = await Student.findOne({ student_id: studentId });
    console.log('Searching for student:', studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let studentData = await StudentData.findById(student._id);
    console.log('Student data found:', studentData);
    if (!studentData) {
      console.log('Student data not found, creating new account...');
      studentData = new StudentData({
        _id: student._id,
        student_id: studentId,
        attendance: [],
        marks: []
      });
    }

    if (!studentData.attendance) {
      studentData.attendance = [];
    }

    studentData.attendance.push({
      Id: student._id,
      studentId: studentId,
      date: new Date(date),
      status
    });

    await studentData.save();

    res.status(200).json({
      message: 'Attendance uploaded successfully',
      data: studentData.attendance
    });
  } catch (error) {
    console.error('Error in uploadAttendance:', error); // Add detailed logging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const searchStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('Searching for student:', studentId);

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