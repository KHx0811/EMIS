import config from "../config.js";
import mongoose from "mongoose";

const { mongo_uri } = config;

export const connectToDB = () => {
  mongoose
    .connect(mongo_uri)
    .then(() => {
      console.log("connected to database");
    })
    .catch((err) => {
      console.log("error connecting to database", err);
    });
};
