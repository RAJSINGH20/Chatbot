import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

console.log(
    "OpenRouter Key:",
    process.env.OPENROUTER_API_KEY ? "Loaded" : "NOT LOADED"
);

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export const gptmodel = async (text) => {
    try {
        const response = await client.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: text,
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("GPT Error:", error);
        throw error;
    }
};