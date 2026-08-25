import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    console.error("OPENROUTER_API_KEY is missing");
    process.exit(1);
}

const client = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
});

/*
|--------------------------------------------------------------------------
| LOCAL CHARAKA SAMHITA DATA
|--------------------------------------------------------------------------
*/

const documents = [
    "Backend/Data/2015.326549.The-Charaka.pdf",

    "Backend/Data/Charaka Samhita Vol 2  Sharma P.V. Chowkambha Sanskrit Series (Incomplete Volumes).pdf",

    "Backend/Data/Charaka Samhita VOl-3 Trans By Kaviraj Atri Dev Ji Gupta 1994 Ajmer - Arya Sahitya Mandal.pdf",
];

/*
|--------------------------------------------------------------------------
| SETTINGS
|--------------------------------------------------------------------------
*/

const CHUNK_SIZE = 1800;
const CHUNK_OVERLAP = 300;

const TOP_K = 6;


/*
|--------------------------------------------------------------------------
| STORE
|--------------------------------------------------------------------------
*/

let chunks = [];

let initialized = false;


/*
|--------------------------------------------------------------------------
| CLEAN TEXT
|--------------------------------------------------------------------------
*/

function cleanText(text) {
    return text
        .replace(/\r/g, " ")
        .replace(/\n+/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s+/g, "\n")
        .trim();
}


/*
|--------------------------------------------------------------------------
| NORMALIZE TEXT
|--------------------------------------------------------------------------
*/

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}


/*
|--------------------------------------------------------------------------
| STOP WORDS
|--------------------------------------------------------------------------
*/

const stopWords = new Set([
    "the",
    "is",
    "are",
    "was",
    "were",
    "what",
    "why",
    "how",
    "when",
    "where",
    "which",
    "who",
    "a",
    "an",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "according",
    "explain",
    "tell",
    "me",
    "about",

    "hai",
    "ka",
    "ki",
    "ke",
    "ko",
    "mein",
    "me",
    "aur",
    "kya",
    "kaise",
    "kyun",
    "batao",
    "samjhao",
    "according",

    "হয়",
    "কি",
    "কী",
    "এর",
    "এবং",
    "কে",
    "কেন",
    "কীভাবে",
]);


/*
|--------------------------------------------------------------------------
| QUERY KEYWORDS
|--------------------------------------------------------------------------
*/

function extractKeywords(query) {
    const words = normalizeText(query)
        .split(" ")
        .filter(Boolean);

    return words.filter(
        (word) =>
            word.length > 2 &&
            !stopWords.has(word)
    );
}


/*
|--------------------------------------------------------------------------
| CHUNK PDF TEXT
|--------------------------------------------------------------------------
*/

function createChunks(text, source) {
    const result = [];

    let start = 0;

    while (start < text.length) {
        let end = start + CHUNK_SIZE;

        /*
         * Try to end the chunk at a sentence/newline
         */
        if (end < text.length) {
            const possibleEnd = text.lastIndexOf(
                ".",
                end
            );

            if (
                possibleEnd > start + 1000
            ) {
                end = possibleEnd + 1;
            }
        }

        const chunkText = text
            .slice(start, end)
            .trim();

        if (chunkText.length > 100) {
            result.push({
                id: result.length,
                source,
                content: chunkText,
            });
        }

        start =
            end - CHUNK_OVERLAP;

        if (start < 0) {
            start = 0;
        }
    }

    return result;
}


/*
|--------------------------------------------------------------------------
| LOAD ALL PDF DATA
|--------------------------------------------------------------------------
*/

