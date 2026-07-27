export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST method is allowed' });
    }

    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key missing in Vercel settings.' });

    try {
        // STEP 1: Code Google se khud poochega ki kaunsa model active hai
        const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const modelsData = await modelsResponse.json();

        if (modelsData.error) {
            throw new Error("Google API Error: " + modelsData.error.message);
        }

        // STEP 2: Jo pehla working Gemini model milega, usko select kar lega
        let targetModel = "";
        if (modelsData.models && modelsData.models.length > 0) {
            const validModel = modelsData.models.find(m => 
                m.name.includes("gemini") && 
                m.supportedGenerationMethods && 
                m.supportedGenerationMethods.includes("generateContent")
            );
            if (validModel) {
                targetModel = validModel.name;
            } else {
                throw new Error("No compatible Gemini model found for this API key.");
            }
        } else {
            throw new Error("Could not fetch models from Google.");
        }

        const promptText = `Act as an elite Conversion Rate Optimization (CRO) expert. Analyze the brand or website at this URL: ${url}. Provide exactly 3 brutal, hyper-specific, and highly actionable bullet points highlighting conversion killers, UX flaws, or bad copy based on their specific industry. Do NOT use generic advice. Limit to 150 words total.`;

        // STEP 3: Automatically selected model ke sath analysis karega
        const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        const data = await generateResponse.json();
        
        if (data.error) throw new Error(data.error.message);

        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ result: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
