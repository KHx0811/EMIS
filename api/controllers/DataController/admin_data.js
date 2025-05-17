import Teacher from '../../models/teacher.js';
import School from '../../models/schools.js';
import Parent from '../../models/parents.js';
import District from '../../models/districts.js';
import ContactAdminModel from '../../models/DataModels/AdminModel/contactAdminModel.js';

export const contactAdmin = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const { id, userType } = req.user;
    
    let userId;
    
    if (userType === 'teacher') {
      const teacher = await Teacher.findById(id);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      userId = teacher.teacher_id;
    } else if (userType === 'principal') {
      const school = await School.findById(id);
      if (!school) {
        return res.status(404).json({ message: 'Principal not found' });
      }
      userId = school.school_id;
    } else if (userType === 'parent') {
      const parent = await Parent.findById(id);
      if (!parent) {
        return res.status(404).json({ message: 'Principal not found' });
      }
      userId = parent.parent_id;
    } else if (userType === 'districthead') {
      const district = await District.findById(id);
      if (!district) {
        return res.status(404).json({ message: 'Principal not found' });
      }
      userId = district.district_id;
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    const existingRequest = await ContactAdminModel.findOne({
      userId,
      userType,
      subject,
      message,
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'Duplicate request: This message has already been sent to the admin.' 
      });
    }

    const request = new ContactAdminModel({
      userId,
      userType,
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
    const messages = await ContactAdminModel.find()
      .sort({ createdAt: -1 })
      .lean();

    console.log('Messages:', messages);
    
    res.status(200).json({ 
      success: true,
      data: messages 
    });
  } catch (error) {
    console.error('Error in getAllMessages:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await ContactAdminModel.countDocuments({ response: { $exists: false } });
    
    res.status(200).json({ 
      success: true,
      count 
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const respondToMessage = async (req, res) => {
  try {
    const { messageId, response } = req.body;
    
    if (!messageId || !response) {
      return res.status(400).json({ 
        success: false,
        message: 'Message ID and response are required' 
      });
    }
    
    const message = await ContactAdminModel.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Message not found' 
      });
    }
    
    message.response = response;
    message.respondedAt = new Date();
    await message.save();
    
    res.status(200).json({ 
      success: true,
      message: 'Response sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error in respondToMessage:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};


export const getUserMessages = async (req, res) => {
  try {
    const { id, userType } = req.user;
    console.log("UserType:", userType);
    let userId;
    
    if (userType === 'teacher') {
      const teacher = await Teacher.findById(id);
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      userId = teacher.teacher_id;
    } else if (userType === 'principal') {
      const school = await School.findById(id);
      if (!school) {
        return res.status(404).json({ message: 'Principal not found' });
      }
      userId = school.school_id;
    } else if (userType === 'parent') {
      const parent = await Parent.findById(id);
      if (!parent) {
        return res.status(404).json({ message: 'Parent not found' });
      }
      userId = parent.parent_id;
    } else if (userType === 'districthead') {
      const district = await District.findById(id);
      if (!district) {
        return res.status(404).json({ message: 'District head not found' });
      }
      userId = district.district_id;
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }
    
    const messages = await ContactAdminModel.find({ 
      userType, 
      userId 
    })
    .sort({ createdAt: -1 })
    .lean();
    
    res.status(200).json({ 
      success: true,
      data: messages 
    });
  } catch (error) {
    console.error('Error in getUserMessages:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};