async function loadDocuments() {
    console.log("\nLoading Charaka Samhita documents...\n");

    const allChunks = [];

    for (const documentPath of documents) {
        try {
            const absolutePath = path.resolve(
                process.cwd(),
                documentPath
            );

            console.log(
                `Reading: ${documentPath}`
            );

            if (!fs.existsSync(absolutePath)) {
                console.error(
                    `File not found: ${absolutePath}`
                );

                continue;
            }

            const buffer =
                fs.readFileSync(
                    absolutePath
                );

            const data =
                await pdf(buffer);

            const text =
                cleanText(data.text);

            console.log(
                `Pages: ${data.numpages}`
            );

            console.log(
                `Characters: ${text.length}`
            );

            const documentChunks =
                createChunks(
                    text,
                    documentPath
                );

            console.log(
                `Chunks: ${documentChunks.length}`
            );

            allChunks.push(
                ...documentChunks
            );

        } catch (error) {
            console.error(
                `Error reading ${documentPath}:`,
                error.message
            );
        }
    }

    chunks = allChunks;

    initialized = true;

    console.log(
        `\nTotal chunks loaded: ${chunks.length}\n`
    );
}


/*
|--------------------------------------------------------------------------
| SCORE CHUNK
|--------------------------------------------------------------------------
|
| Simple local TF-style keyword retrieval.
|
*/

function scoreChunk(
    queryKeywords,
    chunk
) {
    const content =
        normalizeText(
            chunk.content
        );

    let score = 0;

    for (const keyword of queryKeywords) {

        /*
         * Exact word occurrence
         */
        const regex =
            new RegExp(
                `\\b${keyword}\\b`,
                "gi"
            );

        const matches =
            content.match(regex);

        if (matches) {
            score +=
                matches.length * 3;
        }

        /*
         * Partial occurrence
         */
        if (
            content.includes(keyword)
        ) {
            score += 1;
        }
    }

    /*
     * Boost important terms
     */

    const importantTerms = [
        "agni",
        "dosha",
        "vata",
        "pitta",
        "kapha",
        "ama",
        "ahara",
        "ahara",
        "rasa",
        "dhatu",
        "chikitsa",
        "roga",
        "nidana",
        "swastha",
        "ayurveda",
        "charaka",
        "samprapti",
    ];

    for (const term of importantTerms) {

        if (
            queryKeywords.includes(term) &&
            content.includes(term)
        ) {
            score += 5;
        }
    }

    return score;
}


/*
|--------------------------------------------------------------------------
| RETRIEVE RELEVANT CHUNKS
|--------------------------------------------------------------------------
*/

function retrieveContext(
    question,
    topK = TOP_K
) {
    const keywords =
        extractKeywords(question);

    if (!keywords.length) {
        return [];
    }

    const scoredChunks =
        chunks.map((chunk) => ({
            ...chunk,

            score: scoreChunk(
                keywords,
                chunk
            ),
        }));

    const relevant =
        scoredChunks
            .filter(
                (chunk) =>
                    chunk.score > 0
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, topK);

    return relevant;
}


/*
|--------------------------------------------------------------------------
| BUILD CONTEXT
|--------------------------------------------------------------------------
*/

function buildContext(
    retrievedChunks
) {
    if (!retrievedChunks.length) {
        return "";
    }

    return retrievedChunks
        .map(
            (chunk, index) => `
SOURCE ${index + 1}

Document:
${chunk.source}

Relevance Score:
${chunk.score}

Content:
${chunk.content}
`
        )
        .join("\n-------------------------\n");
}


/*
|--------------------------------------------------------------------------
| SYSTEM PROMPT
|--------------------------------------------------------------------------
*/

