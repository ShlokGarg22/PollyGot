import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv'

dotenv.config();

const app = express();

app.use(cors())
app.use(express.json())
app.use(express.static("."));

//express.json() → makes sure your backend can read JSON data coming from the frontend.

// express.static(".") → makes sure your frontend files (HTML/CSS/JS) are served to the browser without you needing a separate web server

const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
})

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post("/api/check", async(req,res) => {
  try {
    const { english, attempt, lang } = req.body;

    if (!english || !attempt || !lang) {
      return res.status(400).json({ error: "Missing required fields: english, attempt, lang" });
    }
    const prompt = `
    You are a strict language teacher.
  - Translate the English sentence into ${lang}.
  - Compare student's attempt with your reference.
  - Score from 0 to 100.
  - Give short feedback.
  Return JSON only with: is_correct, score, reference_translation, feedback.
  English: ${english}
  Student attempt (${lang}): ${attempt}
    `;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        is_correct: { type: "boolean" },
        score: { type: "number" },
        reference_translation: { type: "string" },
        feedback: { type: "string" }
      },
      required: ["is_correct", "score", "reference_translation", "feedback"]
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: 'You are a strict language teacher. Return only JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { 
        type: 'json_schema', 
        json_schema: { 
          name: 'Grade', 
          schema: schema, 
          strict: true 
        } 
      }
    });

    const text = response?.choices?.[0]?.message?.content ?? "";
    if (!text) {
      return res.status(502).json({ error: "Empty AI response" });
    }

    const result = JSON.parse(text);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI Error" });
  }
})

// New chat endpoint for the chatbot interface
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
      max_tokens: 100
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
})

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log('To access from other devices on your network:');
  console.log(`http://<your-ip-address>:${port}`);
});
