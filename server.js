import express from 'express';
import cors from 'cors';
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
 
dotenv.config();
 
const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
 
const PORT = process.env.PORT || 5001;
const GITA_DATA_FILE = './gita_data.json';
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'bhagavad-gita3.p.rapidapi.com';
 
// ✅ Load Bhagavad Gita Data
let gitaData = {};
fs.readFile(GITA_DATA_FILE, 'utf8', (err, data) => {
    if (err) {
        console.error("❌ Error loading Bhagavad Gita data:", err);
    } else {
        gitaData = JSON.parse(data);
        console.log("✅ Bhagavad Gita data loaded successfully.");
    }
});
 
// ✅ Home Route
app.get('/', (req, res) => {
    res.send("✅ SoulPulse API is running! Use /query or /verse/:chapter/:verse.");
});
 
// ✅ Chatbot Query Handling
app.post('/query', async (req, res) => {
    try {
        const { message } = req.body;
        console.log("🔹 Received message:", message);
 
        if (!message) return res.status(400).json({ error: "Message is required" });
 
        // ✅ Common Responses
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
                return res.json({ response: `📖 *${chapterInfo.title}*\n\n📝 Summary: ${chapterInfo.summary}\n\n💡 Teachings:\n- ${chapterInfo.teachings.join("\n- ")}` });
            }
            return res.json({ response: "I couldn't find that chapter. Please try another one." });
        }
 
        // ✅ Fetch AI Response from Cohere
        const aiResponse = await getCohereResponse(message);
        return res.json({ response: aiResponse });
 
    } catch (error) {
        console.error("❌ Error in /query endpoint:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
 
// ✅ Cohere AI API Call
async function getCohereResponse(userMessage) {
    const payload = {
        model: "command-r",
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
        max_tokens: 300
    };
 
    try {
        const response = await fetch("https://api.cohere.com/v1/chat", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${COHERE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
 
        const data = await response.json();
        return data.generations ? data.generations[0].text : "Sorry, I couldn't process your request.";
    } catch (error) {
        console.error("❌ Error fetching response from Cohere:", error);
        return "Error connecting to the AI service.";
    }
}
 
// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on ${process.env.RENDER_EXTERNAL_URL || `https://soulsepulse.onrender.com`}`);
});
