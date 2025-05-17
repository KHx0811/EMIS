import express from "express";
import views from "./views/index.js";
import config from "./config.js";
import { connectToDB } from "./services/database.js";
import cors from "cors";

const { port } = config;
const app = express();

// CORS setup
const allowedOrigins = [process.env.FRONTEND_URL]; // and define it in your Render env vars
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", views);

app.use("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", allowedOrigins);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(404).json({ message: "Route not found" });
});

// Always connect and listen (works for both Render and local)
connectToDB();
app.listen(port, () => {
  console.log(`✅ Server started on port ${port}`);
});

export default app;
