const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { generatePdf } = require('./services/pdfService');
const { parseStylePrompt } = require('./services/aiService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Style Parser Endpoint
app.post('/api/v1/parse-style', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required' });

        const config = await parseStylePrompt(prompt);
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to parse style' });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'lumina-doc-gen' });
});

// Generate Endpoint
app.post('/api/v1/generate', async (req, res) => {
    try {
        const { type, data, styleConfig } = req.body;

        if (!type || !data) {
            return res.status(400).json({ error: 'Missing type or data' });
        }

        const pdfBuffer = await generatePdf(type, data, styleConfig);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename="${type}-${Date.now()}.pdf"`
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Lumina DocGen Server running on port ${PORT}`);
});
