import Student from "../../models/students.js";
import schools from "../../models/schools.js";
import Teacher from "../../models/teacher.js";
import SchoolFeesModel from "../../models/DataModels/PrincipalModels/schoolFeesModel.js";
import EventModel from "../../models/DataModels/PrincipalModels/eventModel.js";
import LeaveApplicationModel from "../../models/DataModels/TeacherModels/leaveModel.js";
import Budget from "../../models/DataModels/DistrictModel/budgets.js"
import BudgetUsage from "../../models/DataModels/PrincipalModels/budgetUsageModel.js";
import Meeting from '../../models/DataModels/PrincipalModels/meetingModel.js';
import DistrictMeeting from "../../models/DataModels/DistrictModel/meetingModel.js";
import District from "../../models/districts.js";
import ContactAdminModel from "../../models/DataModels/AdminModel/contactAdminModel.js";

export const searchStudent = async (req, res) => {
    try {
        const { student_id } = req.params;

        if (!student_id) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }
        const principalSchoolId = principal.school_id;

        const student = await Student.findOne({ student_id: student_id });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (principalSchoolId !== student.school_id) {
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

export const searchTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params;

        if (!teacher_id) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }
        const principalSchoolId = principal.school_id;

        const teacher = await Teacher.findOne({ teacher_id: teacher_id });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (principalSchoolId !== teacher.school_id) {
            return res.status(403).json({ message: 'You are not authorized to view this teacher\'s details' });
        }

        res.status(200).json({
            message: 'Teacher retrieved successfully',
            data: teacher,
        });
    } catch (error) {
        console.error('Error in searchTeacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createFees = async (req, res) => {
    try {
        const { grade, academicYear, feeType, dueDate, feesAmount, installments, description } = req.body;

        if (!grade || !academicYear || !feeType || !feesAmount) {
            return res.status(400).json({ message: 'Grade, academic year, fee type, and amount are required' });
        }

        const gradeNum = parseInt(grade);
        if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
            return res.status(400).json({ message: 'Grade must be a number between 1 and 12' });
        }

        if (feesAmount <= 0) {
            return res.status(400).json({ message: 'Fee amount must be greater than zero' });
        }

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const existingFee = await SchoolFeesModel.findOne({
            school_id: principal.school_id,
            grade: gradeNum,
            academicYear,
            feeType
        });

        if (existingFee) {
            return res.status(409).json({
                message: 'A fee structure already exists for this grade, academic year, and fee type'
            });
        }

        const newFees = new SchoolFeesModel({
            school_id: principal.school_id,
            grade: gradeNum,
            academicYear,
            feeType,
            dueDate: dueDate || null,
            feesAmount,
            installments: parseInt(installments) || 1,
            description
        });

        await newFees.save();

        res.status(201).json({
            message: 'Fee structure created successfully',
            data: newFees
        });
    } catch (error) {
        console.error('Error in createFees:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllFees = async (req, res) => {
    try {
        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const { academicYear, grade, feeType } = req.query;
        const query = { school_id: principal.school_id };

        if (academicYear) query.academicYear = academicYear;
        if (grade) query.grade = parseInt(grade);
        if (feeType) query.feeType = feeType;

        const fees = await SchoolFeesModel.find(query)
            .sort({ grade: 1, createdAt: -1 });

        res.status(200).json({
            message: 'Fee structures retrieved successfully',
            data: fees
        });
    } catch (error) {
        console.error('Error in getAllFees:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getFeeById = async (req, res) => {
    try {
        const { fee_id } = req.params;

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const fee = await SchoolFeesModel.findById(fee_id);

        if (!fee) {
            return res.status(404).json({ message: 'Fee structure not found' });
        }

        if (fee.school_id !== principal.school_id) {
            return res.status(403).json({ message: 'You are not authorized to view this fee structure' });
        }

        res.status(200).json({
            message: 'Fee structure retrieved successfully',
            data: fee
        });
    } catch (error) {
        console.error('Error in getFeeById:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateFee = async (req, res) => {
    try {
        const { fee_id } = req.params;
        const { grade, academicYear, feeType, dueDate, feesAmount, installments, description } = req.body;

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const fee = await SchoolFeesModel.findById(fee_id);
        if (!fee) {
            return res.status(404).json({ message: 'Fee structure not found' });
        }

        if (fee.school_id !== principal.school_id) {
            return res.status(403).json({ message: 'You are not authorized to update this fee structure' });
        }

        if (grade) fee.grade = parseInt(grade);
        if (academicYear) fee.academicYear = academicYear;
        if (feeType) fee.feeType = feeType;
        if (dueDate !== undefined) fee.dueDate = dueDate || null;
        if (feesAmount !== undefined && feesAmount > 0) fee.feesAmount = feesAmount;
        if (installments) fee.installments = parseInt(installments);
        if (description !== undefined) fee.description = description;

        fee.updatedAt = Date.now();
        await fee.save();

        res.status(200).json({
            message: 'Fee structure updated successfully',
            data: fee
        });
    } catch (error) {
        console.error('Error in updateFee:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteFee = async (req, res) => {
    try {
        const { fee_id } = req.params;

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const fee = await SchoolFeesModel.findById(fee_id);
        if (!fee) {
            return res.status(404).json({ message: 'Fee structure not found' });
        }

        if (fee.school_id !== principal.school_id) {
            return res.status(403).json({ message: 'You are not authorized to delete this fee structure' });
        }

        await SchoolFeesModel.findByIdAndDelete(fee_id);

        res.status(200).json({
            message: 'Fee structure deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteFee:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createEvent = async (req, res) => {
    try {
        const { eventName, eventDescription, eventDate, eventTime, eventLocation, eventType } = req.body;

        if (!eventName || !eventDate || !eventLocation || !eventType) {
            return res.status(400).json({ message: 'Event name, date, location, and type are required' });
        }

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const newEvent = new EventModel({
            school_id: principal.school_id,
            eventName,
            eventDescription,
            eventDate,
            eventTime: eventTime || '',
            eventLocation,
            eventType,
            createdBy: req.user.id
        });

        await newEvent.save();

        return res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: newEvent
        });

    } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getSchoolEvents = async (req, res) => {
    try {
        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const events = await EventModel.find({ school_id: principal.school_id })
            .sort({ eventDate: 1 });

        return res.status(200).json({
            success: true,
            message: 'Events retrieved successfully',
            data: events
        });

    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const updateData = req.body;

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.school_id !== principal.school_id) {
            return res.status(403).json({ message: 'You are not authorized to update this event' });
        }

        const updatedEvent = await EventModel.findByIdAndUpdate(
            eventId,
            updateData,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });

    } catch (error) {
        console.error('Error updating event:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.school_id !== principal.school_id) {
            return res.status(403).json({ message: 'You are not authorized to delete this event' });
        }

        await EventModel.findByIdAndDelete(eventId);

        return res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting event:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getPendingLeaveApplications = async (req, res) => {
    try {
        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const schoolId = principal.school_id;

        const schoolTeachers = await Teacher.find({ school_id: schoolId });

        if (!schoolTeachers || schoolTeachers.length === 0) {
            return res.status(200).json({
                message: 'No teachers found in this school',
                data: []
            });
        }

        const teacherIds = schoolTeachers.map(teacher => teacher.teacher_id);

        const leaveApplications = await LeaveApplicationModel.find({
            teacherId: { $in: teacherIds }
        }).sort({ appliedDate: -1 });

        const enhancedApplications = await Promise.all(
            leaveApplications.map(async (application) => {
                const teacher = schoolTeachers.find(t => t.teacher_id === application.teacherId);
                return {
                    ...application.toObject(),
                    teacherName: teacher ? teacher.name : 'Unknown',
                    teacherEmail: teacher ? teacher.email : '',
                    teacherSubject: teacher ? teacher.subject : ''
                };
            })
        );

        res.status(200).json({
            message: 'Leave applications retrieved successfully',
            data: enhancedApplications
        });
    } catch (error) {
        console.error('Error in getPendingLeaveApplications:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateLeaveStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, remarks } = req.body;

        if (!applicationId || !status) {
            return res.status(400).json({ message: 'Application ID and status are required' });
        }

        if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Status must be Approved, Rejected, or Pending' });
        }

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const schoolId = principal.school_id;

        const leaveApplication = await LeaveApplicationModel.findOne({ applicationId });

        if (!leaveApplication) {
            return res.status(404).json({ message: 'Leave application not found' });
        }

        const teacher = await Teacher.findOne({
            teacher_id: leaveApplication.teacherId
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (teacher.school_id !== schoolId) {
            return res.status(403).json({
                message: 'You are not authorized to update leave applications for teachers from other schools'
            });
        }

        leaveApplication.status = status;
        if (remarks) {
            leaveApplication.remarks = remarks;
        }
        leaveApplication.reviewedAt = new Date();
        leaveApplication.reviewedBy = req.user.id;

        await leaveApplication.save();

        const schoolTeachers = await Teacher.find({ school_id: schoolId });
        const teacherIds = schoolTeachers.map(teacher => teacher.teacher_id);

        const leaveApplications = await LeaveApplicationModel.find({
            teacherId: { $in: teacherIds }
        }).sort({ appliedDate: -1 });

        const enhancedApplications = await Promise.all(
            leaveApplications.map(async (application) => {
                const teacher = schoolTeachers.find(t => t.teacher_id === application.teacherId);
                return {
                    ...application.toObject(),
                    teacherName: teacher ? `${teacher.firstname} ${teacher.lastname}` : 'Unknown',
                    teacherEmail: teacher ? teacher.email : '',
                    teacherSubject: teacher ? teacher.subject : ''
                };
            })
        );

        res.status(200).json({
            message: `Leave application ${status.toLowerCase()} successfully`,
            data: enhancedApplications
        });
    } catch (error) {
        console.error('Error in updateLeaveStatus:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPrincipalProfile = async (req, res) => {
    try {
        const principal = await schools.findById(req.user.id).select('-password');
        if (!principal) {
            return res.status(404).json({ message: 'Principal not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Principal profile retrieved successfully',
            data: principal
        });
    } catch (error) {
        console.error('Error fetching principal profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getSchoolBudgets = async (req, res) => {
    try {
        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const schoolId = principal.school_id;

        const budgets = await Budget.find({ school_id: schoolId });

        const budgetsWithUsage = await Promise.all(budgets.map(async (budget) => {
            const usageRecords = await BudgetUsage.find({ budget_id: budget._id });

            const totalUsed = usageRecords.reduce((sum, record) => sum + record.amount, 0);

            return {
                ...budget.toObject(),
                usage: totalUsed,
                remaining: budget.amount - totalUsed
            };
        }));

        return res.status(200).json({
            success: true,
            message: 'School budgets retrieved successfully',
            data: budgetsWithUsage
        });
    } catch (error) {
        console.error('Error fetching school budgets:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getBudgetStats = async (req, res) => {
    try {
        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const schoolId = principal.school_id;

        const budgets = await Budget.find({ school_id: schoolId });

        if (budgets.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No budgets found for this school',
                data: {
                    totalAllocated: 0,
                    totalUsed: 0,
                    remainingBudget: 0,
                    usagePercentage: 0,
                    budgetsByCategory: {}
                }
            });
        }

        const totalAllocated = budgets.reduce((sum, budget) => sum + budget.amount, 0);

        const budgetIds = budgets.map(budget => budget._id);
        const usageRecords = await BudgetUsage.find({ budget_id: { $in: budgetIds } });

        const totalUsed = usageRecords.reduce((sum, record) => sum + record.amount, 0);

        const remainingBudget = totalAllocated - totalUsed;

        const usagePercentage = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

        const budgetsByCategory = {};
        budgets.forEach(budget => {
            if (!budgetsByCategory[budget.category]) {
                budgetsByCategory[budget.category] = {
                    allocated: 0,
                    used: 0,
                    remaining: 0
                };
            }
            budgetsByCategory[budget.category].allocated += budget.amount;
        });

        usageRecords.forEach(record => {
            const budget = budgets.find(b => b._id.toString() === record.budget_id.toString());
            if (budget && budgetsByCategory[budget.category]) {
                budgetsByCategory[budget.category].used += record.amount;
            }
        });

        Object.keys(budgetsByCategory).forEach(category => {
            budgetsByCategory[category].remaining =
                budgetsByCategory[category].allocated - budgetsByCategory[category].used;
        });

        return res.status(200).json({
            success: true,
            message: 'Budget statistics retrieved successfully',
            data: {
                totalAllocated,
                totalUsed,
                remainingBudget,
                usagePercentage,
                budgetsByCategory
            }
        });
    } catch (error) {
        console.error('Error fetching budget stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const recordBudgetUsage = async (req, res) => {
    try {
        const { budget_id, amount, purpose, date, receipt_number } = req.body;

        if (!budget_id || !amount || !purpose) {
            return res.status(400).json({ message: 'Budget ID, amount, and purpose are required' });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero' });
        }

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const schoolId = principal.school_id;

        const budget = await Budget.findById(budget_id);
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        if (budget.school_id !== schoolId) {
            return res.status(403).json({ message: 'You are not authorized to use this budget' });
        }

        const existingUsage = await BudgetUsage.find({ budget_id });
        const totalUsed = existingUsage.reduce((sum, record) => sum + record.amount, 0);

        if (totalUsed + amount > budget.amount) {
            return res.status(400).json({
                message: 'Insufficient funds in this budget',
                available: budget.amount - totalUsed,
                requested: amount
            });
        }

        const newUsage = new BudgetUsage({
            budget_id,
            amount,
            purpose,
            date: date || new Date(),
            receipt_number,
            recorded_by: req.user.id
        });

        await newUsage.save();

        const updatedTotalUsed = totalUsed + amount;
        if (updatedTotalUsed >= budget.amount && budget.status !== 'depleted') {
            budget.status = 'depleted';
            await budget.save();
        } else if (updatedTotalUsed > 0 && budget.status === 'allocated') {
            budget.status = 'in_use';
            await budget.save();
        }

        const budgets = await Budget.find({ school_id: schoolId });
        const budgetsWithUsage = await Promise.all(budgets.map(async (budgetItem) => {
            const usageRecords = await BudgetUsage.find({ budget_id: budgetItem._id });
            const totalUsed = usageRecords.reduce((sum, record) => sum + record.amount, 0);

            return {
                ...budgetItem.toObject(),
                usage: totalUsed,
                remaining: budgetItem.amount - totalUsed
            };
        }));

        return res.status(201).json({
            success: true,
            message: 'Budget usage recorded successfully',
            data: budgetsWithUsage
        });
    } catch (error) {
        console.error('Error recording budget usage:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getBudgetUsageHistory = async (req, res) => {
    try {
        const { budget_id } = req.params;

        if (!budget_id) {
            return res.status(400).json({ message: 'Budget ID is required' });
        }

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const schoolId = principal.school_id;

        const budget = await Budget.findById(budget_id);
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        if (budget.school_id !== schoolId) {
            return res.status(403).json({ message: 'You are not authorized to view this budget' });
        }

        const usageRecords = await BudgetUsage.find({ budget_id })
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            message: 'Budget usage history retrieved successfully',
            data: usageRecords
        });
    } catch (error) {
        console.error('Error fetching budget usage history:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const deleteBudgetUsage = async (req, res) => {
    try {
        const { usage_id } = req.params;

        if (!usage_id) {
            return res.status(400).json({ message: 'Usage ID is required' });
        }

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const schoolId = principal.school_id;

        const usageRecord = await BudgetUsage.findById(usage_id);
        if (!usageRecord) {
            return res.status(404).json({ message: 'Usage record not found' });
        }

        const budget = await Budget.findById(usageRecord.budget_id);
        if (!budget) {
            return res.status(404).json({ message: 'Associated budget not found' });
        }

        if (budget.school_id !== schoolId) {
            return res.status(403).json({ message: 'You are not authorized to modify this budget' });
        }

        await BudgetUsage.findByIdAndDelete(usage_id);

        const remainingUsage = await BudgetUsage.find({ budget_id: budget._id });
        const totalUsed = remainingUsage.reduce((sum, record) => sum + record.amount, 0);

        if (totalUsed === 0 && budget.status !== 'allocated') {
            budget.status = 'allocated';
            await budget.save();
        } else if (totalUsed < budget.amount && budget.status === 'depleted') {
            budget.status = 'in_use';
            await budget.save();
        }

        const budgets = await Budget.find({ school_id: schoolId });
        const budgetsWithUsage = await Promise.all(budgets.map(async (budgetItem) => {
            const usageRecords = await BudgetUsage.find({ budget_id: budgetItem._id });
            const totalUsed = usageRecords.reduce((sum, record) => sum + record.amount, 0);

            return {
                ...budgetItem.toObject(),
                usage: totalUsed,
                remaining: budgetItem.amount - totalUsed
            };
        }));

        return res.status(200).json({
            success: true,
            message: 'Budget usage record deleted successfully',
            data: budgetsWithUsage
        });
    } catch (error) {
        console.error('Error deleting budget usage:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};



export const getMeetings = async (req, res) => {
    try {
        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const meetings = await Meeting.find({ school_id: principal.school_id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Meetings retrieved successfully',
            data: meetings
        });
    } catch (error) {
        console.error('Error in getMeetings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createMeeting = async (req, res) => {
    try {
        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const { title, description, date, startTime, endTime, location, participantType, agenda } = req.body;

        if (!title || !description || !date || !startTime || !endTime || !location || !participantType) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const meetingId = await Meeting.generateMeetingId(principal.school_id);

        const newMeeting = new Meeting({
            school_id: principal.school_id,
            meetingId,
            title,
            description,
            date,
            startTime,
            endTime,
            location,
            participantType,
            agenda,
            createdBy: req.user.id
        });

        await newMeeting.save();

        res.status(201).json({
            message: 'Meeting created successfully',
            data: newMeeting
        });
    } catch (error) {
        console.error('Error in createMeeting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getMeetingById = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const meeting = await Meeting.findOne({
            meetingId,
            school_id: principal.school_id
        });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json({
            message: 'Meeting retrieved successfully',
            data: meeting
        });
    } catch (error) {
        console.error('Error in getMeetingById:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { status, remarks } = req.body;

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const meeting = await Meeting.findOne({
            meetingId,
            school_id: principal.school_id
        });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Only allow updating certain fields
        if (status) meeting.status = status;
        if (remarks !== undefined) meeting.remarks = remarks;

        await meeting.save();

        res.status(200).json({
            message: 'Meeting updated successfully',
            data: meeting
        });
    } catch (error) {
        console.error('Error in updateMeeting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const meeting = await Meeting.findOne({
            meetingId,
            school_id: principal.school_id
        });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        if (meeting.status === 'Completed' || meeting.status === 'Cancelled') {
            return res.status(400).json({
                message: 'Cannot delete meetings that have been completed or cancelled'
            });
        }

        await meeting.remove();

        res.status(200).json({
            message: 'Meeting deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteMeeting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPrincipalMeetingsWithDistrict = async (req, res) => {
    try {
        const principal = await schools.findById(req.user.id);
        if (!principal) {
            return res.status(404).json({ message: 'School not found' });
        }

        const principalMeetings = await Meeting.find({
            school_id: principal.school_id,
            participantType: 'DistrictHead'
        }).sort({ date: 1, startTime: 1 });

        const districtMeetings = await DistrictMeeting.find({
            participantType: 'SchoolPrincipals',
            schoolId: principal.school_id
        }).sort({ date: 1, startTime: 1 });

        let districtInfo = {};
        if (districtMeetings.length > 0) {
            const districtId = districtMeetings[0].district_id;
            const districtData = await District.findOne({ district_id: districtId });
            if (districtData) {
                districtInfo = {
                    name: districtData.name,
                    district_id: districtData.district_id
                };
            }
        }

        const formattedDistrictMeetings = districtMeetings.map(meeting => {
            return {
                ...meeting.toObject(),
                meetingType: 'district_initiated',
                districtInfo
            };
        });

        const formattedPrincipalMeetings = principalMeetings.map(meeting => {
            return {
                ...meeting.toObject(),
                meetingType: 'principal_initiated',
                districtInfo
            };
        });

        const allMeetings = [...formattedPrincipalMeetings, ...formattedDistrictMeetings];

        allMeetings.sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.startTime.localeCompare(b.startTime);
        });

        res.status(200).json({
            message: 'Meetings with district head retrieved successfully',
            data: allMeetings
        });
    } catch (error) {
        console.error('Error in getPrincipalMeetingsWithDistrict:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const contactAdmin = async (req, res) => {
    try {
      const { userType, subject, message } = req.body;
  
      const principal = await schools.findById(req.user.id);
      if (!principal) {
        return res.status(404).json({ message: 'Principal not found' });
      }
      const schoolId = principal.school_id;
  
      const existingRequest = await ContactAdminModel.findOne({
        userType,
        userId: schoolId,
        subject,
        message,
      });
  
      if (existingRequest) {
        return res.status(400).json({ message: 'Duplicate request: This message has already been sent to the admin.' });
      }
  
      const request = new ContactAdminModel({
        userType,
        userId: schoolId,
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
      const principal = await schools.findById(req.user.id);
      if (!principal) {
        return res.status(404).json({ message: 'Principal not found' });
      }
      const schoolId = principal.school_id;
  
      const messages = await ContactAdminModel.find({ userId: schoolId });
  
      res.status(200).json({ message: 'Messages retrieved successfully', data: messages });
    } catch (error) {
      console.error('Error in getAllMessages:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };