import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("mongodb+srv://rajsinghdurgapur26_db_user:rjGfNVgxg3rAHPiR@chatbot.36kz5pu.mongodb.net/?appName=ChatBot");
    await mongoose.connect("mongodb+srv://rajsinghdurgapur26_db_user:rjGfNVgxg3rAHPiR@chatbot.36kz5pu.mongodb.net/?appName=ChatBot");

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB Connection Failed:", error.message);
  }
};

export default connectDB;
