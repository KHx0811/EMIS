import Student_data from '../models/student_data';
import Student from '../models/student';

exports.getChildData = async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const student = await Student_data.findById(studentId).populate('teachers activities attendance feeDues schoolEvents parentTeacherMeetings');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      data: {
        marks: student.marks,
        teachers: student.teachers,
        activities: student.activities,
        attendance: student.attendance,
        feeDues: student.feeDues,
        schoolEvents: student.schoolEvents,
        parentTeacherMeetings: student.parentTeacherMeetings,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};