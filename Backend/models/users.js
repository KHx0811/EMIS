import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: { 
    type: String, 
    required: true,
    unique: true 
  },
  resetOtp: { 
    type: String, 
    default: "" 
  },
  resetOtpExpireAt: { 
    type: Date, 
    default: Date.now 
  },
  
});

export default model("users", userSchema);
