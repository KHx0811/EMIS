import parents from "../../models/parents.js";
import Student from "../../models/students.js";
import Teacher from "../../models/teacher.js";

import AttendanceModel from "../../models/DataModels/StudentsModels/attendanceModel.js";
import MarksModel from "../../models/DataModels/StudentsModels/marksModel.js";
import FeePaymentModel from "../../models/DataModels/StudentsModels/feePaymentModel.js";

import EventRegistration from "../../models/DataModels/TeacherModels/eventRegistrationModel.js";
import ParentInteractionModel from "../../models/DataModels/TeacherModels/parentInteractionModel.js";
import ClassModel from "../../models/DataModels/TeacherModels/classModel.js";

import SchoolFeesModel from "../../models/DataModels/PrincipalModels/schoolFeesModel.js";
import EventModel from "../../models/DataModels/PrincipalModels/eventModel.js";
import ContactAdminModel from "../../models/DataModels/AdminModel/contactAdminModel.js";





export const getParentProfile = async (req, res) => {
    try {
        const parent = await parents.findById(req.user.id).select('-password');
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Parent profile retrieved successfully',
            data: parent
        });
    } catch (error) {
        console.error('Error fetching Parent profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getChildDetails = async (req, res) => {
    try {
        const parent = await parents.findById(req.user.id);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const parentId = parent.parent_id;
        const student = await Student.findOne({ parent_id: parentId });

        res.status(200).json({
            success: true,
            message: 'Child Details retrieved successfully',
            data: student
        });
    } catch (error) {
        console.error('Error fetching Child profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getChildAttendance = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        const parent = await parents.findById(req.user.id);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const student = await Student.findOne({
            student_id: studentId,
            parent_id: parent.parent_id
        });

        if (!student) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this student\'s information'
            });
        }

        const attendanceRecords = await AttendanceModel.find({
            student_id: studentId
        }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            message: 'Attendance records retrieved successfully',
            data: attendanceRecords
        });
    } catch (error) {
        console.error('Error fetching child attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getChildMarks = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const parent = await parents.findById(req.user.id);

        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const student = await Student.findOne({
            student_id: studentId,
            parent_id: parent.parent_id
        });

        if (!student) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this student\'s information'
            });
        }

        const marksRecords = await MarksModel.find({
            student_id: studentId
        }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            message: 'Marks records retrieved successfully',
            data: marksRecords
        });
    } catch (error) {
        console.error('Error fetching child marks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getChildTeachers = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const parent = await parents.findById(req.user.id);

        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const student = await Student.findOne({
            student_id: studentId,
            parent_id: parent.parent_id
        });

        if (!student) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this student\'s information'
            });
        }

        const classRecords = await ClassModel.find({
            students: { $in: [studentId] }
        });

        if (classRecords.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No teacher records found for this student',
                data: []
            });
        }

        const teacherIds = [...new Set(classRecords.map(record => record.teacherId))];

        const teacherDetails = await Teacher.find({
            teacher_id: { $in: teacherIds }
        }).select('teacher_id name qualification subjects'); // Select the fields you want

        const teacherClassInfo = classRecords.map(classRecord => {
            const teacherInfo = teacherDetails.find(
                teacher => teacher.teacher_id === classRecord.teacherId
            ) || {};
            
            return {
                ...classRecord.toObject(),
                teacherName: teacherInfo.name || 'Unknown',
                qualification: teacherInfo.qualification || 'Not specified',
                teacherSubjects: teacherInfo.subjects || []
            };
        });

        res.status(200).json({
            success: true,
            message: 'Teacher records retrieved successfully',
            data: teacherClassInfo
        });
    } catch (error) {
        console.error('Error fetching child teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getChildFeeStructure = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const parent = await parents.findById(req.user.id);

        if (!parent) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        const student = await Student.findOne({
            student_id: studentId,
            parent_id: parent.parent_id
        });

        if (!student) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this student\'s information'
            });
        }

        // console.log('Querying fee structure with params:', {
        //     school_id: student.school_id,
        //     grade: student.grade,
        //     academicYear: student.academicYear
        // });

        const feeStructure = await SchoolFeesModel.find({
            school_id: student.school_id,
            grade: student.grade,
            academicYear: student.academicYear
        });

        // console.log(`Found ${feeStructure.length} fee structure records`);

        res.status(200).json({
            success: true,
            message: 'Fee structure retrieved successfully',
            data: feeStructure
        });
    } catch (error) {
        console.error('Error fetching fee structure:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getChildFeePayments = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const parent = await parents.findById(req.user.id);

        if (!parent) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        const student = await Student.findOne({
            student_id: studentId,
            parent_id: parent.parent_id
        });

        if (!student) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this student\'s information'
            });
        }

        // console.log('Querying fee payments with studentId:', studentId);

        const feePayments = await FeePaymentModel.find({
            student_id: studentId,
            academicYear: student.academicYear
        }).sort({ createdAt: -1 });

        // console.log(`Found ${feePayments.length} fee payment records`);

        res.status(200).json({
            success: true,
            message: 'Fee payments retrieved successfully',
            data: feePayments
        });
    } catch (error) {
        console.error('Error fetching fee payments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getChildFeeDetails = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const parent = await parents.findById(req.user.id);

        if (!parent) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        const student = await Student.findOne({
            student_id: studentId,
            parent_id: parent.parent_id
        });

        if (!student) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this student\'s information'
            });
        }

        // console.log('Querying fee details with params:', {
        //     school_id: student.school_id,
        //     grade: student.class,
        // });

        const feeStructure = await SchoolFeesModel.find({
            school_id: student.school_id,
            grade: student.class,
        });

        const feePayments = await FeePaymentModel.find({
            student_id: studentId,
            academicYear: student.academicYear
        }).sort({ createdAt: -1 });

        // console.log(`Found ${feeStructure.length} fee structure records and ${feePayments.length} payment records`);

        let totalFees = 0;
        let totalPaid = 0;

        if (feeStructure.length > 0) {
            feeStructure.forEach(fee => {
                totalFees += fee.feesAmount || 0;
            });
        }

        if (feePayments.length > 0) {
            feePayments.forEach(payment => {
                totalPaid += payment.amountPaid || 0;
            });
        }

        const balance = totalFees - totalPaid;
        
        // console.log('Fee summary:', { totalFees, totalPaid, balance });

        res.status(200).json({
            success: true,
            message: 'Fee details retrieved successfully',
            data: {
                feeStructure,
                feePayments,
                summary: {
                    totalFees,
                    totalPaid,
                    balance
                }
            }
        });
    } catch (error) {
        console.error('Error fetching fee details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getAllSchoolEvents = async (req, res) => {
    try {
        const parent = await parents.findById(req.user.id);
        if (!parent) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        const student = await Student.findOne({ parent_id: parent.parent_id });
        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }

        const events = await EventModel.find({
            school_id: student.school_id
        }).sort({ eventDate: 1 });

        res.status(200).json({
            success: true,
            message: 'School events retrieved successfully',
            data: events
        });
    } catch (error) {
        console.error('Error fetching school events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getChildEventRegistrations = async (req, res) => {
    try {
        const parent = await parents.findById(req.user.id);
        if (!parent) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        const student = await Student.findOne({ parent_id: parent.parent_id });
        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }

        const registrations = await EventRegistration.find({
            student_id: student.student_id
        })
        .populate('event_id')
        .populate('class_id')
        .sort({ registration_date: -1 });

        res.status(200).json({
            success: true,
            message: 'Event registrations retrieved successfully',
            data: registrations
        });
    } catch (error) {
        console.error('Error fetching event registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getEventRegistrationDetails = async (req, res) => {
    try {
        const registrationId = req.params.registrationId;
        const parent = await parents.findById(req.user.id);
        
        if (!parent) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        const student = await Student.findOne({ parent_id: parent.parent_id });
        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }

        const registration = await EventRegistration.findById(registrationId)
            .populate('event_id')
            .populate('class_id');

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Event registration not found'
            });
        }

        if (registration.student_id !== student.student_id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this registration'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event registration details retrieved successfully',
            data: registration
        });
    } catch (error) {
        console.error('Error fetching event registration details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getUpcomingEvents = async (req, res) => {
    try {
        const parent = await parents.findById(req.user.id);
        if (!parent) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        const student = await Student.findOne({ parent_id: parent.parent_id });
        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }

        const currentDate = new Date();
        
        const upcomingEvents = await EventModel.find({
            school_id: student.school_id,
            eventDate: { $gte: currentDate }
        }).sort({ eventDate: 1 }).limit(5);  // Get 5 nearest upcoming events

        res.status(200).json({
            success: true,
            message: 'Upcoming events retrieved successfully',
            data: upcomingEvents
        });
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getParentInteractions = async (req, res) => {
    try {
        const parent = await parents.findById(req.user.id);
        if (!parent) {
            return res.status(404).json({ 
                success: false,
                message: 'Parent not found' 
            });
        }

        const students = await Student.find({ parent_id: parent.parent_id });
        
        if (!students || students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No students found for this parent'
            });
        }

        const studentIds = students.map(student => student.student_id);
        
        const interactions = await ParentInteractionModel.find({
            studentId: { $in: studentIds }
        }).sort({ date: -1 });

        const teacherIds = [...new Set(interactions.map(interaction => interaction.teacherId))];
        const teachers = await Teacher.find({ teacher_id: { $in: teacherIds } });
        
        const teacherMap = {};
        teachers.forEach(teacher => {
            teacherMap[teacher.teacher_id] = teacher.name;
        });
        
        const studentMap = {};
        students.forEach(student => {
            studentMap[student.student_id] = student.name;  
        });

        const enhancedInteractions = interactions.map(interaction => {
            return {
                _id: interaction._id,
                teacherId: interaction.teacherId,
                teacherName: teacherMap[interaction.teacherId] || 'Unknown Teacher',
                studentId: interaction.studentId,
                studentName: studentMap[interaction.studentId] || 'Unknown Student',
                interactionType: interaction.interactionType,
                content: interaction.content,
                date: interaction.date,
                __v: interaction.__v
            };
        });

        console.log(
            'Parent interactions retrieved successfully',
            enhancedInteractions
        );

        res.status(200).json({
            success: true,
            message: 'Parent-teacher interactions retrieved successfully',
            data: enhancedInteractions
        });
    } catch (error) {
        console.error('Error fetching parent-teacher interactions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


export const contactAdmin = async (req, res) => {
  try {
    const { userType, subject, message } = req.body;

    const parent = await parents.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    const parentId = parent.parent_id;

    const existingRequest = await ContactAdminModel.findOne({
      userType,
      userId: parentId,
      subject,
      message,
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Duplicate request: This message has already been sent to the admin.' });
    }

    const request = new ContactAdminModel({
      userType,
      userId: parentId,
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

export const getAllMessages = async (req, res) => {
  try {
    const parent = await parents.findById(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    const parentId = parent.parent_id;

    const messages = await ContactAdminModel.find({ userId: parentId });

    res.status(200).json({ message: 'Messages retrieved successfully', data: messages });
  } catch (error) {
    console.error('Error in getAllMessages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};