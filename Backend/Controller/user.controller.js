import User from "../model/user.model.js";
import AI from "../model/ai.model.js";
import { gptmodel } from "../provider/gptmodel.js"

// ==================== REGISTRATION ====================

export const Registration = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log("Entered registration controller");

        // Check required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email, and password are required.",
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered.",
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Registration Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};


// ==================== LOGIN ====================

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("Entered login controller");

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Login successful
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// ==================== AI CHAT ==================
export const Chat = async (req, res) => {
    try {
        console.log("entered in the new chats")

        const { text } = req.body;

        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please give the text first",
            });
        }

        const response = await gptmodel(text);

        console.log("AI Response:", response);

        const chat = await AI.create({
            userMessage: text,
            aiResponse: response,
        });

        return res.status(200).json({
            success: true,
            message: response,
            data: chat,
        });

    } catch (error) {
        console.error("Chat Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
export const getChats = async (req, res) => {
    try {
        console.log("entered in the getchats")
        const chats = await AI.find()
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            chats,
        });

    } catch (error) {
        console.error("Fetch Chats Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch chats",
        });
    }
};