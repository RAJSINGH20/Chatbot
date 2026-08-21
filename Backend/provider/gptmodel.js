import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

console.log(
    "OpenRouter Key:",
    apiKey ? "Loaded" : "NOT LOADED"
);

const client = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
});

const system_prompt = `
You are an AI assistant specialized in studying Aṣṭāṅga Hṛdayam.

Answer the user's questions clearly and accurately.

Rules:
- Answer the user's question directly.
- Use Aṣṭāṅga Hṛdayam concepts when relevant.
- Do not invent Sanskrit verses, chapter numbers, references,
  medicines, dosages, or quotations.
- If information is not available in the provided context,
  clearly say that it is not available.
- Preserve important Sanskrit terminology.
- Explain difficult Ayurvedic concepts in simple language.
- Use Markdown formatting.
- Use headings, bullet points, tables, and code blocks when useful.
- Keep answers readable and well structured.
- If the user asks a simple question, give a concise answer.
- If the user asks for a detailed explanation, provide a structured answer.
- Never fabricate information.

If the user provides retrieved Aṣṭāṅga Hṛdayam text,
use that text as the primary source for the answer.
`;

export const gptmodel = async (text) => {
    try {
        console.log("USER QUERY:", text);

        const response =
            await client.chat.completions.create({
                model: "openai/gpt-4.1-mini",

                messages: [
                    {
                        role: "system",
                        content: system_prompt,
                    },
                    {
                        role: "user",
                        content: text,
                    },
                ],

                temperature: 0.2,
                max_tokens: 2000,
            });

        console.log(
            "FULL RESPONSE:",
            JSON.stringify(response, null, 2)
        );

        const answer =
            response.choices?.[0]?.message?.content;

        if (!answer) {
            console.error(
                "No answer returned by model"
            );

            return "I could not generate an answer.";
        }

        return answer;

    } catch (error) {
        console.error(
            "GPT ERROR:",
            error?.response?.data || error
        );

        throw error;
    }
};