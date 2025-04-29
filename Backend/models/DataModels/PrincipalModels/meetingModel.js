// models/DataModels/PrincipalModels/meetingModel.js
import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  school_id: {
    type: String,
    required: true,
    index: true
  },
  meetingId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  participantType: {
    type: String,
    enum: ['Parents', 'Teachers', 'School', 'DistrictHead'],
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Pending', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  agenda: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  }
}, { timestamps: true });

meetingSchema.statics.generateMeetingId = async function(schoolId) {
  const schoolPrefix = schoolId.substring(0, 3).toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const lastMeeting = await this.findOne(
    { meetingId: new RegExp(`^${schoolPrefix}-MTG-${dateStr}-`) },
    { meetingId: 1 },
    { sort: { meetingId: -1 } }
  );
  
  let meetingNumber = 1;
  if (lastMeeting) {
    const lastNumber = parseInt(lastMeeting.meetingId.split('-').pop());
    if (!isNaN(lastNumber)) {
      meetingNumber = lastNumber + 1;
    }
  }
  
  const meetingNumberStr = meetingNumber.toString().padStart(3, '0');
  return `${schoolPrefix}-MTG-${dateStr}-${meetingNumberStr}`;
};

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;