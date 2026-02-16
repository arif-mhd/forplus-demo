const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

const mockParse = (prompt) => {
    // Simple keyword matching for demo purposes if no API key
    const config = {
        primaryColor: '#000000',
        fontFamily: 'Helvetica',
        headerBg: '#f3f4f6'
    };

    const p = prompt.toLowerCase();

    if (p.includes('blue')) config.primaryColor = '#2563eb';
    if (p.includes('red')) config.primaryColor = '#dc2626';
    if (p.includes('green')) config.primaryColor = '#16a34a';
    if (p.includes('purple')) config.primaryColor = '#9333ea';

    if (p.includes('modern') || p.includes('sans')) config.fontFamily = 'Helvetica';
    if (p.includes('classic') || p.includes('serif')) config.fontFamily = 'Times New Roman';
    if (p.includes('code') || p.includes('mono')) config.fontFamily = 'Courier New';

    if (p.includes('dark')) {
        config.headerBg = '#1f2937';
        // ensuring text readability would be handled in template CSS logic usually
    }

    return config;
};

const parseStylePrompt = async (prompt) => {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('No OpenAI API Key found. Using mock parser.');
        return mockParse(prompt);
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a CSS configuration assistant. Extract style parameters from the user prompt. Return ONLY JSON. Fields: primaryColor (hex), fontFamily (Helvetica, Times New Roman, Courier New), headerBg (hex)."
                },
                { role: "user", content: prompt }
            ],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('OpenAI Error:', error);
        return mockParse(prompt);
    }
};

module.exports = { parseStylePrompt };
