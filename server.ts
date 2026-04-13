import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8080;

  app.use(cors());
  app.use(express.json());

  // Request Logging Middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // Diagnostic Logs for Environment
  console.log("--- Environment Diagnostics ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("CWD:", process.cwd());
  console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "PRESENT (Masked)" : "MISSING");
  console.log("-------------------------------");

  // Multer setup for image uploads
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  // Gemini API Lazy Initialization Helper
  const getAiClient = () => {
    // Try multiple possible sources for the key
    const rawKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
    
    // Clean the key: trim whitespace and remove potential surrounding quotes from platform injection
    const apiKey = rawKey?.trim().replace(/^["']|["']$/g, "");
    
    if (!apiKey) {
      const availableKeys = Object.keys(process.env).filter(k => k.includes("KEY") || k.includes("GEMINI"));
      console.error(`[Critical] GEMINI_API_KEY is missing. Available related keys: ${availableKeys.join(", ")}`);
      throw new Error("GEMINI_API_KEY environment variable is missing. Please check your Zeabur environment settings.");
    }

    if (apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
      console.error(`[Critical] GEMINI_API_KEY value is invalid: "${apiKey}"`);
      throw new Error(`The provided GEMINI_API_KEY is invalid (too short or placeholder). Current value: ${apiKey}`);
    }

    // Safe logging for debugging
    console.log(`[Diagnostic] AI Client Init. Source: ${process.env.GEMINI_API_KEY ? "process.env" : "import.meta.env"}. Length: ${apiKey.length}. Prefix: ${apiKey.substring(0, 4)}`);
    
    return new GoogleGenAI({ apiKey });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Test endpoint to verify API Key directly
  app.get("/api/ai/test", async (req, res) => {
    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Hi",
      });
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error("Test API Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Proxy endpoint for Gemini to bypass VPN issues for external users
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { model, contents, config } = req.body;
      
      // Diagnostic inside the handler
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      console.log(`[Generate] Request received. Model: ${model}. Key length: ${apiKey?.length || 0}`);
      
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in the generate handler.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Ensure contents is in the right format
      const finalContents = Array.isArray(contents) ? contents : [{ role: "user", parts: [{ text: String(contents) }] }];

      const response = await ai.models.generateContent({ 
        model: model || "gemini-3-flash-preview", 
        contents: finalContents, 
        config 
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      // Log more details if it's a Google API error
      if (error.response) {
        console.error("Google API Response Error:", JSON.stringify(error.response, null, 2));
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Image analysis endpoint (multi-modal)
  app.post("/api/ai/vision", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }
      const { prompt, model } = req.body;
      const ai = getAiClient();
      
      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: req.file.mimetype,
                  data: req.file.buffer.toString("base64"),
                },
              },
            ],
          },
        ],
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Vision Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
