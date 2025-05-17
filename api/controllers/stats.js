import Student from '../models/students.js';
import Teacher from '../models/teacher.js';
import School from '../models/schools.js';

export const getCounts = async (req, res) => {
  try {
    const [studentCount, teacherCount, schoolCount] = await Promise.all([
      Student.countDocuments().exec(),
      Teacher.countDocuments().exec(),
      School.countDocuments().exec()
    ]);
    
    return res.status(200).json({
      status: 'success',
      data: {
        studentCount,
        teacherCount,
        schoolCount
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
