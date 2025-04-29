import Student from '../../models/students.js';
import ClassModel from '../../models/DataModels/TeacherModels/classModel.js';
import MarksModel from '../../models/DataModels/StudentsModels/marksModel.js';
import AttendanceModel from '../../models/DataModels/StudentsModels/attendanceModel.js';
import AssignmentModel from '../../models/DataModels/TeacherModels/assignmentModel.js';
import Teacher from '../../models/teacher.js';


export const getAllStudentsForTeacher = async (req, res) => {
  try {
    if(req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }
    console.log('Request user:', req.user);
    const teacherObjectId = req.user.id;

    const findTeacherId = await Teacher.findById(teacherObjectId);
    if (!findTeacherId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherId = findTeacherId.teacher_id;
    const schoolId = findTeacherId.school_id;
    console.log('School ID:', schoolId);
    

    const students = await Student.find({ school_id: schoolId });
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
    const { subject, type, marks } = req.body;
    
    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ message: 'No marks data provided' });
    }

    const results = [];
    const errors = [];

    for (const mark of marks) {
      try {
        const { studentId, marks, maxMarks } = mark;
        
        const student = await Student.findOne({ student_id: studentId });
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        const newMark = new MarksModel({
          student_id: studentId,
          subject,
          value: marks,
          maxMarks,
          examType: type || 'Monthly',
          date: new Date()
        });
        console.log('New Mark:', newMark);

        await newMark.save();
        results.push({ studentId, status: 'success' });
      } catch (error) {
        console.error('Error processing mark for student:', mark.studentId, error);
        errors.push({ studentId: mark.studentId, error: error.message });
      }
    }

    res.status(200).json({
      message: 'Marks uploaded successfully',
      data: { results, errors }
    });
  } catch (error) {
    console.error('Error in uploadMarks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const uploadAttendance = async (req, res) => {
  try {
    const { classId, date, attendance } = req.body;

    if (!classId || !date || !attendance || !Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ message: 'Invalid or missing data' });
    }


    const classData = await ClassModel.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentIds = classData.students || [];
    if (studentIds.length === 0) {
      return res.status(400).json({ message: 'No students found in this class' });
    }

    const results = [];
    const errors = [];

    for (const record of attendance) {
      try {
        const { studentId, status } = record;

        if (!studentIds.includes(studentId)) {
          errors.push({ studentId, error: 'Student not in this class' });
          continue;
        }

        const student = await Student.findOne({ student_id: studentId });
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        const newAttendance = new AttendanceModel({
          student_id: studentId,
          date: new Date(date),
          status,
        });

        await newAttendance.save();
        results.push({ studentId, status: 'success' });
      } catch (error) {
        console.error('Error processing attendance for student:', record.studentId, error);
        errors.push({ studentId: record.studentId, error: error.message });
      }
    }

    res.status(200).json({
      message: 'Attendance uploaded successfully',
      data: { results, errors },
    });
  } catch (error) {
    console.error('Error in uploadAttendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const assignAssignment = async (req, res) => {
  try {
    const { classId, title, description, dueDate } = req.body;

    if (!classId || !title || !description || !dueDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const objectId = await Teacher.findById(req.user.id);
    if (!objectId) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const teacherId = objectId.teacher_id;

    const classData = await ClassModel.findById(classId);
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const newAssignment = new AssignmentModel({
      classId,
      teacherId,
      title,
      description,
      dueDate: new Date(dueDate),
      assignedDate: new Date(),
    });

    console.log('New Assignment:', newAssignment);

    await newAssignment.save();

    res.status(200).json({
      message: 'Assignment assigned successfully',
      data: newAssignment,
    });
  } catch (error) {
    console.error('Error in assignAssignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const classData = await ClassModel.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const studentIds = classData.students || [];
    console.log('Student IDs in class:', studentIds);
    
    if (studentIds.length === 0) {
      return res.status(200).json({ message: 'No students in this class', data: [] });
    }
    
    const students = await Student.find({ student_id: { $in: studentIds } });
    
    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No student records found for this class' });
    }
    
    res.status(200).json({ 
      message: 'Students retrieved successfully', 
      data: students 
    });
  } catch (error) {
    console.error('Error in getStudentsByClass:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const searchStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const marks = await MarksModel.find({ student_id: studentId });
    const attendance = await AttendanceModel.find({ student_id: studentId });
    const assignments = await AssignmentSubmissionModel.find({ student_id: studentId });
    const notes = await TeacherNoteModel.find({ student_id: studentId });
    const interactions = await ParentInteractionModel.find({ student_id: studentId });

    const studentData = {
      studentInfo: student,
      marks,
      attendance,
      assignments,
      notes,
      interactions
    };

    res.status(200).json({
      message: 'Student retrieved successfully',
      data: studentData
    });
  } catch (error) {
    console.error('Error in searchStudentById:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};