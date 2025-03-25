import Student from '../models/student';
import StudentData from '../models/DataModels/student_data';
import mongoose from 'mongoose';

export const studentControllers = {
  uploadMarks: async (req, res) => {
    try {
      const { studentId, subject, value, maxMarks, type } = req.body;
      
      const student = await StudentData.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      student.marks.push({
        subject,
        value,
        maxMarks,
        type: type || 'Monthly',
        date: new Date()
      });

      await student.save();
      
      res.status(200).json({ 
        message: 'Marks uploaded successfully', 
        data: student.marks 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  uploadAttendance: async (req, res) => {
    try {
      const { studentId, month, totalDays, presentDays } = req.body;
      
      const student = await StudentData.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const attendancePercentage = (presentDays / totalDays) * 100;
      const attendanceStatus = attendancePercentage >= 75 ? 'Good' : 'Poor';

      const existingAttendance = student.attendance.find(a => a.month === month);
      
      if (existingAttendance) {
        existingAttendance.totalDays = totalDays;
        existingAttendance.presentDays = presentDays;
        existingAttendance.status = attendanceStatus;
        existingAttendance.value = attendancePercentage;
      } else {
        student.attendance.push({
          month,
          totalDays,
          presentDays,
          status: attendanceStatus,
          value: attendancePercentage
        });
      }

      await student.save();
      
      res.status(200).json({ 
        message: 'Attendance uploaded successfully', 
        data: student.attendance 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  createAssignment: async (req, res) => {
    try {
      const { studentId, title, description, subject, dueDate, maxMarks, teacherId } = req.body;
      
      const student = await StudentData.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      student.assignments.push({
        title,
        description,
        subject,
        dueDate: new Date(dueDate),
        maxMarks,
        teacherId,
        status: 'Pending'
      });

      await student.save();
      
      res.status(201).json({ 
        message: 'Assignment created successfully', 
        data: student.assignments 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  addActivity: async (req, res) => {
    try {
      const { studentId, name, type, description, achievement } = req.body;
      
      const student = await StudentData.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      student.activities.push({
        name,
        type,
        description,
        achievement,
        date: new Date()
      });

      await student.save();
      
      res.status(201).json({ 
        message: 'Activity added successfully', 
        data: student.activities 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};