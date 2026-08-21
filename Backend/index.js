import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./Database/db.js";
import route from "./Routes/route.js";
import router from "./Routes/route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Connect MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// User routes
app.use("/api/user", route);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});