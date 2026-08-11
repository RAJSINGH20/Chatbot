import mongoose from "mongoose";

const aiSchema = new mongoose.Schema(
    {
        userMessage: {
            type: String,
            required: true,
        },

        aiResponse: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const AI = mongoose.model("AI", aiSchema);

export default AI;