import express from "express";
import views from "./views/index.js";
import config from "./config.js";
import { connectToDB } from "./services/database.js";
import cors from "cors";



const { port } = config;
const app = express();

app.use(express.json());
app.use(cors());


app.use("/api", views);
connectToDB();

app.listen(port, () => {
  console.log(`server started on ${port}`);
});