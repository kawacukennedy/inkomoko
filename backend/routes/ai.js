const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/ai/enhance-story
router.post('/enhance-story', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.length < 20) {
            return res.status(400).json({ error: 'Please provide a longer story text for AI to analyze.' });
        }

        if (!process.env.GEMINI_API_KEY) {
          return res.status(503).json({ error: 'AI features are currently unavailable. Please check backend configuration.' });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        You are a distinguished cultural historian and linguist specializing in Rwandan heritage and the preservation of oral traditions (Inkomoko).
        Analyze the provided oral history text. It may be in Kinyarwanda or English.
        
        Task:
        1. Identify the core message or moral of the story.
        2. Create a compelling title that honors the content (max 8 words).
        3. Write a 1-2 sentence "hook" (summary) designed to invite the next generation to listen. If the input is in Kinyarwanda, provide the summary in both Kinyarwanda and English.
        4. Select the best category: 'story', 'tradition', 'song', 'proverb', or 'culture'.
        5. Suggest 3-5 specific cultural tags (e.g., #Umuco, #Ancestry, #Inyambo).

        Story Text: "${text}"

        Return a JSON object with this exact structure:
        {
          "title": "Story Title",
          "summary": "The beautiful summary or bilingual summary...",
          "category": "story|tradition|song|proverb|culture",
          "tags": ["tag1", "tag2"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonResponse = JSON.parse(response.text());
        
        res.json(jsonResponse);

    } catch (err) {
        console.error('Gemini AI Error:', err);
        res.status(500).json({ error: 'AI processing failed. Please try again or fill in manually.' });
    }
});

module.exports = router;
