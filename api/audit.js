export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST method is allowed' });
    }

    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key missing in Vercel settings.' });
    }

    try {
        const promptText = `Act as an elite Conversion Rate Optimization (CRO) expert. Analyze the brand or website at this URL: ${url}. Provide exactly 3 brutal, hyper-specific, and highly actionable bullet points highlighting conversion killers, UX flaws, or bad copy based on their specific industry. Do NOT use generic advice. Limit to 150 words total.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ result: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
