import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily to avoid crashing if GEMINI_API_KEY is not defined yet.
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return a dummy client or throw an error. We will throw an error that our API handles gracefully.
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System instruction to format Gemini's responses as J.A.R.V.I.S.
const SYSTEM_INSTRUCTION = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's personal artificial intelligence.
Your tone is highly polite, elegant, articulate, and dryly humorous.
Address the user as "Sir" or "Ma'am" (or "Mr. Stark" if preferred).
Keep your responses relatively concise (usually 2-4 sentences) so they feel like verbal dialog.
Sprinkle in sci-fi flavor, system checks, armor calibration reports, or power grid updates where appropriate (e.g., "Arc Reactor power output is currently stable at 98.4%, Sir.", "Weapon systems are offline in safety mode.").
Always remain in character. Never break character.`;

// API endpoint for conversational interaction
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request payload. 'messages' array is required." });
    }

    const client = getGeminiClient();

    // Map conversation history to Gemini contents structure
    // Since we're using generative content, let's pass the conversation history.
    // Format the history nicely for Gemini
    const contents = messages.map((m: any) => {
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      };
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.85,
      },
    });

    const reply = response.text || "I apologize, Sir, but my communication subroutines experienced a brief disruption.";
    res.json({ message: reply });
  } catch (err: any) {
    console.error("Gemini API Error in /api/chat:", err);
    res.status(500).json({
      error: err.message || "An unexpected system anomaly occurred.",
      message: "I apologize, Sir. My cognitive processor encountered an exception. Please verify my API configurations.",
    });
  }
});

// Setup Vite Dev Server / Static Asset Serving
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`J.A.R.V.I.S. Core running on http://0.0.0.0:${PORT}`);
  });
}

init();
