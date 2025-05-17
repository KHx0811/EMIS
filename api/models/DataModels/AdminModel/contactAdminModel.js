import { Schema, model } from "mongoose";

const contactAdminSchema = new Schema({
  userId: { 
    type: String, 
    required: true 
  },
  userType: { 
    type: String, 
    required: true, 
    enum: ['parent', 'teacher', 'principal', 'districthead'] 
  },
  subject: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  response: { 
    type: String,
    default: null
  },
  respondedAt: { 
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default model("ContactAdminModel", contactAdminSchema);