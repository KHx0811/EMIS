import ContactAdminModel from '../models/ContactAdminModel.js';
import Teacher from '../models/Teacher.js';
import School from '../models/School.js';

export const contactAdmin = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const { id, userType } = req.user; // Assuming middleware sets these fields
    
    let userId;
    
    // Find the appropriate ID based on user type
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
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Check for duplicate messages
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

    // Create and save the new contact request
    const request = new ContactAdminModel({
      userId,
      userType,
      subject,
      message,
    });
    
    console.log(`Contact Admin Request from ${userType}:`, request);
    await request.save();
    
    res.status(200).json({ message: 'Message sent to admin successfully' });
  } catch (error) {
    console.error('Error in contactAdmin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Controller for admin to respond to messages
export const respondToMessage = async (req, res) => {
  try {
    const { messageId, response } = req.body;
    
    const message = await ContactAdminModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    message.response = response;
    message.respondedAt = new Date();
    await message.save();
    
    res.status(200).json({ message: 'Response sent successfully' });
  } catch (error) {
    console.error('Error in respondToMessage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all messages for admin
export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactAdminModel.find().sort({ createdAt: -1 });
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error in getAllMessages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a specific user
export const getUserMessages = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    
    const messages = await ContactAdminModel.find({ 
      userId, 
      userType 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error in getUserMessages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};