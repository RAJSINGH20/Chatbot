import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./Database/db.js";
import Route from "./Routes/route.js";

const app = express();


// Load environment variables
dotenv.config();


// Middleware
app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);


// Connect MongoDB
connectDB();


// Test route
app.get("/", (req, res) => {
    res.send("Hello World!");
});

console.log("ented index")
// User routes
app.use("/api/user", Route);


// Start server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
}); 