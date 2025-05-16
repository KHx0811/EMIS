import express from "express";
import views from "./views/index.js";
import config from "./config.js";
import { connectToDB } from "./services/database.js";
import cors from "cors";



const { port } = config;
const app = express();

app.use(express.json());
app.use(cors(
  {
    origin: ['https://emis-sigma.vercel.app'],
    credentials: true,
  }
));


app.use("/api", views);
app.use("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://emis-sigma.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.status(404).json({ message: "Route not found" });
});

connectToDB();

app.listen(port, () => {
  console.log(`server started on ${port}`);
});
