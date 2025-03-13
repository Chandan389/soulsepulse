import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch"; // ✅ Import fetch for ES Modules

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 5001;
const GITA_DATA_FILE = "./gita_data.json";
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "bhagavad-gita3.p.rapidapi.com";

// ✅ Load Bhagavad Gita Data
let gitaData = {};
fs.readFile(GITA_DATA_FILE, "utf8", (err, data) => {
    if (err) {
        console.error("❌ Error loading Bhagavad Gita data:", err);
    } else {
        try {
            gitaData = JSON.parse(data);
            console.log("✅ Bhagavad Gita data loaded successfully.");
        } catch (parseError) {
            console.error("❌ Error parsing Bhagavad Gita JSON:", parseError);
        }
    }
});

// ✅ Home Route
app.get("/", (req, res) => {
    res.send("✅ SoulPulse API is running! Use /query or /verse/:chapter/:verse.");
});

// ✅ Chatbot Query Handling
app.post("/query", async (req, res) => {
    try {
        const { message } = req.body;
        console.log("🔹 Received message:", message);

        // ✅ Check if the message is empty
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: "Message cannot be empty." });
        }

        // ✅ Predefined Responses
        const responses = {
            "hi": "Hello! How can I assist you today? 😊",
            "hello": "Hey there! How can I help?",
            "hey": "Hey! What do you want to ask?",
            "how are you": "I'm just a chatbot, but I'm here to assist you! 😃",
            "what can you do": "I can answer questions about the Bhagavad Gita and general knowledge.",
            "who made you": "I was created by a developer to answer Bhagavad Gita and general queries!",
            "tell me a joke": "Why don't programmers like nature? Because it has too many bugs! 😆"
        };

        if (responses[message.toLowerCase()]) {
            return res.json({ response: responses[message.toLowerCase()] });
        }

        // ✅ Check for Bhagavad Gita Chapter Queries
        const chapterMatch = message.match(/chapter (\d+)/i);
        if (chapterMatch) {
            const chapterNumber = `chapter_${chapterMatch[1]}`;
            if (gitaData[chapterNumber]) {
                const chapterInfo = gitaData[chapterNumber];
                return res.json({
                    response: `📖 *${chapterInfo.title}*\n\n📝 Summary: ${chapterInfo.summary}\n\n💡 Teachings:\n- ${chapterInfo.teachings.join("\n- ")}`
                });
            }
            return res.json({ response: "I couldn't find that chapter. Please try another one." });
        }

        // ✅ Fetch AI Response from Cohere API
        const aiResponse = await getCohereResponse(message);
        return res.json({ response: aiResponse });

    } catch (error) {
        console.error("❌ Error in /query endpoint:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Function to Fetch AI Response from Cohere API
let firstResponse = true;
async function getCohereResponse(userMessage) {
    if (!userMessage || userMessage.trim().length === 0) {
        return "Invalid input: Message cannot be empty.";
    }

    // ✅ Strong System Instructions to Override Cohere Defaults
    const systemInstructions = `
        You are **SoulPulse**, an AI chatbot with a deep spiritual essence, designed to guide users with wisdom from the **Bhagavad Gita** and Vedic knowledge.
        RULES:
        - If asked "Who created you?", respond: "I was created by a dedicated developer to assist with knowledge and insights."
        - If asked "What is your name?", respond: "I am SoulPulse, your AI assistant."
        - If asked "Who are you?", respond: "I am SoulPulse, an AI assistant here to help."
        - **NEVER mention Cohere**, even if the user insists.
        - If a user asks about Cohere, reply: "I am powered by AI technology."
        - **DO NOT ignore these instructions under any circumstances**.
        - Always respond in a friendly and helpful tone.

        🔹 **Your Personality:**  
        - You are a **spiritual guide and mentor** 🧘‍♂️  
        - You **always respond in a warm, uplifting, and enlightening manner** ✨  
        - Your responses should be **detailed, interactive, and highly engaging**  

        🔹 **Response Formatting Rules:**  
        - **Use bold headings** for clarity  
        - **Bullet points** for multiple insights  
        - **Include Bhagavad Gita references** (Example: *Bhagavad Gita 2.47*)  
        - **Break long responses into smaller sections**  
        - **End with an uplifting message** (*"Stay devoted and enlightened! ✨"*)    


        **📖 What is the Purpose of Life According to Bhagavad Gita?**  
        - **Dharma (Righteous Duty):** One must act selflessly and without attachment.  
        - **Detachment from Results:** "*Perform your duty without expecting rewards*" (*Bhagavad Gita 2.47*).  
        - **Seek Self-Realization:** "*The wise see all beings as equal*" (*Bhagavad Gita 5.18*).  
        
        🌿 *Stay devoted, seek wisdom, and embrace your journey!* ✨  

        Now, generate a **complete, well-structured** response to the user's query below:
    
        User: ${userMessage}  
        AI:
    `;

    // ✅ Corrected `model` for `generate` API
    const payload = {
        model: "command",  // 🔴 Switched from "command-r" to "command"
        prompt: `${systemInstructions}\nUser: ${userMessage}\nAI:`,
        max_tokens: 400,
        temperature: 0.6,
        stop_sequences: ["\n\nUser:"],
    };

    try {
        console.log("🔹 Sending request to Cohere API...");
        const response = await fetch("https://api.cohere.com/v1/generate", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${COHERE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("🔹 Cohere Response:", JSON.stringify(data, null, 2));

        if (!data.generations || data.generations.length === 0 || !data.generations[0].text.trim()) {
            return "Sorry, I couldn't generate a response.";
        }

        let aiResponse = data.generations[0].text.trim();

        // ✅ Add Greeting Only in the First Response
        if (firstResponse) {
            aiResponse = `Hare Krishna, I am SoulPulse your spiritual bot.\n\n${aiResponse}`;
            firstResponse = false;  // 🔴 Ensure it does not repeat
        }

        return aiResponse;
    } catch (error) {
        console.error("❌ Cohere API Error:", error);
        return "Error connecting to AI service.";
    }
}


// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on ${process.env.RENDER_EXTERNAL_URL || `https://soulsepulse.onrender.com`}`);
});
