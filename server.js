const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5001;
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const GITA_DATA_FILE = './gita_data.json';

// ✅ Add RapidAPI Key
const RAPIDAPI_KEY = '67b70e461fmsh23a94aeabf1cfd7p132243jsn8f86660e3fdc';  // 🔴 Replace this with your actual RapidAPI key
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

// ✅ Fetch Bhagavad Gita Verses from RapidAPI
app.get('/verse/:chapter/:verse', async (req, res) => {
    try {
        const { chapter, verse } = req.params;
        const url = `https://${RAPIDAPI_HOST}/v2/chapters/${chapter}/verses/${verse}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json({ explanation: data || "No explanation found." });

    } catch (error) {
        console.error("❌ Error fetching verse from RapidAPI:", error);
        res.status(500).json({ error: "Failed to retrieve the verse explanation." });
    }
});

// ✅ Chatbot Query Handling
app.post('/query', async (req, res) => {
    try {
        const { message } = req.body;
        console.log("🔹 Received message:", message);

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // ✅ Handle Greetings
        const greetings = ["hi", "hello", "hey", "namaste"];
        if (greetings.includes(message.toLowerCase())) {
            console.log("✅ Responding with greeting");
            return res.json({ response: "Hello! How can I assist you today?" });
        }

        // ✅ Check for Chapter Queries (e.g., "chapter 2")
        const chapterMatch = message.match(/chapter (\d+)/i);
        if (chapterMatch) {
            const chapterNumber = `chapter_${chapterMatch[1]}`;
            if (gitaData[chapterNumber]) {
                const chapterInfo = gitaData[chapterNumber];
                const responseText = `📖 *${chapterInfo.title}*\n\n📝 Summary: ${chapterInfo.summary}\n\n💡 Teachings:\n- ${chapterInfo.teachings.join("\n- ")}`;
                console.log("✅ Responding with Chapter Info");
                return res.json({ response: responseText });
            } else {
                return res.json({ response: "I couldn't find that chapter. Please try another one." });
            }
        }

        // ✅ Check for Verse Queries (e.g., "verse 2.47")
        const verseMatch = message.match(/verse (\d+)\.(\d+)/i);
        if (verseMatch) {
            const chapterNumber = `chapter_${verseMatch[1]}`;
            const verseNumber = verseMatch[2];

            if (gitaData[chapterNumber]) {
                const keyVerses = gitaData[chapterNumber].key_verses;
                const verse = keyVerses.find(v => v.verse === `${verseMatch[1]}.${verseNumber}`);

                if (verse) {
                    const responseText = `📖 *Verse ${verse.verse}*\n\n📜 Sanskrit: ${verse.sanskrit}\n\n📝 Translation: ${verse.translation}`;
                    console.log("✅ Responding with Verse Info");
                    return res.json({ response: responseText });
                }
            }
            return res.json({ response: "Sorry, I couldn't find that verse." });
        }

        // ✅ If no match, send query to AI
        const aiResponse = await getOllamaResponse(message);
        console.log("✅ AI Response:", aiResponse);
        return res.json({ response: aiResponse });

    } catch (error) {
        console.error("❌ Error in /query endpoint:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * Generates an AI response using Ollama.
 * @param {string} userMessage - The user query.
 * @returns {Promise<string>} The AI-generated response.
 */
async function getOllamaResponse(userMessage) {
    const payload = {
        model: 'mistral',
        prompt: `Answer this question based on the Bhagavad Gita:\n"${userMessage}"`,
        stream: false
    };

    try {
        const response = await fetch('http://localhost:11434/api/generate', {  // ✅ Uses built-in fetch
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data.response || 'I am not sure about that.';
    } catch (error) {
        console.error('❌ Error generating AI response:', error);
        return 'Sorry, I could not process your request.';
    }
}

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
