import District from '../../models/districts.js'
import schools from '../../models/schools.js'
import Teacher from '../../models/teacher.js'
import Student from '../../models/students.js'
import Budget from '../../models/DataModels/DistrictModel/budgets.js'
import DistrictMeeting from '../../models/DataModels/DistrictModel/meetingModel.js'
import ContactAdminModel from '../../models/DataModels/TeacherModels/contactAdminModel.js'
import Exam from '../../models/DataModels/DistrictModel/examModel.js'
import { v4 as uuidv4 } from 'uuid';

export const getDistrictProfile = async (req, res) => {
    try {
        const district = await District.findById(req.user.id).select('-password');
        if (!district) {
            return res.status(404).json({ message: 'DistrictHead not found' });
        }

        res.status(200).json({
            success: true,
            message: 'DistrictHead profile retrieved successfully',
            data: district
        });
    } catch (error) {
        console.error('Error fetching DistrictHead profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const searchSchool = async (req, res) => {
    try {
        const { school_id } = req.params;

        if (!school_id) {
            return res.status(400).json({ message: 'School ID is required' });
        }

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const school = await schools.findOne({ school_id: school_id });

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        if (districtId !== school.district_id) {
            return res.status(403).json({
                message: 'You are not authorized to view this school\'s details'
            });
        }

        res.status(200).json({
            success: true,
            message: 'School retrieved successfully',
            data: school,
        });

    } catch (error) {
        console.error('Error in searchSchool:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const searchTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        if (!teacher_id) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const teacher = await Teacher.findOne({ teacher_id: teacher_id });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const school = await schools.findOne({ school_id: teacher.school_id });
        if (!school) {
            return res.status(404).json({ message: 'School associated with this teacher not found' });
        }

        if (districtId !== school.district_id) {
            return res.status(403).json({
                message: 'You are not authorized to view this teacher\'s details'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Teacher retrieved successfully',
            data: teacher,
        });
    } catch (error) {
        console.error('Error in searchTeacher:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const searchStudent = async (req, res) => {
    try {
        const { student_id } = req.params;
        if (!student_id) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const student = await Student.findOne({ student_id: student_id });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const school = await schools.findOne({ school_id: student.school_id });
        if (!school) {
            return res.status(404).json({ message: 'School associated with this student not found' });
        }

        if (districtId !== school.district_id) {
            return res.status(403).json({
                message: 'You are not authorized to view this student\'s details'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student retrieved successfully',
            data: student,
        });
    } catch (error) {
        console.error('Error in searchStudent:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getAllBudgets = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const schoolsPresent = await schools.find({ district_id: districtId });
        const schoolIds = schoolsPresent.map(school => school.school_id);

        const budgets = await Budget.find({ school_id: { $in: schoolIds } });

        res.status(200).json({
            success: true,
            message: 'Budgets retrieved successfully',
            data: budgets
        });
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getBudgetById = async (req, res) => {
    try {
        const { budget_id } = req.params;

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const budget = await Budget.findById(budget_id);
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        const school = await schools.findOne({ school_id: budget.school_id });
        if (!school || school.district_id !== districtId) {
            return res.status(403).json({
                message: 'You are not authorized to view this budget'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Budget retrieved successfully',
            data: budget
        });
    } catch (error) {
        console.error('Error fetching budget:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const createBudget = async (req, res) => {
    try {
        const { school_id, amount, fiscal_year, category, description, status } = req.body;

        if (!school_id || !amount) {
            return res.status(400).json({ message: 'School ID and amount are required' });
        }

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const school = await schools.findOne({ school_id: school_id });
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        if (school.district_id !== districtId) {
            return res.status(403).json({
                message: 'You are not authorized to allocate budget to this school'
            });
        }

        const newBudget = new Budget({
            school_id,
            amount: parseFloat(amount),
            fiscal_year: fiscal_year || new Date().getFullYear(),
            category: category || 'general',
            description: description || '',
            status: status || 'allocated',
            usage: 0,
            created_by: req.user.id,
            allocation_date: new Date()
        });

        await newBudget.save();

        res.status(201).json({
            success: true,
            message: 'Budget allocated successfully',
            data: newBudget
        });
    } catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const updateBudget = async (req, res) => {
    try {
        const { budget_id } = req.params;
        const { school_id, amount, fiscal_year, category, description, status, usage } = req.body;

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const budget = await Budget.findById(budget_id);
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        const school = await schools.findOne({ school_id: budget.school_id });
        if (!school || school.district_id !== districtId) {
            return res.status(403).json({
                message: 'You are not authorized to update this budget'
            });
        }

        if (school_id && school_id !== budget.school_id) {
            const newSchool = await schools.findOne({ school_id: school_id });
            if (!newSchool) {
                return res.status(404).json({ message: 'New school not found' });
            }

            if (newSchool.district_id !== districtId) {
                return res.status(403).json({
                    message: 'You are not authorized to allocate budget to this school'
                });
            }
        }

        budget.school_id = school_id || budget.school_id;
        budget.amount = amount !== undefined ? parseFloat(amount) : budget.amount;
        budget.fiscal_year = fiscal_year || budget.fiscal_year;
        budget.category = category || budget.category;
        budget.description = description !== undefined ? description : budget.description;
        budget.status = status || budget.status;
        budget.usage = usage !== undefined ? parseFloat(usage) : budget.usage;
        budget.last_updated = new Date();
        budget.updated_by = req.user.id;

        await budget.save();

        res.status(200).json({
            success: true,
            message: 'Budget updated successfully',
            data: budget
        });
    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const deleteBudget = async (req, res) => {
    try {
        const { budget_id } = req.params;

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const budget = await Budget.findById(budget_id);
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        const school = await schools.findOne({ school_id: budget.school_id });
        if (!school || school.district_id !== districtId) {
            return res.status(403).json({
                message: 'You are not authorized to delete this budget'
            });
        }

        await Budget.findByIdAndDelete(budget_id);

        res.status(200).json({
            success: true,
            message: 'Budget deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getDistrictSchools = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const schoolsInDistrict = await schools.find({ district_id: districtId });

        res.status(200).json({
            success: true,
            message: 'Schools retrieved successfully',
            data: schoolsInDistrict
        });
    } catch (error) {
        console.error('Error fetching district schools:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getBudgetStats = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;

        const presentSchools = await schools.find({ district_id: districtId });
        const schoolIds = presentSchools.map(school => school.school_id);

        const budgets = await Budget.find({ school_id: { $in: schoolIds } });

        const totalAllocated = budgets.reduce((sum, budget) => sum + budget.amount, 0);
        const totalUsed = budgets.reduce((sum, budget) => sum + (budget.usage || 0), 0);

        const budgetsByCategory = {};
        budgets.forEach(budget => {
            const category = budget.category || 'uncategorized';
            if (!budgetsByCategory[category]) {
                budgetsByCategory[category] = { allocated: 0, used: 0 };
            }
            budgetsByCategory[category].allocated += budget.amount;
            budgetsByCategory[category].used += (budget.usage || 0);
        });

        const budgetsBySchool = {};
        budgets.forEach(budget => {
            const schoolId = budget.school_id;
            if (!budgetsBySchool[schoolId]) {
                budgetsBySchool[schoolId] = { allocated: 0, used: 0 };
            }
            budgetsBySchool[schoolId].allocated += budget.amount;
            budgetsBySchool[schoolId].used += (budget.usage || 0);
        });

        res.status(200).json({
            success: true,
            message: 'Budget statistics retrieved successfully',
            data: {
                totalAllocated,
                totalUsed,
                remainingBudget: totalAllocated - totalUsed,
                usagePercentage: totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0,
                budgetsByCategory,
                budgetsBySchool
            }
        });
    } catch (error) {
        console.error('Error fetching budget statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getDistrictMeetings = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const meetings = await DistrictMeeting.find({ district_id: district.district_id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'District meetings retrieved successfully',
            data: meetings
        });
    } catch (error) {
        console.error('Error in getDistrictMeetings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createDistrictMeeting = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const { title, description, date, startTime, endTime, location, participantType, schoolId, agenda } = req.body;

        if (!title || !description || !date || !startTime || !endTime || !location || !participantType) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (participantType === 'SchoolPrincipals' && !schoolId) {
            return res.status(400).json({ message: 'School ID is required for meetings with school principals' });
        }

        if (schoolId) {
            const school = await schools.findOne({ school_id: schoolId });
            if (!school) {
                return res.status(404).json({ message: 'School not found' });
            }
            if (school.district_id !== district.district_id) {
                return res.status(403).json({ message: 'This school does not belong to your district' });
            }
        }

        const meetingId = await DistrictMeeting.generateMeetingId(district.district_id);

        const newMeeting = new DistrictMeeting({
            district_id: district.district_id,
            meetingId,
            title,
            description,
            date,
            startTime,
            endTime,
            location,
            participantType,
            schoolId: participantType === 'SchoolPrincipals' ? schoolId : null,
            agenda,
            createdBy: req.user.id
        });

        await newMeeting.save();

        res.status(201).json({
            message: 'District meeting created successfully',
            data: newMeeting
        });
    } catch (error) {
        console.error('Error in createDistrictMeeting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getDistrictMeetingById = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const meeting = await DistrictMeeting.findOne({
            meetingId,
            district_id: district.district_id
        });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json({
            message: 'District meeting retrieved successfully',
            data: meeting
        });
    } catch (error) {
        console.error('Error in getDistrictMeetingById:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateDistrictMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { status, remarks } = req.body;

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const meeting = await DistrictMeeting.findOne({
            meetingId,
            district_id: district.district_id
        });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        if (status) meeting.status = status;
        if (remarks !== undefined) meeting.remarks = remarks;

        await meeting.save();

        res.status(200).json({
            message: 'District meeting updated successfully',
            data: meeting
        });
    } catch (error) {
        console.error('Error in updateDistrictMeeting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteDistrictMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const meeting = await DistrictMeeting.findOne({
            meetingId,
            district_id: district.district_id
        });

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        if (meeting.status === 'Completed' || meeting.status === 'Cancelled') {
            return res.status(400).json({
                message: 'Cannot delete meetings that have been completed or cancelled'
            });
        }

        await meeting.deleteOne();

        res.status(200).json({
            message: 'District meeting deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteDistrictMeeting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getDistrictMeetingsWithPrincipals = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtMeetings = await DistrictMeeting.find({
            district_id: district.district_id,
            participantType: 'SchoolPrincipals'
        }).sort({ date: 1, startTime: 1 });

        const schoolIds = districtMeetings.map(meeting => meeting.schoolId).filter(id => id);

        const schoolsData = {};
        if (schoolIds.length > 0) {
            const schoolsList = await schools.find({ school_id: { $in: schoolIds } });
            schoolsList.forEach(school => {
                schoolsData[school.school_id] = {
                    name: school.name,
                    address: school.address
                };
            });
        }

        const meetingsWithSchoolInfo = districtMeetings.map(meeting => {
            const meetingObj = meeting.toObject();
            if (meeting.schoolId && schoolsData[meeting.schoolId]) {
                meetingObj.schoolInfo = schoolsData[meeting.schoolId];
            }
            return meetingObj;
        });

        res.status(200).json({
            message: 'Meetings with school principals retrieved successfully',
            data: meetingsWithSchoolInfo
        });
    } catch (error) {
        console.error('Error in getDistrictMeetingsWithPrincipals:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const contactAdmin = async (req, res) => {
  try {
    const { userType, subject,message } = req.body;

    const objectId = await District.findById(req.user.id);
    if (!objectId) {
      return res.status(404).json({ message: 'District not found' });
    }
    const districtId = objectId.district_id;

    const existingRequest = await ContactAdminModel.findOne({
      userType: userType,
      userId: districtId,
      subject,
      message,
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Duplicate request: This message has already been sent to the admin.' });
    }

    const request = new ContactAdminModel({
      userType: userType,
      userId: districtId,
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

export const getAllSchools = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;
        const schoolsList = await schools.find({ district_id: districtId });

        res.status(200).json({
            success: true,
            message: 'Schools retrieved successfully',
            data: schoolsList
        });
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getAllExams = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;
        const examsList = await Exam.find({ district_id: districtId });

        res.status(200).json({
            success: true,
            message: 'Exams retrieved successfully',
            data: examsList
        });
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const createExam = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;
        
        if (req.body.centers && req.body.centers.length > 0) {
            const centerSchools = await schools.find({ 
                school_id: { $in: req.body.centers },
                district_id: districtId
            });
            
            if (centerSchools.length !== req.body.centers.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more selected schools do not belong to your district'
                });
            }
        }

        const examId = `EXAM-${uuidv4().substring(0, 8)}`;
        
        const newExam = new Exam({
            exam_id: examId,
            exam_name: req.body.exam_name,
            exam_type: req.body.exam_type,
            subject: req.body.subject,
            start_date: new Date(req.body.start_date),
            end_date: new Date(req.body.end_date),
            registration_deadline: new Date(req.body.registration_deadline),
            centers: req.body.centers,
            eligible_grades: req.body.eligible_grades,
            description: req.body.description,
            status: req.body.status || 'scheduled',
            district_id: districtId,
            created_by: req.user.id,
            max_score: req.body.max_score,
            passing_score: req.body.passing_score,
            duration_minutes: req.body.duration_minutes,
            instructions: req.body.instructions
        });

        const savedExam = await newExam.save();

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            data: savedExam
        });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getExamById = async (req, res) => {
    try {
        const { examId } = req.params;
        
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;
        
        const exam = await Exam.findOne({ 
            exam_id: examId,
            district_id: districtId
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found or you do not have permission to view it'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Exam retrieved successfully',
            data: exam
        });
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const updateExam = async (req, res) => {
    try {
        const { examId } = req.params;
        
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;
        
        if (req.body.centers && req.body.centers.length > 0) {
            const centerSchools = await schools.find({ 
                school_id: { $in: req.body.centers },
                district_id: districtId
            });
            
            if (centerSchools.length !== req.body.centers.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more selected schools do not belong to your district'
                });
            }
        }
        
        const updateData = { ...req.body };
        
        if (updateData.start_date) updateData.start_date = new Date(updateData.start_date);
        if (updateData.end_date) updateData.end_date = new Date(updateData.end_date);
        if (updateData.registration_deadline) updateData.registration_deadline = new Date(updateData.registration_deadline);
        
        const exam = await Exam.findOneAndUpdate(
            { exam_id: examId, district_id: districtId },
            updateData,
            { new: true }
        );

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found or you do not have permission to update it'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Exam updated successfully',
            data: exam
        });
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const deleteExam = async (req, res) => {
    try {
        const { examId } = req.params;
        
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;
        
        const exam = await Exam.findOneAndDelete({ 
            exam_id: examId,
            district_id: districtId
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found or you do not have permission to delete it'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Exam deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getExamStats = async (req, res) => {
    try {
        const district = await District.findById(req.user.id);
        if (!district) {
            return res.status(404).json({ message: 'District head not found' });
        }

        const districtId = district.district_id;
        
        const exams = await Exam.find({ district_id: districtId });
        
        const statusCounts = {
            scheduled: exams.filter(exam => exam.status === 'scheduled').length,
            ongoing: exams.filter(exam => exam.status === 'ongoing').length,
            completed: exams.filter(exam => exam.status === 'completed').length,
            cancelled: exams.filter(exam => exam.status === 'cancelled').length,
            postponed: exams.filter(exam => exam.status === 'postponed').length,
        };
        
        const typeCounts = {
            Monthly: exams.filter(exam => exam.exam_type === 'Monthly').length,
            Quarterly: exams.filter(exam => exam.exam_type === 'Quarterly').length,
            'Half-Yearly': exams.filter(exam => exam.exam_type === 'Half-Yearly').length,
            Annual: exams.filter(exam => exam.exam_type === 'Annual').length,
            'Unit Test': exams.filter(exam => exam.exam_type === 'Unit Test').length,
            Project: exams.filter(exam => exam.exam_type === 'Project').length,
        };
        
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        const upcomingExams = exams.filter(exam => {
            const examStartDate = new Date(exam.start_date);
            return examStartDate >= today && examStartDate <= thirtyDaysFromNow && 
                  exam.status !== 'cancelled' && exam.status !== 'completed';
        });
        
        res.status(200).json({
            success: true,
            message: 'Exam statistics retrieved successfully',
            data: {
                totalExams: exams.length,
                statusCounts,
                typeCounts,
                upcomingExamsCount: upcomingExams.length,
                nextExam: upcomingExams.length > 0 ? 
                    upcomingExams.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0] : null
            }
        });
    } catch (error) {
        console.error('Error fetching exam statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


