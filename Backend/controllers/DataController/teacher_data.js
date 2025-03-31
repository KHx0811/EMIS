import Teacher from '../../models/teacher.js';
import { ClassModel, ParentInteractionModel, LeaveApplicationModel } from '../../models/DataModels/teacher_data.js';
import Student from '../../models/students.js';

export const classCheck = async (req, res) => {
  try {
    const objectId = await Teacher.findById(req.user.id);
    if (!objectId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherId = objectId.teacher_id;
    console.log('Teacher ID:', teacherId);


    // Find all documents of type 'Class' for this teacher
    const classes = await ClassModel.find({ teacherId:teacherId, type: 'Class' });
    
    const classesWithDetails = await Promise.all(classes.map(async (cls) => {
      return {
        _id: cls._id,
        className: cls.className,
        section: cls.section,
        students: cls.students || []
      };
    }));
    
    res.status(200).json({ message: 'Classes retrieved successfully', data: classesWithDetails });
  } catch (error) {
    console.error('Error in classCheck:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const { className, section, students } = req.body;
    const objectId = await Teacher.findById(req.user.id);
    if (!objectId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherId = objectId.teacher_id;

    const teacher = await Teacher.findOne({ teacher_id: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const existingClass = await ClassModel.findOne({ 
      className, 
      section, 
      teacherId
    });
    
    if (existingClass) {
      return res.status(400).json({ message: 'Class already exists' });
    }
    // Generate a unique class ID
    // classId = `${teacherId.substring(0, 2)}${className.substring(0, 1)}${section}`;

    const newClass = new ClassModel({
      className,
      section,
      // teacherId: teacherId,
      students: students || []
      // type is automatically set to 'Class' by the discriminator
    });
    console.log('New Class:', newClass);

    await newClass.save();

    res.status(201).json({ message: 'Class created successfully', data: newClass });
  } catch (error) {
    console.error('Error in createClass:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const teacherControllers = {
  applyLeave: async (req, res) => {
    try {
      const { startDate, endDate, reason } = req.body;
      const objectId = await Teacher.findById(req.user.id);
      if (!objectId) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      const teacherId = objectId.teacher_id;

      const leaveApplication = new LeaveApplicationModel({
        teacherId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'Pending',
        appliedDate: new Date()
      });

      await leaveApplication.save();

      // Get all leave applications for this teacher
      const allLeaves = await LeaveApplicationModel.find({ teacherId });

      res.status(201).json({
        message: 'Leave application submitted successfully',
        data: allLeaves
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  recordParentInteraction: async (req, res) => {
    try {
      const { studentId, interactionType, content } = req.body;
      const objectId = await Teacher.findById(req.user.id);
      if (!objectId) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      const teacherId = objectId.teacher_id;

      const interaction = new ParentInteractionModel({
        teacherId,
        studentId,
        interactionType,
        content,
        date: new Date()
      });

      await interaction.save();

      // Get all interactions for this teacher
      const allInteractions = await ParentInteractionModel.find({ teacherId });

      res.status(201).json({
        message: 'Parent interaction recorded successfully',
        data: allInteractions
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};