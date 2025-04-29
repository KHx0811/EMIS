import mongoose from 'mongoose';

const DistrictMeetingSchema = new mongoose.Schema({
  district_id: {
    type: String,
    required: true
  },
  meetingId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
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
    required: true
  },
  participantType: {
    type: String,
    enum: ['SchoolPrincipals', 'Ministers', 'Education Department', 'Staff', 'Other'],
    required: true
  },
  schoolId: {
    type: String,
    default: null
  },
  agenda: {
    type: String
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Pending', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  remarks: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true
  }
}, { timestamps: true });

// Static method to generate unique meeting ID
DistrictMeetingSchema.statics.generateMeetingId = async function(districtId) {
  const count = await this.countDocuments({ district_id: districtId });
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `DM-${districtId}-${year}${month}-${count + 1}`;
};

const DistrictMeeting = mongoose.model('DistrictMeeting', DistrictMeetingSchema);

export default DistrictMeeting;