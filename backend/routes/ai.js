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
        You are an expert cultural researcher specializing in Rwandan oral histories and heritage.
        Analyze the following story text and provide:
        1. A compelling, concise title (max 6-8 words).
        2. A beautiful, engaging 1-2 sentence summary (hook) for the archive description.
        3. The most fitting primary category from this list: story, tradition, song, proverb, culture.
        4. A few relevant cultural tags.

        Story Text: "${text}"

        Return a JSON object with this exact structure:
        {
          "title": "Story Title",
          "summary": "Engagement summary...",
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
