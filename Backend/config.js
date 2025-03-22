import dotenv from 'dotenv';

dotenv.config();

export default {
  mongo_uri: process.env.MONGO_URI,
  port: process.env.PORT || 3000,
  jwt_secret: process.env.JWT_SECRET || "test token",
};