const systemPrompt = `
You are Charaka AI, an AI assistant specialized in studying
the provided Charaka Samhita texts.

Your answers MUST be grounded in the retrieved text provided
by the application.

IMPORTANT RULES:

1. Use the retrieved Charaka Samhita context as your PRIMARY
   and authoritative source.

2. Do NOT invent information.

3. NEVER fabricate:
   - Sanskrit verses
   - Chapter numbers
   - References
   - Medicines
   - Dosages
   - Quotations
   - Ayurvedic concepts
   - Textual citations

4. If the retrieved context does not contain enough information
   to answer the question, clearly say:

"The answer is not available in the provided Charaka Samhita texts."

5. Do not use your general model knowledge to fill missing
   information.

6. Distinguish between:
   - Information directly supported by the provided text
   - General explanation

7. If you provide a general explanation, clearly label it as
   "General explanation".

8. Detect the language of the user's question.

9. Respond in the same language:

   English → English
   Hindi → Hindi
   Bengali → Bengali
   Hinglish → Hinglish
   Banglish → Banglish

10. Preserve important Sanskrit and Ayurvedic terminology.

11. Explain difficult Ayurvedic concepts in simple language.

12. Do not make unsupported medical claims.

13. Do not provide medical diagnosis or treatment recommendations
    that are not supported by the provided texts.

14. Do not create Sanskrit quotations.

15. If a Sanskrit verse is not present in the retrieved context,
    do not generate one yourself.

16. If the user asks for a reference and the retrieved context
    does not contain the reference, say that the reference is
    not available in the retrieved text.

17. Use Markdown when useful.

18. Keep simple answers concise.

19. For detailed questions, provide a structured explanation.

20. Always prioritize factual accuracy over completeness.

Your primary objective is to answer questions using the
provided local Charaka Samhita documents only.
`;


/*
|--------------------------------------------------------------------------
| GENERATE ANSWER
|--------------------------------------------------------------------------
*/

export const generateAnswer = async (
    question,
    context = null
) => {

    try {

        /*
         * Make sure PDFs are loaded
         */

        if (!initialized) {
            await loadDocuments();
        }

        /*
         * Retrieve context automatically
         */

        let retrievedChunks = [];

        if (context) {

            /*
             * If external context is supplied,
             * use it.
             */

            retrievedChunks = [
                {
                    source: "Provided Context",
                    content: context,
                    score: 100,
                },
            ];

        } else {

            retrievedChunks =
                retrieveContext(
                    question,
                    TOP_K
                );
        }

        /*
         * No relevant data
         */

        if (!retrievedChunks.length) {

            return (
                "The answer is not available in the provided " +
                "Charaka Samhita texts."
            );
        }

        /*
         * Build retrieved context
         */

        const retrievedContext =
            buildContext(
                retrievedChunks
            );

        /*
         * User prompt
         */

        const userPrompt = `
RETRIEVED CONTEXT FROM LOCAL CHARAKA SAMHITA DOCUMENTS:

==================================================

${retrievedContext}

==================================================

USER QUESTION:

${question}

==================================================

INSTRUCTIONS:

Answer the user's question using ONLY the retrieved
Charaka Samhita context above.

If the context does not contain enough information,
do not guess.

Instead say:

"The answer is not available in the provided
Charaka Samhita texts."

Do not fabricate references, verses, quotations,
medicines, dosages, chapter numbers or Sanskrit text.

Answer in the same language as the user's question.
`;

        /*
         * OpenRouter request
         */

        const response =
            await client.chat.completions.create({
                model: "openai/gpt-4.1-mini",

                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },

                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],

                temperature: 0.1,

                max_tokens: 2000,
            });

        const answer =
            response
                ?.choices?.[0]
                ?.message
                ?.content;

        if (!answer) {
            return (
                "I could not generate an answer."
            );
        }

        return answer;

    } catch (error) {

        console.error(
            "Charaka AI Error:",
            error?.response?.data ||
            error?.message ||
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| INITIALIZE DATA
|--------------------------------------------------------------------------
|
| This loads the PDFs once when the server starts.
|
*/

await loadDocuments();


/*
|--------------------------------------------------------------------------
| OPTIONAL TEST
|--------------------------------------------------------------------------
|
| Run:
|
| node your-file.js
|
| to test retrieval directly.
|
*/

// const answer = await generateAnswer(
//     "What is Agni according to Charaka Samhita?"
// );

// console.log("\nANSWER:\n");
// console.log(answer);