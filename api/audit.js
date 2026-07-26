export default async function handler(req, res) {
    // Only allow POST requests from the frontend
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST method is allowed' });
    }

    const { url } = req.body;
    
    // Ensure a URL is provided by the user
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Retrieve the DeepSeek API key from Vercel's secure Environment Variables
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'System Error: DeepSeek API Key is missing in Vercel environment.' });
    }

    try {
        // The core instruction set for the AI
        const promptText = `Act as an elite CRO expert. Analyze this specific URL: ${url}. Provide exactly 3 brutal, hyper-specific bullet points highlighting conversion killers, UX flaws, or bad copy based ONLY on what this specific brand/industry does. Do NOT use generic advice. Be ruthless. Limit to 100 words total.`;

        // Send the request to DeepSeek's official API endpoint
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are an expert Conversion Rate Optimizer.' },
                    { role: 'user', content: promptText }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        // Handle any errors returned by DeepSeek's servers
        if (data.error) {
            throw new Error(data.error.message);
        }

        // Extract the AI's response and send it back to the frontend UI
        const aiResponse = data.choices[0].message.content;
        return res.status(200).json({ result: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
