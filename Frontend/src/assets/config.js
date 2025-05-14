import dotenv from 'dotenv';

dotenv.config();

export default {
  url: process.env.URL || "http://localhost:3000",
};