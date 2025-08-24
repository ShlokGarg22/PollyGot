// Add the chat endpoint route
app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Missing or invalid 'messages' array" });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
        }

        // Use system message to give the AI some context if not already present
        let messagesToSend = [...messages];
        if (!messagesToSend.some(m => m.role === 'system')) {
            messagesToSend.unshift({
                role: 'system',
                content: 'You are PollyGot, a friendly and helpful language learning assistant. You help users learn new languages, answer their questions about grammar, vocabulary, and provide cultural context. Keep responses concise, informative, and encouraging.'
            });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messagesToSend,
            temperature: 0.7,
            max_tokens: 800
        });

        const reply = response?.choices?.[0]?.message?.content ?? "";
        if (!reply) {
            return res.status(502).json({ error: "Empty AI response" });
        }

        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "OpenAI Error", details: err.message });
    }
});
