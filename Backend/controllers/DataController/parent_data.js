import parents from "../../models/parents.js";
import Student from "../../models/students.js";
import AttendanceModel from "../../models/DataModels/StudentsModels/attendanceModel.js";
import MarksModel from "../../models/DataModels/StudentsModels/marksModel.js";


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

