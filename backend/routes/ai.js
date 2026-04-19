const express = require('express');
const OpenAI = require('openai');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/enhance-story
router.post('/enhance-story', authenticateToken, async (req, res) => {
    try {
        const { text, type } = req.body;

        if (!text || text.length < 20) {
            return res.status(400).json({ error: 'Please provide a longer story text for AI to analyze.' });
        }

        if (!process.env.OPENAI_API_KEY) {
          return res.status(503).json({ error: 'AI features are currently unavailable. Please check backend configuration.' });
        }

        const prompt = `
        You are an expert cultural researcher specializing in Rwandan oral histories and heritage.
        Analyze the following story text and provide:
        1. A compelling, concise title (max 6-8 words).
        2. A beautiful, engaging 1-2 sentence summary (hook) for the archive description.
        3. The most fitting primary category from this list: story, tradition, song, proverb, culture.
        4. A few relevant cultural tags.

        Story Text: "${text}"

        Return ONLY a JSON object in this format:
        {
          "title": "...",
          "summary": "...",
          "category": "...",
          "tags": ["...", "..."]
        }
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: "You are a helpful assistant for cultural preservation." }, { role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);

    } catch (err) {
        console.error('AI Error:', err);
        res.status(500).json({ error: 'AI processing failed. Please try again or fill in manually.' });
    }
});

module.exports = router;
