import Teacher from '../models/teacher';
import TeacherData from '../../models/DataModels/teacher_data';
import mongoose from 'mongoose';

export const teacherControllers = {
  applyLeave: async (req, res) => {
    try {
      const { teacherId, startDate, endDate, reason } = req.body;

      const teacher = await Teacher.findOne({ teacher_id: teacherId });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      const teacherData = await TeacherData.findById(teacher._id);
      if (!teacherData) {
        return res.status(404).json({ message: 'Teacher data not found' });
      }

      teacherData.leaveApplications.push({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'Pending',
        appliedDate: new Date()
      });

      await teacherData.save();

      res.status(201).json({
        message: 'Leave application submitted successfully',
        data: teacherData.leaveApplications
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  recordParentInteraction: async (req, res) => {
    try {
      const { teacherId, studentId, type, content } = req.body;

      const teacher = await Teacher.findOne({ teacher_id: teacherId });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      const teacherData = await TeacherData.findById(teacher._id);
      if (!teacherData) {
        return res.status(404).json({ message: 'Teacher data not found' });
      }

      teacherData.parentInteractions.push({
        studentId,
        type,
        content,
        date: new Date()
      });

      await teacherData.save();

      res.status(201).json({
        message: 'Parent interaction recorded successfully',
        data: teacherData.parentInteractions
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  searchTeacherById: async (req, res) => {
    try {
      const { teacherId } = req.params;

      const teacher = await Teacher.findOne({ teacher_id: teacherId });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      const teacherData = await TeacherData.findById(teacher._id);
      if (!teacherData) {
        return res.status(404).json({ message: 'Teacher data not found' });
      }

      res.status(200).json({
        message: 'Teacher retrieved successfully',
        data: teacherData
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};