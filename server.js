const express = require("express");

const cors = require("cors");

const fs = require("fs");

const dotenv = require("dotenv");
 
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

app.post('/query', async (req, res) => {
    try {
        const { message } = req.body;

        console.log("🔹 Received message:", message);

        // ✅ Check if the message is empty
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: "Message cannot be empty." });
        }

        // ✅ Call Cohere API
        const aiResponse = await getCohereResponse(message);
        console.log("✅ AI Response:", aiResponse);
        return res.json({ response: aiResponse });

    } catch (error) {
        console.error("❌ Error in /query endpoint:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

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

async function getCohereResponse(userMessage) {
    if (!userMessage || userMessage.trim().length === 0) {
        return "Invalid input: Message cannot be empty.";
    }

    const payload = {
        model: "command-r",
        chat_history: [],  // Required by Cohere API
        message: [{ role: "USER", content: userMessage }],  // Ensure correct format
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

        if (!data.text || data.text.trim().length === 0) {
            return "Sorry, I couldn't generate a response.";
        }

        return data.text;
    } catch (error) {
        console.error("❌ Cohere API Error:", error);
        return "Error connecting to AI service.";
    }
}


 
 
// ✅ Start Server

app.listen(PORT, () => {

    console.log(`✅ Server running on ${process.env.RENDER_EXTERNAL_URL || `https://soulsepulse.onrender.com`}`);

});

 
