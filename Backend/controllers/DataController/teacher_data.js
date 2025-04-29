import Teacher from '../../models/teacher.js';
import Student from '../../models/students.js';
import LeaveApplicationModel from '../../models/DataModels/TeacherModels/leaveModel.js';
import ClassModel from '../../models/DataModels/TeacherModels/classModel.js';
import ContactAdminModel from '../../models/DataModels/TeacherModels/contactAdminModel.js';
import AssignmentModel from '../../models/DataModels/TeacherModels/assignmentModel.js';
import ParentInteractionModel from '../../models/DataModels/TeacherModels/parentInteractionModel.js'
import EventRegistration from '../../models/DataModels/TeacherModels/eventRegistrationModel.js';
import EventModel from '../../models/DataModels/PrincipalModels/eventModel.js';

export const classCheck = async (req, res) => {
  try {
    const objectId = await Teacher.findById(req.user.id);
    if (!objectId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherId = objectId.teacher_id;

    const classes = await ClassModel.find({ teacherId:teacherId });
    
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

    let classId = `${teacherId.substring(0, 2)}${className.substring(0, 1)}${section}`;

    const existingClassByCode = await ClassModel.findOne({ 
      class_code: classId
    });
    
    if (existingClassByCode) {
      return res.status(400).json({ message: 'Class with this code already exists' });
    }


    const existingClass = await ClassModel.findOne({ 
      className, 
      section, 
      teacherId
    });
    
    if (existingClass) {
      return res.status(400).json({ message: 'Class already exists' });
    }
   

    const newClass = new ClassModel({
      className,
      section,
      teacherId: teacherId,
      class_code: classId,
      students: students || []
    });
    await newClass.save();

    res.status(201).json({ message: 'Class created successfully', data: newClass });
  } catch (error) {
    console.error('Error in createClass:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const objectId = await Teacher.findById(req.user.id);
    
    if (!objectId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    const teacherId = objectId.teacher_id;

    const classToDelete = await ClassModel.findById(classId);
    
    if (!classToDelete) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (classToDelete.teacherId !== teacherId) {
      return res.status(403).json({ message: 'You are not authorized to delete this class' });
    }

    await ClassModel.findByIdAndDelete(classId);
    
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error in deleteClass:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getClassesForTeacher = async (req, res) => {
  try {
    const objectId = req.user.id;
    const teacher = await Teacher.findById(objectId);

    const classes = await ClassModel.find({ teacherId : teacher.teacher_id });
    res.status(200).json({ message: 'Classes retrieved successfully', data: classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields are required: startDate, endDate, and reason' });
    }
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    if (startDateObj > endDateObj) {
      return res.status(400).json({ message: 'End date must be after or same as start date' });
    }

    const objectId = await Teacher.findById(req.user.id);
    if (!objectId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherId = objectId.teacher_id;

    let applicationId = Math.floor(Math.random() * 10000);

    const leaveApplication = new LeaveApplicationModel({
      applicationId,
      teacherId,
      startDate: startDateObj,
      endDate: endDateObj,
      reason,
      status: 'Pending',
      appliedDate: new Date(),
    });


    await leaveApplication.save();

    const allLeaves = await LeaveApplicationModel.find({ teacherId }).sort({ appliedDate: -1 });

    res.status(201).json({
      message: 'Leave application submitted successfully',
      data: allLeaves
    });
  } catch (error) {
    console.error('Error in applyLeave:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getLeaveApplications = async (req, res) => {
  try {
    const objectId = await Teacher.findById(req.user.id);
    if (!objectId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherId = objectId.teacher_id;

    const allLeaves = await LeaveApplicationModel.find({ teacherId }).sort({ appliedDate: -1 });

    res.status(200).json({
      message: 'Leave applications retrieved successfully',
      data: allLeaves
    });
  } catch (error) {
    console.error('Error in getLeaveApplications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const recordParentInteraction = async (req, res) => {
  try {
    const { studentId, interactionType, content } = req.body;
    const objectId = await Teacher.findById(req.user.id);
    if (!objectId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherId = objectId.teacher_id;
    console.log(teacherId);

    const interaction = new ParentInteractionModel({
      teacherId,
      studentId,
      interactionType,
      content,
      date: new Date()
    });

    console.log('Parent Interaction:', interaction);
    const studentCheck = await Student.findOne({ student_id: studentId });
    if (!studentCheck) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await interaction.save();

    const allInteractions = await ParentInteractionModel.find({ teacherId });

    res.status(201).json({
      message: 'Parent interaction recorded successfully',
      data: allInteractions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const searchStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherSchoolId = teacher.school_id;

    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (teacherSchoolId !== student.school_id) {
      return res.status(403).json({ message: 'You are not authorized to view this student\'s details' });
    }

    res.status(200).json({ 
      message: 'Student retrieved successfully',
      data: student,
    });
  } catch (error) {
    console.error('Error in searchStudent:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const contactAdmin = async (req, res) => {
  try {
    const { userType, subject,message } = req.body;

    const objectId = await Teacher.findById(req.user.id);
    if (!objectId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherId = objectId.teacher_id;

    const existingRequest = await ContactAdminModel.findOne({
      userType: userType,
      userId: teacherId,
      subject,
      message,
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Duplicate request: This message has already been sent to the admin.' });
    }

    const request = new ContactAdminModel({
      userType: userType,
      userId: teacherId,
      subject,
      message,
    });

    await request.save();

    res.status(200).json({ message: 'Message sent to admin successfully' });
  } catch (error) {
    console.error('Error in contactAdmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSchoolEventsForTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const events = await EventModel.find({ school_id: teacher.school_id })
      .sort({ eventDate: 1 });

    return res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: events
    });
  } catch (error) {
    console.error('Error fetching school events:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const classes = await ClassModel.find({ teacherId: teacher.teacher_id });
    
    return res.status(200).json({
      success: true,
      message: 'Classes retrieved successfully',
      data: classes
    });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getStudentsInClass = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const classData = await ClassModel.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentIds = classData.students;
    
    const students = await Student.find({ student_id: { $in: studentIds } });
    
    return res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const registerStudentForEvent = async (req, res) => {
  try {
    const { eventId, studentId, classId, participationType, skillGroup } = req.body;
    
    if (!eventId || !studentId || !classId || !participationType || !skillGroup) {
      return res.status(400).json({ 
        message: 'Event ID, Student ID, Class ID, Participation Type, and Skill Group are required' 
      });
    }

    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const classData = await ClassModel.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!classData.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student does not belong to this class' });
    }

    const existingRegistration = await EventRegistration.findOne({
      event_id: eventId,
      student_id: studentId
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Student already registered for this event' });
    }

    const registration = new EventRegistration({
      event_id: eventId,
      student_id: studentId,
      class_id: classId,
      teacher_id: teacher.teacher_id,
      participation_type: participationType,
      skill_group: skillGroup
    });

    await registration.save();

    return res.status(201).json({
      success: true,
      message: 'Student registered for event successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error registering student for event:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getTeacherEventRegistrations = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const registrations = await EventRegistration.find({ teacher_id: teacher.teacher_id })
      .populate('event_id', 'eventName eventDate eventType')
      .populate('class_id', 'className section');

    return res.status(200).json({
      success: true,
      message: 'Event registrations retrieved successfully',
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const cancelEventRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const registration = await EventRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.teacher_id !== teacher.teacher_id) {
      return res.status(403).json({ message: 'You are not authorized to cancel this registration' });
    }

    registration.status = 'Withdrawn';
    await registration.save();

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
