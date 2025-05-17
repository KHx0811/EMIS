import express from "express";
import views from "./views/index.js";
import config from "./config.js";
import { connectToDB } from "./services/database.js";
import cors from "cors";

const { port } = config;
const app = express();

// Update CORS configuration to include your new frontend URL
const allowedOrigins = ["https://emis-ebon.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
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

// For Vercel serverless functions, we don't need to actively listen on a port
if (process.env.NODE_ENV !== "production") {
  connectToDB();
  app.listen(port, () => {
    console.log(`server started on ${port}`);
  });
} else {
  connectToDB();
}

// Export for Vercel serverless function
export default app;
