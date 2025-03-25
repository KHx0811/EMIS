import Teacher from '../models/teacher';
import TeacherData from '../../models/DataModels/teacher_data';
import mongoose from 'mongoose';

export const teacherControllers = {
  applyLeave: async (req, res) => {
    try {
      const { teacherId, startDate, endDate, reason } = req.body;
      
      const teacher = await TeacherData.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      teacher.leaveApplications.push({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'Pending',
        appliedDate: new Date()
      });

      await teacher.save();
      
      res.status(201).json({ 
        message: 'Leave application submitted successfully', 
        data: teacher.leaveApplications 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  recordParentInteraction: async (req, res) => {
    try {
      const { teacherId, studentId, type, content } = req.body;
      
      const teacher = await TeacherData.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      teacher.parentInteractions.push({
        studentId,
        type,
        content,
        date: new Date()
      });

      await teacher.save();
      
      res.status(201).json({ 
        message: 'Parent interaction recorded successfully', 
        data: teacher.parentInteractions 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  addTeacherNote: async (req, res) => {
    try {
      const { teacherId, studentId, type, content } = req.body;
      
      const teacher = await TeacherData.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      teacher.teacherNotes.push({
        studentId,
        type,
        content,
        date: new Date()
      });

      await teacher.save();
      
      res.status(201).json({ 
        message: 'Teacher note added successfully', 
        data: teacher.teacherNotes 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  getTeacherProfile: async (req, res) => {
    try {
      const { teacherId } = req.params;
      
      const teacher = await TeacherData.findById(teacherId)
        .select('-leaveApplications.password')
        .populate('leaveApplications')
        .populate('parentInteractions.studentId', 'name student_id')
        .populate('teacherNotes.studentId', 'name student_id');

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      res.status(200).json({ 
        message: 'Teacher profile retrieved successfully', 
        data: teacher 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};